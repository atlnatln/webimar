import React, { useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';

// Sub-components
import ManuelTab from './AlanKontrol/ManuelTab';
import HaritaTab from './AlanKontrol/HaritaTab';

// Styled components
import {
  KontrolPanel,
  KontrolHeader,
  KontrolTitle,
  KontrolSubtitle,
  CloseButton,
  KontrolContent,
  TabContainer,
  TabButton
} from './AlanKontrol/styles';

// Utility imports
import { getAvailableTreeTypes } from '../utils/treeCalculation';

// Custom hooks imports
import {
  useTreeData,
  useVineyardForm,
  useTreeEditing,
  useMapState,
  useVineyardCalculation
} from '../hooks/useVineyardState';
import { useEventHandlers, createEventLogger } from '../hooks/useEventHandlers';

interface AlanKontrolProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
  alanTipi?: 'dikiliAlan' | 'tarlaAlani' | 'zeytinlikAlani'; // Gelecekte farklı alan türleri için
  araziVasfi?: string; // Arazi vasfı bilgisi
  initialDikiliAlan?: number;
  initialTarlaAlani?: number;
  initialZeytinlikAlani?: number; // Zeytinlik alanı desteği
}

const AlanKontrol: React.FC<AlanKontrolProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  alanTipi = 'dikiliAlan',
  araziVasfi = '',
  initialDikiliAlan = 0,
  initialTarlaAlani = 0,
  initialZeytinlikAlani = 0 
}) => {
  // "Tarla + Zeytinlik" ve "… Adetli Zeytin Ağacı bulunan tarla" için varsayılan tab harita olsun
  const [activeTab, setActiveTab] = useState<'manuel' | 'harita'>(
    (araziVasfi === 'Tarla + Zeytinlik' || araziVasfi === '… Adetli Zeytin Ağacı bulunan tarla') ? 'harita' : 'manuel'
  );
  const [isDrawing, setIsDrawing] = useState(false); // Çizim durumu için state
  
  // Custom hooks for state management
  const treeData = useTreeData();
  const formHook = useVineyardForm(initialDikiliAlan, initialTarlaAlani, initialZeytinlikAlani); // Initial değerleri geçirelim
  const editHook = useTreeEditing();
  const mapHook = useMapState();
  const calculationHook = useVineyardCalculation();

  // Destructure for easier access
  const { agacVerileri, eklenenAgaclar, addTree, removeTree, updateTreeCount, clearAllTrees } = treeData;
  const { formState, updateField, resetTreeSelection } = formHook;
  const { editState, startEdit, updateEditCount, cancelEdit } = editHook;
  const { mapState, setDrawingMode, setTarlaPolygon, setDikiliPolygon, setZeytinlikPolygon, triggerEdit, clearPolygons } = mapHook;
  const { hesaplamaSonucu, calculate, clearResult } = calculationHook;

  // Computed values for easier access
  const { dikiliAlan, tarlaAlani, zeytinlikAlani, secilenAgacTuru, secilenAgacTipi, agacSayisi } = formState;
  const { editingIndex, editingAgacSayisi } = editState;
  const { drawingMode, tarlaPolygon, dikiliPolygon, zeytinlikPolygon, editTrigger } = mapState;

  // Create setter functions for form fields
  const setSecilenAgacTuru = (value: string) => updateField('secilenAgacTuru', value);
  const setSecilenAgacTipi = (value: 'normal' | 'bodur' | 'yaribodur') => updateField('secilenAgacTipi', value);
  const setAgacSayisi = (value: number) => updateField('agacSayisi', value);
  const setDikiliAlan = (value: number) => updateField('dikiliAlan', value);
  const setTarlaAlani = (value: number) => updateField('tarlaAlani', value);
  const setZeytinlikAlani = (value: number) => updateField('zeytinlikAlani', value);

  // Clear all polygons function
  const clearAllPolygons = () => {
    clearPolygons();
    clearAllTrees();
    clearResult();
  };

  // Event handling system
  const eventLogger = createEventLogger('AlanKontrol');
  const { callbacks, errorHandler } = useEventHandlers({
    setTarlaPolygon,
    setDikiliPolygon,
    setZeytinlikPolygon,
    setDrawingMode,
    triggerEdit,
    updateField: (field: string, value: any) => updateField(field as any, value),
    tarlaPolygon,
    dikiliPolygon,
    zeytinlikPolygon,
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
      // Sonra hem tarla hem dikili hem zeytinlik state'lerini temizle (drawingMode'dan bağımsız)
      setTarlaPolygon(null);
      setDikiliPolygon(null);
      setZeytinlikPolygon(null);
      // Form field'larını da temizle
      formHook.updateField('tarlaAlani', 0);
      formHook.updateField('dikiliAlan', 0);
      formHook.updateField('zeytinlikAlani', 0);
      // PolygonDrawer'daki katmanları da temizle
      callbacks.onPolygonClear?.();
      // Global temizleme fonksiyonunu da çağır
      if (typeof window !== 'undefined' && (window as any).__polygonDrawerClear) {
        console.log('🎯 Global temizleme fonksiyonu çağrılıyor...');
        (window as any).__polygonDrawerClear();
      }
      
      // 🔥 YENİ: Ana forma da temizlenmiş veriyi gönder
      console.log('🔄 Ana forma temizlenmiş veriler gönderiliyor...');
      onSuccess({
        dikiliAlanKontrolSonucu: null,
        eklenenAgaclar: [],
        dikiliAlan: 0,
        tarlaAlani: 0,
        zeytinlikAlani: 0,
        directTransfer: true,
        clearAll: true, // Temizleme işlemi olduğunu belirt
        alanTipi: alanTipi
      });
      
      console.log('✅ Tüm polygon state\'leri ve harita katmanları temizlendi + Ana form sıfırlandı');
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
      calculate(dikiliAlan, tarlaAlani, eklenenAgaclar, araziVasfi);
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
    }] : []),
    ...(zeytinlikPolygon ? [{
      polygon: zeytinlikPolygon,
      color: '#9c8836',
      name: 'Zeytinlik Alanı',
      id: 'zeytinlik'
    }] : [])
  ], [tarlaPolygon, dikiliPolygon, zeytinlikPolygon]);

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
          zeytinlikAlani: zeytinlikAlani,
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
      eventLogger.logEvent('directCalculation', { dikiliAlan, tarlaAlani, zeytinlikAlani });
      
      // Poligon verilerini doğrudan aktarım yaparak ana forma gönder
      onSuccess({
        dikiliAlanKontrolSonucu: null, // Ağaç hesaplaması yapılmadı
        eklenenAgaclar: [], // Boş ağaç listesi
        dikiliAlan: dikiliAlan,
        tarlaAlani: tarlaAlani,
        zeytinlikAlani: zeytinlikAlani,
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
        {/* "Tarla + Zeytinlik" ve "… Adetli Zeytin Ağacı bulunan tarla" için sadece harita kontrolü göster */}
        {araziVasfi !== 'Tarla + Zeytinlik' && araziVasfi !== '… Adetli Zeytin Ağacı bulunan tarla' && (
          <TabContainer>
            <TabButton 
              $active={activeTab === 'manuel'} 
              onClick={() => handleTabChange('manuel')}
            >
              📝 Manuel Alan Kontrolü
            </TabButton>
            <TabButton 
              $active={activeTab === 'harita'} 
              onClick={() => handleTabChange('harita')}
            >
              🗺️ Haritadan Kontrol
            </TabButton>
          </TabContainer>
        )}

        {/* "Tarla + Zeytinlik" için sadece harita kontrolü */}
        {araziVasfi === 'Tarla + Zeytinlik' ? (
          <HaritaTab
            // Map state
            drawingMode={drawingMode}
            isDrawing={isDrawing}
            tarlaPolygon={tarlaPolygon}
            dikiliPolygon={dikiliPolygon}
            zeytinlikPolygon={zeytinlikPolygon}
            editTrigger={editTrigger}
            existingPolygons={existingPolygons}
            
            // Area values
            dikiliAlan={dikiliAlan}
            tarlaAlani={tarlaAlani}
            zeytinlikAlani={zeytinlikAlani}
            
            // Arazi bilgileri
            araziVasfi={araziVasfi}
            
            // Callbacks
            enhancedCallbacks={enhancedCallbacks}
            setIsDrawing={setIsDrawing}
            handleTabChange={handleTabChange}
            handleDirectCalculation={handleDirectCalculation}
          />
        ) : araziVasfi === '… Adetli Zeytin Ağacı bulunan tarla' ? (
          <HaritaTab
            // Map state
            drawingMode={drawingMode}
            isDrawing={isDrawing}
            tarlaPolygon={tarlaPolygon}
            dikiliPolygon={dikiliPolygon}
            zeytinlikPolygon={zeytinlikPolygon}
            editTrigger={editTrigger}
            existingPolygons={existingPolygons}
            
            // Form state
            dikiliAlan={dikiliAlan}
            tarlaAlani={tarlaAlani}
            zeytinlikAlani={zeytinlikAlani}
            
            // Arazi bilgileri
            araziVasfi={araziVasfi}
            
            // Callbacks
            enhancedCallbacks={enhancedCallbacks}
            setIsDrawing={setIsDrawing}
            handleTabChange={handleTabChange}
            handleDirectCalculation={handleDirectCalculation}
          />
        ) : araziVasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' ? (
          activeTab === 'manuel' ? (
            <ManuelTab
              // Form state
              dikiliAlan={dikiliAlan}
              tarlaAlani={tarlaAlani}
              zeytinlikAlani={zeytinlikAlani}
              secilenAgacTuru={secilenAgacTuru}
              secilenAgacTipi={secilenAgacTipi}
              agacSayisi={agacSayisi}
              
              // Arazi bilgileri
              araziVasfi={araziVasfi}
              
              // Tree data
              agacVerileri={agacVerileri}
              eklenenAgaclar={eklenenAgaclar}
              
              // Polygon data
              tarlaPolygon={tarlaPolygon}
              dikiliPolygon={dikiliPolygon}
              zeytinlikPolygon={zeytinlikPolygon}
              
              // Edit state
              editingIndex={editingIndex}
              editingAgacSayisi={editingAgacSayisi}
              
              // Results
              hesaplamaSonucu={hesaplamaSonucu}
              
              // Actions
              updateField={(field: string, value: any) => updateField(field as any, value)}
              agacEkle={agacEkle}
              agacEdit={agacEdit}
              agacEditSave={agacEditSave}
              agacEditCancel={agacEditCancel}
              agacSil={agacSil}
              updateEditCount={updateEditCount}
              hesaplamaYap={hesaplamaYap}
              temizleVeriler={temizleVeriler}
              devamEt={devamEt}
              getMevcutTipler={getMevcutTipler}
            />
          ) : (
            <HaritaTab
              // Map state
              drawingMode={drawingMode}
              isDrawing={isDrawing}
              tarlaPolygon={tarlaPolygon}
              dikiliPolygon={dikiliPolygon}
              zeytinlikPolygon={zeytinlikPolygon}
              editTrigger={editTrigger}
              existingPolygons={existingPolygons}
              
              // Form state
              dikiliAlan={dikiliAlan}
              tarlaAlani={tarlaAlani}
              zeytinlikAlani={zeytinlikAlani}
              
              // Arazi bilgileri
              araziVasfi={araziVasfi}
              
              // Callbacks
              enhancedCallbacks={enhancedCallbacks}
              setIsDrawing={setIsDrawing}
              handleTabChange={handleTabChange}
              handleDirectCalculation={handleDirectCalculation}
            />
          )
        ) : activeTab === 'manuel' ? (
          <ManuelTab
            // Form state
            dikiliAlan={dikiliAlan}
            tarlaAlani={tarlaAlani}
            zeytinlikAlani={zeytinlikAlani}
            secilenAgacTuru={secilenAgacTuru}
            secilenAgacTipi={secilenAgacTipi}
            agacSayisi={agacSayisi}
            
            // Arazi bilgileri
            araziVasfi={araziVasfi}
            
            // Tree data
            agacVerileri={agacVerileri}
            eklenenAgaclar={eklenenAgaclar}
            
            // Polygon data
            tarlaPolygon={tarlaPolygon}
            dikiliPolygon={dikiliPolygon}
            zeytinlikPolygon={zeytinlikPolygon}
            
            // Edit state
            editingIndex={editingIndex}
            editingAgacSayisi={editingAgacSayisi}
            
            // Results
            hesaplamaSonucu={hesaplamaSonucu}
            
            // Actions
            updateField={(field: string, value: any) => updateField(field as any, value)}
            agacEkle={agacEkle}
            agacEdit={agacEdit}
            agacEditSave={agacEditSave}
            agacEditCancel={agacEditCancel}
            agacSil={agacSil}
            updateEditCount={updateEditCount}
            hesaplamaYap={hesaplamaYap}
            temizleVeriler={temizleVeriler}
            devamEt={devamEt}
            getMevcutTipler={getMevcutTipler}
          />
        ) : (
          <HaritaTab
            // Map state
            drawingMode={drawingMode}
            isDrawing={isDrawing}
            tarlaPolygon={tarlaPolygon}
            dikiliPolygon={dikiliPolygon}
            zeytinlikPolygon={zeytinlikPolygon}
            editTrigger={editTrigger}
            existingPolygons={existingPolygons}
            
            // Area values
            dikiliAlan={dikiliAlan}
            tarlaAlani={tarlaAlani}
            zeytinlikAlani={zeytinlikAlani}
            
            // Arazi bilgileri
            araziVasfi={araziVasfi}
            
            // Callbacks
            enhancedCallbacks={enhancedCallbacks}
            setIsDrawing={setIsDrawing}
            handleTabChange={handleTabChange}
            handleDirectCalculation={handleDirectCalculation}
          />
        )}
      </KontrolContent>
    </KontrolPanel>
  );
};

export default AlanKontrol;
