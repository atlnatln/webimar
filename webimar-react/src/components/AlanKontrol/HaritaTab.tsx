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
  zeytinlikPolygon: any;
  editTrigger: any;
  existingPolygons: any[];
  
  // Area values
  dikiliAlan: number;
  tarlaAlani: number;
  zeytinlikAlani: number;
  
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
  zeytinlikPolygon,
  editTrigger,
  existingPolygons,
  dikiliAlan,
  tarlaAlani,
  zeytinlikAlani,
  araziVasfi,
  enhancedCallbacks,
  setIsDrawing,
  handleTabChange,
  handleDirectCalculation
}) => {
  const handleDrawingButtonClick = (mode: 'tarla' | 'dikili' | 'zeytinlik', e: React.MouseEvent) => {
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

  const renderAreaEditButton = (areaType: 'tarla' | 'dikili' | 'zeytinlik', polygon: any) => {
    const colors = {
      tarla: { bg: 'rgba(243, 156, 18, 0.1)', border: '#f39c12', hoverBg: 'rgba(243, 156, 18, 0.2)' },
      dikili: { bg: 'rgba(39, 174, 96, 0.1)', border: '#27ae60', hoverBg: 'rgba(39, 174, 96, 0.2)' },
      zeytinlik: { bg: 'rgba(156, 136, 54, 0.1)', border: '#9c8836', hoverBg: 'rgba(156, 136, 54, 0.2)' }
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
        title={`${areaType === 'tarla' ? 'Tarla' : areaType === 'dikili' ? 'Dikili' : 'Zeytinlik'} alanını düzenle`}
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
          : araziVasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf'
          ? 'Harita üzerinde poligon çizerek zeytin ağaçlarının bulunduğu dikili alanı belirleyebilirsiniz.'
          : araziVasfi === 'Tarla + Zeytinlik'
          ? 'Harita üzerinde poligon çizerek tarla alanı ve zeytinlik alanı belirleyebilirsiniz. Önce tarla alanını, sonra zeytinlik alanı çizin.'
          : araziVasfi === '… Adetli Zeytin Ağacı bulunan tarla'
          ? 'Bu arazi tipi için sadece tarla alanını çizmeniz yeterlidir. Zeytin ağacı bilgileri formdan alınmıştır.'
          : araziVasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf'
          ? 'Dikili alanı çizin. Zeytin ağacı bilgileri formdan alınmış, diğer dikili vasıf ağaçları için manuel kontrol sekmesini kullanın.'
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
          <HighlightBox $variant={drawingMode === 'tarla' ? 'warning' : drawingMode === 'zeytinlik' ? 'info' : 'success'}>
            🎨 {drawingMode === 'tarla' ? 'Tarla Alanı' : drawingMode === 'zeytinlik' ? 'Zeytinlik Alanı' : 'Dikili Alan'} çiziliyor...
            <span style={{ marginLeft: '8px', fontSize: '12px' }}>
              (Haritaya tıklayarak çizin, çift tıklayarak bitirin)
            </span>
          </HighlightBox>
        )}
        
        <FlexContainer style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          {araziVasfi !== 'Dikili vasıflı' && araziVasfi !== 'Zeytin ağaçlı + herhangi bir dikili vasıf' && araziVasfi !== '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' && (
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
          
          {araziVasfi === 'Tarla + Zeytinlik' ? (
            <Button
              $variant={drawingMode === 'zeytinlik' ? 'primary' : 'secondary'}
              onClick={(e) => handleDrawingButtonClick('zeytinlik', e)}
              style={{ 
                backgroundColor: drawingMode === 'zeytinlik' ? '#9c8836' : '#ecf0f1',
                color: drawingMode === 'zeytinlik' ? 'white' : '#9c8836',
                border: `2px solid #9c8836`
              }}
            >
              🫒 Zeytinlik Alanı Çiz
            </Button>
          ) : araziVasfi !== '… Adetli Zeytin Ağacı bulunan tarla' && (
            <Button
              $variant={drawingMode === 'dikili' ? 'success' : 'secondary'}
              onClick={(e) => handleDrawingButtonClick('dikili', e)}
              style={{ 
                backgroundColor: drawingMode === 'dikili' ? '#27ae60' : '#ecf0f1',
                color: drawingMode === 'dikili' ? 'white' : '#27ae60',
                border: `2px solid #27ae60`
              }}
            >
              {araziVasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf' 
                ? '🫒 Zeytin Ağaçlı Dikili Alan Çiz' 
                : '🟢 Dikili Alan Çiz'
              }
            </Button>
          )}
          
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
            polygonColor={drawingMode === 'tarla' ? '#8B4513' : drawingMode === 'zeytinlik' ? '#9c8836' : '#27ae60'}
            polygonName={drawingMode === 'tarla' ? 'Tarla Alanı' : drawingMode === 'zeytinlik' ? 'Zeytinlik Alanı' : 'Dikili Alan'}
            hideControls={true}
            existingPolygons={existingPolygons}
            drawingMode={drawingMode as 'tarla' | 'dikili' | 'zeytinlik' | null}
            onDrawingModeChange={enhancedCallbacks.onDrawingModeChange}
            onDrawingStateChange={enhancedCallbacks.onDrawingStateChange}
            showDrawingModeControls={false}
            externalEditTrigger={editTrigger}
          />
        </MapContainer>
      </MapWrapper>
      
      {/* Alan gösterimi */}
      <AreaDisplayContainer>
        {araziVasfi !== 'Dikili vasıflı' && araziVasfi !== 'Zeytin ağaçlı + herhangi bir dikili vasıf' && araziVasfi !== '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' && (
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
        
        {araziVasfi === 'Tarla + Zeytinlik' ? (
          <AreaDisplayBox $color="#9c8836">
            <FlexContainer style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <AreaLabel>🫒 Zeytinlik Alanı</AreaLabel>
                <AreaValue>
                  {zeytinlikAlani > 0 ? formatArea(zeytinlikAlani).m2 : '0'} m²
                </AreaValue>
                <AreaSubtext>
                  {zeytinlikAlani > 0 ? `${formatArea(zeytinlikAlani).donum} dönüm` : 'Çizilmedi'}
                </AreaSubtext>
              </div>
              {renderAreaEditButton('zeytinlik', zeytinlikPolygon)}
            </FlexContainer>
          </AreaDisplayBox>
        ) : araziVasfi !== '… Adetli Zeytin Ağacı bulunan tarla' && (
          <AreaDisplayBox $color="#27ae60">
            <FlexContainer style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <AreaLabel>
                  {araziVasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf' 
                    ? '🫒 Zeytin Ağaçlı Dikili Alan'
                    : araziVasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf'
                    ? '🫒 Zeytin Ağaçlı Dikili Alan'
                    : '🟢 Dikili Alan'
                  }
                </AreaLabel>
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
        )}
      </AreaDisplayContainer>
      
      {/* İlerleme durumu */}
      {(tarlaPolygon || dikiliPolygon || zeytinlikPolygon) && (
        <HighlightBox>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>📊 Alan Belirleme Durumu:</div>
          <div style={{ fontSize: '14px' }}>
            {araziVasfi !== 'Dikili vasıflı' && araziVasfi !== 'Zeytin ağaçlı + herhangi bir dikili vasıf' && araziVasfi !== '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' && (
              <>
                ✅ Tarla Alanı: {tarlaPolygon ? '✅ Çizildi' : '❌ Çizilmedi'}
                <br/>
              </>
            )}
            {araziVasfi === 'Tarla + Zeytinlik' ? (
              <>
                ✅ Zeytinlik Alanı: {zeytinlikPolygon ? '✅ Çizildi' : '❌ Çizilmedi'}
              </>
            ) : araziVasfi !== '… Adetli Zeytin Ağacı bulunan tarla' && (
              <>
                ✅ {araziVasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf' 
                  ? 'Zeytin Ağaçlı Dikili Alan'
                  : araziVasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf'
                  ? 'Zeytin Ağaçlı Dikili Alan'
                  : 'Dikili Alan'
                }: {dikiliPolygon ? '✅ Çizildi' : '❌ Çizilmedi'}
              </>
            )}
          </div>
          
          {(araziVasfi === 'Dikili vasıflı' || araziVasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf' || araziVasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' ? dikiliPolygon : 
            araziVasfi === 'Tarla + Zeytinlik' ? (tarlaPolygon && zeytinlikPolygon) :
            araziVasfi === '… Adetli Zeytin Ağacı bulunan tarla' ? tarlaPolygon :
            (tarlaPolygon && dikiliPolygon)) && (
            <HighlightBox $variant="success" style={{ marginTop: '8px' }}>
              🎯 {araziVasfi === 'Dikili vasıflı' 
                ? 'Dikili alan çizildi! Ağaç bilgilerini manuel alan kontrolü sekmesinden ekleyebilirsiniz.'
                : araziVasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf'
                ? 'Zeytin ağaçlı dikili alan çizildi! Ağaç türlerini ve sayılarını manuel kontrol sekmesinden ekleyebilirsiniz.'
                : araziVasfi === 'Tarla + Zeytinlik'
                ? 'Her iki alan çizildi!'
                : araziVasfi === '… Adetli Zeytin Ağacı bulunan tarla'
                ? 'Tarla alanı çizildi! Zeytin ağacı bilgileri form üzerinden alınmıştır.'
                : araziVasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf'
                ? 'Dikili alan çizildi! Zeytin ağacı bilgileri formdan alınmış, diğer dikili vasıf ağaçları için manuel kontrole geçin.'
                : 'Her iki alan çizildi! Ağaç bilgilerini manuel kontrol sekmesinden ekleyebilirsiniz.'
              }
            </HighlightBox>
          )}
        </HighlightBox>
      )}
      
      {/* Manuel kontrole geçiş ve direkt hesaplama butonları */}
      {(araziVasfi === 'Dikili vasıflı' || araziVasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf' || araziVasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' ? dikiliPolygon : 
        araziVasfi === 'Tarla + Zeytinlik' ? (tarlaPolygon && zeytinlikPolygon) :
        araziVasfi === '… Adetli Zeytin Ağacı bulunan tarla' ? tarlaPolygon :
        (tarlaPolygon && dikiliPolygon)) && (
        <FlexContainer $direction="column" style={{ width: '100%' }}>
          {araziVasfi !== 'Tarla + Zeytinlik' && araziVasfi !== '… Adetli Zeytin Ağacı bulunan tarla' && (
            <Button 
              onClick={() => handleTabChange('manuel')} 
              $variant="primary"
              style={{ width: '100%' }}
            >
              {araziVasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf' 
                ? '🌱 Ağaç Bilgilerini Eklemek İçin Manuel Alan Kontrolüne Geç'
                : araziVasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf'
                ? '🌱 Dikili Vasıf için Ağaç Bilgilerini Eklemek İçin Manuel Kontrole Geç'
                : '📝 Ağaç Bilgilerini Eklemek İçin Manuel Alan Kontrolüne Geç'
              }
            </Button>
          )}
          
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
