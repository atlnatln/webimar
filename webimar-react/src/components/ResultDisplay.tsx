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
  border: 1px solid #e...j && (calculationType === 'solucan-tesisi' || calculationType === 'mantar-tesisi' || calculationType === 'aricilik' || calculationType === 'hububat-silo' || calculationType === 'tarimsal-depo' || calculationType === 'lisansli-depo' || calculationType === 'yikama-tesisi' || calculationType === 'kurutma-tesisi' || calculationType === 'meyve-sebze-kurutma' || calculationType === 'zeytinyagi-fabrikasi' || calculationType === 'su-depolama' || calculationType === 'su-kuyulari' || calculationType === 'zeytinyagi-uretim-tesisi' || calculationType === 'soguk-hava-deposu' || calculationType === 'sut-sigirciligi' || calculationType === 'besi-sigirciligi' || calculationType === 'agil-kucukbas') && (e7eb;
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

const ResultUnit = styled.span`
  color: #6b7280;
  font-size: 14px;
  font-weight: 400;
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
    return null;
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
      </ResultHeader>

      <ResultGrid>
        {/* Alan Bilgileri */}
        {(data.alan_m2 || data.arazi_alani) && (
          <ResultCard>
            <ResultLabel>Toplam Alan</ResultLabel>
            <ResultValue>
              {formatNumber(data.alan_m2 || data.arazi_alani)} <ResultUnit>m²</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Girilen parselin toplam alanı
            </ResultDescription>
          </ResultCard>
        )}

        {/* Kapasite Bilgileri */}
        {data.kapasite && (
          <ResultCard>
            <ResultLabel>Maksimum Kapasite</ResultLabel>
            <ResultValue>
              {formatNumber(data.kapasite)} <ResultUnit>baş</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Bu alanda yetiştirilebilecek maksimum hayvan sayısı
            </ResultDescription>
          </ResultCard>
        )}

        {/* Yapı Alanı */}
        {data.yapi_alani && (
          <ResultCard>
            <ResultLabel>Yapı Alanı</ResultLabel>
            <ResultValue>
              {formatNumber(data.yapi_alani)} <ResultUnit>m²</ResultUnit>
            </ResultValue>
            <ResultDescription>
              İnşa edilebilecek maksimum yapı alanı
            </ResultDescription>
          </ResultCard>
        )}

        {/* İnşaat Alanı */}
        {data.insaat_alani && (
          <ResultCard>
            <ResultLabel>İnşaat Alanı</ResultLabel>
            <ResultValue>
              {formatNumber(data.insaat_alani)} <ResultUnit>m²</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Toplam inşaat alanı
            </ResultDescription>
          </ResultCard>
        )}

        {/* Taban Alanı */}
        {data.taban_alani && (
          <ResultCard>
            <ResultLabel>Taban Alanı</ResultLabel>
            <ResultValue>
              {formatNumber(data.taban_alani)} <ResultUnit>m²</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Yapının taban alanı
            </ResultDescription>
          </ResultCard>
        )}

        {/* Sera Alanı */}
        {data.sera_alani && (
          <ResultCard>
            <ResultLabel>Sera Alanı</ResultLabel>
            <ResultValue>
              {formatNumber(data.sera_alani)} <ResultUnit>m²</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Kurulabilecek sera alanı
            </ResultDescription>
          </ResultCard>
        )}

        {/* Depolama Kapasitesi */}
        {(data.depolama_kapasitesi || data.depo_alani) && (
          <ResultCard>
            <ResultLabel>Depo Alanı</ResultLabel>
            <ResultValue>
              {formatNumber(data.depolama_kapasitesi || data.depo_alani)} <ResultUnit>{data.depolama_kapasitesi ? 'ton' : 'm²'}</ResultUnit>
            </ResultValue>
            <ResultDescription>
              {data.depolama_kapasitesi ? 'Maksimum depolama kapasitesi' : 'Depo taban alanı'}
            </ResultDescription>
          </ResultCard>
        )}

        {/* Silo Kapasitesi */}
        {data.silo_kapasitesi && (
          <ResultCard>
            <ResultLabel>Silo Kapasitesi</ResultLabel>
            <ResultValue>
              {formatNumber(data.silo_kapasitesi)} <ResultUnit>ton</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Silo depolama kapasitesi
            </ResultDescription>
          </ResultCard>
        )}

        {/* Soğuk Depo Kapasitesi */}
        {data.soguk_depo_kapasitesi && (
          <ResultCard>
            <ResultLabel>Soğuk Depo Kapasitesi</ResultLabel>
            <ResultValue>
              {formatNumber(data.soguk_depo_kapasitesi)} <ResultUnit>ton</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Soğuk depo kapasitesi
            </ResultDescription>
          </ResultCard>
        )}

        {/* Üretim Kapasitesi */}
        {data.uretim_kapasitesi && (
          <ResultCard>
            <ResultLabel>Üretim Kapasitesi</ResultLabel>
            <ResultValue>
              {formatNumber(data.uretim_kapasitesi)} <ResultUnit>kg/yıl</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Yıllık üretim kapasitesi
            </ResultDescription>
          </ResultCard>
        )}

        {/* Kovan Sayısı */}
        {data.kovan_sayisi && (
          <ResultCard>
            <ResultLabel>Maksimum Kovan Sayısı</ResultLabel>
            <ResultValue>
              {formatNumber(data.kovan_sayisi)} <ResultUnit>adet</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Kurulabilecek maksimum kovan sayısı
            </ResultDescription>
          </ResultCard>
        )}

        {/* Havuz Alanı */}
        {data.havuz_alani && (
          <ResultCard>
            <ResultLabel>Havuz Alanı</ResultLabel>
            <ResultValue>
              {formatNumber(data.havuz_alani)} <ResultUnit>m²</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Su ürünleri havuz alanı
            </ResultDescription>
          </ResultCard>
        )}

        {/* Yumurta Kapasitesi */}
        {data.yumurta_kapasitesi && (
          <ResultCard>
            <ResultLabel>Yumurta Kapasitesi</ResultLabel>
            <ResultValue>
              {formatNumber(data.yumurta_kapasitesi)} <ResultUnit>adet/yıl</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Yıllık yumurta üretim kapasitesi
            </ResultDescription>
          </ResultCard>
        )}

        {/* Kuluçka Kapasitesi */}
        {data.kulucka_kapasitesi && (
          <ResultCard>
            <ResultLabel>Kuluçka Kapasitesi</ResultLabel>
            <ResultValue>
              {formatNumber(data.kulucka_kapasitesi)} <ResultUnit>adet</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Kuluçka makinesi kapasitesi
            </ResultDescription>
          </ResultCard>
        )}

        {/* Bağ Evi Özel Durumlar */}
        {data.maksimum_insaat_alani && (
          <ResultCard>
            <ResultLabel>Maksimum İnşaat Alanı</ResultLabel>
            <ResultValue>
              {formatNumber(data.maksimum_insaat_alani)} <ResultUnit>m²</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Bağ evi için maksimum inşaat alanı
            </ResultDescription>
          </ResultCard>
        )}

        {/* Üretim Alanı */}
        {data.uretim_alani && (
          <ResultCard>
            <ResultLabel>Üretim Alanı</ResultLabel>
            <ResultValue>
              {formatNumber(data.uretim_alani)} <ResultUnit>m²</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Aktif üretim alanı
            </ResultDescription>
          </ResultCard>
        )}

        {/* Lisanslı Depo Özel Alanları */}
        {data.maksimum_emsal && (
          <ResultCard>
            <ResultLabel>Maksimum Emsal Alanı</ResultLabel>
            <ResultValue>
              {formatNumber(data.maksimum_emsal)} <ResultUnit>m²</ResultUnit>
            </ResultValue>
            <ResultDescription>
              İzin verilen maksimum yapılaşma alanı
            </ResultDescription>
          </ResultCard>
        )}

        {data.kalan_emsal !== undefined && (
          <ResultCard>
            <ResultLabel>Kalan Emsal Hakkı</ResultLabel>
            <ResultValue>
              {formatNumber(data.kalan_emsal)} <ResultUnit>m²</ResultUnit>
            </ResultValue>
            <ResultDescription>
              Müştemilatlar (araç yolu, idari bina, laboratuvar vb.) için kullanılabilir alan
            </ResultDescription>
          </ResultCard>
        )}

        {data.emsal_orani && (
          <ResultCard>
            <ResultLabel>Emsal Oranı</ResultLabel>
            <ResultValue>
              {data.emsal_orani}
            </ResultValue>
            <ResultDescription>
              Uygulanabilir maksimum emsal oranı
            </ResultDescription>
          </ResultCard>
        )}
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

      {/* Detaylı HTML Mesajı - Lisanslı Depo için */}
      {data.html_mesaj && calculationType === 'lisansli-depo' && (
        <ResultCard style={{ marginTop: '20px', padding: '0' }}>
          <div 
            style={{ padding: '20px' }}
            dangerouslySetInnerHTML={{ __html: data.html_mesaj }}
          />
        </ResultCard>
      )}

      {/* Detaylı HTML Mesajı - Yıkama Tesisi için */}
      {data.html_mesaj && calculationType === 'yikama-tesisi' && (
        <ResultCard style={{ marginTop: '20px', padding: '0' }}>
          <div 
            style={{ padding: '20px' }}
            dangerouslySetInnerHTML={{ __html: data.html_mesaj }}
          />
        </ResultCard>
      )}

      {/* Detaylı HTML Mesajı - Solucan Tesisi için */}
      {data.mesaj && calculationType === 'solucan-tesisi' && (
        <ResultCard style={{ marginTop: '20px', padding: '0' }}>
          <div 
            style={{ padding: '20px' }}
            dangerouslySetInnerHTML={{ __html: data.mesaj }}
          />
        </ResultCard>
      )}

      {/* Detaylı HTML Mesajı - Mantar Tesisi için */}
      {data.mesaj && calculationType === 'mantar-tesisi' && (
        <ResultCard style={{ marginTop: '20px', padding: '0' }}>
          <div 
            style={{ padding: '20px' }}
            dangerouslySetInnerHTML={{ __html: data.mesaj }}
          />
        </ResultCard>
      )}


      {/* Detaylı HTML Mesajı - Tüm Tarımsal Yapılar için */}
      {data.mesaj && (
        calculationType === 'solucan-tesisi' || 
        calculationType === 'mantar-tesisi' || 
        calculationType === 'aricilik' || 
        calculationType === 'hububat-silo' || 
        calculationType === 'tarimsal-depo' || 
        calculationType === 'lisansli-depo' || 
        calculationType === 'yikama-tesisi' || 
        calculationType === 'kurutma-tesisi' || 
        calculationType === 'meyve-sebze-kurutma' || 
        calculationType === 'zeytinyagi-fabrikasi' || 
        calculationType === 'su-depolama' || 
        calculationType === 'su-kuyulari' || 
        calculationType === 'zeytinyagi-uretim-tesisi' || 
        calculationType === 'soguk-hava-deposu' || 
        calculationType === 'agil-kucukbas' || 
        calculationType === 'kumes-gezen' || 
        calculationType === 'kumes-hindi' || 
        calculationType === 'kumes-yumurtaci' || 
        calculationType === 'kumes-etci' || 
        calculationType === 'kaz-ordek' || 
        calculationType === 'hara' || 
        calculationType === 'ipek-bocekciligi' || 
        calculationType === 'evcil-hayvan' || 
        calculationType === 'sut-sigirciligi' || 
        calculationType === 'besi-sigirciligi' || 
        calculationType === 'sera'
      ) && (
        <ResultCard style={{ marginTop: '20px', padding: '0' }}>
          <div 
            style={{ padding: '20px' }}
            dangerouslySetInnerHTML={{ __html: data.mesaj }}
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
