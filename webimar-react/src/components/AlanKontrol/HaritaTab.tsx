import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonDrawer from '../Map/PolygonDrawer';
import { formatArea } from '../../utils/areaCalculation';
import {
  FormSection,
  SectionTitle,
  InfoBox,
  Button,
  MapWrapper,
  AreaDisplayContainer,
  AreaDisplayBox,
  AreaLabel,
  AreaValue,
  AreaSubtext,
  HighlightBox,
  FlexContainer
} from './styles';

interface HaritaTabProps {
  // Map state
  drawingMode: string | null;
  isDrawing: boolean;
  tarlaPolygon: any;
  dikiliPolygon: any;
  editTrigger: any;
  existingPolygons: any[];
  
  // Area values
  dikiliAlan: number;
  tarlaAlani: number;
  
  // Arazi bilgileri
  araziVasfi?: string;
  
  // Callbacks
  enhancedCallbacks: any;
  setIsDrawing: (drawing: boolean) => void;
  handleTabChange: (tab: 'manuel' | 'harita') => void;
  handleDirectCalculation: () => void;
}

const HaritaTab: React.FC<HaritaTabProps> = ({
  drawingMode,
  isDrawing,
  tarlaPolygon,
  dikiliPolygon,
  editTrigger,
  existingPolygons,
  dikiliAlan,
  tarlaAlani,
  araziVasfi,
  enhancedCallbacks,
  setIsDrawing,
  handleTabChange,
  handleDirectCalculation
}) => {
  const handleDrawingButtonClick = (mode: 'tarla' | 'dikili', e: React.MouseEvent) => {
    console.log(`🎨 ${mode.toUpperCase()} butonuna tıklandı!`);
    e.preventDefault();
    e.stopPropagation();
    
    // Aynı mod zaten aktifse hiçbir şey yapma
    if (drawingMode === mode && isDrawing) {
      console.log('⚠️ Aynı mod zaten aktif');
      return;
    }
    
    // Aynı mod ama çizim değilse, sadece çizimi başlat
    if (drawingMode === mode && !isDrawing) {
      console.log('🔄 Aynı mod, sadece çizimi başlat');
      setIsDrawing(true);
      enhancedCallbacks.onDrawingStateChange?.(true);
      return;
    }
    
    // Farklı mode - önce modu değiştir, sonra çizimi başlat
    enhancedCallbacks.onDrawingModeChange?.(mode);
    
    setTimeout(() => {
      setIsDrawing(true);
      enhancedCallbacks.onDrawingStateChange?.(true);
    }, 50);
  };

  const handleStopDrawing = (e: React.MouseEvent) => {
    console.log('🛑 Çizimi durdur butonuna tıklandı');
    e.preventDefault();
    e.stopPropagation();
    setIsDrawing(false);
    enhancedCallbacks.onDrawingStateChange?.(false);
    enhancedCallbacks.onDrawingModeChange?.(null);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    enhancedCallbacks.onFullClear?.();
  };

  const renderAreaEditButton = (areaType: 'tarla' | 'dikili', polygon: any) => {
    const colors = {
      tarla: { bg: 'rgba(243, 156, 18, 0.1)', border: '#f39c12', hoverBg: 'rgba(243, 156, 18, 0.2)' },
      dikili: { bg: 'rgba(39, 174, 96, 0.1)', border: '#27ae60', hoverBg: 'rgba(39, 174, 96, 0.2)' }
    };
    
    return polygon && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          enhancedCallbacks.onAreaDisplayEdit(areaType);
        }}
        style={{
          background: colors[areaType].bg,
          border: `1px solid ${colors[areaType].border}`,
          fontSize: '18px',
          cursor: 'pointer',
          padding: '6px 8px',
          borderRadius: '6px',
          transition: 'all 0.2s',
          minWidth: '32px',
          minHeight: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = colors[areaType].hoverBg}
        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = colors[areaType].bg}
        title={`${areaType === 'tarla' ? 'Tarla' : 'Dikili'} alanını düzenle`}
      >
        ✏️
      </button>
    );
  };

  return (
    <FormSection>
      <SectionTitle>🗺️ Harita Üzerinden Alan Belirleme</SectionTitle>
      <InfoBox>
        {araziVasfi === 'Dikili vasıflı' 
          ? 'Harita üzerinde poligon çizerek dikili alanı belirleyebilirsiniz.'
          : 'Harita üzerinde poligon çizerek tarla alanı ve dikili alanı belirleyebilirsiniz. Önce tarla alanını, sonra dikili alanı çizin.'
        }
      </InfoBox>
      
      {/* Drawing mode controls */}
      <HighlightBox>
        <div style={{ marginBottom: '12px', fontWeight: '600', fontSize: '14px', color: '#2c3e50' }}>
          🎨 Çizim Modu:
        </div>
        
        {/* Drawing status indicator */}
        {isDrawing && drawingMode && (
          <HighlightBox $variant={drawingMode === 'tarla' ? 'warning' : 'success'}>
            🎨 {drawingMode === 'tarla' ? 'Tarla Alanı' : 'Dikili Alan'} çiziliyor...
            <span style={{ marginLeft: '8px', fontSize: '12px' }}>
              (Haritaya tıklayarak çizin, çift tıklayarak bitirin)
            </span>
          </HighlightBox>
        )}
        
        <FlexContainer style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          {araziVasfi !== 'Dikili vasıflı' && (
            <Button
              $variant={drawingMode === 'tarla' ? 'primary' : 'secondary'}
              onClick={(e) => handleDrawingButtonClick('tarla', e)}
              style={{ 
                backgroundColor: drawingMode === 'tarla' ? '#8B4513' : '#ecf0f1',
                color: drawingMode === 'tarla' ? 'white' : '#8B4513',
                border: `2px solid #8B4513`
              }}
            >
              🟤 Tarla Alanı Çiz
            </Button>
          )}
          
          <Button
            $variant={drawingMode === 'dikili' ? 'success' : 'secondary'}
            onClick={(e) => handleDrawingButtonClick('dikili', e)}
            style={{ 
              backgroundColor: drawingMode === 'dikili' ? '#27ae60' : '#ecf0f1',
              color: drawingMode === 'dikili' ? 'white' : '#27ae60',
              border: `2px solid #27ae60`
            }}
          >
            🟢 Dikili Alan Çiz
          </Button>
          
          {isDrawing && (
            <Button $variant="warning" onClick={handleStopDrawing}>
              ⏹️ Çizimi Durdur
            </Button>
          )}
          
          <Button $variant="danger" onClick={handleClearAll}>
            🗑️ Tümünü Temizle
          </Button>
        </FlexContainer>
      </HighlightBox>
      
      {/* Harita */}
      <MapWrapper>
        <MapContainer
          center={[38.4237, 27.1428]} // İzmir merkezi
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          />
          
          <PolygonDrawer
            onPolygonComplete={enhancedCallbacks.onPolygonComplete}
            onPolygonClear={enhancedCallbacks.onPolygonClear}
            onPolygonEdit={enhancedCallbacks.onPolygonEdit}
            disabled={false}
            polygonColor={drawingMode === 'tarla' ? '#8B4513' : '#27ae60'}
            polygonName={drawingMode === 'tarla' ? 'Tarla Alanı' : 'Dikili Alan'}
            hideControls={true}
            existingPolygons={existingPolygons}
            drawingMode={drawingMode as 'tarla' | 'dikili' | null}
            onDrawingModeChange={enhancedCallbacks.onDrawingModeChange}
            onDrawingStateChange={enhancedCallbacks.onDrawingStateChange}
            showDrawingModeControls={false}
            externalEditTrigger={editTrigger}
          />
        </MapContainer>
      </MapWrapper>
      
      {/* Alan gösterimi */}
      <AreaDisplayContainer>
        {araziVasfi !== 'Dikili vasıflı' && (
          <AreaDisplayBox $color="#8B4513">
            <FlexContainer style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <AreaLabel>🟤 Tarla Alanı</AreaLabel>
                <AreaValue>
                  {tarlaAlani > 0 ? formatArea(tarlaAlani).m2 : '0'} m²
                </AreaValue>
                <AreaSubtext>
                  {tarlaAlani > 0 ? `${formatArea(tarlaAlani).donum} dönüm` : 'Çizilmedi'}
                </AreaSubtext>
              </div>
              {renderAreaEditButton('tarla', tarlaPolygon)}
            </FlexContainer>
          </AreaDisplayBox>
        )}
        
        <AreaDisplayBox $color="#27ae60">
          <FlexContainer style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <AreaLabel>🟢 Dikili Alan</AreaLabel>
              <AreaValue>
                {dikiliAlan > 0 ? formatArea(dikiliAlan).m2 : '0'} m²
              </AreaValue>
              <AreaSubtext>
                {dikiliAlan > 0 ? `${formatArea(dikiliAlan).donum} dönüm` : 'Çizilmedi'}
              </AreaSubtext>
            </div>
            {renderAreaEditButton('dikili', dikiliPolygon)}
          </FlexContainer>
        </AreaDisplayBox>
      </AreaDisplayContainer>
      
      {/* İlerleme durumu */}
      {(tarlaPolygon || dikiliPolygon) && (
        <HighlightBox>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>📊 Alan Belirleme Durumu:</div>
          <div style={{ fontSize: '14px' }}>
            {araziVasfi !== 'Dikili vasıflı' && (
              <>
                ✅ Tarla Alanı: {tarlaPolygon ? '✅ Çizildi' : '❌ Çizilmedi'}
                <br/>
              </>
            )}
            ✅ Dikili Alan: {dikiliPolygon ? '✅ Çizildi' : '❌ Çizilmedi'}
          </div>
          
          {(araziVasfi === 'Dikili vasıflı' ? dikiliPolygon : (tarlaPolygon && dikiliPolygon)) && (
            <HighlightBox $variant="success" style={{ marginTop: '8px' }}>
              🎯 {araziVasfi === 'Dikili vasıflı' 
                ? 'Dikili alan çizildi! Ağaç bilgilerini manuel kontrol sekmesinden ekleyebilirsiniz.'
                : 'Her iki alan çizildi! Ağaç bilgilerini manuel kontrol sekmesinden ekleyebilirsiniz.'
              }
            </HighlightBox>
          )}
        </HighlightBox>
      )}
      
      {/* Manuel kontrole geçiş ve direkt hesaplama butonları */}
      {(araziVasfi === 'Dikili vasıflı' ? dikiliPolygon : (tarlaPolygon && dikiliPolygon)) && (
        <FlexContainer $direction="column" style={{ width: '100%' }}>
          <Button 
            onClick={() => handleTabChange('manuel')} 
            $variant="primary"
            style={{ width: '100%' }}
          >
            📝 Ağaç Bilgilerini Eklemek İçin Manuel Kontrole Geç
          </Button>
          
          <Button 
            onClick={handleDirectCalculation}
            $variant="success"
            style={{ width: '100%' }}
          >
            🚀 Poligon Verilerini Hesaplama Formuna Aktar
          </Button>
        </FlexContainer>
      )}
    </FormSection>
  );
};

export default HaritaTab;
