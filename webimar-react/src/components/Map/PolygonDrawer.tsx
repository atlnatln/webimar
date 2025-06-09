import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { useMap, useMapEvents } from 'react-leaflet'; // useMapEvents eklendi, useCallback eklendi
import styled from 'styled-components';

// Global CSS for polygon tooltips
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
  .polygon-tooltip:before {
    border-top-color: #3498db !important;
  }
`;

// Global style'ı head'e ekle
if (typeof document !== 'undefined' && !document.getElementById('polygon-tooltip-style')) {
  const style = document.createElement('style');
  style.id = 'polygon-tooltip-style';
  style.textContent = GlobalStyle;
  document.head.appendChild(style);
}

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
  externalDrawingTrigger?: number;
  externalStopTrigger?: number;
  externalClearTrigger?: number;
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
  externalDrawingTrigger = 0,
  externalStopTrigger = 0,
  externalClearTrigger = 0,
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
  const completedPolygonsLayerRef = useRef<L.LayerGroup | null>(null); // Tamamlanmış poligonlar için katman
  
  // const markersRef = useRef<L.Marker[]>([]); // KALDIRILDI
  // const linesRef = useRef<L.Polyline[]>([]); // KALDIRILDI
  // const polygonRef = useRef<L.Polygon | null>(null); // KALDIRILDI
  // const mapClickHandlerRef = useRef<((e: L.LeafletMouseEvent) => void) | null>(null); // KALDIRILDI, useMapEvents kullanılıyor
  const helpMarkerRef = useRef<HTMLDivElement | null>(null);

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
    // Tamamlanmış poligonlar için ayrı katman oluştur (haritaya doğrudan eklenir)
    if (!completedPolygonsLayerRef.current) {
      completedPolygonsLayerRef.current = L.layerGroup().addTo(map);
    }
    
    return () => {
      if (drawingLayerRef.current) {
        map.removeLayer(drawingLayerRef.current); // Ana katmanı kaldırmak alt katmanları da kaldırır
        drawingLayerRef.current = null;
        markersLayerRef.current = null;
        linesLayerRef.current = null;
        polygonLayerRef.current = null;
      }
      if (completedPolygonsLayerRef.current) {
        map.removeLayer(completedPolygonsLayerRef.current);
        completedPolygonsLayerRef.current = null;
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
    dblclick: (e) => {
      if (isDrawing) {
        // Event'i durdur ve polygon'u tamamla
        e.originalEvent?.stopPropagation();
        e.originalEvent?.preventDefault();
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
    
    // Çizim sırasında çift tıklama yakınlaştırmasını devre dışı bırak
    map.doubleClickZoom.disable();
    
    console.log('🎨 Çizim başlatıldı, double-click zoom devre dışı');
  };

  // Çizimi durdur
  const stopDrawing = () => {
    setIsDrawing(false);
    onDrawingStateChange?.(false);
    
    // Çizim bittiğinde çift tıklama yakınlaştırmasını tekrar aktifleştir
    map.doubleClickZoom.enable();
    
    console.log('🛑 Çizim durduruldu, double-click zoom aktif');
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

  // Kalıcı polygon ekle (tamamlanmış poligonlar için)
  const addPermanentPolygon = (points: PolygonPoint[], color: string = polygonColor, name: string = polygonName) => {
    if (!completedPolygonsLayerRef.current || points.length < 3) return;
    
    const latLngs = points.map(p => [p.lat, p.lng] as [number, number]);
    
    const polygon = L.polygon(latLngs, {
      color: color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.3,
      opacity: 0.8
    });
    
    // Polygon'a tooltip ekle
    try {
      const coordinates = [...points.map(p => [p.lng, p.lat]), [points[0].lng, points[0].lat]];
      const turfPolygon = turf.polygon([coordinates]);
      const area = turf.area(turfPolygon); // m² cinsinden
      const areaInDonum = (area / 10000).toFixed(2);
      
      polygon.bindTooltip(`
        <strong>${name}</strong><br>
        Alan: ${areaInDonum} dönüm<br>
        (${Math.round(area)} m²)
      `, {
        permanent: false,
        direction: 'center',
        className: 'polygon-tooltip'
      });
    } catch (error) {
      console.error('Tooltip oluşturma hatası:', error);
    }
    
    polygon.addTo(completedPolygonsLayerRef.current);
    console.log(`🔥 Kalıcı polygon eklendi: ${name}, renk: ${color}`);
    
    return polygon;
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
    
    // ÖNEMLİ: Polygon'u kalıcı katmana ekle (kaybolmasını önler)
    addPermanentPolygon(currentPoints, polygonColor, polygonName);
    
    // Sadece çizim katmanlarını temizle (kalıcı polygon korunur)
    setCurrentPoints([]);
    setCurrentArea(0);
    markersLayerRef.current?.clearLayers();
    linesLayerRef.current?.clearLayers();
    polygonLayerRef.current?.clearLayers();
    
    onPolygonComplete?.(polygon);
    
    console.log('✅ Polygon tamamlandı ve kalıcı katmana eklendi, alan:', polygon.area, 'm²');
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
    console.log('🧹 Tam temizleme başlatılıyor...');
    
    // Önce tüm kalıcı poligonları temizle
    if (completedPolygonsLayerRef.current) {
      completedPolygonsLayerRef.current.clearLayers();
      console.log('✅ Kalıcı poligonlar temizlendi');
    }
    
    // Sonra çizim durumunu temizle
    if (isDrawing) {
      stopDrawing();
    }
    clearDrawing();
    
    console.log('🧹 Tüm poligonlar (kalıcı dahil) temizlendi');
    
    // Güvenlik için double-click zoom'u yeniden aktifleştir
    map.doubleClickZoom.enable();
  };

  // Yardım mesajı göster
  const showHelpMessage = () => {
    // Eğer zaten help mesajı varsa, hiçbir şey yapma
    if (helpMarkerRef.current) {
      return;
    }
    
    // CSS ile sabit konumlandırma için DOM elementini doğrudan oluştur
    const helpDiv = document.createElement('div');
    helpDiv.className = 'polygon-help-message';
    helpDiv.innerHTML = '📍 Polygon çizmek için haritaya tıklayın';
    helpDiv.style.cssText = `
      position: absolute;
      top: 10px;
      left: 50px;
      z-index: 1000;
      background-color: rgba(255, 255, 255, 0.92);
      color: #2c3e50;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      border: 1px solid #bdc3c7;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      pointer-events: none;
      white-space: nowrap;
    `;
    
    // Harita konteynerine ekle
    const mapContainer = map.getContainer();
    mapContainer.appendChild(helpDiv);
    
    // Referansı sakla (DOM element olarak)
    helpMarkerRef.current = helpDiv;
  };

  // Yardım mesajını gizle
  const hideHelpMessage = () => {
    // Mevcut referansı temizle
    if (helpMarkerRef.current) {
      const mapContainer = map.getContainer();
      if (mapContainer.contains(helpMarkerRef.current)) {
        mapContainer.removeChild(helpMarkerRef.current);
      }
      helpMarkerRef.current = null;
    }
    
    // Tüm polygon-help-message sınıfına sahip elementleri temizle (güvenlik için)
    const mapContainer = map.getContainer();
    const existingMessages = mapContainer.querySelectorAll('.polygon-help-message');
    existingMessages.forEach(element => {
      if (mapContainer.contains(element)) {
        mapContainer.removeChild(element);
      }
    });
  };

  // External triggers
  useEffect(() => {
    if (externalDrawingTrigger > 0 && !disabled) {
      startDrawing();
    }
  }, [externalDrawingTrigger]);

  useEffect(() => {
    if (externalStopTrigger > 0) {
      stopDrawing();
    }
  }, [externalStopTrigger]);

  useEffect(() => {
    if (externalClearTrigger > 0) {
      fullClear(); // clearDrawing yerine fullClear kullan
    }
  }, [externalClearTrigger]);

  // Help mesajını isDrawing state'ine göre yönet
  useEffect(() => {
    if (isDrawing) {
      showHelpMessage();
    } else {
      hideHelpMessage();
    }
  }, [isDrawing]);

  // Mevcut poligonları yükle (component mount olduğunda)
  useEffect(() => {
    if (existingPolygons && existingPolygons.length > 0 && completedPolygonsLayerRef.current) {
      console.log('📋 Mevcut poligonlar yükleniyor:', existingPolygons.length, 'adet');
      existingPolygons.forEach((item, index) => {
        addPermanentPolygon(item.polygon.points, item.color, item.name);
      });
    }
  }, [existingPolygons, completedPolygonsLayerRef.current]);

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
