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
}

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
      editLayerRef.current = L.layerGroup().addTo(map);
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
  const addPermanentPolygon = useCallback((points: PolygonPoint[], color: string = polygonColor, name: string = polygonName, uniqueId?: string) => {
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
  }, [enableEdit, isDrawing, isEditing]); // existingPolygons ve color/name dependencies kaldırıldı

  // Edit Modu Fonksiyonları
  const startEditMode = (polygonIndex: number) => {
    if (isDrawing) {
      alert('Önce çizim modunu durdurun!');
      return;
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
  };

  const stopEditMode = () => {
    const currentEditingIndex = editingPolygonIndex;
    
    setIsEditing(false);
    isEditingRef.current = false; // Ref'i de güncelle
    setEditingPolygonIndex(-1);
    setEditingPoints([]);
    
    // Ref'i de temizle
    editingPointsRef.current = [];
    
    // Edit markerlarını temizle
    clearEditMarkers();
    
    // Asıl polygon'u tekrar görünür hale getir
    if (completedPolygonsLayerRef.current && currentEditingIndex >= 0 && existingPolygons[currentEditingIndex]) {
      const targetPolygon = existingPolygons[currentEditingIndex];
      const originalColor = targetPolygon.color;
      
      // Tüm layer'ları kontrol et ve doğru polygon'u bul
      completedPolygonsLayerRef.current.eachLayer((layer) => {
        const polygon = layer as L.Polygon;
        if (polygon && polygon.getLatLngs) {
          const layerLatLngs = polygon.getLatLngs()[0] as L.LatLng[];
          
          // Layer'ın koordinatlarını targetPolygon ile karşılaştır
          if (layerLatLngs.length === targetPolygon.polygon.points.length) {
            const matches = layerLatLngs.every((latLng, idx) => {
              const point = targetPolygon.polygon.points[idx];
              return Math.abs(latLng.lat - point.lat) < 0.000001 && 
                     Math.abs(latLng.lng - point.lng) < 0.000001;
            });
            
            if (matches) {
              // Bu doğru polygon, tekrar görünür yap
              polygon.setStyle({ 
                opacity: 0.8, 
                fillOpacity: 0.3,
                color: originalColor,
                fillColor: originalColor 
              });
              console.log('🔓 Edit tamamlandı, polygon görünür yapıldı:', targetPolygon.name);
            }
          }
        }
      });
    }
  };

  const createEditableMarkers = (points: PolygonPoint[], polygonIndex: number) => {
    if (!editLayerRef.current) return;
    
    // editingPointsRef'i güncelle
    editingPointsRef.current = [...points];
    
    // Önceki edit markerlarını temizle
    clearEditMarkers();
    
    points.forEach((point, index) => {
      const marker = L.marker([point.lat, point.lng], {
        draggable: true,
        icon: L.divIcon({
          className: 'edit-marker',
          html: `<div style="
            background-color: #f39c12;
            border-radius: 50%;
            width: 12px;
            height: 12px;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.4);
            cursor: move;
          "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        })
      });
      
      // Marker sürüklendiğinde polygon'u güncelle - sadece visual update
      marker.on('drag', (e) => {
        const newLatlng = (e.target as L.Marker).getLatLng();
        
        // Önceki throttle'ı temizle
        if (dragThrottleRef.current) {
          clearTimeout(dragThrottleRef.current);
        }
        
        // Sadece visual update (parent notify etme)
        dragThrottleRef.current = setTimeout(() => {
          // Direkt visual update çağır, parent notify etme
          const newPoints = [...editingPointsRef.current];
          newPoints[index] = { lat: newLatlng.lat, lng: newLatlng.lng };
          editingPointsRef.current = newPoints;
          updateEditPolygonVisual(newPoints, polygonIndex);
        }, 16);
      });
      
      // Drag end'de parent'a notify et (setTimeout ile async yapıyoruz)
      marker.on('dragend', (e) => {
        const newLatlng = (e.target as L.Marker).getLatLng();
        // setState in render hatasını önlemek için setTimeout kullan
        setTimeout(() => {
          updateEditingPoint(index, { lat: newLatlng.lat, lng: newLatlng.lng }, polygonIndex);
        }, 0);
      });
      
      marker.addTo(editLayerRef.current!);
      editMarkersRef.current.push(marker);
    });
  };

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
          }, 100); // 100ms debounce
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
    
    // 10ms gecikme ile güncelle (daha responsive)
    throttledVisualUpdate.current = setTimeout(() => {
      performVisualUpdate(points, polygonIndex);
    }, 10);
  }, [isEditing]);
  
  const performVisualUpdate = (points: PolygonPoint[], polygonIndex: number) => {
    if (!editLayerRef.current || points.length < 3) {
      return;
    }
    
    // Tekrar edit modu kontrolü - güvenlik için
    if (!isEditingRef.current) {
      return;
    }
    
    // Asıl polygon'u gizle - existingPolygons dizisinden doğru polygon'u bul
    if (completedPolygonsLayerRef.current && existingPolygons[polygonIndex]) {
      const targetPolygon = existingPolygons[polygonIndex];
      
      // Tüm layer'ları kontrol et ve doğru polygon'u bul
      completedPolygonsLayerRef.current.eachLayer((layer) => {
        const polygon = layer as L.Polygon;
        if (polygon && polygon.getLatLngs) {
          const layerLatLngs = polygon.getLatLngs()[0] as L.LatLng[];
          
          // Layer'ın koordinatlarını targetPolygon ile karşılaştır
          if (layerLatLngs.length === targetPolygon.polygon.points.length) {
            const matches = layerLatLngs.every((latLng, idx) => {
              const point = targetPolygon.polygon.points[idx];
              return Math.abs(latLng.lat - point.lat) < 0.000001 && 
                     Math.abs(latLng.lng - point.lng) < 0.000001;
            });
            
            if (matches) {
              // Bu doğru polygon, gizle
              polygon.setStyle({ opacity: 0, fillOpacity: 0 });
              console.log('🔒 Edit için polygon gizlendi:', targetPolygon.name);
            }
          }
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
    }
  };

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

  const clearEditMarkers = () => {
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
    const uniqueId = `completed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
      stopDrawing();
    }
    clearDrawing();
    
    console.log('🧹 Tüm poligonlar temizlendi');
    
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

  useEffect(() => {
    if (externalEditTrigger.timestamp > 0 && existingPolygons.length > 0 && externalEditTrigger.polygonIndex >= 0) {
      startEditMode(externalEditTrigger.polygonIndex);
    }
  }, [externalEditTrigger]);

  // Help mesajını isDrawing state'ine göre yönet
  useEffect(() => {
    if (isDrawing) {
      showHelpMessage();
    } else {
      hideHelpMessage();
    }
  }, [isDrawing]);

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
        addPermanentPolygon(item.polygon.points, item.color, item.name, uniqueId);
      });
    }
    
    // Son yüklenen poligonları kaydet
    lastLoadedPolygonsRef.current = existingPolygons;
  }, [existingPolygons, isEditing]); // addPermanentPolygon'u dependency'den kaldır

  return (
    <>
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
export type { DrawnPolygon, PolygonPoint };
