import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';

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

const MapControls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ControlButton = styled.button`
  background: #ffffff;
  border: 2px solid #ccc;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #f0f0f0;
  }
  
  &:active {
    background: #e0e0e0;
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
  kmlLayers?: KMLLayer[];
  height?: string;
}

// KML yükleme bileşeni
const KMLLoader: React.FC<{ layers: KMLLayer[] }> = ({ layers }) => {
  const map = useMap();
  const loadedLayersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    // Önceki katmanları temizle
    loadedLayersRef.current.forEach(layer => {
      map.removeLayer(layer);
    });
    loadedLayersRef.current = [];

    // Yeni katmanları yükle
    layers.forEach(async (layerConfig) => {
      try {
        const response = await fetch(layerConfig.url);
        const kmlText = await response.text();
        
        // KML'yi GeoJSON'a dönüştür (basit implementasyon)
        // Gerçek uygulamada bir KML parser kullanılmalı
        console.log(`${layerConfig.name} KML katmanı yüklendi:`, kmlText.substring(0, 200));
        
        // Geçici olarak bir örnek katman ekle
        const layer = L.circle(map.getCenter(), {
          ...layerConfig.style,
          radius: 5000,
        }).addTo(map);
        
        loadedLayersRef.current.push(layer);
      } catch (error) {
        console.error(`${layerConfig.name} KML katmanı yüklenirken hata:`, error);
      }
    });

    return () => {
      loadedLayersRef.current.forEach(layer => {
        map.removeLayer(layer);
      });
    };
  }, [layers, map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
  center = [38.4237, 27.1428], // İzmir koordinatları
  zoom = 10,
  onMapClick,
  selectedCoordinate,
  kmlLayers = [],
  height = '500px'
}) => {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const coordinate: Coordinate = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    };
    
    onMapClick?.(coordinate);
  };

  const fitToIzmir = () => {
    if (mapInstance) {
      mapInstance.setView([38.4237, 27.1428], 10);
    }
  };

  return (
    <MapContainer_Styled style={{ height }}>
      <MapControls>
        <ControlButton onClick={fitToIzmir}>
          🎯 İzmir'e Git
        </ControlButton>
      </MapControls>
      
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => setMapInstance}
      >
        {/* Uydu görüntüsü - mevcut sistemle uyumlu */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          maxZoom={18}
        />
        
        {/* KML katmanları */}
        {kmlLayers.length > 0 && <KMLLoader layers={kmlLayers} />}
        
        {/* Seçilen koordinat marker'ı */}
        {selectedCoordinate && (
          <Marker position={[selectedCoordinate.lat, selectedCoordinate.lng]}>
            <Popup>
              <div>
                <strong>Seçilen Konum</strong><br />
                Enlem: {selectedCoordinate.lat.toFixed(6)}<br />
                Boylam: {selectedCoordinate.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Harita tıklama olayı */}
        <MapEventHandler onMapClick={handleMapClick} />
      </MapContainer>
    </MapContainer_Styled>
  );
};

// Harita olaylarını yöneten bileşen
const MapEventHandler: React.FC<{ onMapClick: (e: L.LeafletMouseEvent) => void }> = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [map, onMapClick]);

  return null;
};

export default MapComponent;
export type { Coordinate, KMLLayer };
