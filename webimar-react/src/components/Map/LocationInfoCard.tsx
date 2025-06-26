import React, { useState } from 'react';
import styled from 'styled-components';
import BuyukOvaModal from '../Modals/BuyukOvaModal';
import SuTahsisModal from '../Modals/SuTahsisModal';
import { LocationCheckResult } from '../../utils/kmlChecker';

interface LocationInfoCardProps {
  locationResult: LocationCheckResult | null;
  calculationType?: string;
  selectedPoint?: { lat: number; lng: number } | null;
  onSuTahsisResponse?: (hasSuTahsis: boolean) => void;
}

const CardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 16px 0;
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const CardBody = styled.div`
  padding: 20px;
`;

const InfoItem = styled.div<{ $type?: 'info' | 'warning' | 'error' | 'success' }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  border-left: 4px solid;
  
  ${props => {
    switch (props.$type) {
      case 'warning':
        return `
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border-left-color: #f59e0b;
          color: #92400e;
        `;
      case 'error':
        return `
          background: linear-gradient(135deg, #fef2f2, #fecaca);
          border-left-color: #ef4444;
          color: #991b1b;
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border-left-color: #10b981;
          color: #065f46;
        `;
      default:
        return `
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-left-color: #0ea5e9;
          color: #0c4a6e;
        `;
    }
  }}
`;

const InfoIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoText = styled.p`
  margin: 0 0 8px 0;
  font-weight: 500;
  line-height: 1.4;
`;

const InfoSubtext = styled.p`
  margin: 0;
  font-size: 13px;
  opacity: 0.8;
  line-height: 1.3;
`;

const ActionButton = styled.button`
  background: none;
  border: 2px solid currentColor;
  color: inherit;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
  
  &:hover {
    background: currentColor;
    color: white;
  }
`;

const CoordinateInfo = styled.div`
  background: #f8fafc;
  border-radius: 6px;
  padding: 10px 12px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #475569;
  margin-top: 12px;
`;

// Hayvancılık tesisleri ve tarımsal ürün yıkama tesisleri
const WATER_DEPENDENT_FACILITIES = [
  'sut-sigirciligi',
  'besi-sigirciligi',
  'agil-kucukbas',
  'yumurta-tavukciligi',
  'et-tavukciligi',
  'hindi-yetistiriciligi',
  'kaz-yetistiriciligi',
  'serbest-dolasan-tavukculuk',
  'kanatliyem-uretimi',
  'tarimsal-urun-yikama' // Bu da eklenebilir gelecekte
];

const LocationInfoCard: React.FC<LocationInfoCardProps> = ({ 
  locationResult, 
  calculationType,
  selectedPoint,
  onSuTahsisResponse
}) => {
  const [showBuyukOvaModal, setShowBuyukOvaModal] = useState(false);
  const [showSuTahsisModal, setShowSuTahsisModal] = useState(false);

  // Debug logging
  console.log('🔍 LocationInfoCard render:', {
    locationResult,
    calculationType,
    selectedPoint,
    hasBuyukOva: locationResult?.buyukOvaIcinde,
    hasKapaliSu: locationResult?.kapaliSuHavzasiIcinde,
    needsWaterPermit: calculationType && WATER_DEPENDENT_FACILITIES.includes(calculationType)
  });

  if (!locationResult || !selectedPoint) {
    console.log('❌ LocationInfoCard: No result or point, returning null');
    return null;
  }

  // Su tahsis belgesi gerekli mi kontrol et
  const needsWaterPermit = calculationType && 
    WATER_DEPENDENT_FACILITIES.includes(calculationType);

  console.log('🔍 Water permit check:', {
    calculationType,
    needsWaterPermit,
    waterFacilities: WATER_DEPENDENT_FACILITIES
  });

  const handleSuTahsisResponse = (hasSuTahsis: boolean) => {
    onSuTahsisResponse?.(hasSuTahsis);
    if (!hasSuTahsis) {
      // Su tahsis belgesi yoksa modal açık kalır
      return;
    }
    setShowSuTahsisModal(false);
  };

  return (
    <>
      <CardContainer>
        <CardHeader>
          <span>📍</span>
          <CardTitle>Seçilen Konum Analizi</CardTitle>
        </CardHeader>
        
        <CardBody>
          {/* İzmir sınırları kontrolü - sadece dışındaysa göster */}
          {!locationResult.izmirinIcinde && (
            <>
              <CoordinateInfo>
                📍 Koordinatlar: {selectedPoint.lat.toFixed(6)}, {selectedPoint.lng.toFixed(6)}
              </CoordinateInfo>

              <InfoItem $type="error">
                <InfoIcon>❌</InfoIcon>
                <InfoContent>
                  <InfoText>İzmir sınırları dışında</InfoText>
                  <InfoSubtext>
                    Hesaplamalarımız sadece İzmir ili sınırları içinde yapılabilmektedir. Lütfen harita üzerinden İzmir sınırları içinde bir nokta seçiniz.
                  </InfoSubtext>
                  {locationResult.detaylar.izmirBolgeAdi && (
                    <InfoSubtext>
                      Bölge: {locationResult.detaylar.izmirBolgeAdi}
                    </InfoSubtext>
                  )}
                </InfoContent>
              </InfoItem>
            </>
          )}

          {/* Büyük ova kontrolü (sadece İzmir içindeyse) */}
          {locationResult.izmirinIcinde && locationResult.buyukOvaIcinde && (
            <InfoItem $type="warning">
              <InfoIcon>⚠️</InfoIcon>
              <InfoContent>
                <InfoText>Büyük Ova Koruma Alanı İçinde</InfoText>
                <InfoSubtext>
                  İşlemler normalden uzun sürecektir
                </InfoSubtext>
                {locationResult.detaylar.buyukOvaAdi && (
                  <InfoSubtext>
                    Ova: {locationResult.detaylar.buyukOvaAdi}
                  </InfoSubtext>
                )}
                <ActionButton onClick={() => setShowBuyukOvaModal(true)}>
                  📋 Detayları Gör
                </ActionButton>
              </InfoContent>
            </InfoItem>
          )}

          {/* Kapalı su havzası kontrolü (sadece İzmir içindeyse ve gerekli tesisler için) */}
          {locationResult.izmirinIcinde && 
           locationResult.kapaliSuHavzasiIcinde && 
           needsWaterPermit && (
            <InfoItem $type="warning">
              <InfoIcon>💧</InfoIcon>
              <InfoContent>
                <InfoText>Kapalı Su Havzası İçinde</InfoText>
                <InfoSubtext>
                  Su tahsis belgesi gereklidir
                </InfoSubtext>
                {locationResult.detaylar.kapaliSuHavzaAdi && (
                  <InfoSubtext>
                    Havza: {locationResult.detaylar.kapaliSuHavzaAdi}
                  </InfoSubtext>
                )}
                <ActionButton onClick={() => setShowSuTahsisModal(true)}>
                  💧 Su Belgesi Kontrol
                </ActionButton>
              </InfoContent>
            </InfoItem>
          )}

          {/* Başarılı durum mesajı */}
          {locationResult.izmirinIcinde && 
           !locationResult.buyukOvaIcinde && 
           (!needsWaterPermit || !locationResult.kapaliSuHavzasiIcinde) && (
            <InfoItem $type="success">
              <InfoIcon>🎉</InfoIcon>
              <InfoContent>
                <InfoText>Konum Uygun</InfoText>
                <InfoSubtext>
                  Seçtiğiniz konumda hesaplama yapabilirsiniz
                </InfoSubtext>
              </InfoContent>
            </InfoItem>
          )}
        </CardBody>
      </CardContainer>

      {/* Modals */}
      <BuyukOvaModal
        isOpen={showBuyukOvaModal}
        onClose={() => setShowBuyukOvaModal(false)}
        calculationType={calculationType}
        selectedPoint={selectedPoint}
      />

      <SuTahsisModal
        isOpen={showSuTahsisModal}
        onClose={() => setShowSuTahsisModal(false)}
        onResponse={handleSuTahsisResponse}
        calculationType={calculationType}
      />
    </>
  );
};

export default LocationInfoCard;
