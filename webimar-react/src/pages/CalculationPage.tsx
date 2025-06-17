import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import CalculationForm from '../components/CalculationForm';
import ResultDisplay from '../components/ResultDisplay';
import MapComponent, { MapRef } from '../components/Map/MapComponent';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { CalculationResult, StructureType } from '../types';

interface CalculationPageProps {
  calculationType: StructureType;
  title: string;
  description: string;
}

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f3f4f6;
  text-align: center;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
    padding-bottom: 16px;
    text-align: left;
  }
`;

const PageTitle = styled.h1`
  color: #111827;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const PageDescription = styled.p`
  color: #6b7280;
  font-size: 18px;
  line-height: 1.6;
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-left: 0;
    margin-right: 0;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const FormSection = styled.div`
  order: 0;
`;

const ResultSection = styled.div`
  order: 1;
`;

const MapSection = styled.div<{ $isOpen: boolean }>`
  margin-bottom: 32px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  height: ${props => props.$isOpen ? 'auto' : '60px'};
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
    border-radius: 8px;
  }
`;

const MapHeader = styled.div<{ $isOpen: boolean }>`
  padding: 16px 24px;
  border-bottom: ${props => props.$isOpen ? '1px solid #e5e7eb' : 'none'};
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const MapTitle = styled.h3`
  color: #111827;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const MapToggleButton = styled.button<{ $isOpen: boolean }>`
  background: ${props => props.$isOpen ? '#e74c3c' : '#3498db'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: ${props => props.$isOpen ? '#c0392b' : '#2980b9'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const MapContainer = styled.div<{ $isOpen: boolean }>`
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: ${props => props.$isOpen ? '600px' : '0'};
  opacity: ${props => props.$isOpen ? 1 : 0};
`;



const CalculationPage: React.FC<CalculationPageProps> = ({ 
  calculationType, 
  title, 
  description 
}) => {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState<{lat: number, lng: number} | null>(null);
  const [isManualSelection, setIsManualSelection] = useState(false); // Manuel harita tıklaması mı?
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [araziVasfi, setAraziVasfi] = useState<string>(''); // Arazi vasfı bilgisi
  const mapRef = useRef<MapRef>(null);

  const handleCalculationResult = (newResult: CalculationResult) => {
    console.log('🎯 CalculationPage - handleCalculationResult called with:', newResult);
    setResult(newResult);
    setIsLoading(false);
    console.log('📊 CalculationPage - State updated: result set, isLoading set to false');
  };

  const handleCalculationStart = () => {
    console.log('🚀 CalculationPage - handleCalculationStart called, setting isLoading to true');
    setIsLoading(true);
    setResult(null);
    console.log('📊 CalculationPage - State updated: isLoading set to true, result cleared');
  };

  const handleAraziVasfiChange = (newAraziVasfi: string) => {
    console.log(`🧹 CalculationPage - Arazi vasfı değişti: "${araziVasfi}" → "${newAraziVasfi}"`);
    
    // Arazi vasfı değiştiğinde önceki hesaplama sonuçlarını temizle
    if (araziVasfi && newAraziVasfi !== araziVasfi) {
      console.log('🧹 CalculationPage - Önceki hesaplama sonuçları temizleniyor');
      setResult(null);
      setIsLoading(false);
    }
    
    setAraziVasfi(newAraziVasfi);
    console.log('✅ CalculationPage - Arazi vasfı güncellendi');
  };

  // CalculationType değişiminde form ve sonuçları sıfırla
  useEffect(() => {
    console.log(`🔄 CalculationPage - calculationType değişti: "${calculationType}"`);
    console.log('🧹 CalculationPage - calculationType değişiminde önceki hesaplama verileri temizleniyor');
    
    // Form ve sonuçları sıfırla
    setResult(null);
    setIsLoading(false);
    setAraziVasfi(''); // Arazi vasfını da sıfırla
    setSelectedCoordinate(null); // Seçili koordinatları da temizle
    setIsManualSelection(false); // Manuel seçim flag'ini sıfırla
    
    console.log('✅ CalculationPage - calculationType değişiminde sıfırlama tamamlandı');
  }, [calculationType]);

  const handleMapClick = (coordinate: {lat: number, lng: number}) => {
    setSelectedCoordinate(coordinate);
    setIsManualSelection(true); // Manuel seçim olarak işaretle
    console.log('Manuel seçilen koordinat:', coordinate);
  };

  const toggleMapVisibility = () => {
    setIsMapVisible(!isMapVisible);
  };

  // Konum seçildiğinde haritada zoom yap
  const handleLocationSelect = (location: any) => {
    // Zoom seviyesini konum türüne göre ayarla
    const zoomLevel = location.tur === 'İLÇE' ? 13 : 15; // İlçe için 13, mahalle için 15
    
    // Haritada konuma zoom yap
    if (mapRef.current) {
      mapRef.current.zoomToLocation(location.latitude, location.longitude, zoomLevel);
    }
    
    // Mahalle/İlçe seçimi için koordinat gösterimi ve marker'ı kaldır
    setSelectedCoordinate(null);
    setIsManualSelection(false);
    
    console.log(`📍 ${location.tur}: ${location.ad}, ${location.ilce} seçildi (zoom: ${zoomLevel}) - Marker gösterilmiyor`);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
        <PageDescription>{description}</PageDescription>
      </PageHeader>
      
      <MapSection $isOpen={isMapVisible}>
        <MapHeader $isOpen={isMapVisible}>
          <MapTitle>
            📍 Arazi Konumu Seçimi
          </MapTitle>
          <MapToggleButton $isOpen={isMapVisible} onClick={toggleMapVisibility}>
            {isMapVisible ? (
              <>
                <span>📍</span>
                Haritayı Gizle
              </>
            ) : (
              <>
                <span>🗺️</span>
                Haritayı Göster
              </>
            )}
          </MapToggleButton>
        </MapHeader>
        <MapContainer $isOpen={isMapVisible}>
          {/* Konum Arama Bölümü */}
          <div style={{ 
            marginBottom: '16px', 
            padding: '16px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ 
              marginBottom: '8px', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#2c3e50' 
            }}>
              🔍 İlçe/Mahalle Arama
            </div>
            <LocationAutocomplete 
              onLocationSelect={handleLocationSelect}
              placeholder="İlçe veya mahalle adı yazın... (örn: Karşıyaka, Bornova)"
            />
            <div style={{ 
              marginTop: '8px', 
              fontSize: '12px', 
              color: '#6c757d' 
            }}>
              💡 İlçe veya mahalle seçtiğinizde harita otomatik olarak o konuma odaklanacak
            </div>
          </div>

          <MapComponent
            ref={mapRef}
            center={[38.4237, 27.1428]} // İzmir merkezi
            zoom={10}
            onMapClick={handleMapClick}
            selectedCoordinate={selectedCoordinate}
            showMarker={isManualSelection} // Sadece manuel seçimde marker göster
            height="400px"
            kmlLayers={[
              {
                url: '/izmir.kml',
                name: 'İzmir Sınırları',
                style: {
                  color: '#006600',
                  weight: 3,
                  fillOpacity: 0.05
                }
              },
              {
                url: '/izmir_kapali_alan.kml', 
                name: 'Yasak Kapalı Alanlar',
                style: {
                  color: 'red',
                  weight: 2,
                  fillOpacity: 0.3,
                  fillColor: 'red'
                }
              },
              {
                url: '/Büyük Ovalar İzmir.kml',
                name: 'Büyük Ovalar',
                style: {
                  color: 'blue',
                  weight: 2,
                  fillOpacity: 0.2,
                  fillColor: 'blue'
                }
              }
            ]}
          />

        </MapContainer>
      </MapSection>
      
      <ContentGrid>
        <FormSection>
          <CalculationForm
            calculationType={calculationType}
            onResult={handleCalculationResult}
            onCalculationStart={handleCalculationStart}
            selectedCoordinate={isManualSelection ? selectedCoordinate : null}
            onAraziVasfiChange={handleAraziVasfiChange}
          />
        </FormSection>
        
        {(result || isLoading) && (
          <ResultSection>
            <ResultDisplay
              result={result}
              isLoading={isLoading}
              calculationType={calculationType}
              araziVasfi={araziVasfi}
            />
          </ResultSection>
        )}
      </ContentGrid>
    </PageContainer>
  );
};

export default CalculationPage;
