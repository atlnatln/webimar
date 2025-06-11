import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { useMap, useMapEvents } from 'react-leaflet';
import styled from 'styled-components';

// Global CSS - Simplified
const GlobalStyle = `
  .polygon-tooltip {
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid #3498db !important;
    border-radius: 4px !important;
    padding: 6px 8px !important;
    font-size: 11px !important;
    color: #2c3e50 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
  }
  
  .edit-marker {
    z-index: 1000 !important;
    pointer-events: auto !important;
    cursor: move !important;
  }
  
  .edit-marker:hover {
    transform: scale(1.1) !important;
  }
  
  .leaflet-edit-pane {
    z-index: 999 !important;
    pointer-events: auto !important;
  }
`;

// Inject styles once
if (typeof document !== 'undefined' && !document.getElementById('polygon-optimized-style')) {
  const style = document.createElement('style');
  style.id = 'polygon-optimized-style';
  style.textContent = GlobalStyle;
  document.head.appendChild(style);
}

// Styled components - Simplified
const DrawingControls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DrawButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? '#e74c3c' : '#3498db'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? '#c0392b' : '#2980b9'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

const DrawingModeContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid #34495e;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 320px;
`;

const DrawingModeButton = styled.button<{ $active: boolean; $color: string }>`
  padding: 10px 16px;
  margin-right: 8px;
  margin-bottom: 8px;
  border: 2px solid ${props => props.$color};
  background: ${props => props.$active ? props.$color : 'white'};
  color: ${props => props.$active ? 'white' : props.$color};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$color};
    color: white;
  }
`;

// Interfaces
interface PolygonPoint {
  lat: number;
  lng: number;
}

interface DrawnPolygon {
  points: PolygonPoint[];
  area: number;
}

interface PolygonDrawerOptimizedProps {
  onPolygonComplete?: (polygon: DrawnPolygon) => void;
  onPolygonClear?: () => void;
  onDrawingStateChange?: (isDrawing: boolean) => void;
  onPolygonEdit?: (polygon: DrawnPolygon, index: number) => void;
  disabled?: boolean;
  polygonColor?: string;
  polygonName?: string;
  hideControls?: boolean;
  existingPolygons?: Array<{
    polygon: DrawnPolygon;
    color: string;
    name: string;
    id?: string;
  }>;
  drawingMode?: 'tarla' | 'dikili' | null;
  onDrawingModeChange?: (mode: 'tarla' | 'dikili' | null) => void;
  showDrawingModeControls?: boolean;
  externalEditTrigger?: { timestamp: number; polygonIndex: number };
}

const PolygonDrawerOptimized: React.FC<PolygonDrawerOptimizedProps> = ({
  onPolygonComplete,
  onPolygonClear,
  onDrawingStateChange,
  onPolygonEdit,
  disabled = false,
  polygonColor = '#e74c3c',
  polygonName = 'Polygon',
  hideControls = false,
  existingPolygons = [],
  drawingMode = null,
  onDrawingModeChange,
  showDrawingModeControls = false,
  externalEditTrigger = { timestamp: 0, polygonIndex: -1 }
}) => {
  const map = useMap();
  
  // Simplified state
  const [isDrawing, setIsDrawing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [currentPoints, setCurrentPoints] = useState<PolygonPoint[]>([]);
  
  // Single layer references
  const drawingLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonsLayerRef = useRef<L.LayerGroup | null>(null);
  const editLayerRef = useRef<L.LayerGroup | null>(null);
  
  // Edit state refs
  const editingPointsRef = useRef<PolygonPoint[]>([]);
  const editMarkersRef = useRef<L.Marker[]>([]);
  const dragThrottleRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  // Initialize layers once
  useEffect(() => {
    if (!drawingLayerRef.current) {
      drawingLayerRef.current = L.layerGroup().addTo(map);
    }
    if (!polygonsLayerRef.current) {
      polygonsLayerRef.current = L.layerGroup().addTo(map);
    }
    if (!editLayerRef.current) {
      if (!map.getPane('editPane')) {
        const editPane = map.createPane('editPane');
        editPane.style.zIndex = '999';
      }
      editLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      [drawingLayerRef, polygonsLayerRef, editLayerRef].forEach(ref => {
        if (ref.current) {
          map.removeLayer(ref.current);
          ref.current = null;
        }
      });
      // Clear all throttles
      Object.values(dragThrottleRef.current).forEach(clearTimeout);
    };
  }, [map]);

  // Optimized map click handler
  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    if (!isDrawing || editingIndex >= 0) return;
    
    const newPoint: PolygonPoint = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    };
    
    setCurrentPoints(prev => {
      const newPoints = [...prev, newPoint];
      updateDrawingVisual(newPoints);
      return newPoints;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawing, editingIndex]); // updateDrawingVisual is stable

  // Map events
  useMapEvents({
    click: handleMapClick,
    dblclick: (e) => {
      if (isDrawing && currentPoints.length >= 3) {
        e.originalEvent?.stopPropagation();
        completePolygon();
      }
    }
  });

  // Optimized drawing visual update
  const updateDrawingVisual = useCallback((points: PolygonPoint[]) => {
    if (!drawingLayerRef.current) return;
    
    drawingLayerRef.current.clearLayers();
    
    // Add markers
    points.forEach((point, index) => {
      const marker = L.marker([point.lat, point.lng], {
        icon: L.divIcon({
          html: `<div style="width: ${index === 0 ? 10 : 8}px; height: ${index === 0 ? 10 : 8}px; background: ${index === 0 ? '#27ae60' : '#e74c3c'}; border: 2px solid white; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></div>`,
          iconSize: [index === 0 ? 10 : 8, index === 0 ? 10 : 8],
          iconAnchor: [index === 0 ? 5 : 4, index === 0 ? 5 : 4]
        })
      });
      marker.addTo(drawingLayerRef.current!);
    });

    // Add lines
    if (points.length >= 2) {
      const polyline = L.polyline(points.map(p => [p.lat, p.lng]), {
        color: polygonColor,
        weight: 3,
        opacity: 0.8
      });
      polyline.addTo(drawingLayerRef.current!);
    }

    // Add polygon fill
    if (points.length >= 3) {
      const polygon = L.polygon(points.map(p => [p.lat, p.lng]), {
        color: polygonColor,
        weight: 2,
        fillColor: polygonColor,
        fillOpacity: 0.2
      });
      polygon.addTo(drawingLayerRef.current!);
    }
  }, [polygonColor]);

  // Start drawing
  const startDrawing = useCallback(() => {
    if (disabled) return;
    
    setIsDrawing(true);
    setCurrentPoints([]);
    setEditingIndex(-1);
    onDrawingStateChange?.(true);
    
    // Clear any existing editing
    editLayerRef.current?.clearLayers();
    editMarkersRef.current = [];
    
    map.doubleClickZoom.disable();
  }, [disabled, onDrawingStateChange, map]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    onDrawingStateChange?.(false);
    drawingLayerRef.current?.clearLayers();
    setCurrentPoints([]);
    map.doubleClickZoom.enable();
  }, [onDrawingStateChange, map]);

  // Complete polygon
  const completePolygon = useCallback(() => {
    if (currentPoints.length < 3) return;

    // Calculate area
    const coordinates = [...currentPoints.map(p => [p.lng, p.lat]), [currentPoints[0].lng, currentPoints[0].lat]];
    const turfPolygon = turf.polygon([coordinates]);
    const area = Math.round(turf.area(turfPolygon));

    const polygon: DrawnPolygon = {
      points: currentPoints,
      area
    };

    // Add to permanent layer
    addPermanentPolygon(polygon);
    
    // Clear drawing
    setCurrentPoints([]);
    drawingLayerRef.current?.clearLayers();
    
    onPolygonComplete?.(polygon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPoints, onPolygonComplete]); // addPermanentPolygon is stable

  // Add permanent polygon
  const addPermanentPolygon = useCallback((polygonData: DrawnPolygon) => {
    if (!polygonsLayerRef.current) return;

    const uniqueId = drawingMode === 'tarla' ? 'tarla' : 
                     drawingMode === 'dikili' ? 'dikili' : 
                     `polygon-${Date.now()}`;

    // Check if already exists
    let exists = false;
    polygonsLayerRef.current.eachLayer((layer: any) => {
      if (layer.options?.polygonId === uniqueId) {
        exists = true;
      }
    });

    if (exists) return;

    const polygon = L.polygon(polygonData.points.map(p => [p.lat, p.lng]), {
      color: polygonColor,
      weight: 2,
      fillColor: polygonColor,
      fillOpacity: 0.3,
      polygonId: uniqueId
    } as any);

    // Add tooltip
    const areaInDonum = (polygonData.area / 10000).toFixed(2);
    polygon.bindTooltip(`
      <strong>${polygonName}</strong><br>
      Alan: ${areaInDonum} dönüm<br>
      (${polygonData.area} m²)
    `, { className: 'polygon-tooltip' });

    // Add click for edit
    polygon.on('click', (e) => {
      e.originalEvent?.stopPropagation();
      const index = existingPolygons.findIndex(item => 
        item.id === uniqueId || 
        (item.polygon.points.length === polygonData.points.length && 
         item.polygon.points.every((point, i) => 
           Math.abs(point.lat - polygonData.points[i].lat) < 0.000001 &&
           Math.abs(point.lng - polygonData.points[i].lng) < 0.000001
         ))
      );
      if (index >= 0) startEditMode(index);
    });

    polygon.addTo(polygonsLayerRef.current);
  }, [drawingMode, polygonColor, polygonName, existingPolygons]);

  // Optimized edit mode
  const startEditMode = useCallback((polygonIndex: number) => {
    if (isDrawing || !existingPolygons[polygonIndex]) return;

    setEditingIndex(polygonIndex);
    setIsDrawing(false);
    
    const points = existingPolygons[polygonIndex].polygon.points;
    editingPointsRef.current = [...points];

    // Clear previous edit markers
    editLayerRef.current?.clearLayers();
    editMarkersRef.current = [];

    // Create edit markers
    points.forEach((point, index) => {
      const marker = L.marker([point.lat, point.lng], {
        draggable: true,
        icon: L.divIcon({
          html: '<div style="width: 16px; height: 16px; background: #f39c12; border: 3px solid white; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.4); cursor: move;"></div>',
          className: 'edit-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        }),
        pane: 'editPane'
      });

      // Optimized drag handler
      marker.on('drag', (e: any) => {
        const newLatLng = e.target.getLatLng();
        
        // Clear previous throttle for this marker
        if (dragThrottleRef.current[index]) {
          clearTimeout(dragThrottleRef.current[index]);
        }

        // Throttled update
        dragThrottleRef.current[index] = setTimeout(() => {
          editingPointsRef.current[index] = { lat: newLatLng.lat, lng: newLatLng.lng };
          
          // Update parent immediately with throttle
          if (onPolygonEdit && editingPointsRef.current.length >= 3) {
            try {
              const coordinates = [...editingPointsRef.current.map(p => [p.lng, p.lat]), [editingPointsRef.current[0].lng, editingPointsRef.current[0].lat]];
              const turfPolygon = turf.polygon([coordinates]);
              const area = Math.round(turf.area(turfPolygon));
              
              onPolygonEdit({
                points: [...editingPointsRef.current],
                area
              }, polygonIndex);
            } catch (error) {
              console.error('Area calculation error:', error);
            }
          }
        }, 100);
      });

      marker.addTo(editLayerRef.current!);
      editMarkersRef.current.push(marker);
    });

    // Hide original polygon
    polygonsLayerRef.current?.eachLayer((layer: any) => {
      const targetId = existingPolygons[polygonIndex].id;
      if (layer.options?.polygonId === targetId) {
        layer.setStyle({ opacity: 0, fillOpacity: 0 });
      }
    });
  }, [isDrawing, existingPolygons, onPolygonEdit]);

  // Stop edit mode
  const stopEditMode = useCallback(() => {
    setEditingIndex(-1);
    editLayerRef.current?.clearLayers();
    editMarkersRef.current = [];
    
    // Clear all drag throttles
    Object.values(dragThrottleRef.current).forEach(clearTimeout);
    dragThrottleRef.current = {};

    // Restore polygon visibility
    polygonsLayerRef.current?.eachLayer((layer: any) => {
      layer.setStyle({ opacity: 0.8, fillOpacity: 0.3 });
    });
  }, []);

  // Load existing polygons - simplified
  useEffect(() => {
    if (editingIndex >= 0) return; // Don't reload during editing

    polygonsLayerRef.current?.clearLayers();
    
    existingPolygons.forEach((item) => {
      addPermanentPolygon(item.polygon);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPolygons, editingIndex]); // addPermanentPolygon is stable

  // External edit trigger
  useEffect(() => {
    if (externalEditTrigger.timestamp > 0 && externalEditTrigger.polygonIndex >= 0) {
      startEditMode(externalEditTrigger.polygonIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalEditTrigger]); // startEditMode is stable

  // Drawing mode buttons handler
  const handleModeChange = useCallback((mode: 'tarla' | 'dikili') => {
    if (drawingMode === mode && isDrawing) return;
    
    onDrawingModeChange?.(mode);
    setTimeout(() => startDrawing(), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawingMode, isDrawing, onDrawingModeChange]); // startDrawing is stable

  return (
    <>
      {/* Drawing Mode Controls */}
      {showDrawingModeControls && (
        <DrawingModeContainer>
          <div style={{ marginBottom: '8px', fontWeight: '600' }}>Çizim Modu:</div>
          
          <DrawingModeButton
            $active={drawingMode === 'tarla'}
            $color="#8B4513"
            onClick={() => handleModeChange('tarla')}
          >
            🟤 Tarla Alanı Çiz
          </DrawingModeButton>
          
          <DrawingModeButton
            $active={drawingMode === 'dikili'}
            $color="#27ae60"
            onClick={() => handleModeChange('dikili')}
          >
            🟢 Dikili Alan Çiz
          </DrawingModeButton>
          
          {isDrawing && (
            <DrawButton onClick={stopDrawing}>
              ⏹️ Çizimi Durdur
            </DrawButton>
          )}
        </DrawingModeContainer>
      )}

      {/* Regular Controls */}
      {!hideControls && (
        <DrawingControls>
          {editingIndex >= 0 ? (
            <DrawButton onClick={stopEditMode}>
              ✅ Düzenlemeyi Bitir
            </DrawButton>
          ) : !isDrawing ? (
            <DrawButton onClick={startDrawing} disabled={disabled}>
              🎨 Polygon Çiz
            </DrawButton>
          ) : (
            <>
              <DrawButton $active onClick={stopDrawing}>
                ⏹️ Çizimi Durdur
              </DrawButton>
              <DrawButton 
                onClick={completePolygon} 
                disabled={currentPoints.length < 3}
              >
                ✅ Tamamla ({currentPoints.length})
              </DrawButton>
            </>
          )}
          
          <DrawButton 
            onClick={() => {
              polygonsLayerRef.current?.clearLayers();
              onPolygonClear?.();
            }}
            disabled={editingIndex >= 0}
          >
            🗑️ Temizle
          </DrawButton>
        </DrawingControls>
      )}
    </>
  );
};

export default PolygonDrawerOptimized;
export type { DrawnPolygon, PolygonPoint, PolygonDrawerOptimizedProps };
