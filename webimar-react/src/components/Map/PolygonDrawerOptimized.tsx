import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { useMap, useMapEvents } from 'react-leaflet';
import styled from 'styled-components';

// Global CSS - Simplified with stable markers
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
  
  .draggable-marker {
    z-index: 1000 !important;
    pointer-events: auto !important;
  }
  
  .draggable-marker .marker-handle {
    width: 16px !important;
    height: 16px !important;
    background: #f39c12 !important;
    border: 3px solid white !important;
    border-radius: 50% !important;
    box-shadow: 0 3px 8px rgba(0,0,0,0.4) !important;
    cursor: move !important;
    pointer-events: auto !important;
    position: absolute !important;
    top: 3px !important;
    left: 3px !important;
    z-index: 1001 !important;
  }
  
  .draggable-marker:hover .marker-handle {
    transform: scale(1.1) !important;
  }
  
  .leaflet-edit-pane {
    z-index: 999 !important;
    pointer-events: auto !important;
  }
  
  .leaflet-marker-pane .leaflet-marker-icon.edit-marker {
    z-index: 1000 !important;
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
  const startEditModeRef = useRef<((index: number) => void) | null>(null);

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

  // Enhanced map click handler with double-click detection
  const lastClickTimeRef = useRef<number>(0);
  const handleMapClickWithDoubleClick = useCallback((e: L.LeafletMouseEvent) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTimeRef.current;
    
    console.log('🗺️ Harita tıklandı! isDrawing:', isDrawing, 'editingIndex:', editingIndex, 'timeDiff:', timeDiff);
    
    // Double-click detection (within 500ms)
    if (timeDiff < 500 && isDrawing && currentPoints.length >= 3) {
      console.log('🖱️ Manuel çift tıklama algılandı! (timeDiff:', timeDiff, 'ms)');
      completePolygon();
      lastClickTimeRef.current = 0; // Reset
      return;
    }
    
    lastClickTimeRef.current = currentTime;
    
    if (!isDrawing || editingIndex >= 0) {
      console.log('❌ Tıklama reddedildi - isDrawing:', isDrawing, 'editingIndex:', editingIndex);
      return;
    }
    
    const newPoint: PolygonPoint = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    };
    
    console.log('✅ Yeni nokta ekleniyor:', newPoint);
    
    setCurrentPoints(prev => {
      const newPoints = [...prev, newPoint];
      console.log('📍 Toplam nokta sayısı:', newPoints.length);
      updateDrawingVisual(newPoints);
      return newPoints;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawing, editingIndex, currentPoints.length]); // updateDrawingVisual, completePolygon are stable

  // Map events
  useMapEvents({
    click: handleMapClickWithDoubleClick, // Use enhanced handler
    dblclick: (e) => {
      console.log('🖱️ Çift tıklama algılandı! isDrawing:', isDrawing, 'points:', currentPoints.length);
      
      if (isDrawing && currentPoints.length >= 3) {
        console.log('✅ Polygon tamamlanıyor...');
        e.originalEvent?.stopPropagation();
        e.originalEvent?.preventDefault();
        completePolygon();
      } else {
        console.log('❌ Çift tıklama reddedildi - isDrawing:', isDrawing, 'points:', currentPoints.length);
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

  // Edit visual update function - display real-time polygon during editing
  const updateEditVisual = useCallback((points: PolygonPoint[]) => {
    console.log('🎨 updateEditVisual çağrıldı! points:', points.length);
    
    if (!editLayerRef.current || points.length < 3) {
      console.log('❌ updateEditVisual iptal - editLayer:', !!editLayerRef.current, 'points:', points.length);
      return;
    }
    
    // Remove existing edit polygon (keep markers)
    editLayerRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Polygon) {
        console.log('🗑️ Eski edit polygon kaldırılıyor');
        editLayerRef.current!.removeLayer(layer);
      }
    });
    
    // Add updated edit polygon
    const editPolygon = L.polygon(points.map(p => [p.lat, p.lng]), {
      color: '#f39c12',
      weight: 3,
      fillColor: '#f39c12',
      fillOpacity: 0.2,
      dashArray: '5, 5'
    });
    
    console.log('✅ Yeni edit polygon oluşturuldu');
    
    // Calculate and show area
    try {
      const coordinates = [...points.map(p => [p.lng, p.lat]), [points[0].lng, points[0].lat]];
      const turfPolygon = turf.polygon([coordinates]);
      const area = turf.area(turfPolygon);
      const areaInDonum = (area / 10000).toFixed(2);
      
      console.log('📐 Edit polygon alan hesaplandı:', Math.round(area), 'm²');
      
      // Tooltip'i sadece hoverda ve üstte göster
      editPolygon.bindTooltip(
        `<strong>📝 Düzenleniyor</strong><br>Alan: ${areaInDonum} dönüm<br>(${Math.round(area)} m²)`,
        {
          className: 'polygon-tooltip',
          permanent: false, // sadece hoverda göster
          direction: 'top', // üstte göster
          offset: [0, -10]
        }
      );
    } catch (error) {
      console.error('❌ Edit area calculation error:', error);
    }
    
    editPolygon.addTo(editLayerRef.current);
    console.log('✅ Edit polygon katmana eklendi');
  }, []);

  // Start drawing
  const startDrawing = useCallback(() => {
    console.log('🎯 startDrawing çağrıldı! disabled:', disabled, 'isDrawing:', isDrawing);
    
    if (disabled) {
      console.log('❌ Drawing disabled, çıkılıyor');
      return;
    }
    
    console.log('✅ Drawing başlatılıyor...');
    setIsDrawing(true);
    setCurrentPoints([]);
    setEditingIndex(-1);
    onDrawingStateChange?.(true);
    
    // Clear any existing editing
    editLayerRef.current?.clearLayers();
    editMarkersRef.current = [];
    
    map.doubleClickZoom.disable();
    console.log('🗺️ Harita hazır, click event handler aktif!');
  }, [disabled, onDrawingStateChange, map]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    console.log('🛑 stopDrawing çağrıldı! isDrawing:', isDrawing, 'currentPoints:', currentPoints.length);
    
    setIsDrawing(false);
    onDrawingStateChange?.(false);
    drawingLayerRef.current?.clearLayers();
    setCurrentPoints([]);
    map.doubleClickZoom.enable();
    
    console.log('✅ Drawing durduruldu ve katmanlar temizlendi');
  }, [onDrawingStateChange, map, isDrawing, currentPoints.length]);

  // Complete polygon
  const completePolygon = useCallback(() => {
    console.log('🏁 completePolygon çağrıldı! points:', currentPoints.length);
    
    if (currentPoints.length < 3) {
      console.log('❌ Yeterli nokta yok, minimum 3 gerekli');
      return;
    }

    console.log('✅ Polygon tamamlanıyor, alan hesaplanıyor...');

    // Calculate area
    const coordinates = [...currentPoints.map(p => [p.lng, p.lat]), [currentPoints[0].lng, currentPoints[0].lat]];
    const turfPolygon = turf.polygon([coordinates]);
    const area = Math.round(turf.area(turfPolygon));

    const polygon: DrawnPolygon = {
      points: currentPoints,
      area
    };

    console.log('📐 Alan hesaplandı:', area, 'm²');

    // Add to permanent layer
    addPermanentPolygon(polygon);
    
    // Clear drawing
    setCurrentPoints([]);
    drawingLayerRef.current?.clearLayers();
    
    console.log('✅ Polygon tamamlandı ve katmana eklendi');
    onPolygonComplete?.(polygon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPoints, onPolygonComplete]); // addPermanentPolygon is stable

  // Add permanent polygon
  const addPermanentPolygon = useCallback((polygonData: DrawnPolygon, existingId?: string, existingPolygonsArray?: Array<{
    polygon: DrawnPolygon;
    color: string;
    name: string;
    id?: string;
  }>) => {
    if (!polygonsLayerRef.current) return;

    const uniqueId = existingId || `${drawingMode || 'polygon'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

    // Add click for edit - simplified
    polygon.on('click', (e) => {
      console.log('🎯 Polygon tıklandı! uniqueId:', uniqueId);
      e.originalEvent?.stopPropagation();
      
      // Use provided array or fallback to current existingPolygons
      const polygonsArray = existingPolygonsArray || existingPolygons;
      
      // Find polygon in existingPolygons array
      const index = polygonsArray.findIndex(item => {
        if (item.id === uniqueId) return true;
        
        // Fallback: compare by points and area
        return item.polygon.points.length === polygonData.points.length &&
               Math.abs(item.polygon.area - polygonData.area) < 100 &&
               item.polygon.points.every((point, i) => 
                 Math.abs(point.lat - polygonData.points[i].lat) < 0.000001 &&
                 Math.abs(point.lng - polygonData.points[i].lng) < 0.000001
               );
      });
      
      console.log('🔍 Edit için polygon index bulundu:', index);
      if (index >= 0) {
        startEditModeRef.current?.(index);
      } else {
        console.log('❌ Polygon index bulunamadı!');
      }
    });

    polygon.addTo(polygonsLayerRef.current);
  }, [drawingMode, polygonColor, polygonName, existingPolygons]);

  // Optimized edit mode
  const startEditMode = useCallback((polygonIndex: number) => {
    console.log('🎯 startEditMode çağrıldı! polygonIndex:', polygonIndex, 'isDrawing:', isDrawing, 'currentEditingIndex:', editingIndex);
    
    if (isDrawing || !existingPolygons[polygonIndex]) {
      console.log('❌ Edit mode başlatılamadı - isDrawing:', isDrawing, 'polygon exists:', !!existingPolygons[polygonIndex]);
      return;
    }

    // Aynı polygon zaten editleniyorsa, işlem yapma
    if (editingIndex === polygonIndex) {
      console.log('⚠️ Bu polygon zaten edit modunda, işlem iptal ediliyor');
      return;
    }

    console.log('✅ Edit mode başlatılıyor...');
    
    // Debug: Show current polygon data
    if (existingPolygons[polygonIndex]) {
      const currentPolygon = existingPolygons[polygonIndex];
      console.log('🔍 Edit edilecek polygon verisi:', {
        index: polygonIndex,
        id: currentPolygon.id,
        pointCount: currentPolygon.polygon.points.length,
        area: currentPolygon.polygon.area,
        firstPoint: currentPolygon.polygon.points[0]
      });
    }
    
    // Eğer başka bir polygon editleniyorsa, önce o edit'i bitir
    if (editingIndex >= 0) {
      console.log('🔄 Önce mevcut edit mode bitiriliyor, index:', editingIndex);
      
      // Previous edit'i düzgün şekilde bitir - bu polygon katmanını da yenileyecek
      
      // Edit layers'ı temizle
      editLayerRef.current?.clearLayers();
      editMarkersRef.current = [];
      editingPointsRef.current = [];
      
      // editingIndex'i sıfırla ki existingPolygons useEffect'i tetiklensin
      setEditingIndex(-1);
      
      console.log('⏳ Önceki edit tamamlandı, polygon katmanı yenilenecek...');
      
      // Önceki edit'in katman güncellemesinin tamamlanması için kısa bir bekleme
      setTimeout(() => {
        console.log('🔄 Delayed olarak yeni edit başlatılıyor, polygonIndex:', polygonIndex);
        
        // Şimdi yeni edit'i başlat (recursive call ama kontrollü)
        if (editingIndex === -1) { // Emin ol ki önceki edit bitti
          setEditingIndex(polygonIndex);
          setIsDrawing(false);
          
          const points = existingPolygons[polygonIndex].polygon.points;
          editingPointsRef.current = [...points];
          console.log('🔍 Edit edilecek noktalar:', points.length, points);

          // Clear previous edit markers
          editLayerRef.current?.clearLayers();
          editMarkersRef.current = [];

          // Create edit markers - with proper event handling from original code
          points.forEach((point, index) => {
            console.log('🔨 Edit marker oluşturuluyor! index:', index, 'point:', point);
            
            const marker = L.marker([point.lat, point.lng], {
              draggable: true,
              // Responsive drag için optimize edilmiş ayarlar (orijinal koddan)
              interactive: true,
              bubblingMouseEvents: false,
              zIndexOffset: 1000,
              pane: 'editPane',
              icon: L.divIcon({
                html: '<div class="marker-handle"></div>',
                className: 'edit-marker draggable-marker',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              })
            });

            console.log('✅ Marker oluşturuldu! draggable:', marker.options.draggable);

            // Test marker click first
            marker.on('click', () => {
              console.log('🎯 Edit marker tıklandı! index:', index);
            });

            // Drag start event - tüm map kontrollerini devre dışı bırak (orijinal koddan)
            marker.on('dragstart', (e: any) => {
              console.log('🎯 Marker drag başladı! index:', index);
              
              // Drag sırasında tüm map kontrollerini devre dışı bırak
              map.dragging.disable();
              map.touchZoom.disable();
              map.doubleClickZoom.disable();
              map.scrollWheelZoom.disable();
              map.boxZoom.disable();
              map.keyboard.disable();
              
              // Visual feedback
              const markerElement = e.target.getElement();
              if (markerElement) {
                const handleElement = markerElement.querySelector('.marker-handle');
                if (handleElement) {
                  handleElement.style.transform = 'scale(1.2)';
                  handleElement.style.zIndex = '2000';
                }
              }
            });

            // Drag event - throttle ile performance optimizasyonu (orijinal koddan)
            let dragThrottle: NodeJS.Timeout | null = null;
            marker.on('drag', (e: any) => {
              const newLatLng = e.target.getLatLng();
              
              // Throttle drag updates
              if (dragThrottle) {
                clearTimeout(dragThrottle);
              }
              
              dragThrottle = setTimeout(() => {
                const updatedPoints = [...editingPointsRef.current];
                updatedPoints[index] = { lat: newLatLng.lat, lng: newLatLng.lng };
                editingPointsRef.current = updatedPoints;
                setCurrentPoints([...updatedPoints]);
                
                console.log('🔄 Marker sürüklendi:', { 
                  index, 
                  newLat: newLatLng.lat.toFixed(6), 
                  newLng: newLatLng.lng.toFixed(6) 
                });
                
                // Immediate visual update during drag
                updateEditVisual(updatedPoints);
                
                // Çizimin güncellenmesi için onChange callback'i çağır
                if (onPolygonEdit && updatedPoints.length >= 3) {
                  try {
                    const coordinates = [...updatedPoints.map(p => [p.lng, p.lat]), [updatedPoints[0].lng, updatedPoints[0].lat]];
                    const turfPolygon = turf.polygon([coordinates]);
                    const area = turf.area(turfPolygon);
                    
                    const editedPolygon: DrawnPolygon = {
                      points: updatedPoints,
                      area: Math.round(area)
                    };
                    
                    onPolygonEdit(editedPolygon, polygonIndex);
                  } catch (error) {
                    console.error('Drag sırasında alan hesaplama hatası:', error);
                  }
                }
              }, 50);
            });

            // Drag end event - map kontrollerini yeniden etkinleştir (orijinal koddan)
            marker.on('dragend', (e: any) => {
              if (dragThrottle) {
                clearTimeout(dragThrottle);
                dragThrottle = null;
              }
              
              const finalLatLng = e.target.getLatLng();
              console.log('✅ Marker drag tamamlandı:', { 
                index, 
                finalLat: finalLatLng.lat.toFixed(6), 
                finalLng: finalLatLng.lng.toFixed(6),
                totalPoints: editingPointsRef.current.length 
              });
              
              // Visual feedback geri al
              const markerElement = e.target.getElement();
              if (markerElement) {
                const handleElement = markerElement.querySelector('.marker-handle');
                if (handleElement) {
                  handleElement.style.transform = 'scale(1)';
                  handleElement.style.zIndex = '1001';
                }
              }
              
              // Tüm map kontrollerini yeniden etkinleştir
              map.dragging.enable();
              map.touchZoom.enable();
              map.doubleClickZoom.enable();
              map.scrollWheelZoom.enable();
              map.boxZoom.enable();
              map.keyboard.enable();
            });

            console.log('📌 Event handlerlar eklendi, marker ekleniyor...');
            marker.addTo(editLayerRef.current!);
            editMarkersRef.current.push(marker);
            console.log('✅ Marker katmana eklendi! Total markers:', editMarkersRef.current.length);
          });

          // Hide currently editing polygon (not others)
          console.log('👁️ Şu anda edit edilen polygon gizleniyor, polygonIndex:', polygonIndex);
          polygonsLayerRef.current?.eachLayer((layer: any) => {
            const targetId = existingPolygons[polygonIndex].id;
            if (layer.options?.polygonId === targetId) {
              console.log('🙈 Polygon gizlendi, targetId:', targetId);
              layer.setStyle({ opacity: 0, fillOpacity: 0 });
            }
          });

          // Show initial edit visual
          setTimeout(() => {
            updateEditVisual(points);
          }, 50);
        }
      }, 100);
      
      return; // Fonksiyondan çık, setTimeout devam edecek
    }
    
    // Önceki edit modundan çıkılırken tüm polygonları restore et
    console.log('🔄 Tüm polygonları restore ediliyor...');
    polygonsLayerRef.current?.eachLayer((layer: any) => {
      layer.setStyle({ opacity: 0.8, fillOpacity: 0.3 });
    });
    
    setEditingIndex(polygonIndex);
    setIsDrawing(false);
    
    const points = existingPolygons[polygonIndex].polygon.points;
    editingPointsRef.current = [...points];
    console.log('🔍 Edit edilecek noktalar:', points.length, points);

    // Clear previous edit markers
    editLayerRef.current?.clearLayers();
    editMarkersRef.current = [];

    // Create edit markers - with proper event handling from original code
    points.forEach((point, index) => {
      console.log('🔨 Edit marker oluşturuluyor! index:', index, 'point:', point);
      
      const marker = L.marker([point.lat, point.lng], {
        draggable: true,
        // Responsive drag için optimize edilmiş ayarlar (orijinal koddan)
        interactive: true,
        bubblingMouseEvents: false,
        zIndexOffset: 1000,
        pane: 'editPane',
        icon: L.divIcon({
          html: '<div class="marker-handle"></div>',
          className: 'edit-marker draggable-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        })
      });

      console.log('✅ Marker oluşturuldu! draggable:', marker.options.draggable);

      // Test marker click first
      marker.on('click', () => {
        console.log('🎯 Edit marker tıklandı! index:', index);
      });

      // Drag start event - tüm map kontrollerini devre dışı bırak (orijinal koddan)
      marker.on('dragstart', (e: any) => {
        console.log('🎯 Marker drag başladı! index:', index);
        
        // Drag sırasında tüm map kontrollerini devre dışı bırak
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        
        // Visual feedback
        const markerElement = e.target.getElement();
        if (markerElement) {
          const handleElement = markerElement.querySelector('.marker-handle');
          if (handleElement) {
            handleElement.style.transform = 'scale(1.2)';
            handleElement.style.zIndex = '2000';
          }
        }
      });

      // Drag event - throttle ile performance optimizasyonu (orijinal koddan)
      let dragThrottle: NodeJS.Timeout | null = null;
      marker.on('drag', (e: any) => {
        const newLatLng = e.target.getLatLng();
        
        // Throttle drag updates
        if (dragThrottle) {
          clearTimeout(dragThrottle);
        }
        
        dragThrottle = setTimeout(() => {
          const updatedPoints = [...editingPointsRef.current];
          updatedPoints[index] = { lat: newLatLng.lat, lng: newLatLng.lng };
          editingPointsRef.current = updatedPoints;
          setCurrentPoints([...updatedPoints]);
          
          console.log('🔄 Marker sürüklendi:', { 
            index, 
            newLat: newLatLng.lat.toFixed(6), 
            newLng: newLatLng.lng.toFixed(6) 
          });
          
          // Immediate visual update during drag
          updateEditVisual(updatedPoints);
          
          // Çizimin güncellenmesi için onChange callback'i çağır
          if (onPolygonEdit && updatedPoints.length >= 3) {
            try {
              const coordinates = [...updatedPoints.map(p => [p.lng, p.lat]), [updatedPoints[0].lng, updatedPoints[0].lat]];
              const turfPolygon = turf.polygon([coordinates]);
              const area = turf.area(turfPolygon);
              
              const editedPolygon: DrawnPolygon = {
                points: updatedPoints,
                area: Math.round(area)
              };
              
              onPolygonEdit(editedPolygon, polygonIndex);
            } catch (error) {
              console.error('Drag sırasında alan hesaplama hatası:', error);
            }
          }
        }, 50);
      });

      // Drag end event - map kontrollerini yeniden etkinleştir (orijinal koddan)
      marker.on('dragend', (e: any) => {
        if (dragThrottle) {
          clearTimeout(dragThrottle);
          dragThrottle = null;
        }
        
        const finalLatLng = e.target.getLatLng();
        console.log('✅ Marker drag tamamlandı:', { 
          index, 
          finalLat: finalLatLng.lat.toFixed(6), 
          finalLng: finalLatLng.lng.toFixed(6),
          totalPoints: editingPointsRef.current.length 
        });
        
        // Visual feedback geri al
        const markerElement = e.target.getElement();
        if (markerElement) {
          const handleElement = markerElement.querySelector('.marker-handle');
          if (handleElement) {
            handleElement.style.transform = 'scale(1)';
            handleElement.style.zIndex = '1001';
          }
        }
        
        // Tüm map kontrollerini yeniden etkinleştir
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
      });

      console.log('📌 Event handlerlar eklendi, marker ekleniyor...');
      marker.addTo(editLayerRef.current!);
      editMarkersRef.current.push(marker);
      console.log('✅ Marker katmana eklendi! Total markers:', editMarkersRef.current.length);
    });

    // Hide currently editing polygon (not others)
    console.log('👁️ Şu anda edit edilen polygon gizleniyor, polygonIndex:', polygonIndex);
    polygonsLayerRef.current?.eachLayer((layer: any) => {
      const targetId = existingPolygons[polygonIndex].id;
      if (layer.options?.polygonId === targetId) {
        console.log('🙈 Polygon gizlendi, targetId:', targetId);
        layer.setStyle({ opacity: 0, fillOpacity: 0 });
      }
    });

    // Show initial edit visual
    setTimeout(() => {
      updateEditVisual(points);
    }, 50);
  }, [isDrawing, existingPolygons, onPolygonEdit, map, updateEditVisual]);

  // Update startEditMode ref
  useEffect(() => {
    startEditModeRef.current = startEditMode;
  }, [startEditMode]);

  // Stop edit mode
  const stopEditMode = useCallback(() => {
    console.log('🛑 stopEditMode çağrıldı! Mevcut editingIndex:', editingIndex);
    
    if (editingIndex < 0) { // Already stopped or not editing
      console.log('⚠️ stopEditMode: Zaten edit modunda değil.');
      return;
    }

    const idxBeingStopped = editingIndex; // Capture before resetting
    
    // Debug: Show current state before stopping
    console.log('🛑 Edit mode durduruluyor:', {
      editingIndex: idxBeingStopped,
      editingPointsCount: editingPointsRef.current.length,
      editMarkersCount: editMarkersRef.current.length,
      existingPolygonsCount: existingPolygons.length
    });

    // 1. Clean up editing layers and refs
    editLayerRef.current?.clearLayers();
    editMarkersRef.current = [];
    editingPointsRef.current = []; // Clear edited points ref

    // Clear all drag throttles
    Object.values(dragThrottleRef.current).forEach(clearTimeout);
    dragThrottleRef.current = {};

    // 2. Important: Reset editingIndex. This will allow the main polygon layer
    //    to refresh based on the latest existingPolygons.
    setEditingIndex(-1); 
    setIsDrawing(false); // Ensure drawing mode is also off if it was somehow on

    // 3. The useEffect listening to [existingPolygons, editingIndex] will now run
    //    because editingIndex changed to -1. It will clear polygonsLayerRef
    //    and redraw all polygons from the (hopefully updated by onPolygonEdit)
    //    existingPolygons prop. This ensures the *edited* polygon is shown.

    console.log(`✅ Edit mode durduruldu: index ${idxBeingStopped}. PolygonsLayer güncellenmesi bekleniyor.`);
    
    // Force immediate refresh to ensure visual update
    setTimeout(() => {
      console.log('🔄 Forced refresh after edit stop');
    }, 100);

  }, [editingIndex, existingPolygons]);

  // Load existing polygons - simplified
  useEffect(() => {
    // This effect runs when existingPolygons changes OR when editingIndex changes to -1 (edit stopped)
    if (editingIndex >= 0) {
      console.log(`🚫 Edit devam ediyor (index ${editingIndex}), existingPolygons yüklemesi atlandı.`);
      return; // Don't reload permanent polygons while an edit is active
    }

    console.log('🔄 Existing polygons yeniden yükleniyor/güncelleniyor, count:', existingPolygons.length);
    
    // Debug: Show each polygon being loaded
    existingPolygons.forEach((item, index) => {
      if (item && item.polygon) {
        console.log(`  🔍 Loading polygon ${index}: ID=${item.id}, Points=${item.polygon.points.length}, Area=${item.polygon.area}`);
        console.log(`    First point: lat=${item.polygon.points[0]?.lat.toFixed(6)}, lng=${item.polygon.points[0]?.lng.toFixed(6)}`);
      }
    });
    
    polygonsLayerRef.current?.clearLayers(); // Clear before redrawing all
    
    existingPolygons.forEach((item, index) => {
      // Ensure item and item.polygon exist
      if (item && item.polygon) {
        console.log(`  📐 Polygon yükleniyor: index ${index}, ID: ${item.id || 'ID_YOK'}, Alan: ${item.polygon.area}`);
        addPermanentPolygon(item.polygon, item.id, existingPolygons); // Pass existing polygons array
      } else {
        console.warn(`  ⚠️ Hatalı polygon verisi, index ${index}:`, item);
      }
    });
    
    console.log('✅ Existing polygons yükleme tamamlandı');
  }, [existingPolygons, editingIndex, addPermanentPolygon]);

  // Listen for external polygon clear requests
  useEffect(() => {
    // This effect will be triggered when parent calls onPolygonClear
    // We need to clear all our internal layers as well
    const handleClearRequest = () => {
      console.log('🧹 PolygonDrawerOptimized: External clear request received');
      // Clear all layers
      polygonsLayerRef.current?.clearLayers();
      drawingLayerRef.current?.clearLayers();
      editLayerRef.current?.clearLayers();
      // Reset internal state
      setCurrentPoints([]);
      setEditingIndex(-1);
      editMarkersRef.current = [];
      editingPointsRef.current = [];
      console.log('✅ PolygonDrawerOptimized: All layers and state cleared');
    };
    
    // Store the clear function globally so parent can call it
    // This is a workaround since we can't directly listen to callback calls
    if (typeof window !== 'undefined') {
      (window as any).__polygonDrawerClear = handleClearRequest;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__polygonDrawerClear;
      }
    };
  }, []);

  // Drawing mode buttons handler
  const handleModeChange = useCallback((mode: 'tarla' | 'dikili') => {
    if (drawingMode === mode && isDrawing) return;
    
    onDrawingModeChange?.(mode);
    setTimeout(() => startDrawing(), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawingMode, isDrawing, onDrawingModeChange]); // startDrawing is stable

  // Auto-start/stop drawing when mode changes and we're not editing
  useEffect(() => {
    if (drawingMode && !isDrawing && editingIndex < 0) {
      console.log('🎯 Drawing mode değişti, otomatik drawing başlatılıyor:', drawingMode);
      startDrawing();
    } else if (!drawingMode && isDrawing) {
      console.log('🛑 Drawing mode null oldu, otomatik drawing durduruluyor');
      stopDrawing();
    }
  }, [drawingMode, isDrawing, editingIndex, startDrawing, stopDrawing]);

  // Listen for external edit triggers
  useEffect(() => {
    if (externalEditTrigger && externalEditTrigger.timestamp > 0 && externalEditTrigger.polygonIndex >= 0) {
      console.log('🎯 External edit trigger algılandı:', externalEditTrigger);
      const { polygonIndex } = externalEditTrigger;
      
      // Check if polygon exists
      if (polygonIndex < existingPolygons.length) {
        console.log('🎯 startEditMode çağrılıyor, polygonIndex:', polygonIndex);
        startEditMode(polygonIndex);
      } else {
        console.warn('⚠️ Geçersiz polygon index:', polygonIndex, 'Toplam polygon sayısı:', existingPolygons.length);
      }
    }
  }, [externalEditTrigger, startEditMode, existingPolygons]);

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
