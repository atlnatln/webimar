import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { useMap, useMapEvents } from 'react-leaflet'; // useMapEvents eklendi, useCallback eklendi
import styled from 'styled-components';

// Global window interface extension
declare global {
  interface Window {
    showAllHiddenPolygons?: () => void;
  }
}

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
  
  /* Edit marker görünürlüğünü garanti altına al */
  .edit-marker {
    z-index: 1000 !important;
    pointer-events: auto !important;
    cursor: move !important;
  }
  
  .edit-marker > div, .edit-marker .marker-handle {
    pointer-events: auto !important;
    z-index: 1000 !important;
    position: relative !important;
    cursor: move !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
  }
  
  .draggable-marker {
    transition: transform 0.1s ease !important;
  }
  
  .draggable-marker:hover .marker-handle {
    transform: scale(1.1) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
  }
  
  .draggable-marker:active .marker-handle {
    transform: scale(1.2) !important;
    box-shadow: 0 6px 16px rgba(0,0,0,0.6) !important;
  }
  
  /* Edit layer pane için özel stil */
  .leaflet-edit-pane {
    z-index: 999 !important;
    pointer-events: auto !important;
  }
  
  /* Leaflet marker için drag optimizasyonu */
  .leaflet-marker-draggable {
    cursor: move !important;
  }
  
  .leaflet-marker-draggable:hover {
    z-index: 2000 !important;
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
  z-index: 1001;
  position: relative;
  
  &:hover {
    background: ${props => props.$active ? '#c0392b' : '#2980b9'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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

// Drawing Mode Control Components
const DrawingModeContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 2px solid #34495e;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  pointer-events: auto;
  min-width: 320px;
  max-width: 500px;
  
  @media (max-width: 768px) {
    left: 10px;
    right: 10px;
    transform: none;
    max-width: calc(100% - 20px);
  }
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
  pointer-events: auto;
  position: relative;
  z-index: 1001;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.$color};
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background: #95a5a6;
    border-color: #95a5a6;
    color: white;
    cursor: not-allowed;
  }
`;

const DrawingStatusIndicator = styled.div<{ $color: string }>`
  background: ${props => props.$color};
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.8; }
    100% { opacity: 1; }
  }
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
  onPolygonEdit?: (polygon: DrawnPolygon, index: number) => void;
  disabled?: boolean;
  polygonColor?: string;
  polygonName?: string;
  hideControls?: boolean;
  autoStart?: boolean;
  externalDrawingTrigger?: number;
  externalStopTrigger?: number;
  externalClearTrigger?: number;
  externalEditTrigger?: { timestamp: number; polygonIndex: number };
  enableEdit?: boolean;
  existingPolygons?: Array<{
    polygon: DrawnPolygon;
    color: string;
    name: string;
    id?: string;
  }>;
  // Drawing mode management
  drawingMode?: 'tarla' | 'dikili' | null;
  onDrawingModeChange?: (mode: 'tarla' | 'dikili' | null) => void;
  showDrawingModeControls?: boolean;
}

// Utility function for area formatting
export const formatArea = (area: number) => {
  return {
    m2: area.toLocaleString('tr-TR'),
    donum: (area / 1000).toFixed(2),
    hectare: (area / 10000).toFixed(4)
  };
};

const PolygonDrawer: React.FC<PolygonDrawerProps> = ({
  onPolygonComplete,
  onPolygonClear,
  onDrawingStateChange,
  onPolygonEdit,
  disabled = false,
  polygonColor = '#e74c3c',
  polygonName = 'Polygon',
  hideControls = false,
  autoStart = false,
  externalDrawingTrigger = 0,
  externalStopTrigger = 0,
  externalClearTrigger = 0,
  externalEditTrigger = { timestamp: 0, polygonIndex: -1 },
  enableEdit = false,
  existingPolygons = [],
  // Drawing mode management
  drawingMode = null,
  onDrawingModeChange,
  showDrawingModeControls = false,
}) => {
  const map = useMap();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPolygonIndex, setEditingPolygonIndex] = useState<number>(-1);
  const [editingPoints, setEditingPoints] = useState<PolygonPoint[]>([]);
  const [currentPoints, setCurrentPoints] = useState<PolygonPoint[]>([]);
  const [currentArea, setCurrentArea] = useState<number>(0);

  // isEditing state'ini ref'e senkron tut
  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);
  
  // Referanslar
  const drawingLayerRef = useRef<L.LayerGroup | null>(null); // Ana çizim katmanı
  const markersLayerRef = useRef<L.LayerGroup | null>(null); // Sadece markerlar için alt katman
  const linesLayerRef = useRef<L.LayerGroup | null>(null);   // Sadece çizgiler için alt katman
  const polygonLayerRef = useRef<L.LayerGroup | null>(null); // Sadece poligon için alt katman
  const completedPolygonsLayerRef = useRef<L.LayerGroup | null>(null); // Tamamlanmış poligonlar için katman
  const editLayerRef = useRef<L.LayerGroup | null>(null); // Edit modu için katman
  const editMarkersRef = useRef<L.Marker[]>([]); // Edit modunda draggable markerlar
  const editingPointsRef = useRef<PolygonPoint[]>([]); // editingPoints'in güncel değeri için
  const tempEditPolygonRef = useRef<L.Polygon | null>(null); // Geçici edit polygon referansı
  const isEditingRef = useRef<boolean>(false); // isEditing state'inin güncel değeri için
  const dragThrottleRef = useRef<NodeJS.Timeout | null>(null); // Drag event throttle'ı için
  
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
    // Edit modu için ayrı katman oluştur
    if (!editLayerRef.current) {
      // Edit layer için özel pane oluştur
      if (!map.getPane('editPane')) {
        const editPane = map.createPane('editPane');
        editPane.style.zIndex = '999';
        editPane.style.pointerEvents = 'auto';
      }
      
      editLayerRef.current = L.layerGroup().addTo(map);
      console.log('✅ Edit layer oluşturuldu ve haritaya eklendi');
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
      if (editLayerRef.current) {
        map.removeLayer(editLayerRef.current);
        editLayerRef.current = null;
      }
      
      // Throttled update'i temizle
      if (throttledVisualUpdate.current) {
        clearTimeout(throttledVisualUpdate.current);
        throttledVisualUpdate.current = null;
      }
      
      // Parent notification timeout'u temizle
      if (parentNotificationTimeout.current) {
        clearTimeout(parentNotificationTimeout.current);
        parentNotificationTimeout.current = null;
      }
    };
  }, [map]);

  // Harita tıklama işleyicisi - basitleştirilmiş versiyon
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    // Edit modunda veya çizim modu değilse hiçbir şey yapma
    if (!isDrawing || isEditing) return;
    
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
  const startDrawing = useCallback(() => {
    console.log('🎨 startDrawing çağrıldı:', { disabled, isDrawing, onDrawingStateChange: !!onDrawingStateChange });
    
    if (disabled || isDrawing) {
      console.log('⚠️ startDrawing iptal edildi:', { disabled, isDrawing });
      return;
    }
    
    setIsDrawing(true);
    onDrawingStateChange?.(true);
    setCurrentPoints([]);
    setCurrentArea(0);
    
    // Çizim katmanlarını temizle
    markersLayerRef.current?.clearLayers();
    linesLayerRef.current?.clearLayers();
    polygonLayerRef.current?.clearLayers();
    
    // NOT: onPolygonClear çağrılmıyor - çizim başladığında modu korumak için
    
    // Çizim sırasında çift tıklama yakınlaştırmasını devre dışı bırak
    map.doubleClickZoom.disable();
    
    console.log('✅ Çizim başlatıldı, double-click zoom devre dışı');
  }, [disabled, isDrawing, onDrawingStateChange, map]);

  // Çizimi durdur
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    onDrawingStateChange?.(false);
    
    // Çizim bittiğinde çift tıklama yakınlaştırmasını tekrar aktifleştir
    map.doubleClickZoom.enable();
    
    console.log('🛑 Çizim durduruldu, double-click zoom aktif');
  }, [onDrawingStateChange, map]);

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
  const addPermanentPolygon = useCallback((points: PolygonPoint[], color: string = polygonColor, name: string = polygonName, uniqueId?: string): L.Polygon | undefined => {
    if (!completedPolygonsLayerRef.current || points.length < 3) return;
    
    // Unique ID oluştur (verilen değer yoksa koordinatlara göre)
    const polygonId = uniqueId || `${name}-${points.map(p => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join('-')}`;
    
    // Aynı ID'ye sahip polygon varsa, tekrar ekleme
    let alreadyExists = false;
    completedPolygonsLayerRef.current.eachLayer((layer) => {
      const polygon = layer as any;
      if (polygon.options && polygon.options.polygonId === polygonId) {
        alreadyExists = true;
      }
    });
    
    if (alreadyExists) {
      console.log('🚫 Aynı polygon zaten mevcut, eklenmedi:', polygonId);
      return;
    }
    
    const latLngs = points.map(p => [p.lat, p.lng] as [number, number]);
    
    const polygon = L.polygon(latLngs, {
      color: color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.3,
      opacity: 0.8,
      polygonId: polygonId // Unique identifier ekle
    } as any);
    
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
    
    // Edit özelliği etkinse, polygon'a click event ekle
    if (enableEdit) {
      polygon.on('click', (e) => {
        e.originalEvent?.stopPropagation();
        
        // Hangi polygon'a tıklandığını bul
        const clickedIndex = existingPolygons.findIndex(item => 
          item.polygon.points.length === points.length &&
          item.polygon.points.every((point, index) => 
            Math.abs(point.lat - points[index].lat) < 0.000001 &&
            Math.abs(point.lng - points[index].lng) < 0.000001
          )
        );
        
        if (clickedIndex !== -1 && !isDrawing) {
          console.log('📝 Polygon edit için seçildi:', clickedIndex);
          startEditMode(clickedIndex);
        }
      });
      
      // Edit modunda olduğunu belirten stil
      polygon.on('mouseover', () => {
        if (!isDrawing && !isEditing) {
          polygon.setStyle({
            color: '#f39c12',
            weight: 3,
            fillOpacity: 0.4
          });
        }
      });
      
      polygon.on('mouseout', () => {
        if (!isDrawing && !isEditing) {
          polygon.setStyle({
            color: color,
            weight: 2,
            fillOpacity: 0.3
          });
        }
      });
    }
    
    polygon.addTo(completedPolygonsLayerRef.current);
    console.log(`✅ Kalıcı polygon eklendi: ${name}, ID: ${polygonId}`);
    
    return polygon;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableEdit, isDrawing, isEditing, existingPolygons, polygonColor, polygonName]);

  // performVisualUpdate fonksiyonunu tanımla
  const performVisualUpdate = useCallback((points: PolygonPoint[], polygonIndex: number) => {
    // Execution guard - aynı anda birden fazla visual update önle
    if (isUpdatingVisual.current) {
      console.log('⚠️ performVisualUpdate zaten çalışıyor, atlaniyor');
      return;
    }
    
    const now = Date.now();
    if (now - lastVisualUpdateTime.current < 100) {
      console.log('⚠️ performVisualUpdate çok sık çağrılıyor, atlaniyor');
      return;
    }
    
    isUpdatingVisual.current = true;
    lastVisualUpdateTime.current = now;
    console.log('🔄 performVisualUpdate başlatıldı - ID:', polygonIndex);
    
    if (!editLayerRef.current || points.length < 3) {
      isUpdatingVisual.current = false;
      return;
    }
    
    // Tekrar edit modu kontrolü - güvenlik için
    if (!isEditingRef.current) {
      isUpdatingVisual.current = false;
      return;
    }
    
    // Asıl polygon'u gizle - ID-based matching kullan
    if (completedPolygonsLayerRef.current && existingPolygons[polygonIndex]) {
      const targetPolygon = existingPolygons[polygonIndex];
      const targetId = targetPolygon.id;
      
      console.log('🔍 performVisualUpdate: Polygon gizleniyor, hedef ID:', targetId);
      
      // ID-bazlı matching ile doğru polygon'u bul ve gizle
      completedPolygonsLayerRef.current.eachLayer((layer) => {
        const polygon = layer as L.Polygon & { options?: any };
        
        if (polygon && polygon.options && polygon.options.polygonId === targetId) {
          // Bu doğru polygon, gizle
          polygon.setStyle({ opacity: 0, fillOpacity: 0 });
          console.log('✅ performVisualUpdate: Polygon başarıyla gizlendi:', targetPolygon.name, 'ID:', targetId);
          return; // Layer bulundu, döngüyü bitir
        }
      });
    }
    
    try {
      // Her seferinde önceki geçici polygon'u temizle ve yenisini oluştur
      if (tempEditPolygonRef.current && editLayerRef.current.hasLayer(tempEditPolygonRef.current)) {
        editLayerRef.current.removeLayer(tempEditPolygonRef.current);
        tempEditPolygonRef.current = null;
      }
      
      // Yeni koordinatları hazırla
      const latLngs = points.map(p => [p.lat, p.lng] as [number, number]);
      
      // Yeni geçici edit polygon'u oluştur
      const editPolygon = L.polygon(latLngs, {
        color: '#f39c12', // Edit modu için farklı renk
        weight: 3,
        fillColor: '#f39c12',
        fillOpacity: 0.2,
        opacity: 0.8,
        dashArray: '5, 5' // Kesikli çizgi ile edit modunu belirgin yap
      });
      
      // Tooltip'i ekle
      const coordinates = [...points.map(p => [p.lng, p.lat]), [points[0].lng, points[0].lat]];
      const turfPolygon = turf.polygon([coordinates]);
      const area = turf.area(turfPolygon);
      const areaInDonum = (area / 10000).toFixed(2);
      const polygonName = existingPolygons[polygonIndex]?.name || 'Polygon';
      
      editPolygon.bindTooltip(`
        <strong>${polygonName}</strong><br>
        Alan: ${areaInDonum} dönüm<br>
        (${Math.round(area)} m²)<br>
        <em>Düzenleniyor...</em>
      `, {
        permanent: false,
        direction: 'center',
        className: 'polygon-tooltip'
      });
      
      // Geçici edit polygon'u katmana ekle ve referansı sakla
      editPolygon.addTo(editLayerRef.current);
      tempEditPolygonRef.current = editPolygon;
      
    } catch (error) {
      console.error('🔄 Edit polygon güncelleme hatası:', error);
    } finally {
      // Execution guard'ı temizle
      isUpdatingVisual.current = false;
      console.log('✅ performVisualUpdate tamamlandı');
    }
  }, [existingPolygons]);

  // Edit Modu Fonksiyonları
  const startEditMode = useCallback((polygonIndex: number): void => {
    console.log('🎯 startEditMode çağrıldı, index:', polygonIndex);
    
    if (isDrawing) {
      alert('Önce çizim modunu durdurun!');
      return;
    }
    
    // Eğer zaten edit modundaysak, önceki edit modunu durdur
    if (isEditing && editingPolygonIndex !== polygonIndex) {
      console.log('🔄 Önceki edit modu durduruluyor, index:', editingPolygonIndex);
      stopEditMode();
    }
    
    if (!existingPolygons[polygonIndex]) {
      console.error('Edit edilecek polygon bulunamadı:', polygonIndex);
      return;
    }
    
    setIsEditing(true);
    isEditingRef.current = true; // Ref'i de güncelle
    setEditingPolygonIndex(polygonIndex);
    const polygonPoints = [...existingPolygons[polygonIndex].polygon.points];
    setEditingPoints(polygonPoints);
    
    // Ref'i hemen güncelle
    editingPointsRef.current = [...polygonPoints];
    
    // Edit için draggable markerları oluştur - polygonIndex'i parametre olarak geç
    createEditableMarkers(polygonPoints, polygonIndex);
    
    // İlk visual update'i başlat - polygon'u gizle ve edit polygon'u göster
    setTimeout(() => {
      performVisualUpdate(polygonPoints, polygonIndex);
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPolygons, isDrawing, isEditing, editingPolygonIndex]);

  const stopEditMode = useCallback((): void => {
    const currentEditingIndex = editingPolygonIndex;
    
    setIsEditing(false);
    isEditingRef.current = false; // Ref'i de güncelle
    setEditingPolygonIndex(-1);
    setEditingPoints([]);
    
    // Ref'i de temizle
    editingPointsRef.current = [];
    
    // Edit markerlarını temizle
    // Throttled update'i temizle
    if (throttledVisualUpdate.current) {
      clearTimeout(throttledVisualUpdate.current);
      throttledVisualUpdate.current = null;
    }
    
    // Drag throttle'ı temizle
    if (dragThrottleRef.current) {
      clearTimeout(dragThrottleRef.current);
      dragThrottleRef.current = null;
    }
    
    // Parent notification timeout'u temizle
    if (parentNotificationTimeout.current) {
      clearTimeout(parentNotificationTimeout.current);
      parentNotificationTimeout.current = null;
    }
    
    editMarkersRef.current.forEach(marker => {
      if (editLayerRef.current && editLayerRef.current.hasLayer(marker)) {
        editLayerRef.current.removeLayer(marker);
      }
    });
    editMarkersRef.current = [];
    
    // Geçici edit polygon'u temizle
    if (tempEditPolygonRef.current && editLayerRef.current) {
      editLayerRef.current.removeLayer(tempEditPolygonRef.current);
      tempEditPolygonRef.current = null;
    }
    
    // Güncellenmiş polygon'u restore et - orijinal değil, güncel versiyonu
    if (completedPolygonsLayerRef.current && currentEditingIndex >= 0 && existingPolygons[currentEditingIndex]) {
      const targetPolygon = existingPolygons[currentEditingIndex];
      const originalColor = targetPolygon.color;
      const targetId = targetPolygon.id;
      
      console.log('🔍 stopEditMode: Güncellenmiş polygon restore ediliyor, hedef ID:', targetId, 'renk:', originalColor);
      
      // Mevcut polygon'u kaldır ve güncellenmiş versiyonu ekle
      completedPolygonsLayerRef.current.eachLayer((layer) => {
        const polygon = layer as L.Polygon & { options?: any };
        
        if (polygon && polygon.options && polygon.options.polygonId === targetId) {
          // Eski polygon'u kaldır
          completedPolygonsLayerRef.current?.removeLayer(polygon);
          console.log('🗑️ stopEditMode: Eski polygon kaldırıldı:', targetPolygon.name, 'ID:', targetId);
        }
      });
      
      // Güncellenmiş polygon'u ekle
      const updatedPolygon = existingPolygons[currentEditingIndex];
      if (updatedPolygon && updatedPolygon.polygon && updatedPolygon.polygon.points) {
        addPermanentPolygon(updatedPolygon.polygon.points, originalColor, updatedPolygon.name, targetId);
        console.log('✅ stopEditMode: Güncellenmiş polygon eklendi:', updatedPolygon.name, 'ID:', targetId);
      } else {
        console.warn('⚠️ stopEditMode: Güncellenmiş polygon verileri bulunamadı, fallback restore yapılıyor');
        // Fallback: Orijinal görünürlüğü restore et
        completedPolygonsLayerRef.current.eachLayer((layer) => {
          const polygon = layer as L.Polygon & { options?: any };
          
          if (polygon && polygon.options && polygon.options.polygonId === targetId) {
            polygon.setStyle({ 
              opacity: 0.8, 
              fillOpacity: 0.3,
              color: originalColor,
              fillColor: originalColor 
            });
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPolygonIndex, existingPolygons]);

  const createEditableMarkers = useCallback((points: PolygonPoint[], polygonIndex: number) => {
    console.log('🎯 createEditableMarkers çağrıldı:', { 
      points: points.length, 
      polygonIndex, 
      isEditing: isEditingRef.current, 
      editLayerExists: !!editLayerRef.current 
    });
    
    if (!editLayerRef.current) {
      console.error('❌ editLayerRef.current null!');
      return;
    }
    
    // Layer'ın haritaya eklendiğini kontrol et
    console.log('🔍 Edit layer haritada mı?', map.hasLayer(editLayerRef.current));
    console.log('🔍 Edit layer visible mı?', editLayerRef.current.options);
    
    // Layer sayısını kontrol et
    console.log('🔍 Edit layer içindeki layer sayısı:', Object.keys(editLayerRef.current.getLayers()).length);
    
    // editingPointsRef'i güncelle
    editingPointsRef.current = [...points];
    
    // Önceki edit markerlarını temizle
    // Throttled update'i temizle
    if (throttledVisualUpdate.current) {
      clearTimeout(throttledVisualUpdate.current);
      throttledVisualUpdate.current = null;
    }
    
    // Drag throttle'ı temizle
    if (dragThrottleRef.current) {
      clearTimeout(dragThrottleRef.current);
      dragThrottleRef.current = null;
    }
    
    // Parent notification timeout'u temizle
    if (parentNotificationTimeout.current) {
      clearTimeout(parentNotificationTimeout.current);
      parentNotificationTimeout.current = null;
    }
    
    editMarkersRef.current.forEach(marker => {
      if (editLayerRef.current && editLayerRef.current.hasLayer(marker)) {
        editLayerRef.current.removeLayer(marker);
      }
    });
    editMarkersRef.current = [];
    
    // Geçici edit polygon'u temizle
    if (tempEditPolygonRef.current && editLayerRef.current) {
      editLayerRef.current.removeLayer(tempEditPolygonRef.current);
      tempEditPolygonRef.current = null;
    }
    
    points.forEach((point, index) => {
      const marker = L.marker([point.lat, point.lng], {
        draggable: true,
        pane: 'editPane', // Özel pane'e ekle
        icon: L.divIcon({
          className: 'edit-marker',
          html: `<div style="
            background-color: #f39c12;
            border-radius: 50%;
            width: 14px;
            height: 14px;
            border: 3px solid white;
            box-shadow: 0 3px 6px rgba(0,0,0,0.5);
            cursor: move;
            position: relative;
            z-index: 1000;
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      });
      
      // Marker sürüklendiğinde polygon'u güncelle - sadece visual update
      marker.on('drag', (e) => {
        const newLatlng = (e.target as L.Marker).getLatLng();
        
        // Önceki throttle'ı temizle
        if (dragThrottleRef.current) {
          clearTimeout(dragThrottleRef.current);
        }
        
        // Throttle ile visual update
        dragThrottleRef.current = setTimeout(() => {
          const newPoints = [...editingPointsRef.current];
          newPoints[index] = { lat: newLatlng.lat, lng: newLatlng.lng };
          editingPointsRef.current = newPoints;
          updateEditPolygonVisual(newPoints, polygonIndex);
        }, 50);
      });
      
      // Drag end'de sadece final update (parent notification ile)
      marker.on('dragend', (e) => {
        // Mevcut throttle'ı iptal et
        if (dragThrottleRef.current) {
          clearTimeout(dragThrottleRef.current);
          dragThrottleRef.current = null;
        }
        
        const newLatlng = (e.target as L.Marker).getLatLng();
        // Final update - parent notification ile
        setTimeout(() => {
          updateEditingPoint(index, { lat: newLatlng.lat, lng: newLatlng.lng }, polygonIndex);
        }, 0);
      });
      
      marker.addTo(editLayerRef.current!);
      editMarkersRef.current.push(marker);
      console.log(`✅ Edit marker ${index} eklendi:`, marker.getLatLng());
      console.log(`🔍 Marker ${index} haritada görünür mü?`, map.hasLayer(marker));
      console.log(`🔍 Marker ${index} pane:`, marker.options.pane);
    });
    
    console.log('🎯 Toplam oluşturulan edit marker sayısı:', editMarkersRef.current.length);
    console.log('🔍 Edit layer\'daki toplam layer sayısı:', Object.keys(editLayerRef.current.getLayers()).length);
    
    // Edit layer'ın görünürlüğünü doğrudan kontrol et
    setTimeout(() => {
      console.log('🔍 Edit layer visible mi? (delayed check):', editLayerRef.current && map.hasLayer(editLayerRef.current));
      console.log('🔍 EditPane var mı?', !!map.getPane('editPane'));
      const editPane = map.getPane('editPane');
      if (editPane) {
        console.log('🔍 EditPane style:', {
          zIndex: editPane.style.zIndex,
          pointerEvents: editPane.style.pointerEvents,
          display: editPane.style.display
        });
      }
      
      // Bir global debug fonksiyonu ekle
      (window as any).showEditMarkers = () => {
        console.log('🔍 Edit marker debug:', {
          totalMarkers: editMarkersRef.current.length,
          editLayerExists: !!editLayerRef.current,
          editLayerOnMap: editLayerRef.current && map.hasLayer(editLayerRef.current),
          markersOnMap: editMarkersRef.current.map(m => map.hasLayer(m))
        });
      };
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateEditingPoint = useCallback((pointIndex: number, newPoint: PolygonPoint, polygonIndex: number) => {
    // Edit modunda olmadığımız halde bu fonksiyon çağrılabilir - güvenlik kontrolü
    if (!isEditingRef.current) {
      return;
    }
    
    setEditingPoints(prevPoints => {
      const newPoints = [...prevPoints];
      newPoints[pointIndex] = newPoint;
      
      // Ref'i güncelle
      editingPointsRef.current = newPoints;
      
      // Sadece parent component'e bildir (visual update ayrı)
      if (newPoints.length >= 3) {
        try {
          const coordinates = [...newPoints.map(p => [p.lng, p.lat]), [newPoints[0].lng, newPoints[0].lat]];
          const turfPolygon = turf.polygon([coordinates]);
          const area = turf.area(turfPolygon);
          
          const editedPolygon: DrawnPolygon = {
            points: newPoints,
            area: Math.round(area)
          };
          
          // Parent component'e bildir - debounced yaparak çok sık çağrılmasını önle
          if (parentNotificationTimeout.current) {
            clearTimeout(parentNotificationTimeout.current);
          }
          
          parentNotificationTimeout.current = setTimeout(() => {
            onPolygonEdit?.(editedPolygon, polygonIndex);
          }, 300); // 200ms → 300ms ile daha stabil alan hesaplaması
        } catch (error) {
          console.error('Alan hesaplama hatası:', error);
        }
      }
      
      return newPoints;
    });
  }, [onPolygonEdit]);

  // Throttled visual update fonksiyonu
  const throttledVisualUpdate = useRef<NodeJS.Timeout | null>(null);
  const parentNotificationTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastVisualUpdateTime = useRef<number>(0);
  const isUpdatingVisual = useRef<boolean>(false);
  
  const updateEditPolygonVisual = useCallback((points: PolygonPoint[], polygonIndex: number) => {
    if (!editLayerRef.current || points.length < 3) {
      return;
    }
    
    // Edit modunda değilsek işlem yapma
    if (!isEditingRef.current) {
      return;
    }
    
    // Önceki throttle'ı temizle
    if (throttledVisualUpdate.current) {
      clearTimeout(throttledVisualUpdate.current);
    }
    
    // Daha uzun debounce ile performans optimizasyonu
    throttledVisualUpdate.current = setTimeout(() => {
      if (typeof performVisualUpdate === 'function') {
        performVisualUpdate(points, polygonIndex);
      }
    }, 150); // 100ms → 150ms ile daha stabil performans
  }, [performVisualUpdate]);
  
  const saveEditChanges = () => {
    if (editingPolygonIndex === -1 || editingPoints.length < 3) return;
    
    // Alan hesapla
    try {
      const coordinates = [...editingPoints.map(p => [p.lng, p.lat]), [editingPoints[0].lng, editingPoints[0].lat]];
      const turfPolygon = turf.polygon([coordinates]);
      const area = turf.area(turfPolygon);
      
      const editedPolygon: DrawnPolygon = {
        points: editingPoints,
        area: Math.round(area)
      };
      
      // Parent component'e bildir
      onPolygonEdit?.(editedPolygon, editingPolygonIndex);
      
      console.log('💾 Polygon düzenlemesi kaydedildi:', editedPolygon);
    } catch (error) {
      console.error('Edit kaydetme hatası:', error);
    }
    
    stopEditMode();
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
    // Drawing mode'a göre sabit ID kullan (duplicate önlemi)
    const uniqueId = drawingMode === 'tarla' ? 'tarla' : 
                     drawingMode === 'dikili' ? 'dikili' : 
                     `completed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    addPermanentPolygon(currentPoints, polygonColor, polygonName, uniqueId);
    
    // Sadece çizim katmanlarını temizle (kalıcı polygon korunur)
    setCurrentPoints([]);
    setCurrentArea(0);
    markersLayerRef.current?.clearLayers();
    linesLayerRef.current?.clearLayers();
    polygonLayerRef.current?.clearLayers();
    
    onPolygonComplete?.(polygon);
    
    console.log('✅ Polygon tamamlandı ve kalıcı katmana eklendi, alan:', polygon.area, 'm²');
  };



  // Tam temizleme (çizim durdur + temizle)
  const fullClear = useCallback(() => {
    console.log('🧹 fullClear başlatılıyor...');
    console.log('🧹 Mevcut existingPolygons:', existingPolygons.length, 'adet');
    
    // Önce edit modunu durdur
    if (isEditing) {
      console.log('🧹 Edit modu durduruluyor...');
      stopEditMode();
    }
    
    // Sonra tüm kalıcı poligonları temizle
    if (completedPolygonsLayerRef.current) {
      const layerCount = Object.keys(completedPolygonsLayerRef.current.getLayers()).length;
      console.log('🧹 Temizlenecek katman sayısı:', layerCount);
      completedPolygonsLayerRef.current.clearLayers();
      console.log('✅ Kalıcı poligonlar katmanı temizlendi');
    }
    
    // Sonra çizim durumunu temizle
    if (isDrawing) {
      console.log('🧹 Çizim durduruluyor...');
      setIsDrawing(false);
      onDrawingStateChange?.(false);
      map.doubleClickZoom.enable();
    }
    
    // Çizim katmanlarını temizle
    markersLayerRef.current?.clearLayers();
    linesLayerRef.current?.clearLayers();
    polygonLayerRef.current?.clearLayers();
    setCurrentPoints([]);
    setCurrentArea(0);
    onPolygonClear?.();
    
    console.log('🧹 Tüm poligonlar temizlendi');
    
    // Güvenlik için double-click zoom'u yeniden aktifleştir
    map.doubleClickZoom.enable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPolygons.length, isEditing, isDrawing, onDrawingStateChange, map]);





  // External triggers
  useEffect(() => {
    if (externalDrawingTrigger > 0 && !disabled) {
      console.log('🎨 startDrawing çağrıldı:', { disabled, isDrawing, onDrawingStateChange: !!onDrawingStateChange });
      
      if (disabled || isDrawing) {
        console.log('⚠️ startDrawing iptal edildi:', { disabled, isDrawing });
        return;
      }
      
      setIsDrawing(true);
      onDrawingStateChange?.(true);
      setCurrentPoints([]);
      setCurrentArea(0);
      
      // Çizim katmanlarını temizle
      markersLayerRef.current?.clearLayers();
      linesLayerRef.current?.clearLayers();
      polygonLayerRef.current?.clearLayers();
      
      // NOT: onPolygonClear çağrılmıyor - çizim başladığında modu korumak için
      
      // Çizim sırasında çift tıklama yakınlaştırmasını devre dışı bırak
      map.doubleClickZoom.disable();
      
      console.log('✅ Çizim başlatıldı, double-click zoom devre dışı');
    }
  }, [externalDrawingTrigger, disabled, isDrawing, onDrawingStateChange, map]);

  useEffect(() => {
    if (externalStopTrigger > 0) {
      setIsDrawing(false);
      onDrawingStateChange?.(false);
      
      // Çizim bittiğinde çift tıklama yakınlaştırmasını tekrar aktifleştir
      map.doubleClickZoom.enable();
      
      console.log('🛑 Çizim durduruldu, double-click zoom aktif');
    }
  }, [externalStopTrigger, onDrawingStateChange, map]);

  useEffect(() => {
    if (externalClearTrigger > 0) {
      console.log('🧹 fullClear başlatılıyor...');
      console.log('🧹 Mevcut existingPolygons:', existingPolygons.length, 'adet');
      
      // Önce edit modunu durdur
      if (isEditing) {
        console.log('🧹 Edit modu durduruluyor...');
        // stopEditMode'u inline yap
        setIsEditing(false);
        isEditingRef.current = false;
        setEditingPolygonIndex(-1);
        setEditingPoints([]);
        editingPointsRef.current = [];
      }
      
      // Sonra tüm kalıcı poligonları temizle
      if (completedPolygonsLayerRef.current) {
        const layerCount = Object.keys(completedPolygonsLayerRef.current.getLayers()).length;
        console.log('🧹 Temizlenecek katman sayısı:', layerCount);
        completedPolygonsLayerRef.current.clearLayers();
        console.log('✅ Kalıcı poligonlar katmanı temizlendi');
      }
      
      // Sonra çizim durumunu temizle
      if (isDrawing) {
        console.log('🧹 Çizim durduruluyor...');
        setIsDrawing(false);
        onDrawingStateChange?.(false);
        map.doubleClickZoom.enable();
      }
      
      // Çizim katmanlarını temizle
      markersLayerRef.current?.clearLayers();
      linesLayerRef.current?.clearLayers();
      polygonLayerRef.current?.clearLayers();
      setCurrentPoints([]);
      setCurrentArea(0);
      onPolygonClear?.();
      
      console.log('🧹 Tüm poligonlar temizlendi');
      
      // Güvenlik için double-click zoom'u yeniden aktifleştir
      map.doubleClickZoom.enable();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalClearTrigger, existingPolygons.length, isEditing, isDrawing, onDrawingStateChange, map]);

  useEffect(() => {
    if (externalEditTrigger.timestamp > 0 && existingPolygons.length > 0 && externalEditTrigger.polygonIndex >= 0) {
      const polygonIndex = externalEditTrigger.polygonIndex;
      console.log('🎯 startEditMode çağrıldı, index:', polygonIndex);
      
      if (isDrawing) {
        alert('Önce çizim modunu durdurun!');
        return;
      }
      
      // Eğer zaten edit modundaysak, önceki edit modunu durdur
      if (isEditing && editingPolygonIndex !== polygonIndex) {
        console.log('🔄 Önceki edit modu durduruluyor, index:', editingPolygonIndex);
        // stopEditMode inline
        setIsEditing(false);
        isEditingRef.current = false;
        setEditingPolygonIndex(-1);
        setEditingPoints([]);
        editingPointsRef.current = [];
      }
      
      if (!existingPolygons[polygonIndex]) {
        console.error('Edit edilecek polygon bulunamadı:', polygonIndex);
        return;
      }
      
      setIsEditing(true);
      isEditingRef.current = true;
      setEditingPolygonIndex(polygonIndex);
      const polygonPoints = [...existingPolygons[polygonIndex].polygon.points];
      setEditingPoints(polygonPoints);
      editingPointsRef.current = [...polygonPoints];
      
      // createEditableMarkers inline
      if (editLayerRef.current) {
        // Edit marker'ları oluştur
        console.log('🎯 createEditableMarkers çağrıldı:', { 
          points: polygonPoints.length, 
          polygonIndex, 
          isEditing: isEditingRef.current, 
          editLayerExists: !!editLayerRef.current 
        });
        
        // Önce mevcut edit marker'ları temizle
        editLayerRef.current.clearLayers();
        
        // Her nokta için draggable marker oluştur
        polygonPoints.forEach((point, index) => {
          if (editLayerRef.current) {
            const marker = L.marker([point.lat, point.lng], {
              draggable: true,
              // Daha responsive drag için optimized icon ve options
              icon: L.divIcon({
                html: '<div class="marker-handle" style="width: 16px; height: 16px; background: #f39c12; border: 3px solid white; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.4); cursor: move; transition: transform 0.1s ease;"></div>',
                className: 'edit-marker draggable-marker',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              }),
              // Drag sensitivity için interaktif seçenekler
              interactive: true,
              bubblingMouseEvents: false,
              // Z-index ayarları
              zIndexOffset: 1000,
              pane: 'editPane'
            });
            
            console.log('🔧 Edit marker oluşturuldu:', { lat: point.lat, lng: point.lng, index });
            
            // Drag start event - map kontrollerini devre dışı bırak
            marker.on('dragstart', (e: any) => {
              console.log('🟡 Drag başladı:', index);
              // Drag sırasında diğer eventleri geçici olarak devre dışı bırak
              map.dragging.disable();
              map.touchZoom.disable();
              map.doubleClickZoom.disable();
              map.scrollWheelZoom.disable();
              map.boxZoom.disable();
              map.keyboard.disable();
              
              // Visual feedback
              const markerElement = e.target.getElement();
              if (markerElement) {
                markerElement.style.transform = 'scale(1.2)';
                markerElement.style.zIndex = '2000';
              }
            });
            
            // Drag event - throttle ile performance optimizasyonu
            let dragThrottle: NodeJS.Timeout | null = null;
            marker.on('drag', (e: any) => {
              const newLatLng = e.target.getLatLng();
              
              // Throttle drag updates to improve performance
              if (dragThrottle) {
                clearTimeout(dragThrottle);
              }
              
              dragThrottle = setTimeout(() => {
                const updatedPoints = [...editingPointsRef.current];
                updatedPoints[index] = { lat: newLatLng.lat, lng: newLatLng.lng };
                editingPointsRef.current = updatedPoints;
                setEditingPoints([...updatedPoints]);
                
                console.log('🔄 Marker sürüklendi:', { 
                  index, 
                  newLat: newLatLng.lat.toFixed(6), 
                  newLng: newLatLng.lng.toFixed(6) 
                });
                
                // Çizimin güncellenmesi için onChange callback'i çağır - Turf.js ile alan hesapla
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
              }, 50); // 50ms throttle
            });
            
            // Drag end event - map kontrollerini yeniden etkinleştir
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
                markerElement.style.transform = 'scale(1)';
                markerElement.style.zIndex = '1000';
              }
              
              // Map kontrollerini yeniden etkinleştir
              map.dragging.enable();
              map.touchZoom.enable();
              map.doubleClickZoom.enable();
              map.scrollWheelZoom.enable();
              map.boxZoom.enable();
              map.keyboard.enable();
            });
            
            marker.addTo(editLayerRef.current);
            console.log('✅ Edit marker editPane\'e eklendi:', { lat: point.lat, lng: point.lng });
          }
        });
        
        // İlk visual update'i başlat
        setTimeout(() => {
          if (typeof performVisualUpdate === 'function') {
            performVisualUpdate(polygonPoints, polygonIndex);
          }
        }, 50);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalEditTrigger, existingPolygons.length, isDrawing, isEditing, editingPolygonIndex, performVisualUpdate]);

  // Help mesajını isDrawing state'ine göre yönet
  useEffect(() => {
    if (isDrawing) {
      // showHelpMessage inline
      if (!helpMarkerRef.current) {
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
        
        const mapContainer = map.getContainer();
        mapContainer.appendChild(helpDiv);
        helpMarkerRef.current = helpDiv;
      }
    } else {
      // hideHelpMessage inline
      if (helpMarkerRef.current) {
        const mapContainer = map.getContainer();
        if (mapContainer.contains(helpMarkerRef.current)) {
          mapContainer.removeChild(helpMarkerRef.current);
        }
        helpMarkerRef.current = null;
      }
      
      const mapContainer = map.getContainer();
      const existingMessages = mapContainer.querySelectorAll('.polygon-help-message');
      existingMessages.forEach(element => {
        if (mapContainer.contains(element)) {
          mapContainer.removeChild(element);
        }
      });
    }
  }, [isDrawing, map]);

  // Mevcut poligonları yükle - sadece layer temizlendiğinde veya ilk yüklemede
  const lastLoadedPolygonsRef = useRef<typeof existingPolygons>([]);
  
  useEffect(() => {
    // Edit modundayken yeniden yükleme yapma (performans optimizasyonu)
    if (isEditing) {
      return;
    }
    
    // Eğer aynı poligonlar zaten yüklenmişse, tekrar yükleme
    if (lastLoadedPolygonsRef.current === existingPolygons) {
      return;
    }
    
    // Sadece polygon sayısı değiştiğinde veya tamamen farklı array'de yenile
    const needsReload = !lastLoadedPolygonsRef.current || 
                       lastLoadedPolygonsRef.current.length !== existingPolygons.length;
    
    if (!needsReload) {
      return;
    }
    
    console.log('🔄 Poligonlar yeniden yükleniyor, sayı:', existingPolygons.length);
    
    // İlk olarak katmanı temizle (önceki poligonları kaldır)
    if (completedPolygonsLayerRef.current) {
      completedPolygonsLayerRef.current.clearLayers();
    }
    
    // Mevcut poligonları yükle - addPermanentPolygon fonksiyonunu kullan
    if (existingPolygons && existingPolygons.length > 0) {
      existingPolygons.forEach((item, index) => {
        const uniqueId = item.id || `existing-${index}-${item.name}`;
        if (addPermanentPolygon) {
          addPermanentPolygon(item.polygon.points, item.color, item.name, uniqueId);
        }
      });
    }
    
    // Son yüklenen poligonları kaydet
    lastLoadedPolygonsRef.current = existingPolygons;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPolygons, isEditing, addPermanentPolygon]); // addPermanentPolygon'u dependency'den kaldır

  return (
    <>
      {/* Drawing Mode Controls */}
      {showDrawingModeControls && (
        <DrawingModeContainer
          onClick={(e) => {
            // Container seviyesinde tüm event'leri durdur
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => {
            // Mouse down'da da event'leri durdur
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <div style={{ marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
            Çizim Modu:
          </div>
          
          {/* Drawing status indicator */}
          {isDrawing && drawingMode && (
            <DrawingStatusIndicator $color={drawingMode === 'tarla' ? '#8B4513' : '#27ae60'}>
              🎨 {drawingMode === 'tarla' ? 'Tarla Alanı' : 'Dikili Alan'} çiziliyor...
              <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                (Haritaya tıklayarak çizin, çift tıklayarak bitirin)
              </span>
            </DrawingStatusIndicator>
          )}
          
          <div 
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px', 
              alignItems: 'center',
              pointerEvents: 'auto'
            }}
            onClick={(e) => {
              // Container seviyesinde event propagation'ı durdur
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <DrawingModeButton
              $active={drawingMode === 'tarla'}
              $color="#8B4513"
              onMouseDown={(e) => {
                // Mouse down'da hemen event'i durdur
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={(e) => {
                console.log('🟤 TARLA butonuna tıklandı! Event:', e);
                e.stopPropagation();
                e.preventDefault();
                
                // Inline mode değiştirme
                if (drawingMode === 'tarla' && isDrawing) {
                  console.log('⚠️ Aynı mod zaten aktif');
                  return;
                }
                
                if (isDrawing && drawingMode !== 'tarla') {
                  setIsDrawing(false);
                  onDrawingStateChange?.(false);
                  map.doubleClickZoom.enable();
                }
                
                onDrawingModeChange?.('tarla');
                
                setTimeout(() => {
                  setIsDrawing(true);
                  onDrawingStateChange?.(true);
                  setCurrentPoints([]);
                  setCurrentArea(0);
                  // Çizim katmanlarını temizle
                  markersLayerRef.current?.clearLayers();
                  linesLayerRef.current?.clearLayers();
                  polygonLayerRef.current?.clearLayers();
                  map.doubleClickZoom.disable();
                }, 50);
              }}
              disabled={false}
            >
              🟤 Tarla Alanı Çiz
            </DrawingModeButton>
            
            <DrawingModeButton
              $active={drawingMode === 'dikili'}
              $color="#27ae60"
              onMouseDown={(e) => {
                // Mouse down'da hemen event'i durdur
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={(e) => {
                console.log('🟢 DİKİLİ butonuna tıklandı! Event:', e);
                e.stopPropagation();
                e.preventDefault();
                
                // Inline mode değiştirme
                if (drawingMode === 'dikili' && isDrawing) {
                  console.log('⚠️ Aynı mod zaten aktif');
                  return;
                }
                
                if (isDrawing && drawingMode !== 'dikili') {
                  setIsDrawing(false);
                  onDrawingStateChange?.(false);
                  map.doubleClickZoom.enable();
                }
                
                onDrawingModeChange?.('dikili');
                
                setTimeout(() => {
                  setIsDrawing(true);
                  onDrawingStateChange?.(true);
                  setCurrentPoints([]);
                  setCurrentArea(0);
                  // Çizim katmanlarını temizle
                  markersLayerRef.current?.clearLayers();
                  linesLayerRef.current?.clearLayers();
                  polygonLayerRef.current?.clearLayers();
                  map.doubleClickZoom.disable();
                }, 50);
              }}
              disabled={false}
            >
              🟢 Dikili Alan Çiz
            </DrawingModeButton>
            
            {/* Stop drawing button */}
            {isDrawing && (
              <DrawButton 
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={(e) => {
                  console.log('🛑 Çizimi durdur butonuna tıklandı');
                  e.stopPropagation();
                  e.preventDefault();
                  setIsDrawing(false);
                  onDrawingStateChange?.(false);
                  onDrawingModeChange?.(null);
                  map.doubleClickZoom.enable();
                }}
              >
                ⏹️ Çizimi Durdur
              </DrawButton>
            )}
          </div>
        </DrawingModeContainer>
      )}

      {!hideControls && (
        <DrawingControls>
          {!isDrawing && !isEditing ? (
            <DrawButton onClick={startDrawing} disabled={disabled}>
              🎨 Polygon Çiz
            </DrawButton>
          ) : isEditing ? (
            <>
              <DrawButton onClick={saveEditChanges}>
                💾 Kaydet
              </DrawButton>
              <DrawButton onClick={stopEditMode}>
                ❌ İptal
              </DrawButton>
            </>
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
          
          <DrawButton onClick={fullClear} disabled={isEditing}>
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
          
          {isEditing && (
            <InfoPanel>
              <div><strong>Düzenleme Modu:</strong></div>
              <div>Nokta Sayısı: {editingPoints.length}</div>
              <div style={{ marginTop: 4, fontSize: 10, color: '#666' }}>
                Noktaları sürükleyin
              </div>
            </InfoPanel>
          )}
        </DrawingControls>
      )}
    </>
  );
};

export default PolygonDrawer;
export type { DrawnPolygon, PolygonPoint, PolygonDrawerProps };
