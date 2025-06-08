import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';
import KMLLayerManager from './KMLLayerManager';
import { KMLLayerConfig } from '../../utils/kmlParser';

// Leaflet default marker icons düzeltmesi
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapContainer_Styled = styled.div`
  height: 500px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .leaflet-container {
    height: 100%;
    width: 100%;
  }
`;

interface Coordinate {
  lat: number;
  lng: number;
}

interface KMLLayer {
  url: string;
  name: string;
  style?: {
    color?: string;
    weight?: number;
    fillOpacity?: number;
    fillColor?: string;
  };
}

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  onMapClick?: (coordinate: Coordinate) => void;
  selectedCoordinate?: Coordinate | null;
  showMarker?: boolean; // Marker gösterilsin mi?
  kmlLayers?: KMLLayer[];
  height?: string;
}

// Map ref interface - dışarıdan erişilebilir fonksiyonlar
export interface MapRef {
  zoomToLocation: (lat: number, lng: number, zoom?: number) => void;
  getMapInstance: () => L.Map | null;
}

// KML yükleme bileşeni - gerçek KML dosyalarını yüklemek için KMLLayerManager kullanır
const KMLLoader: React.FC<{ layers: KMLLayer[] }> = ({ layers }) => {
  // KMLLayer'ı KMLLayerConfig'e dönüştür
  const layerConfigs: KMLLayerConfig[] = layers.map(layer => ({
    name: layer.name,
    url: layer.url,
    style: layer.style,
    visible: true
  }));

  return (
    <KMLLayerManager 
      layerConfigs={layerConfigs}
      onLayersLoaded={(parsedLayers) => {
        console.log('KML katmanları yüklendi:', parsedLayers.map(l => l.name));
      }}
      onError={(error) => {
        console.error('KML katman yükleme hatası:', error);
      }}
    />
  );
};

const MapComponent = forwardRef<MapRef, MapComponentProps>(({
  center = [38.4237, 27.1428], // İzmir koordinatları
  zoom = 10,
  onMapClick,
  selectedCoordinate,
  showMarker = true, // Default olarak marker göster
  kmlLayers = [],
  height = '500px'
}, ref) => {
  const mapRef = useRef<L.Map | null>(null);

  // External API için ref expose etme
  useImperativeHandle(ref, () => ({
    zoomToLocation: (lat: number, lng: number, zoom = 15) => {
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], zoom, {
          animate: true,
          duration: 1.5
        });
      }
    },
    getMapInstance: () => mapRef.current
  }), []);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const coordinate: Coordinate = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    };
    
    onMapClick?.(coordinate);
  };

  return (
    <MapContainer_Styled style={{ height }}>
      
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Uydu görüntüsü - mevcut sistemle uyumlu */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          maxZoom={18}
        />
        
        {/* KML katmanları */}
        {kmlLayers.length > 0 && <KMLLoader layers={kmlLayers} />}
        
        {/* Seçilen koordinat marker'ı - sadece showMarker true ise göster */}
        {selectedCoordinate && showMarker && (
          <Marker position={[selectedCoordinate.lat, selectedCoordinate.lng]} />
        )}
        
        {/* Harita tıklama olayı */}
        <MapEventHandler onMapClick={handleMapClick} mapRef={mapRef} />
      </MapContainer>
    </MapContainer_Styled>
  );
});

// Harita olaylarını yöneten bileşen
const MapEventHandler: React.FC<{ 
  onMapClick: (e: L.LeafletMouseEvent) => void;
  mapRef: React.RefObject<L.Map | null>;
}> = ({ onMapClick, mapRef }) => {
  const map = useMap();

  useEffect(() => {
    // Map instance'ı ref'e kaydet
    if (mapRef.current !== map) {
      mapRef.current = map;
    }

    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [map, onMapClick, mapRef]);

  return null;
};

// forwardRef için displayName ekle
MapComponent.displayName = 'MapComponent';

export default MapComponent;
export type { Coordinate, KMLLayer };
