import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonDrawer from './Map/PolygonDrawer';
import 'leaflet/dist/leaflet.css';

// Utility imports
import { getAvailableTreeTypes } from '../utils/treeCalculation';
import { formatArea } from '../utils/areaCalculation';

// Custom hooks imports
import {
  useTreeData,
  useVineyardForm,
  useTreeEditing,
  useMapState,
  useVineyardCalculation
} from '../hooks/useVineyardState';
import { useEventHandlers, createEventLogger } from '../hooks/useEventHandlers';

// Stil bileşenleri
const KontrolPanel = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: ${props => props.$isOpen ? '0' : '-100vw'};
  width: 100vw;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: right 0.3s ease;
  overflow-y: auto;
  padding: 0;

  @media (min-width: 768px) {
    width: 500px;
    right: ${props => props.$isOpen ? '0' : '-500px'};
  }
`;

const KontrolHeader = styled.div`
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 1001;
`;

const KontrolTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
`;

const KontrolSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const KontrolContent = styled.div`
  padding: 16px;
  
  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #ecf0f1;
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: ${props => props.$active ? '#27ae60' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#2c3e50'};
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  margin-bottom: -2px;
  
  @media (min-width: 768px) {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  &:hover {
    background: ${props => props.$active ? '#27ae60' : '#ecf0f1'};
  }
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h4`
  color: #27ae60;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 6px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e6ed;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #27ae60;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e6ed;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #27ae60;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' }>`
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => {
    switch (props.$variant) {
      case 'success':
        return `
          background: #27ae60;
          color: white;
          &:hover { background: #229954; }
        `;
      case 'warning':
        return `
          background: #f39c12;
          color: white;
          &:hover { background: #e67e22; }
        `;
      case 'danger':
        return `
          background: #e74c3c;
          color: white;
          &:hover { background: #c0392b; }
        `;
      case 'secondary':
        return `
          background: #95a5a6;
          color: white;
          &:hover { background: #7f8c8d; }
        `;
      default:
        return `
          background: #3498db;
          color: white;
          &:hover { background: #2980b9; }
        `;
    }
  }}
`;

const AgacListesi = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  min-height: 100px;
  max-height: 200px;
  overflow-y: auto;
`;

const AgacItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SonucPanel = styled.div<{ $type: 'success' | 'warning' | 'error' }>`
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
  
  ${props => {
    switch (props.$type) {
      case 'success':
        return `
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        `;
      case 'warning':
        return `
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
        `;
      default:
        return `
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        `;
    }
  }}
`;

const InfoBox = styled.div`
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  color: #1565c0;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 16px;
`;

const MapWrapper = styled.div`
  height: 300px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  border: 2px solid #e0e6ed;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
  }
`;

// Drawing mode components removed - now handled by PolygonDrawer

const AreaDisplayContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const AreaDisplayBox = styled.div<{ $color: string }>`
  padding: 12px;
  border: 2px solid ${props => props.$color};
  border-radius: 6px;
  background: ${props => props.$color}10;
`;

const AreaLabel = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
`;

const AreaValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
`;

const AreaSubtext = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

interface AlanKontrolProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
  alanTipi?: 'dikiliAlan' | 'tarlaAlani' | 'zeytinlikAlani'; // Gelecekte farklı alan türleri için
}

const AlanKontrol: React.FC<AlanKontrolProps> = ({ isOpen, onClose, onSuccess, alanTipi = 'dikiliAlan' }) => {
  const [activeTab, setActiveTab] = useState<'manuel' | 'harita'>('manuel');
  const [isDrawing, setIsDrawing] = useState(false); // Çizim durumu için state
  
  // Custom hooks for state management
  const treeData = useTreeData();
  const formHook = useVineyardForm();
  const editHook = useTreeEditing();
  const mapHook = useMapState();
  const calculationHook = useVineyardCalculation();

  // Destructure for easier access
  const { agacVerileri, eklenenAgaclar, addTree, removeTree, updateTreeCount, clearAllTrees } = treeData;
  const { formState, updateField, resetTreeSelection } = formHook;
  const { editState, startEdit, updateEditCount, cancelEdit } = editHook;
  const { mapState, setDrawingMode, setTarlaPolygon, setDikiliPolygon, triggerEdit } = mapHook;
  const { hesaplamaSonucu, calculate, clearResult } = calculationHook;

  // Computed values for easier access
  const { dikiliAlan, tarlaAlani, secilenAgacTuru, secilenAgacTipi, agacSayisi } = formState;
  const { editingIndex, editingAgacSayisi } = editState;
  const { drawingMode, tarlaPolygon, dikiliPolygon, editTrigger } = mapState;

  // Event handling system
  const eventLogger = createEventLogger('AlanKontrol');
  const { callbacks, errorHandler } = useEventHandlers({
    setTarlaPolygon,
    setDikiliPolygon,
    setDrawingMode,
    triggerEdit,
    updateField: (field: string, value: any) => updateField(field as any, value),
    tarlaPolygon,
    dikiliPolygon,
    drawingMode
  });

  // Drawing state callback'ini callbacks'e ekle
  const enhancedCallbacks = {
    ...callbacks,
    onDrawingStateChange: (drawing: boolean) => {
      setIsDrawing(drawing);
    },
    // Tümünü temizle için özel callback
    onFullClear: () => {
      console.log('🧹 Tümünü temizle butonu tıklandı');
      // Önce drawing mode'u null yap
      setDrawingMode(null);
      // Sonra hem tarla hem dikili state'lerini temizle (drawingMode'dan bağımsız)
      setTarlaPolygon(null);
      setDikiliPolygon(null);
      // Form field'larını da temizle
      formHook.updateField('tarlaAlani', 0);
      formHook.updateField('dikiliAlan', 0);
      // PolygonDrawer'daki katmanları da temizle
      callbacks.onPolygonClear?.();
      // Global temizleme fonksiyonunu da çağır
      if (typeof window !== 'undefined' && (window as any).__polygonDrawerClear) {
        console.log('🎯 Global temizleme fonksiyonu çağrılıyor...');
        (window as any).__polygonDrawerClear();
      }
      console.log('✅ Tüm polygon state\'leri ve harita katmanları temizlendi');
    }
  };

  // Seçilen ağaç türünün mevcut tiplerini al - utility kullan
  const getMevcutTipler = (agacTuruId: string) => {
    return getAvailableTreeTypes(agacTuruId, agacVerileri);
  };

  // Tree management with centralized error handling
  const agacEkle = () => {
    try {
      eventLogger.logEvent('agacEkle', { secilenAgacTuru, secilenAgacTipi, agacSayisi });
      addTree(secilenAgacTuru, secilenAgacTipi, agacSayisi);
      resetTreeSelection();
      eventLogger.logEvent('agacEkle_success');
    } catch (error) {
      eventLogger.logError('agacEkle', error);
      errorHandler.handleError(error as Error, 'agacEkle');
      errorHandler.showUserError(error instanceof Error ? error.message : 'Ağaç eklenirken hata oluştu');
    }
  };

  const agacSil = (index: number) => {
    try {
      eventLogger.logEvent('agacSil', { index });
      removeTree(index);
      eventLogger.logEvent('agacSil_success');
    } catch (error) {
      eventLogger.logError('agacSil', error);
      errorHandler.handleError(error as Error, 'agacSil');
      errorHandler.showUserError('Ağaç silme sırasında hata oluştu');
    }
  };

  const agacEdit = (index: number) => {
    try {
      eventLogger.logEvent('agacEdit', { index });
      startEdit(index, eklenenAgaclar[index].sayi);
    } catch (error) {
      eventLogger.logError('agacEdit', error);
      errorHandler.handleError(error as Error, 'agacEdit');
      errorHandler.showUserError('Ağaç düzenleme modunu başlatma sırasında hata oluştu');
    }
  };

  const agacEditSave = (index: number) => {
    try {
      eventLogger.logEvent('agacEditSave', { index, editingAgacSayisi });
      updateTreeCount(index, editingAgacSayisi);
      cancelEdit();
      eventLogger.logEvent('agacEditSave_success');
    } catch (error) {
      eventLogger.logError('agacEditSave', error);
      errorHandler.handleError(error as Error, 'agacEditSave');
      errorHandler.showUserError(error instanceof Error ? error.message : 'Ağaç güncellenirken hata oluştu');
    }
  };

  const agacEditCancel = () => {
    try {
      eventLogger.logEvent('agacEditCancel');
      cancelEdit();
    } catch (error) {
      eventLogger.logError('agacEditCancel', error);
      errorHandler.logError(error, 'agacEditCancel');
    }
  };

  // Tab değişikliği işleyicisi - standardize edilmiş
  const handleTabChange = (tab: 'manuel' | 'harita') => {
    try {
      eventLogger.logEvent('tabChange', { tab, previousTab: activeTab });
      setActiveTab(tab);
      callbacks.onTabChange(tab);
    } catch (error) {
      errorHandler.handleError(error as Error, 'handleTabChange');
      errorHandler.showUserError('Sekme değiştirme sırasında hata oluştu');
    }
  };

  // Calculation management with error handling
  const hesaplamaYap = () => {
    try {
      eventLogger.logEvent('hesaplamaYap', { dikiliAlan, tarlaAlani, agacSayisi: eklenenAgaclar.length });
      calculate(dikiliAlan, tarlaAlani, eklenenAgaclar);
      eventLogger.logEvent('hesaplamaYap_success');
    } catch (error) {
      eventLogger.logError('hesaplamaYap', error);
      errorHandler.handleError(error as Error, 'hesaplamaYap');
      errorHandler.showUserError('Hesaplama sırasında hata oluştu');
    }
  };

  // Data cleanup with error handling
  const temizleVeriler = () => {
    try {
      eventLogger.logEvent('temizleVeriler');
      clearAllTrees();
      clearResult();
      eventLogger.logEvent('temizleVeriler_success');
    } catch (error) {
      eventLogger.logError('temizleVeriler', error);
      errorHandler.handleError(error as Error, 'temizleVeriler');
      errorHandler.showUserError('Veri temizleme sırasında hata oluştu');
    }
  };

  // existingPolygons'u useMemo ile optimize et (infinite loop önlemi)
  const existingPolygons = useMemo(() => [
    ...(tarlaPolygon ? [{
      polygon: tarlaPolygon,
      color: '#8B4513',
      name: 'Tarla Alanı',
      id: 'tarla'
    }] : []),
    ...(dikiliPolygon ? [{
      polygon: dikiliPolygon,
      color: '#27ae60',
      name: 'Dikili Alan',
      id: 'dikili'
    }] : [])
  ], [tarlaPolygon, dikiliPolygon]);

  // Business logic functions with error handling
  const devamEt = () => {
    try {
      eventLogger.logEvent('devamEt', { 
        yeterli: hesaplamaSonucu?.yeterlilik?.yeterli,
        kriter2: hesaplamaSonucu?.yeterlilik?.kriter2 
      });
      
      // Herhangi bir kriter sağlanıyorsa (success, warning veya kriter2 sağlanan error durumlarında) değer aktarımına izin ver
      if (hesaplamaSonucu?.yeterlilik?.yeterli === true || hesaplamaSonucu?.yeterlilik?.kriter2 === true) {
        onSuccess({
          dikiliAlanKontrolSonucu: hesaplamaSonucu,
          eklenenAgaclar: eklenenAgaclar,
          dikiliAlan: dikiliAlan,
          tarlaAlani: tarlaAlani,
          alanTipi: alanTipi // Alan tipini de gönder
        });
        onClose();
        eventLogger.logEvent('devamEt_success');
      } else {
        // Hiçbir kriter sağlanmıyor - uyarı göster
        errorHandler.showUserError('Bağ evi kontrolü başarısız olduğu için değer aktarımı yapılamaz. Lütfen kriterleri sağlayın.');
        eventLogger.logEvent('devamEt_failed', 'criteria_not_met');
      }
    } catch (error) {
      eventLogger.logError('devamEt', error);
      errorHandler.handleError(error as Error, 'devamEt');
      errorHandler.showUserError('Sonuç aktarımı sırasında hata oluştu');
    }
  };

  const handleDirectCalculation = () => {
    try {
      eventLogger.logEvent('directCalculation', { dikiliAlan, tarlaAlani });
      
      // Poligon verilerini doğrudan aktarım yaparak ana forma gönder
      onSuccess({
        dikiliAlanKontrolSonucu: null, // Ağaç hesaplaması yapılmadı
        eklenenAgaclar: [], // Boş ağaç listesi
        dikiliAlan: dikiliAlan,
        tarlaAlani: tarlaAlani,
        directTransfer: true, // Bu bir doğrudan aktarım olduğunu belirt
        alanTipi: alanTipi // Alan tipini de gönder
      });
      onClose();
      eventLogger.logEvent('directCalculation_success');
    } catch (error) {
      eventLogger.logError('directCalculation', error);
      errorHandler.handleError(error as Error, 'directCalculation');
      errorHandler.showUserError('Doğrudan aktarım sırasında hata oluştu');
    }
  };

  if (!isOpen) return null;

  return (
    <KontrolPanel 
      $isOpen={isOpen}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kontrol-title"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
    >
      <KontrolHeader>
        <CloseButton onClick={onClose} aria-label="Kapat">×</CloseButton>
        <KontrolTitle id="kontrol-title">🌳 Alan Kontrolü</KontrolTitle>
        <KontrolSubtitle>Bağ evi için alan uygunluk kontrolü</KontrolSubtitle>
      </KontrolHeader>

      <KontrolContent>
        <TabContainer>
          <TabButton 
            $active={activeTab === 'manuel'} 
            onClick={() => handleTabChange('manuel')}
          >
            📝 Manuel Kontrol
          </TabButton>
          <TabButton 
            $active={activeTab === 'harita'} 
            onClick={() => handleTabChange('harita')}
          >
            🗺️ Haritadan Kontrol
          </TabButton>
        </TabContainer>

        {activeTab === 'manuel' ? (
          <>
            <FormSection>
              <SectionTitle>📏 Alan Bilgisi</SectionTitle>
              
              {/* Haritadan gelen alan bilgisi uyarısı */}
              {(tarlaPolygon || dikiliPolygon) && (
                <div style={{ 
                  background: '#e8f5e8', 
                  border: '1px solid #c3e6cb', 
                  color: '#155724',
                  padding: '12px', 
                  borderRadius: '6px', 
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                    🗺️ Haritadan Alınan Veriler
                  </div>
                  {tarlaPolygon && (
                    <div>✅ Tarla Alanı: {formatArea(tarlaAlani).m2} m² ({formatArea(tarlaAlani).donum} dönüm)</div>
                  )}
                  {dikiliPolygon && (
                    <div>✅ Dikili Alan: {formatArea(dikiliAlan).m2} m² ({formatArea(dikiliAlan).donum} dönüm)</div>
                  )}
                  {(tarlaPolygon || dikiliPolygon) && (
                    <div style={{ fontWeight: '600', color: '#2563eb' }}>
                      📊 Toplam Parsel: {formatArea(dikiliAlan + tarlaAlani).m2} m² ({formatArea(dikiliAlan + tarlaAlani).donum} dönüm)
                    </div>
                  )}
                  <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                    Bu değerler harita üzerinden çizilen poligonlardan otomatik hesaplanmıştır.
                  </div>
                </div>
              )}
              
              <FormGroup>
                <Label htmlFor="dikili-alan-input">Dikili Alan (m²)</Label>
                <Input
                  id="dikili-alan-input"
                  type="number"
                  value={dikiliAlan}
                  onChange={(e) => updateField('dikiliAlan', Number(e.target.value))}
                  placeholder="Örn: 12000"
                  min="1"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="tarla-alani-input">Tarla Alanı (m²)</Label>
                <Input
                  id="tarla-alani-input"
                  type="number"
                  value={tarlaAlani}
                  onChange={(e) => updateField('tarlaAlani', Number(e.target.value))}
                  placeholder={dikiliAlan > 0 ? `En az ${dikiliAlan}` : "Örn: 15000"}
                  min={dikiliAlan > 0 ? dikiliAlan : 1}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Toplam parsel alanı (dikili alan + diğer alanlar)
                  {dikiliAlan > 0 && (
                    <div style={{ color: '#e67e22', marginTop: '2px' }}>
                      💡 Minimum: {dikiliAlan.toLocaleString()} m² (dikili alan kadar)
                    </div>
                  )}
                  {dikiliAlan > 0 && tarlaAlani > 0 && (
                    <div style={{ color: '#2563eb', marginTop: '2px', fontWeight: '600' }}>
                      📊 Toplam: {(dikiliAlan + tarlaAlani).toLocaleString()} m² ({((dikiliAlan + tarlaAlani) / 1000).toFixed(1)} dönüm)
                    </div>
                  )}
                </div>
              </FormGroup>
            </FormSection>

            <FormSection>
              <SectionTitle>🌱 Ağaç Bilgileri</SectionTitle>
              <FormGroup>
                <Label htmlFor="agac-turu-select">Ağaç Türü</Label>
                <Select
                  id="agac-turu-select"
                  value={secilenAgacTuru}
                  onChange={(e) => {
                    updateField('secilenAgacTuru', e.target.value);
                    updateField('secilenAgacTipi', 'normal');
                  }}
                >
                  <option value="">Ağaç türü seçin...</option>
                  {agacVerileri.map(agac => (
                    <option key={agac.sira} value={agac.sira.toString()}>
                      {agac.tur}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              {secilenAgacTuru && (
                <FormGroup>
                  <Label htmlFor="agac-tipi-select">Ağaç Tipi</Label>
                  <Select
                    id="agac-tipi-select"
                    value={secilenAgacTipi}
                    onChange={(e) => updateField('secilenAgacTipi', e.target.value as any)}
                  >
                    {getMevcutTipler(secilenAgacTuru).map(tip => (
                      <option key={tip.value} value={tip.value}>
                        {tip.label}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              )}

              <FormGroup>
                <Label htmlFor="agac-sayisi-input">Ağaç Sayısı</Label>
                <Input
                  id="agac-sayisi-input"
                  type="number"
                  value={agacSayisi || ''}
                  onChange={(e) => updateField('agacSayisi', Number(e.target.value))}
                  placeholder="Ağaç sayısını girin"
                  min="1"
                />
              </FormGroup>

              <Button onClick={agacEkle} $variant="success">
                ➕ Ağaç Ekle
              </Button>
            </FormSection>

            {eklenenAgaclar.length > 0 && (
              <FormSection>
                <SectionTitle>📋 Eklenen Ağaçlar</SectionTitle>
                <AgacListesi>
                  {eklenenAgaclar.map((agac, index) => (
                    <AgacItem key={index}>
                      {editingIndex === index ? (
                        <>
                          <span>
                            <strong>{agac.turAdi}</strong> ({agac.tipi}) - 
                            <input
                              type="number"
                              value={editingAgacSayisi}
                              onChange={(e) => updateEditCount(Number(e.target.value))}
                              min="1"
                              style={{
                                width: '60px',
                                margin: '0 8px',
                                padding: '4px',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                              }}
                            />
                            adet
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <Button onClick={() => agacEditSave(index)} $variant="success" style={{ fontSize: '12px', padding: '4px 8px' }}>
                              ✓
                            </Button>
                            <Button onClick={agacEditCancel} $variant="secondary" style={{ fontSize: '12px', padding: '4px 8px' }}>
                              ✕
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span>
                            <strong>{agac.turAdi}</strong> ({agac.tipi}) - {agac.sayi} adet
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <Button onClick={() => agacEdit(index)} $variant="primary" style={{ fontSize: '12px', padding: '4px 8px' }}>
                              ✏️
                            </Button>
                            <Button onClick={() => agacSil(index)} $variant="danger" style={{ fontSize: '12px', padding: '4px 8px' }}>
                              🗑️
                            </Button>
                          </div>
                        </>
                      )}
                    </AgacItem>
                  ))}
                </AgacListesi>

                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <Button onClick={hesaplamaYap} $variant="primary">
                    🧮 Hesapla
                  </Button>
                  <Button onClick={temizleVeriler} $variant="secondary">
                    🗑️ Temizle
                  </Button>
                </div>
              </FormSection>
            )}

            {hesaplamaSonucu && (
              <SonucPanel $type={hesaplamaSonucu.type}>
                <h4 style={{ margin: '0 0 12px 0' }}>{hesaplamaSonucu.message}</h4>
                
                {/* Yeterlilik durumu gösterimi */}
                {hesaplamaSonucu.yeterlilik && (
                  <div style={{ 
                    padding: '12px', 
                    borderRadius: '6px', 
                    marginBottom: '12px',
                    background: hesaplamaSonucu.yeterlilik.yeterli ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${hesaplamaSonucu.yeterlilik.yeterli ? '#c3e6cb' : '#f5c6cb'}`,
                    color: hesaplamaSonucu.yeterlilik.yeterli ? '#155724' : '#721c24'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                      {hesaplamaSonucu.yeterlilik.yeterli ? '✅ Bağ Evi Kontrolü Başarılı' : '❌ Bağ Evi Kontrolü Başarısız'}
                    </div>
                    
                    {/* Kriter durumları */}
                    <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Kriter 1:</strong> Dikili alan ≥ 5000 m² + %100 ağaç yoğunluğu: {' '}
                        <span style={{ color: hesaplamaSonucu.yeterlilik.kriter1 ? '#155724' : '#721c24' }}>
                          {hesaplamaSonucu.yeterlilik.kriter1 ? '✅ Sağlanıyor' : '❌ Sağlanmıyor'}
                        </span>
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Kriter 2:</strong> Tarla alanı ≥ 20000 m²: {' '}
                        <span style={{ color: hesaplamaSonucu.yeterlilik.kriter2 ? '#155724' : '#721c24' }}>
                          {hesaplamaSonucu.yeterlilik.kriter2 ? '✅ Sağlanıyor' : '❌ Sağlanmıyor'}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '14px' }}>
                      Mevcut ağaç yoğunluğu: <strong>%{hesaplamaSonucu.yeterlilik.oran.toFixed(1)}</strong>
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      Dikili alan: <strong>{dikiliAlan.toLocaleString()} m²</strong>
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      Tarla alanı: <strong>{tarlaAlani.toLocaleString()} m²</strong>
                    </div>
                    <div style={{ fontSize: '14px', color: '#2563eb', fontWeight: '600' }}>
                      Toplam parsel: <strong>{(dikiliAlan + tarlaAlani).toLocaleString()} m²</strong>
                    </div>
                    {!hesaplamaSonucu.yeterlilik.yeterli && hesaplamaSonucu.yeterlilik.eksikOran && (
                      <div style={{ fontSize: '14px', marginTop: '4px' }}>
                        Eksik ağaç yoğunluğu: <strong>%{hesaplamaSonucu.yeterlilik.eksikOran.toFixed(1)}</strong>
                      </div>
                    )}
                  </div>
                )}

                {hesaplamaSonucu.details && (
                  <>
                    <p>Aşağıdaki ağaç türleri için beklenen minimum sayılara ulaşılmamıştır:</p>
                    <ul>
                      {hesaplamaSonucu.details.map((tur: any, index: number) => (
                        <li key={index}>
                          <strong>{tur.turAdi}</strong>: {tur.girilenSayi} adet (gerekli: {tur.gerekliSayi} adet)
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {hesaplamaSonucu.alanBilgisi && hesaplamaSonucu.type === 'error' && (
                  <>
                    <p>
                      <strong>Ağaçların kapladığı toplam alan:</strong> {hesaplamaSonucu.alanBilgisi.kaplanAlan.toLocaleString()} m² 
                      (Toplam arazinin %{hesaplamaSonucu.alanBilgisi.oran}'si)
                    </p>

                    {hesaplamaSonucu.alanBilgisi.agacDetaylari && (
                      <div style={{ marginTop: '12px' }}>
                        <strong>Ağaç türü detayları:</strong>
                        <ul style={{ marginTop: '8px' }}>
                          {hesaplamaSonucu.alanBilgisi.agacDetaylari.map((detay: any, index: number) => (
                            <li key={index} style={{ marginBottom: '4px' }}>
                              <strong>{detay.turAdi}:</strong> {detay.sayi} adet → {detay.kaplanAlan.toLocaleString()} m²
                              <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                                (1000m²'de {detay.binMetrekareBasinaGerekli} adet gerekli)
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {/* Buton gösterimi - yeterlilik başarılı veya kriter2 sağlanıyorsa */}
                <div style={{ marginTop: '16px' }}>
                  {(hesaplamaSonucu.type === 'success' && hesaplamaSonucu.yeterlilik?.yeterli === true) || 
                   (hesaplamaSonucu.type === 'error' && hesaplamaSonucu.yeterlilik?.kriter2 === true) ? (
                    <div>
                      <p style={{ background: '#e8f5e8', padding: '8px', borderRadius: '4px', margin: '12px 0', fontSize: '14px' }}>
                        ✅ Bağ evi kontrolü başarılı. Arazide bağ evi yapılabilir.
                      </p>
                      <Button onClick={devamEt} $variant={
                        hesaplamaSonucu.type === 'success' ? 'success' : 'warning'
                      }>
                        ✅ Devam Et
                      </Button>
                    </div>
                  ) : null}
                  
                  {hesaplamaSonucu.type === 'error' && !hesaplamaSonucu.yeterlilik?.kriter2 && (
                    <div>
                      <p style={{ background: '#f8d7da', padding: '8px', borderRadius: '4px', margin: '12px 0', fontSize: '14px' }}>
                        ❌ Arazide bağ evi yapılamaz. Hiçbir kriter sağlanmıyor.
                      </p>
                      <p style={{ fontSize: '13px', color: '#666', margin: '8px 0' }}>
                        💡 Çözüm önerileri:
                        <br/>• Dikili alanı 5000 m²'ye çıkarın ve %100 ağaç yoğunluğu sağlayın
                        <br/>• Veya tarla alanını 20000 m²'ye çıkarın
                      </p>
                    </div>
                  )}
                </div>
              </SonucPanel>
            )}
          </>
        ) : (
          // Harita sekmesi
          <>
            <FormSection>
              <SectionTitle>🗺️ Harita Üzerinden Alan Belirleme</SectionTitle>
              <InfoBox>
                Harita üzerinde poligon çizerek tarla alanı ve dikili alanı belirleyebilirsiniz. 
                Önce tarla alanını, sonra dikili alanı çizin.
              </InfoBox>
              
              {/* Drawing mode controls - InfoBox altında */}
              <div style={{ 
                margin: '16px 0',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.98)',
                border: '2px solid #34495e',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ marginBottom: '12px', fontWeight: '600', fontSize: '14px', color: '#2c3e50' }}>
                  🎨 Çizim Modu:
                </div>
                
                {/* Drawing status indicator */}
                {isDrawing && drawingMode && (
                  <div style={{
                    background: drawingMode === 'tarla' ? '#8B4513' : '#27ae60',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    🎨 {drawingMode === 'tarla' ? 'Tarla Alanı' : 'Dikili Alan'} çiziliyor...
                    <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                      (Haritaya tıklayarak çizin, çift tıklayarak bitirin)
                    </span>
                  </div>
                )}
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <Button
                    $variant={drawingMode === 'tarla' ? 'primary' : 'secondary'}
                    onClick={(e) => {
                      console.log('🟤 TARLA butonuna tıklandı! Event:', e);
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Aynı mod zaten aktifse hiçbir şey yapma
                      if (drawingMode === 'tarla' && isDrawing) {
                        console.log('⚠️ Aynı mod zaten aktif');
                        return;
                      }
                      
                      // Aynı mod ama çizim değilse, sadece çizimi başlat
                      if (drawingMode === 'tarla' && !isDrawing) {
                        console.log('🔄 Aynı mod, sadece çizimi başlat');
                        setIsDrawing(true);
                        enhancedCallbacks.onDrawingStateChange?.(true);
                        return;
                      }
                      
                      // Farklı mode - önce modu değiştir, sonra çizimi başlat
                      enhancedCallbacks.onDrawingModeChange?.('tarla');
                      
                      setTimeout(() => {
                        setIsDrawing(true);
                        enhancedCallbacks.onDrawingStateChange?.(true);
                      }, 50);
                    }}
                    style={{ 
                      backgroundColor: drawingMode === 'tarla' ? '#8B4513' : '#ecf0f1',
                      color: drawingMode === 'tarla' ? 'white' : '#8B4513',
                      border: `2px solid #8B4513`
                    }}
                  >
                    🟤 Tarla Alanı Çiz
                  </Button>
                  
                  <Button
                    $variant={drawingMode === 'dikili' ? 'success' : 'secondary'}
                    onClick={(e) => {
                      console.log('🟢 DİKİLİ butonuna tıklandı! Event:', e);
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Aynı mod zaten aktifse hiçbir şey yapma
                      if (drawingMode === 'dikili' && isDrawing) {
                        console.log('⚠️ Aynı mod zaten aktif');
                        return;
                      }
                      
                      // Aynı mod ama çizim değilse, sadece çizimi başlat
                      if (drawingMode === 'dikili' && !isDrawing) {
                        console.log('🔄 Aynı mod, sadece çizimi başlat');
                        setIsDrawing(true);
                        enhancedCallbacks.onDrawingStateChange?.(true);
                        return;
                      }
                      
                      // Farklı mode - önce modu değiştir, sonra çizimi başlat
                      enhancedCallbacks.onDrawingModeChange?.('dikili');
                      
                      setTimeout(() => {
                        setIsDrawing(true);
                        enhancedCallbacks.onDrawingStateChange?.(true);
                      }, 50);
                    }}
                    style={{ 
                      backgroundColor: drawingMode === 'dikili' ? '#27ae60' : '#ecf0f1',
                      color: drawingMode === 'dikili' ? 'white' : '#27ae60',
                      border: `2px solid #27ae60`
                    }}
                  >
                    🟢 Dikili Alan Çiz
                  </Button>
                  
                  {isDrawing && (
                    <Button
                      $variant="warning"
                      onClick={(e) => {
                        console.log('🛑 Çizimi durdur butonuna tıklandı');
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDrawing(false);
                        enhancedCallbacks.onDrawingStateChange?.(false);
                        enhancedCallbacks.onDrawingModeChange?.(null);
                      }}
                    >
                      ⏹️ Çizimi Durdur
                    </Button>
                  )}
                  
                  <Button
                    $variant="danger"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      enhancedCallbacks.onFullClear?.();
                    }}
                  >
                    🗑️ Tümünü Temizle
                  </Button>
                </div>
              </div>
              
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
                  
                  {/* Polygon çizim component'i - optimized version */}
                  <PolygonDrawer
                    onPolygonComplete={enhancedCallbacks.onPolygonComplete}
                    onPolygonClear={enhancedCallbacks.onPolygonClear}
                    onPolygonEdit={enhancedCallbacks.onPolygonEdit}
                    disabled={false}
                    polygonColor={drawingMode === 'tarla' ? '#8B4513' : '#27ae60'}
                    polygonName={drawingMode === 'tarla' ? 'Tarla Alanı' : 'Dikili Alan'}
                    hideControls={true}
                    existingPolygons={existingPolygons}
                    drawingMode={drawingMode}
                    onDrawingModeChange={enhancedCallbacks.onDrawingModeChange}
                    onDrawingStateChange={enhancedCallbacks.onDrawingStateChange}
                    showDrawingModeControls={false}
                    externalEditTrigger={editTrigger}
                  />
                </MapContainer>
              </MapWrapper>
              
              {/* Alan gösterimi */}
              <AreaDisplayContainer>
                <AreaDisplayBox $color="#8B4513">
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <AreaLabel>🟤 Tarla Alanı</AreaLabel>
                        <AreaValue>
                          {tarlaAlani > 0 ? formatArea(tarlaAlani).m2 : '0'} m²
                        </AreaValue>
                        <AreaSubtext>
                          {tarlaAlani > 0 ? `${formatArea(tarlaAlani).donum} dönüm` : 'Çizilmedi'}
                        </AreaSubtext>
                      </div>
                      {tarlaPolygon && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            enhancedCallbacks.onAreaDisplayEdit('tarla');
                          }}
                          style={{
                            background: 'rgba(243, 156, 18, 0.1)',
                            border: '1px solid #f39c12',
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
                          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(243, 156, 18, 0.2)'}
                          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(243, 156, 18, 0.1)'}
                          title="Tarla alanını düzenle"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </>
                </AreaDisplayBox>
                
                <AreaDisplayBox $color="#27ae60">
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <AreaLabel>🟢 Dikili Alan</AreaLabel>
                        <AreaValue>
                          {dikiliAlan > 0 ? formatArea(dikiliAlan).m2 : '0'} m²
                        </AreaValue>
                        <AreaSubtext>
                          {dikiliAlan > 0 ? `${formatArea(dikiliAlan).donum} dönüm` : 'Çizilmedi'}
                        </AreaSubtext>
                      </div>
                      {dikiliPolygon && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            enhancedCallbacks.onAreaDisplayEdit('dikili');
                          }}
                          style={{
                            background: 'rgba(39, 174, 96, 0.1)',
                            border: '1px solid #27ae60',
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
                          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(39, 174, 96, 0.2)'}
                          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(39, 174, 96, 0.1)'}
                          title="Dikili alanı düzenle"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </>
                </AreaDisplayBox>
              </AreaDisplayContainer>
              
              {/* İlerleme durumu */}
              {(tarlaPolygon || dikiliPolygon) && (
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  marginBottom: '16px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>📊 Alan Belirleme Durumu:</div>
                  <div style={{ fontSize: '14px' }}>
                    ✅ Tarla Alanı: {tarlaPolygon ? '✅ Çizildi' : '❌ Çizilmedi'}
                    <br/>
                    ✅ Dikili Alan: {dikiliPolygon ? '✅ Çizildi' : '❌ Çizilmedi'}
                  </div>
                  
                  {tarlaPolygon && dikiliPolygon && (
                    <div style={{ marginTop: '8px', padding: '8px', background: '#e8f5e8', borderRadius: '4px' }}>
                      🎯 Her iki alan çizildi! Ağaç bilgilerini manuel kontrol sekmesinden ekleyebilirsiniz.
                    </div>
                  )}
                </div>
              )}
              
              {/* Manuel kontrole geçiş ve direkt hesaplama butonları */}
              {tarlaPolygon && dikiliPolygon && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                </div>
              )}
            </FormSection>
          </>
        )}
      </KontrolContent>
    </KontrolPanel>
  );
};

export default AlanKontrol;
