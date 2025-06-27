import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BuyukOvaModal from '../Modals/BuyukOvaModal';
import { LocationCheckResult } from '../../utils/kmlChecker';

interface LocationInfoCardProps {
  locationResult: LocationCheckResult | null;
  calculationType?: string;
  selectedPoint?: { lat: number; lng: number } | null;
}

const CardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin: 12px 0;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  position: relative;
  z-index: 10;

  @media (max-width: 600px) {
    margin: 8px 0;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.10);
  }
`;

const CardBody = styled.div`
  padding: 14px;

  @media (max-width: 600px) {
    padding: 8px 6px;
  }
`;

const InfoItem = styled.div<{ $type?: 'info' | 'warning' | 'error' | 'success' }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  border-left: 3px solid;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  font-size: 14px;

  @media (max-width: 600px) {
    padding: 7px 6px;
    border-radius: 6px;
    font-size: 12px;
    gap: 6px;
  }

  ${props => {
    switch (props.$type) {
      case 'warning':
        return `
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border-left-color: #f59e0b;
          color: #92400e;
          border: 1px solid rgba(245, 158, 11, 0.2);
        `;
      case 'error':
        return `
          background: linear-gradient(135deg, #fef2f2, #fecaca);
          border-left-color: #ef4444;
          color: #991b1b;
          border: 1px solid rgba(239, 68, 68, 0.2);
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border-left-color: #10b981;
          color: #065f46;
          border: 1px solid rgba(16, 185, 129, 0.2);
        `;
      default:
        return `
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-left-color: #0ea5e9;
          color: #0c4a6e;
          border: 1px solid rgba(14, 165, 233, 0.2);
        `;
    }
  }}
`;

const InfoIcon = styled.div`
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;

  @media (max-width: 600px) {
    font-size: 15px;
  }
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoText = styled.p`
  margin: 0 0 4px 0;
  font-weight: 500;
  line-height: 1.3;

  @media (max-width: 600px) {
    font-size: 13px;
    margin-bottom: 2px;
  }
`;

const InfoSubtext = styled.p`
  margin: 0;
  font-size: 12px;
  opacity: 0.8;
  line-height: 1.2;

  @media (max-width: 600px) {
    font-size: 11px;
  }
`;

const CoordinateInfo = styled.div`
  background: #f8fafc;
  border-radius: 5px;
  padding: 7px 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #475569;
  margin-top: 8px;

  @media (max-width: 600px) {
    font-size: 11px;
    padding: 5px 6px;
    border-radius: 4px;
    margin-top: 6px;
  }
`;

const LocationInfoCard: React.FC<LocationInfoCardProps> = ({ 
  locationResult, 
  calculationType,
  selectedPoint
}) => {
  const [showBuyukOvaModal, setShowBuyukOvaModal] = useState(false);

  // Mobilde Leaflet attribution'ı gizle
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media (max-width: 600px) {
        .leaflet-control-attribution {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!locationResult || !selectedPoint || !locationResult.buyukOvaIcinde) {
    return null;
  }

  return (
    <>
      <CardContainer>
        
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

          {/* Dinamik genişleme - Büyük ova */}
          {locationResult.izmirinIcinde && locationResult.buyukOvaIcinde && (
            <InfoItem $type="warning">
              <InfoIcon>⚠️</InfoIcon>
              <InfoContent>
                <InfoText>
                  Büyük Ova Koruma Alanı İçinde
                  <button
                    type="button"
                    aria-label="Büyük Ova hakkında bilgi al"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f59e0b',
                      fontSize: '15px',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '6px',
                      lineHeight: 1,
                      verticalAlign: 'middle'
                    }}
                    onClick={() => setShowBuyukOvaModal(true)}
                  >
                    ❓
                  </button>
                </InfoText>
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
    </>
  );
};

export default LocationInfoCard;
