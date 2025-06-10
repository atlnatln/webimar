import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useLocation } from 'react-router-dom'; // useLocation import edildi
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import PolygonDrawer, { DrawnPolygon, formatArea } from '../components/Map/PolygonDrawer';
import KMLLayerManager from '../components/Map/KMLLayerManager';
import { healthCheck, checkCoordinate } from '../services/apiService';

// Leaflet default marker icons düzeltmesi
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
`;

const ControlPanel = styled.div`
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
`;

const ControlSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ControlLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #495057;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  cursor: pointer;
  
  input[type="checkbox"] {
    margin: 0;
  }
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const MapWrapper = styled.div`
  position: relative;
  height: calc(100vh - 400px);
  min-height: 500px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
  }
`;

// Harita boyutlandırma bileşeni
const MapResizer: React.FC<{ onMapReady: (map: L.Map) => void }> = ({ onMapReady }) => {
  const map = useMap();

  useEffect(() => {
    // Map referansını üst bileşene gönder
    onMapReady(map);

    const resizeMap = () => {
      // Harita konteynerinin boyutlarını yeniden hesapla
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };

    // Sayfa yüklendiğinde ve pencere boyutu değiştiğinde haritayı yeniden boyutlandır
    resizeMap();
    window.addEventListener('resize', resizeMap);

    return () => {
      window.removeEventListener('resize', resizeMap);
    };
  }, [map, onMapReady]);

  return null;
};

const ResultPanel = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const ResultTitle = styled.h3`
  color: #495057;
  margin-bottom: 15px;
`;

const ResultItem = styled.div`
  margin-bottom: 10px;
  font-size: 14px;
  
  strong {
    color: #2c3e50;
  }
`;

const CoordinateList = styled.div`
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
`;

const MapTestPage: React.FC = () => {
  const location = useLocation(); // location nesnesi alındı
  const [drawnPolygon, setDrawnPolygon] = useState<DrawnPolygon | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false); // Çizim modu state'i
  const mapRef = useRef<L.Map | null>(null);
  
  // Sayfa yüklendiğinde ve route değiştiğinde harita boyutlandırma
  useEffect(() => {
    // Rota değiştiğinde haritanın yeniden boyutlandırılması için kısa bir gecikme eklendi.
    // Bu, DOM güncellemelerinin tamamlanmasını ve harita konteynerinin doğru boyutları almasını sağlar.
    const timer = setTimeout(() => {
      if (mapRef.current) {
        console.log('MapTestPage: Forcing invalidateSize due to location change or mount.');
        mapRef.current.invalidateSize();
      }
    }, 150); // Zaman aşımı biraz artırıldı, gerekirse ayarlanabilir.

    return () => clearTimeout(timer);
  }, [location]); // Bağımlılık dizisine location eklendi

  // Pencere boyutu değiştiğinde harita boyutlandırma (Bu hook kalabilir)
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // KML katman görünürlük durumları
  const [kmlLayers, setKmlLayers] = useState({
    izmir: true,
    closedAreas: true,
    bigPlains: true
  });

  // Backend API test durumları
  const [apiTestResult, setApiTestResult] = useState<string>('');
  const [isApiTesting, setIsApiTesting] = useState(false);

  // İzmir merkezine odaklanmış konum (mevcut sistemle uyumlu)
  const izmir = { lat: 38.4237, lng: 27.1428 };

  const handlePolygonComplete = (polygon: DrawnPolygon) => {
    setDrawnPolygon(polygon);
    console.log('Polygon tamamlandı:', polygon);
  };

  const handlePolygonClear = () => {
    setDrawnPolygon(null);
    // Polygon temizlendi (log removed for cleaner console)
  };

  const handleDrawingStateChange = (isDrawing: boolean) => {
    setIsDrawingMode(isDrawing);
    console.log('🎨 Çizim modu değişti:', isDrawing);
  };

  const handleKmlLayerToggle = (layerName: keyof typeof kmlLayers) => {
    setKmlLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  // Backend API sağlık kontrolü
  const testBackendHealth = async () => {
    setIsApiTesting(true);
    setApiTestResult('API sağlık kontrolü yapılıyor...');
    
    try {
      const result = await healthCheck();
      setApiTestResult(`✅ Backend API çalışıyor: ${result.message}`);
    } catch (error) {
      setApiTestResult(`❌ Backend API hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
    
    setIsApiTesting(false);
  };

  // Koordinat doğrulama testi
  const testCoordinateValidation = async () => {
    setIsApiTesting(true);
    setApiTestResult('Koordinat doğrulama testi yapılıyor...');
    
    try {
      // İzmir merkezini test et
      const result = await checkCoordinate(izmir.lat, izmir.lng);
      setApiTestResult(`✅ Koordinat testi başarılı: 
        • İzmir içinde: ${result.in_izmir ? 'Evet' : 'Hayır'}
        • Kapalı alanda: ${result.in_yas_kapali_alan ? 'Evet' : 'Hayır'}
        • Büyük ovada: ${result.inside_polygons.length > 0 ? 'Evet' : 'Hayır'}
        • Ova adı: ${result.inside_polygons[0] || 'Yok'}
        • Toplam ova: ${result.total_ova_polygons}
        • Toplam kapalı alan: ${result.total_kapali_alan_polygons}
        • Toplam İzmir: ${result.total_izmir_polygons}`);
    } catch (error) {
      setApiTestResult(`❌ Koordinat doğrulama hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
    
    setIsApiTesting(false);
  };

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  return (
    <PageContainer>
      <Title>🗺️ Webimar Map Polygon Çizim & KML Katmanları Testi</Title>
      
      {/* KML Katman Kontrolleri */}
      <ControlPanel>
        <ControlSection>
          <ControlLabel>🗺️ KML Katmanları:</ControlLabel>
          <CheckboxGroup>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={kmlLayers.izmir}
                onChange={() => handleKmlLayerToggle('izmir')}
              />
              İzmir Sınırları
            </CheckboxItem>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={kmlLayers.closedAreas}
                onChange={() => handleKmlLayerToggle('closedAreas')}
              />
              Yasak Kapalı Alanlar
            </CheckboxItem>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={kmlLayers.bigPlains}
                onChange={() => handleKmlLayerToggle('bigPlains')}
              />
              Büyük Ovalar
            </CheckboxItem>
          </CheckboxGroup>
        </ControlSection>
      </ControlPanel>
      
      {/* Backend API Test Paneli */}
      <ControlPanel>
        <ControlSection>
          <ControlLabel>🔧 Backend API Testleri:</ControlLabel>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Button 
              onClick={testBackendHealth} 
              disabled={isApiTesting}
              style={{ backgroundColor: '#28a745' }}
            >
              {isApiTesting ? 'Test ediliyor...' : 'API Sağlık Kontrolü'}
            </Button>
            <Button 
              onClick={testCoordinateValidation} 
              disabled={isApiTesting}
              style={{ backgroundColor: '#007bff' }}
            >
              {isApiTesting ? 'Test ediliyor...' : 'Koordinat Doğrulama Testi'}
            </Button>
          </div>
          {apiTestResult && (
            <div style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              whiteSpace: 'pre-line'
            }}>
              {apiTestResult}
            </div>
          )}
        </ControlSection>
      </ControlPanel>
      
      <MapWrapper>
        <MapContainer
          center={[izmir.lat, izmir.lng]}
          zoom={10}
          whenReady={() => setIsMapReady(true)}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Harita boyutlandırma bileşeni */}
          <MapResizer onMapReady={(map) => {
            mapRef.current = map;
            // Harita hazır olduğunda boyutlandırma yap
            setTimeout(() => {
              map.invalidateSize();
            }, 100);
          }} />
          {/* Satellite imagery (mevcut sistemle aynı) */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          />
          
          {/* Polygon çizim komponenti */}
          {isMapReady && (
            <>
              {/* KML Katmanları */}
              <KMLLayerManager
                layerConfigs={[
                  {
                    name: 'izmir',
                    url: '/izmir.kml',
                    visible: kmlLayers.izmir,
                    style: { color: '#3388ff', weight: 2, fillOpacity: 0.1 }
                  },
                  {
                    name: 'closedAreas',
                    url: '/izmir_kapali_alan.kml',
                    visible: kmlLayers.closedAreas,
                    style: { color: '#ff3333', weight: 2, fillOpacity: 0.3 }
                  },
                  {
                    name: 'bigPlains',
                    url: '/Büyük Ovalar İzmir.kml',
                    visible: kmlLayers.bigPlains,
                    style: { color: '#33ff33', weight: 2, fillOpacity: 0.2 }
                  }
                ]}
                isDrawingMode={isDrawingMode}
              />
              
              {/* Polygon Çizim */}
              <PolygonDrawer
                onPolygonComplete={handlePolygonComplete}
                onPolygonClear={handlePolygonClear}
                onDrawingStateChange={handleDrawingStateChange}
              />
            </>
          )}
        </MapContainer>
      </MapWrapper>

      {drawnPolygon && (
        <ResultPanel>
          <ResultTitle>📊 Çizilen Polygon Bilgileri</ResultTitle>
          
          <ResultItem>
            <strong>Nokta Sayısı:</strong> {drawnPolygon.points.length}
          </ResultItem>
          
          <ResultItem>
            <strong>Alan:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>{formatArea(drawnPolygon.area).m2} m²</li>
              <li>{formatArea(drawnPolygon.area).donum} dönüm</li>
              <li>{formatArea(drawnPolygon.area).hectare} hektar</li>
            </ul>
          </ResultItem>
          
          <ResultItem>
            <strong>Koordinatlar:</strong>
            <CoordinateList>
              {drawnPolygon.points.map((point: any, index: number) => (
                <div key={index}>
                  {index + 1}. Nokta: {formatCoordinate(point.lat)}, {formatCoordinate(point.lng)}
                </div>
              ))}
            </CoordinateList>
          </ResultItem>
        </ResultPanel>
      )}
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>📝 Kullanım Talimatları:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h5 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>🗺️ KML Katmanları:</h5>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>🔵 İzmir Sınırları: İl sınırlarını gösterir</li>
              <li>🔴 Yasak Kapalı Alanlar: Yasaklı bölgeleri gösterir</li>
              <li>🟢 Büyük Ovalar: Tarım alanlarını gösterir</li>
              <li>✅ Katmanları açıp kapatabilirsiniz</li>
            </ul>
          </div>
          <div>
            <h5 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>✏️ Polygon Çizimi:</h5>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>🎨 "Polygon Çiz" butonuna tıklayarak başlayın</li>
              <li>📍 Harita üzerinde noktaları tıklayarak çizin</li>
              <li>✅ En az 3 nokta ile "Tamamla" butonuna tıklayın</li>
              <li>🔄 Çift tıklama ile de tamamlayabilirsiniz</li>
              <li>🗑️ "Temizle" butonu ile silebilirsiniz</li>
            </ul>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default MapTestPage;
