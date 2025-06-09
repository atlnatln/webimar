import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { useMap, useMapEvents } from 'react-leaflet'; // useMapEvents eklendi, useCallback eklendi
import styled from 'styled-components';

const DrawingControls = styled.div`
  position: absolute;
  top: 60px;
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
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? '#c0392b' : '#2980b9'};
  }
  
  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

const InfoPanel = styled.div`
  background: #ffffff;
  border: 2px solid #3498db;
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;
  font-size: 11px;
  max-width: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

interface PolygonPoint {
  lat: number;
  lng: number;
}

interface DrawnPolygon {
  points: PolygonPoint[];
  area: number; // m² cinsinden
}

interface PolygonDrawerProps {
  onPolygonComplete?: (polygon: DrawnPolygon) => void;
  onPolygonClear?: () => void;
  onDrawingStateChange?: (isDrawing: boolean) => void;
  disabled?: boolean;
  polygonColor?: string;
  polygonName?: string;
  hideControls?: boolean;
  autoStart?: boolean;
  externalDrawingTrigger?: boolean;
  externalStopTrigger?: boolean;
  externalClearTrigger?: boolean;
  existingPolygons?: Array<{
    polygon: DrawnPolygon;
    color: string;
    name: string;
  }>;
}

const PolygonDrawer: React.FC<PolygonDrawerProps> = ({
  onPolygonComplete,
  onPolygonClear,
  onDrawingStateChange,
  disabled = false,
  polygonColor = '#e74c3c',
  polygonName = 'Polygon',
  hideControls = false,
  autoStart = false,
  externalDrawingTrigger = false,
  externalStopTrigger = false,
  externalClearTrigger = false,
  existingPolygons = [],
}) => {
  const map = useMap();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<PolygonPoint[]>([]);
  const [currentArea, setCurrentArea] = useState<number>(0);
  
  // Referanslar
  const drawingLayerRef = useRef<L.LayerGroup | null>(null); // Ana çizim katmanı
  const markersLayerRef = useRef<L.LayerGroup | null>(null); // Sadece markerlar için alt katman
  const linesLayerRef = useRef<L.LayerGroup | null>(null);   // Sadece çizgiler için alt katman
  const polygonLayerRef = useRef<L.LayerGroup | null>(null); // Sadece poligon için alt katman
  
  // const markersRef = useRef<L.Marker[]>([]); // KALDIRILDI
  // const linesRef = useRef<L.Polyline[]>([]); // KALDIRILDI
  // const polygonRef = useRef<L.Polygon | null>(null); // KALDIRILDI
  // const mapClickHandlerRef = useRef<((e: L.LeafletMouseEvent) => void) | null>(null); // KALDIRILDI, useMapEvents kullanılıyor
  const helpMarkerRef = useRef<L.Marker | null>(null);

  // Çizim katmanlarını başlat
  useEffect(() => {
    if (!drawingLayerRef.current) {
      drawingLayerRef.current = L.layerGroup().addTo(map);
    }
    if (!markersLayerRef.current && drawingLayerRef.current) {
      markersLayerRef.current = L.layerGroup().addTo(drawingLayerRef.current);
    }
    if (!linesLayerRef.current && drawingLayerRef.current) {
      linesLayerRef.current = L.layerGroup().addTo(drawingLayerRef.current);
    }
    if (!polygonLayerRef.current && drawingLayerRef.current) {
      polygonLayerRef.current = L.layerGroup().addTo(drawingLayerRef.current);
    }
    
    return () => {
      if (drawingLayerRef.current) {
        map.removeLayer(drawingLayerRef.current); // Ana katmanı kaldırmak alt katmanları da kaldırır
        drawingLayerRef.current = null;
        markersLayerRef.current = null;
        linesLayerRef.current = null;
        polygonLayerRef.current = null;
      }
    };
  }, [map]);

  // Harita tıklama işleyicisi - basitleştirilmiş versiyon
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!isDrawing) return;
    
    e.originalEvent?.stopPropagation();
    e.originalEvent?.preventDefault();
    
    const newPoint: PolygonPoint = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    };
    
    // Yeni nokta listesini oluştur
    const newPoints = [...currentPoints, newPoint];
    console.log('📍 Nokta eklendi. Toplam:', newPoints.length);
    
    // State'i güncelle
    setCurrentPoints(newPoints);
    
    // Visual güncellemeleri hemen yap
    addMarker(e.latlng, newPoints.length);
    if (newPoints.length >= 2) {
      addLine(newPoints[newPoints.length - 2], newPoint);
    }
    if (newPoints.length >= 3) {
      updatePolygon(newPoints);
    }
  };

  // useMapEvents hook'u ile harita olaylarını yönet
  useMapEvents({
    click: handleMapClick,
    dblclick: () => {
      if (isDrawing) {
        completePolygon();
      }
    }
  });

  // Çizimi başlat
  const startDrawing = () => {
    if (disabled || isDrawing) return;
    
    setIsDrawing(true);
    onDrawingStateChange?.(true);
    setCurrentPoints([]);
    setCurrentArea(0);
    clearDrawing();
    showHelpMessage();
    console.log('🎨 Çizim başlatıldı');
  };

  // Çizimi durdur
  const stopDrawing = () => {
    setIsDrawing(false);
    onDrawingStateChange?.(false);
    hideHelpMessage();
    console.log('🛑 Çizim durduruldu');
  };

  // Marker ekle
  const addMarker = (latlng: L.LatLng, index: number) => {
    if (!markersLayerRef.current) return;
    
    // İlk nokta yeşil, son nokta mavi, diğerleri kırmızı küçük noktalar
    let backgroundColor = '#e74c3c'; // varsayılan kırmızı
    let size = 8;
    
    if (index === 1) {
      backgroundColor = '#27ae60'; // ilk nokta yeşil
      size = 10;
    }
    
    const marker = L.marker(latlng, {
      icon: L.divIcon({
        className: 'polygon-marker',
        html: `<div style="
          background-color: ${backgroundColor};
          border-radius: 50%;
          width: ${size}px;
          height: ${size}px;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
      })
    });
    
    marker.addTo(markersLayerRef.current); // markersLayerRef'e eklendi
    // markersRef.current.push(marker); // KALDIRILDI
  };

  // Çizgi ekle
  const addLine = (point1: PolygonPoint, point2: PolygonPoint) => {
    if (!linesLayerRef.current) return;
    const line = L.polyline([
      [point1.lat, point1.lng],
      [point2.lat, point2.lng]
    ], {
      color: '#e74c3c',
      weight: 3,
      opacity: 0.8
    });
    
    line.addTo(linesLayerRef.current); // linesLayerRef'e eklendi
    // linesRef.current.push(line); // KALDIRILDI
  };

  // Polygon güncelle
  const updatePolygon = (points: PolygonPoint[]) => {
    if (!polygonLayerRef.current) return;
    polygonLayerRef.current.clearLayers(); // Önceki poligonu temizle
    
    const latLngs = points.map(p => [p.lat, p.lng] as [number, number]);
    
    const polygon = L.polygon(latLngs, {
      color: '#e74c3c',
      weight: 2,
      fillColor: '#e74c3c',
      fillOpacity: 0.2
    });
    
    polygon.addTo(polygonLayerRef.current); // polygonLayerRef'e eklendi
      
    // Alanı hesapla (m² cinsinden) - Turf.js kullanarak
    try {
      const coordinates = [...points.map(p => [p.lng, p.lat]), [points[0].lng, points[0].lat]];
      const turfPolygon = turf.polygon([coordinates]);
      const area = turf.area(turfPolygon); // m² cinsinden
      setCurrentArea(Math.round(area));
    } catch (error) {
      console.error('Alan hesaplama hatası:', error);
      setCurrentArea(0);
    }
  };

  // Polygon tamamla
  const completePolygon = () => {
    if (currentPoints.length < 3) {
      alert('Polygon oluşturmak için en az 3 nokta gereklidir.');
      return;
    }
    
    console.log('✅ Polygon tamamlandı, area:', currentArea);
    
    const polygon: DrawnPolygon = {
      points: currentPoints,
      area: currentArea
    };
    
    // Çizim modunu durdurmak yerine sadece mevcut çizimi temizle
    // Bu sayede kullanıcı aynı tipte yeni polygon çizebilir
    setCurrentPoints([]);
    setCurrentArea(0);
    markersLayerRef.current?.clearLayers();
    linesLayerRef.current?.clearLayers();
    polygonLayerRef.current?.clearLayers();
    hideHelpMessage();
    
    onPolygonComplete?.(polygon);
    
    console.log('✅ Polygon tamamlandı, alan:', polygon.area, 'm²');
  };

  // Çizimi temizle
  const clearDrawing = () => {
    markersLayerRef.current?.clearLayers();
    linesLayerRef.current?.clearLayers();
    polygonLayerRef.current?.clearLayers();
        
    // State'i sıfırla
    setCurrentPoints([]);
    setCurrentArea(0);
    
    onPolygonClear?.();
  };

  // Tam temizleme (çizim durdur + temizle)
  const fullClear = () => {
    if (isDrawing) {
      stopDrawing();
    }
    clearDrawing();
  };

  // Yardım mesajı göster
  const showHelpMessage = () => {
    const helpMarker = L.marker(map.getCenter(), {
      icon: L.divIcon({
        className: 'help-marker',
        html: `<div style="
          background-color: rgba(52, 152, 219, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        ">📍 Polygon çizmek için haritaya tıklayın</div>`,
        iconSize: [200, 30],
        iconAnchor: [100, 15]
      })
    });
    
    if (drawingLayerRef.current) {
      helpMarker.addTo(drawingLayerRef.current);
      helpMarkerRef.current = helpMarker;
    }
  };

  // Yardım mesajını gizle
  const hideHelpMessage = () => {
    if (helpMarkerRef.current && drawingLayerRef.current) {
      drawingLayerRef.current.removeLayer(helpMarkerRef.current);
      helpMarkerRef.current = null;
    }
  };

  // External triggers
  useEffect(() => {
    if (externalDrawingTrigger && !disabled) {
      startDrawing();
    }
  }, [externalDrawingTrigger]);

  useEffect(() => {
    if (externalStopTrigger) {
      stopDrawing();
    }
  }, [externalStopTrigger]);

  useEffect(() => {
    if (externalClearTrigger) {
      clearDrawing();
    }
  }, [externalClearTrigger]);

  return (
    <>
      {!hideControls && (
        <DrawingControls>
          {!isDrawing ? (
            <DrawButton onClick={startDrawing} disabled={disabled}>
              🎨 Polygon Çiz
            </DrawButton>
          ) : (
            <>
              <DrawButton $active onClick={stopDrawing}>
                ⏹️ Çizimi Durdur
              </DrawButton>
              <DrawButton onClick={completePolygon} disabled={currentPoints.length < 3}>
                ✅ Tamamla
              </DrawButton>
            </>
          )}
          
          <DrawButton onClick={fullClear}>
            🗑️ Temizle
          </DrawButton>
          
          {isDrawing && (
            <InfoPanel>
              <div><strong>Çizim Bilgileri:</strong></div>
              <div>Nokta Sayısı: {currentPoints.length}</div>
              {currentArea > 0 && (
                <div>Alan: {(currentArea / 10000).toFixed(2)} dönüm</div>
              )}
              <div style={{ marginTop: 4, fontSize: 10, color: '#666' }}>
                Çift tıklayarak tamamlayın
              </div>
            </InfoPanel>
          )}
        </DrawingControls>
      )}
    </>
  );
};

export default PolygonDrawer;
export type { DrawnPolygon, PolygonPoint };
