import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DetailedCalculationInput, CalculationResult, StructureType } from '../types';
import { apiService } from '../services/api';
import { useStructureTypes } from '../contexts/StructureTypesContext';

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const FormTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
  }

  &:invalid {
    border-color: #e74c3c;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const SubmitButton = styled.button<{ $isLoading: boolean }>`
  background: ${props => props.$isLoading ? '#95a5a6' : '#3498db'};
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.$isLoading ? 'not-allowed' : 'pointer'};
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.$isLoading ? '#95a5a6' : '#2980b9'};
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fef5f5;
  border: 1px solid #feb2b2;
  color: #c53030;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const RequiredIndicator = styled.span`
  color: #e74c3c;
  margin-left: 4px;
`;

// Backend constants.py ile senkronize yapı türü labels - artık types dosyasından import ediliyor

// Arazi tipi interface'i API'den gelen data için
interface AraziTipi {
  id: number;
  ad: string;
}

interface CalculationFormComponentProps {
  calculationType: StructureType;
  onResult: (result: CalculationResult) => void;
  onCalculationStart: () => void;
}

const CalculationForm: React.FC<CalculationFormComponentProps> = ({
  calculationType,
  onResult,
  onCalculationStart
}) => {
  const { structureTypeLabels } = useStructureTypes();
  const [formData, setFormData] = useState<DetailedCalculationInput>({
    alan_m2: 0,
    arazi_vasfi: 'Dikili tarım'
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [araziTipleri, setAraziTipleri] = useState<AraziTipi[]>([]);
  const [araziTipleriLoading, setAraziTipleriLoading] = useState(true);

  // API'den arazi tiplerini çek
  useEffect(() => {
    const fetchAraziTipleri = async () => {
      try {
        setAraziTipleriLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/calculations/arazi-tipleri/');
        const data = await response.json();
        
        if (data.success) {
          setAraziTipleri(data.data);
          // İlk arazi tipini default olarak seç
          if (data.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              arazi_vasfi: data.data[0].ad
            }));
          }
        } else {
          console.error('Arazi tipleri çekilemedi:', data.message);
        }
      } catch (error) {
        console.error('Arazi tipleri API hatası:', error);
      } finally {
        setAraziTipleriLoading(false);
      }
    };

    fetchAraziTipleri();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'alan_m2' || name === 'silo_taban_alani_m2' ? Number(value) : value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.alan_m2 || formData.alan_m2 <= 0) {
      errors.alan_m2 = 'Alan (m²) pozitif bir sayı olmalıdır';
    }

    if (!formData.arazi_vasfi) {
      errors.arazi_vasfi = 'Arazi vasfı seçilmelidir';
    }

    // Hububat silo için özel validation
    if (calculationType === 'hububat-silo') {
      if (!formData.silo_taban_alani_m2 || formData.silo_taban_alani_m2 <= 0) {
        errors.silo_taban_alani_m2 = 'Planlanan silo taban alanı pozitif bir sayı olmalıdır';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    onCalculationStart();

    try {
      // calculationType'ı API service key formatına dönüştür (- yerine _)
      const calculationKey = calculationType.replace(/-/g, '_');
      console.log(`🔄 CalculationType: ${calculationType} → Key: ${calculationKey}`);
      console.log('📋 Available calculations:', Object.keys(apiService.calculations));
      console.log('🔍 Looking for key:', calculationKey);
      console.log('✅ Key exists?', calculationKey in apiService.calculations);
      console.log('🎯 Full apiService.calculations object:', apiService.calculations);
      
      // İpek böcekçiliği için dut_bahcesi_var_mi alanını default true yap
      const finalFormData = { ...formData };
      if (calculationType === 'ipek-bocekciligi' && finalFormData.dut_bahcesi_var_mi === undefined) {
        finalFormData.dut_bahcesi_var_mi = true;
        console.log('🌳 İpek böcekçiliği için dut_bahcesi_var_mi default true olarak ayarlandı');
      }
      
      // Explicitly debug each step
      console.log('🔬 Debug Info:');
      console.log('- calculationType:', calculationType);
      console.log('- calculationKey:', calculationKey);
      console.log('- typeof calculationKey:', typeof calculationKey);
      console.log('- apiService:', apiService);
      console.log('- apiService.calculations:', apiService.calculations);
      console.log('- Object.keys(apiService.calculations):', Object.keys(apiService.calculations));
      console.log('- Has solucan_tesisi key?:', 'solucan_tesisi' in apiService.calculations);
      console.log('- apiService.calculations.solucan_tesisi:', apiService.calculations.solucan_tesisi);
      
      const calculationFunction = apiService.calculations[calculationKey as keyof typeof apiService.calculations];
      console.log('🎲 calculationFunction:', calculationFunction);
      
      if (!calculationFunction) {
        console.error(`❌ Function not found for key: ${calculationKey}`);
        console.error('❌ Available keys:', Object.keys(apiService.calculations));
        throw new Error(`Hesaplama türü desteklenmiyor: ${calculationType}`);
      }
      const apiResult = await calculationFunction(finalFormData);
      console.log('🎯 API Result:', apiResult);
      
      // Debug: Hara ve İpek Böcekçiliği response'larını log'la
      if (calculationType === 'hara' || calculationType === 'ipek-bocekciligi') {
        console.log(`${calculationType} API Response:`, JSON.stringify(apiResult, null, 2));
      }
      
      // İpek böcekçiliği için özel response mapping
      if (calculationType === 'ipek-bocekciligi' && (apiResult as any).sonuc && typeof (apiResult as any).sonuc === 'object') {
        const ipekResult = (apiResult as any).sonuc;
        const result: CalculationResult = {
          success: (apiResult as any).success || false,
          message: ipekResult.mesaj_metin || (apiResult as any).message || 'İpek böcekçiliği hesaplama tamamlandı',
          data: {
            // İpek böcekçiliği sonuclarını aktar
            ...ipekResult,
            // Ana mesajı ayarla
            ana_mesaj: ipekResult.mesaj_metin || ipekResult.mesaj || 'İpek böcekçiliği hesaplama tamamlandı',
            // HTML mesajını ayarla
            mesaj: ipekResult.mesaj || '',
            // Diğer alanları map et
            alan_m2: formData.alan_m2,
            maksimum_kapasite: ipekResult.maksimum_taban_alani,
            maksimum_taban_alani: ipekResult.maksimum_taban_alani,
            maksimum_yapilasma_alani_m2: ipekResult.maksimum_yapilasma_alani_m2
          }
        };
        
        console.log('🔄 İpek Böcekçiliği Transformed Result:', result);
        onResult(result);
        return;
      }
      
      // Backend response'unu frontend CalculationResult formatına dönüştür
      const result: CalculationResult = {
        success: (apiResult as any).success || false,
        message: (apiResult as any).sonuc || (apiResult as any).message || 'Hesaplama tamamlandı',
        data: {
          // Backend'den gelen tüm verileri aktar
          ...(apiResult as any),
          // Detaylar varsa onları da üst seviyeye taşı
          ...((apiResult as any).detaylar || {}),
          // İzin durumunu doğru şekilde map et - hububat silo, tarımsal depo, lisanslı depo, yıkama tesisi, kurutma tesisi, meyve-sebze-kurutma, zeytinyagi-fabrikasi, su-depolama, su-kuyulari, zeytinyagi-uretim-tesisi, soguk-hava-deposu, sut-sigirciligi, besi-sigirciligi, agil-kucukbas, kümes türleri, kaz-ördek, hara, ipek böcekçiliği, evcil hayvan ve sera için özel handling
          izin_durumu: (calculationType === 'hububat-silo' || calculationType === 'tarimsal-depo' || calculationType === 'lisansli-depo' || calculationType === 'yikama-tesisi' || calculationType === 'kurutma-tesisi' || calculationType === 'meyve-sebze-kurutma' || calculationType === 'zeytinyagi-fabrikasi' || calculationType === 'su-depolama' || calculationType === 'su-kuyulari' || calculationType === 'zeytinyagi-uretim-tesisi' || calculationType === 'soguk-hava-deposu' || calculationType === 'sut-sigirciligi' || calculationType === 'besi-sigirciligi' || calculationType === 'agil-kucukbas' || calculationType === 'kumes-gezen' || calculationType === 'kumes-hindi' || calculationType === 'kumes-yumurtaci' || calculationType === 'kumes-etci' || calculationType === 'kaz-ordek' || calculationType === 'hara' || calculationType === 'ipek-bocekciligi' || calculationType === 'evcil-hayvan' || calculationType === 'sera')
            ? (apiResult as any).data?.izin_durumu || (apiResult as any).results?.izin_durumu || (apiResult as any).izin_durumu || (apiResult as any).detaylar?.izin_durumu || 'izin_verilemez'
            : (apiResult as any).detaylar?.izin_durumu || 
              ((apiResult as any).sonuc?.includes('YAPILABİLİR') ? 'izin_verilebilir' : 'izin_verilemez'),
          // Ana mesajı ayarla
          ana_mesaj: (apiResult as any).sonuc || (apiResult as any).message,
          // HTML mesajını ayarla - ağıl, kümes türleri, kaz-ördek, hara, ipek böcekçiliği, evcil hayvan, süt sığırcılığı, besi sığırcılığı, sera ve kurutma tesisi için results.html_mesaj öncelikli
          mesaj: (calculationType === 'agil-kucukbas' || calculationType === 'kumes-gezen' || calculationType === 'kumes-hindi' || calculationType === 'kumes-yumurtaci' || calculationType === 'kumes-etci' || calculationType === 'kaz-ordek' || calculationType === 'hara' || calculationType === 'ipek-bocekciligi' || calculationType === 'evcil-hayvan' || calculationType === 'sut-sigirciligi' || calculationType === 'besi-sigirciligi' || calculationType === 'sera' || calculationType === 'kurutma-tesisi')
            ? (apiResult as any).results?.html_mesaj || (apiResult as any).results?.mesaj || (apiResult as any).html_mesaj || (apiResult as any).mesaj || (apiResult as any).data?.html_mesaj
            : (apiResult as any).mesaj || (apiResult as any).html_mesaj || (apiResult as any).data?.html_mesaj || (apiResult as any).results?.html_mesaj,
          // Diğer önemli alanları map et
          alan_m2: (apiResult as any).detaylar?.arazi_alani || (apiResult as any).data?.arazi_alani || formData.alan_m2,
          maksimum_kapasite: (apiResult as any).maksimum_kapasite,
          maksimum_taban_alani: (apiResult as any).maksimum_taban_alani,
          uretim_hatti_alani: (apiResult as any).detaylar?.uretim_hatti_alani,
          toplam_mustemilat_alani: (apiResult as any).detaylar?.toplam_mustemilat_alani,
          // Hububat silo için özel alanlar
          maksimum_emsal: (apiResult as any).detaylar?.maksimum_emsal,
          kalan_emsal: (apiResult as any).detaylar?.kalan_emsal,
          maks_idari_teknik_alan: (apiResult as any).detaylar?.maks_idari_teknik_alan
        }
      };
      
      console.log('🔄 Transformed Result:', result);
      onResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Hesaplama sırasında bir hata oluştu';
      setError(errorMessage);
      
      const errorResult: CalculationResult = {
        success: false,
        message: errorMessage,
        data: {
          izin_durumu: 'izin_verilemez',
          ana_mesaj: errorMessage
        }
      };
      
      onResult(errorResult);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer>
      <FormTitle>
        {structureTypeLabels[calculationType] || calculationType} Hesaplama
      </FormTitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <form onSubmit={handleSubmit}>
        <FormGrid>
          <FormGroup>
            <Label>
              Alan (m²) <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <Input
              type="number"
              name="alan_m2"
              value={formData.alan_m2 || ''}
              onChange={handleInputChange}
              placeholder="Örn: 5000"
              min="1"
              step="1"
              required
            />
            {validationErrors.alan_m2 && (
              <ErrorMessage>{validationErrors.alan_m2}</ErrorMessage>
            )}
          </FormGroup>

          {/* Hububat silo için özel alan */}
          {calculationType === 'hububat-silo' && (
            <FormGroup>
              <Label>
                Planlanan Silo Taban Alanı (m²) <RequiredIndicator>*</RequiredIndicator>
              </Label>
              <Input
                type="number"
                name="silo_taban_alani_m2"
                value={formData.silo_taban_alani_m2 || ''}
                onChange={handleInputChange}
                placeholder="Örn: 1000"
                min="1"
                step="1"
                required
              />
              {validationErrors.silo_taban_alani_m2 && (
                <ErrorMessage>{validationErrors.silo_taban_alani_m2}</ErrorMessage>
              )}
            </FormGroup>
          )}

          {/* İpek böcekçiliği için özel alan */}
          {calculationType === 'ipek-bocekciligi' && (
            <FormGroup>
              <Label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="dut_bahcesi_var_mi"
                  checked={formData.dut_bahcesi_var_mi !== undefined ? formData.dut_bahcesi_var_mi : true}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      dut_bahcesi_var_mi: e.target.checked
                    }));
                  }}
                />
                Arazide dut bahçesi var mı? <RequiredIndicator>*</RequiredIndicator>
              </Label>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                İpek böcekçiliği tesisi için arazide dut bahçesi bulunması zorunludur.
              </div>
            </FormGroup>
          )}

          <FormGroup>
            <Label>
              Arazi Vasfı <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <Select
              name="arazi_vasfi"
              value={formData.arazi_vasfi}
              onChange={handleInputChange}
              required
              disabled={araziTipleriLoading}
            >
              {araziTipleriLoading ? (
                <option>Arazi tipleri yükleniyor...</option>
              ) : (
                araziTipleri.map((araziTipi: AraziTipi) => (
                  <option key={araziTipi.id} value={araziTipi.ad}>
                    {araziTipi.ad}
                  </option>
                ))
              )}
            </Select>
            {validationErrors.arazi_vasfi && (
              <ErrorMessage>{validationErrors.arazi_vasfi}</ErrorMessage>
            )}
          </FormGroup>
        </FormGrid>

        <SubmitButton
          type="submit"
          $isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span>⏳</span>
              Hesaplanıyor...
            </>
          ) : (
            <>
              <span>🧮</span>
              Hesapla
            </>
          )}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default CalculationForm;
