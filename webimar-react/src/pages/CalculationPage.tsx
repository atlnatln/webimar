import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import CalculationForm from '../components/CalculationForm';
import ResultDisplay from '../components/ResultDisplay';
import MapComponent, { MapRef } from '../components/Map/MapComponent';
import LocationAutocomplete from '../components/LocationAutocomplete';
import LocationInfoCard from '../components/Map/LocationInfoCard';
import { LocationValidationProvider, useLocationValidation } from '../contexts/LocationValidationContext';
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
  max-height: ${props => props.$isOpen ? '800px' : '0'};
  opacity: ${props => props.$isOpen ? 1 : 0};
`;

const LocationValidationSection = styled.div`
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const FormBlockingOverlay = styled.div<{ $isBlocked: boolean; $blockReason?: string }>`
  position: relative;
  
  ${props => props.$isBlocked && `
    pointer-events: none;
    opacity: 0.6;
    
    &::after {
      content: "${props.$blockReason || "⚠️ Haritadan geçerli bir konum seçmeniz gerekiyor"}";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #dc3545;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 10;
      text-align: center;
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
      max-width: 300px;
    }
  `}
`;

// Ana sayfa bileşeni - location validation ile wrap edilmiş
const CalculationPageContent: React.FC<CalculationPageProps> = ({ 
  calculationType, 
  title, 
  description 
}) => {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [araziVasfi, setAraziVasfi] = useState<string>('');
  const [emsalTuru, setEmsalTuru] = useState<string>('marjinal');
  const mapRef = useRef<MapRef>(null);
  
  // Location validation context
  const { 
    state: locationState, 
    setSelectedPoint, 
    canUserProceedWithCalculation 
  } = useLocationValidation();

  // Form engelleme durumu ve nedeni
  const isFormBlocked = !canUserProceedWithCalculation(calculationType);
  
  const getBlockReason = () => {
    const { kmlCheckResult, suTahsisBelgesi } = locationState;
    
    if (!kmlCheckResult) {
      return "⚠️ Haritadan bir konum seçmeniz gerekiyor";
    }
    
    if (!kmlCheckResult.izmirinIcinde) {
      return "❌ İzmir sınırları içinde bir konum seçmeniz gerekiyor";
    }
    
    // Su tahsis belgesi kontrolü
    const waterDependentFacilities = [
      'sut-sigirciligi', 'besi-sigirciligi', 'agil-kucukbas',
      'kumes-yumurtaci', 'kumes-etci', 'kumes-hindi', 'kaz-ordek',
      'kumes-gezen', 'hara', 'evcil-hayvan', 'yikama-tesisi'
    ];
    
    if (calculationType && 
        waterDependentFacilities.includes(calculationType) && 
        kmlCheckResult.kapaliSuHavzasiIcinde &&
        suTahsisBelgesi === null) {
      return "💧 Su tahsis belgesi durumunu belirtmeniz gerekiyor";
    }
    
    if (calculationType && 
        waterDependentFacilities.includes(calculationType) && 
        kmlCheckResult.kapaliSuHavzasiIcinde &&
        suTahsisBelgesi === false) {
      return "❌ Bu konumda su tahsis belgesi gereklidir";
    }
    
    return "⚠️ Haritadan geçerli bir konum seçmeniz gerekiyor";
  };
  
  console.log('🔍 CalculationPage - Form block check:', {
    calculationType,
    isFormBlocked,
    blockReason: getBlockReason(),
    canProceed: canUserProceedWithCalculation(calculationType)
  });

  // Render Debug - Component her render edildiğinde çalışır
  console.log('🔄 CalculationPage - Component Render:', {
    result: result,
    isLoading: isLoading,
    calculationType: calculationType,
    resultExists: !!result,
    shouldShowResult: !!(result || isLoading)
  });

  const handleCalculationResult = (newResult: CalculationResult) => {
    console.log('🎯 CalculationPage - handleCalculationResult called with:', newResult);
    console.log('🔍 CalculationPage - Before state update:', { currentResult: result, currentIsLoading: isLoading });
    
    setResult(newResult);
    setIsLoading(false);
    
    console.log('📊 CalculationPage - State updated: result set, isLoading set to false');
    
    // Debug: State güncellendikten sonra render koşulunu kontrol et
    setTimeout(() => {
      console.log('🔍 CalculationPage - Render Condition Debug:', {
        result: newResult,
        isLoading: false,
        shouldRenderResult: (newResult || false),
        newResult_truthy: !!newResult,
        newResult_success: newResult?.success
      });
    }, 100);
    
    // Force re-render debug
    setTimeout(() => {
      console.log('🔍 CalculationPage - Force check after 500ms...');
    }, 500);
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

  // Emsal türü değişikliği için handler
  const handleEmsalTuruChange = (newEmsalTuru: string) => {
    console.log(`🔄 CalculationPage - Emsal türü değişti: "${emsalTuru}" → "${newEmsalTuru}"`);
    setEmsalTuru(newEmsalTuru);
    
    // Eğer sonuç zaten varsa, yeni hesaplama başlat
    if (result) {
      console.log('🔄 CalculationPage - Emsal türü değiştiği için yeniden hesaplama yapılacak');
      setIsLoading(true);
      
      // Form submit işlemini tetikle
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          console.log('🚀 CalculationPage - Form submit tetikleniyor (emsal türü değişikliği)');
          form.dispatchEvent(new Event('submit', { bubbles: true }));
        } else {
          console.error('❌ CalculationPage - Form bulunamadı, loading durumu sıfırlanıyor');
          setIsLoading(false);
        }
      }, 100); // Form'un güncellenmesi için kısa bir bekleme
    }
    
    console.log('✅ CalculationPage - Emsal türü güncellendi');
  };

  // CalculationType değişiminde form ve sonuçları sıfırla
  useEffect(() => {
    console.log(`🔄 CalculationPage - calculationType değişti: "${calculationType}"`);
    console.log('🧹 CalculationPage - calculationType değişiminde önceki hesaplama verileri temizleniyor');
    
    // Form ve sonuçları sıfırla
    setResult(null);
    setIsLoading(false);
    setAraziVasfi(''); // Arazi vasfını da sıfırla
    setSelectedPoint(null); // Seçili koordinatları da temizle
    setIsManualSelection(false); // Manuel seçim flag'ini sıfırla
    
    console.log('✅ CalculationPage - calculationType değişiminde sıfırlama tamamlandı');
  }, [calculationType, setSelectedPoint]);

  const handleMapClick = (coordinate: {lat: number, lng: number}) => {
    setSelectedPoint(coordinate);
    setIsManualSelection(true); // Manuel seçim olarak işaretle
    console.log('🗺️ Manuel seçilen koordinat:', coordinate);
    console.log('📍 Calculation type:', calculationType);
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
    setSelectedPoint(null);
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
            selectedCoordinate={locationState.selectedPoint}
            showMarker={isManualSelection && locationState.kmlCheckResult?.izmirinIcinde} // Sadece İzmir içinde ve manuel seçimde marker göster
            height="400px"
            kmlLayers={[
              {
                url: '/izmir.kml',
                name: 'İzmir Sınırları',
                style: {
                  color: '#006600',
                  weight: 2,
                  fillOpacity: 0,
                  fillColor: 'transparent'
                }
              }
              // Diğer KML katmanları gizlendi - sadece İzmir sınırları görünür
            ]}
          />

          {/* Location Validation Info Card */}
          {locationState.selectedPoint && (
            <LocationValidationSection>
              <LocationInfoCard
                locationResult={locationState.kmlCheckResult}
                calculationType={calculationType}
                selectedPoint={locationState.selectedPoint}
              />
            </LocationValidationSection>
          )}

        </MapContainer>
      </MapSection>
      
      <ContentGrid>
        <FormSection>
          <FormBlockingOverlay $isBlocked={isFormBlocked} $blockReason={getBlockReason()}>
            <CalculationForm
              calculationType={calculationType}
              onResult={handleCalculationResult}
              onCalculationStart={handleCalculationStart}
              selectedCoordinate={isManualSelection ? locationState.selectedPoint : null}
              onAraziVasfiChange={handleAraziVasfiChange}
              emsalTuru={emsalTuru}
              onEmsalTuruChange={handleEmsalTuruChange}
            />
          </FormBlockingOverlay>
        </FormSection>
        
        {(() => {
          console.log('🔍 CalculationPage - Render Check:', { result, isLoading, shouldRender: (result || isLoading) });
          return null;
        })()}
        
        {(result || isLoading) && (
          <ResultSection>
            {(() => {
              console.log('🖼️ CalculationPage - Rendering ResultDisplay with:', { result, isLoading, calculationType, araziVasfi, emsalTuru });
              return null;
            })()}
            <ResultDisplay
              result={result}
              isLoading={isLoading}
              calculationType={calculationType}
              araziVasfi={araziVasfi}
              selectedEmsalType={emsalTuru}
              onEmsalTypeChange={handleEmsalTuruChange}
            />
          </ResultSection>
        )}
      </ContentGrid>
    </PageContainer>
  );
};

// Ana bileşen - LocationValidationProvider ile wrap edilmiş
const CalculationPage: React.FC<CalculationPageProps> = (props) => {
  return (
    <LocationValidationProvider>
      <CalculationPageContent {...props} />
    </LocationValidationProvider>
  );
};

export default CalculationPage;
