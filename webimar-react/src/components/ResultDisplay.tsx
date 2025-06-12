import React from 'react';
import styled from 'styled-components';
import { CalculationResult, StructureType } from '../types';
import { useStructureTypes } from '../contexts/StructureTypesContext';

interface ResultDisplayProps {
  result: CalculationResult | null;
  isLoading: boolean;
  calculationType: StructureType;
}

const ResultContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-top: 24px;
  border: 1px solid #e5e7eb;
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
`;

const ResultIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  
  &::after {
    content: '✓';
    color: white;
    font-size: 24px;
    font-weight: bold;
  }
`;

const ResultTitle = styled.h2`
  color: #111827;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const ResultSubtitle = styled.p`
  color: #6b7280;
  font-size: 14px;
  margin: 4px 0 0 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6b7280;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 12px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ResultCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const ResultLabel = styled.h3`
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const ResultValue = styled.div`
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const ResultDescription = styled.p`
  color: #6b7280;
  font-size: 14px;
  margin: 8px 0 0 0;
  line-height: 1.5;
`;

const ErrorContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
`;

const ErrorTitle = styled.h3`
  color: #dc2626;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  color: #7f1d1d;
  font-size: 14px;
  margin: 0;
`;

// Backend constants.py ile senkronize yapı türü display isimleri - artık context'ten geliyor
const getCalculationTypeDisplayName = (type: StructureType, structureTypeLabels: Record<StructureType, string>): string => {
  return structureTypeLabels[type] || type;
};

// Dinamik alan konfigürasyonu
interface FieldConfig {
  key: string | string[]; // Tek alan veya alternatif alanlar
  label: string;
  unit: string;
  description: string;
  formatter?: (value: any, data?: any) => string;
  condition?: (data: any) => boolean;
}

const fieldConfigs: FieldConfig[] = [
  {
    key: ['alan_m2', 'arazi_alani'],
    label: 'Toplam Alan',
    unit: 'm²',
    description: 'Girilen parselin toplam alanı'
  },
  {
    key: 'kapasite',
    label: 'Maksimum Kapasite',
    unit: 'baş',
    description: 'Bu alanda yetiştirilebilecek maksimum hayvan sayısı'
  },
  {
    key: 'yapi_alani',
    label: 'Yapı Alanı',
    unit: 'm²',
    description: 'İnşa edilebilecek maksimum yapı alanı'
  },
  {
    key: 'insaat_alani',
    label: 'İnşaat Alanı',
    unit: 'm²',
    description: 'Toplam inşaat alanı'
  },
  {
    key: 'taban_alani',
    label: 'Taban Alanı',
    unit: 'm²',
    description: 'Yapının taban alanı'
  },
  {
    key: 'sera_alani',
    label: 'Sera Alanı',
    unit: 'm²',
    description: 'Kurulabilecek sera alanı'
  },
  {
    key: ['depolama_kapasitesi', 'depo_alani'],
    label: 'Depo Alanı',
    unit: '',
    description: '',
    formatter: (value: any, data: any) => {
      if (data.depolama_kapasitesi) {
        return `${formatNumber(data.depolama_kapasitesi)} ton`;
      }
      if (data.depo_alani) {
        return `${formatNumber(data.depo_alani)} m²`;
      }
      return `${formatNumber(value)} m²`;
    },
    condition: (data: any) => data.depolama_kapasitesi || data.depo_alani
  },
  {
    key: 'silo_kapasitesi',
    label: 'Silo Kapasitesi',
    unit: 'ton',
    description: 'Silo depolama kapasitesi'
  },
  {
    key: 'soguk_depo_kapasitesi',
    label: 'Soğuk Depo Kapasitesi',
    unit: 'ton',
    description: 'Soğuk depo kapasitesi'
  },
  {
    key: 'uretim_kapasitesi',
    label: 'Üretim Kapasitesi',
    unit: 'kg/yıl',
    description: 'Yıllık üretim kapasitesi'
  },
  {
    key: 'kovan_sayisi',
    label: 'Maksimum Kovan Sayısı',
    unit: 'adet',
    description: 'Kurulabilecek maksimum kovan sayısı'
  },
  {
    key: 'havuz_alani',
    label: 'Havuz Alanı',
    unit: 'm²',
    description: 'Su ürünleri havuz alanı'
  },
  {
    key: 'maksimum_insaat_alani',
    label: 'Maksimum İnşaat Alanı',
    unit: 'm²',
    description: 'Bağ evi için maksimum inşaat alanı'
  },
  {
    key: 'uretim_alani',
    label: 'Üretim Alanı',
    unit: 'm²',
    description: 'Aktif üretim alanı'
  },
  {
    key: 'maksimum_emsal',
    label: 'Maksimum Emsal Alanı',
    unit: 'm²',
    description: 'İzin verilen maksimum yapılaşma alanı'
  },
  {
    key: 'kalan_emsal',
    label: 'Kalan Emsal Hakkı',
    unit: 'm²',
    description: 'Müştemilatlar (araç yolu, idari bina, laboratuvar vb.) için kullanılabilir alan'
  },
  {
    key: 'emsal_orani',
    label: 'Emsal Oranı',
    unit: '',
    description: 'Uygulanabilir maksimum emsal oranı'
  }
];

const getFieldValue = (data: any, key: string | string[]): any => {
  if (Array.isArray(key)) {
    for (const k of key) {
      if (data[k] !== undefined && data[k] !== null) {
        return data[k];
      }
    }
    return null;
  }
  return data[key];
};

const renderFieldCards = (data: any) => {
  return fieldConfigs.map((config, index) => {
    const value = getFieldValue(data, config.key);
    
    // Alan yoksa veya koşul sağlanmıyorsa gösterme
    if (!value && value !== 0) return null;
    if (config.condition && !config.condition(data)) return null;
    
    // Özel formatter varsa kullan
    const formattedValue = config.formatter 
      ? config.formatter(value, data)
      : `${formatNumber(value)} ${config.unit}`;
    
    // Açıklama için özel mantık
    let description = config.description;
    if (Array.isArray(config.key) && config.key.includes('depolama_kapasitesi') && config.key.includes('depo_alani')) {
      description = data.depolama_kapasitesi ? 'Maksimum depolama kapasitesi' : 'Depo taban alanı';
    }
    
    return (
      <ResultCard key={`field-${index}`}>
        <ResultLabel>{config.label}</ResultLabel>
        <ResultValue>
          {formattedValue}
        </ResultValue>
        <ResultDescription>
          {description}
        </ResultDescription>
      </ResultCard>
    );
  }).filter(Boolean);
};

const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return value.toString();
  
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 2
  }).format(num);
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading, calculationType }) => {
  const { structureTypeLabels } = useStructureTypes();

  console.log('🖼️ ResultDisplay props:', { result, isLoading, calculationType });

  if (isLoading) {
    console.log('⏳ Showing loading state');
    return (
      <ResultContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <span>Hesaplama yapılıyor...</span>
        </LoadingContainer>
      </ResultContainer>
    );
  }

  if (!result) {
    console.log('❌ No result to display');
    return (
      <ResultContainer>
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#6b7280',
          fontSize: '16px'
        }}>
          Hesaplama yapmak için formu doldurun ve "Hesapla" butonuna tıklayın.
        </div>
      </ResultContainer>
    );
  }

  if (!result.success) {
    console.log('💥 Showing error result:', result.message);
    return (
      <ResultContainer>
        <ErrorContainer>
          <ErrorTitle>Hesaplama Hatası</ErrorTitle>
          <ErrorMessage>{result.message}</ErrorMessage>
        </ErrorContainer>
      </ResultContainer>
    );
  }

  const data = result.data;
  console.log('✨ Rendering successful result with data:', data);

  return (
    <ResultContainer>
      <ResultHeader>
        <ResultIcon />
        <div>
          <ResultTitle>{getCalculationTypeDisplayName(calculationType, structureTypeLabels)} Hesaplama Sonucu</ResultTitle>
          <ResultSubtitle>Hesaplama başarıyla tamamlandı</ResultSubtitle>
        </div>
      </ResultHeader>      <ResultGrid>
        {/* Dinamik alan kartları */}
        {renderFieldCards(data)}
      </ResultGrid>

      {/* İzin Durumu */}
      {data.izin_durumu && (
        <ResultCard style={{ marginTop: '20px', borderColor: data.izin_durumu.includes('YAPILABİLİR') ? '#10b981' : '#ef4444' }}>
          <ResultLabel>İzin Durumu</ResultLabel>
          <ResultValue style={{ color: data.izin_durumu.includes('YAPILABİLİR') ? '#10b981' : '#ef4444' }}>
            {data.izin_durumu}
          </ResultValue>
          <ResultDescription>
            Mevcut mevzuat kapsamında tespit edilen izin durumu
          </ResultDescription>
        </ResultCard>
      )}

      {/* Detaylı HTML Mesajı - Tüm Tarımsal Yapılar için */}
      {(data.mesaj || data.html_mesaj) && (
        <ResultCard style={{ marginTop: '20px', padding: '0' }}>
          <div 
            style={{ padding: '20px' }}
            dangerouslySetInnerHTML={{ __html: data.mesaj || data.html_mesaj }}
          />
        </ResultCard>
      )}

      {/* Ek Bilgiler */}
      {data.aciklama && (
        <ResultCard style={{ marginTop: '20px' }}>
          <ResultLabel>Açıklama</ResultLabel>
          <ResultDescription style={{ marginTop: '8px', fontSize: '16px' }}>
            {data.aciklama}
          </ResultDescription>
        </ResultCard>
      )}
    </ResultContainer>
  );
};

export default ResultDisplay;
