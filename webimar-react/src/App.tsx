import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import CalculationPage from './pages/CalculationPage';
import MapTestPage from './pages/MapTestPage';
import { StructureType } from './types';
import { StructureTypesProvider, useStructureTypes } from './contexts/StructureTypesContext';
import './App.css';

// Yapı türü descriptions mapping - Backend constants.py ile uyumlu 27 yapı türü
const getStructureDescription = (structureType: StructureType, structureTypeLabels: Record<StructureType, string>): string => {
  const descriptions: Record<StructureType, string> = {
    // Özel Üretim Tesisleri (ID: 1-4)
    'solucan-tesisi': 'Solucan ve solucan gübresi üretim tesisleri için yapı hesaplamalarını yapın.',
    'mantar-tesisi': 'Mantar üretim tesisleri için yapı hesaplamalarını yapın.',
    'sera': 'Seracılık tesisleri için yapı hesaplamalarını yapın.',
    'aricilik': 'Arı yetiştiriciliği ve bal üretimi tesisleri için hesaplamalar.',
    
    // Depolama ve İşleme Tesisleri (ID: 5-16)
    'hububat-silo': 'Hububat ve yem depolama siloları için yapı hesaplamalarını yapın.',
    'tarimsal-depo': 'Tarımsal amaçlı depolar için yapı hesaplamalarını yapın.',
    'lisansli-depo': 'Lisanslı depolar için yapı hesaplamalarını yapın.',
    'yikama-tesisi': 'Tarımsal ürün yıkama tesisleri için yapı hesaplamalarını yapın.',
    'kurutma-tesisi': 'Hububat, çeltik, ayçiçeği kurutma tesisleri için yapı hesaplamalarını yapın.',
    'meyve-sebze-kurutma': 'Açıkta meyve/sebze kurutma alanları için yapı hesaplamalarını yapın.',
    'zeytinyagi-fabrikasi': 'Zeytinyağı fabrikaları için yapı hesaplamalarını yapın.',
    'su-depolama': 'Su depolama tesisleri için yapı hesaplamalarını yapın.',
    'su-kuyulari': 'Su kuyuları için yapı hesaplamalarını yapın.',
    'bag-evi': 'Bağ evleri için yapı hesaplamalarını yapın.',
    'zeytinyagi-uretim-tesisi': 'Zeytinyağı üretim tesisleri için yapı hesaplamalarını yapın.',
    'soguk-hava-deposu': 'Soğuk hava depoları için yapı hesaplamalarını yapın.',
    
    // Hayvancılık Tesisleri (ID: 17-27)
    'sut-sigirciligi': 'Süt sığırı yetiştiriciliği tesisleri için yapı hesaplamalarını yapın.',
    'agil-kucukbas': 'Koyun, keçi ve benzeri küçükbaş hayvanlar için ağıl hesaplamalarını yapın.',
    'kumes-yumurtaci': 'Yumurtacı tavuk kümesleri için yapı hesaplamalarını yapın.',
    'kumes-etci': 'Etçi tavuk kümesleri için yapı hesaplamalarını yapın.',
    'kumes-gezen': 'Gezen tavuk kümesleri için yapı hesaplamalarını yapın.',
    'kumes-hindi': 'Hindi kümesleri için yapı hesaplamalarını yapın.',
    'kaz-ordek': 'Kaz ve ördek çiftlikleri için yapı hesaplamalarını yapın.',
    'hara': 'At yetiştiriciliği için hara tesisi hesaplamalarını yapın.',
    'ipek-bocekciligi': 'İpek böceği yetiştiriciliği tesisleri için hesaplamalar.',
    'evcil-hayvan': 'Evcil hayvan ve bilimsel araştırma hayvanı üretim tesisleri için hesaplamalar.',
    'besi-sigirciligi': 'Besi sığırı yetiştiriciliği tesisleri için yapı hesaplamalarını yapın.'
  };
  
  return descriptions[structureType] || `${structureTypeLabels[structureType]} için yapı hesaplamalarını yapın.`;
};

// App Routes component - dinamik yapı türleri ile
const AppRoutes: React.FC = () => {
  const { structureTypeLabels, loading } = useStructureTypes();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div>Yapı türleri yükleniyor...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/map-test" element={<MapTestPage />} />
      
      {/* Dinamik routes - her yapı türü için */}
      {Object.keys(structureTypeLabels).map((structureType) => {
        const type = structureType as StructureType;
        return (
          <Route
            key={type}
            path={`/${type}`}
            element={
              <CalculationPage
                calculationType={type}
                title={structureTypeLabels[type]}
                description={getStructureDescription(type, structureTypeLabels)}
              />
            }
          />
        );
      })}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <StructureTypesProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </Router>
    </StructureTypesProvider>
  );
};

export default App;
