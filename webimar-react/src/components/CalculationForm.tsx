import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { DetailedCalculationInput, CalculationResult, StructureType } from '../types';
import { apiService } from '../services/api';
import { useStructureTypes } from '../contexts/StructureTypesContext';
import AlanKontrol from './AlanKontrol';

// Cursor yanıp sönme animasyonu
const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

// Typewriter efekti için hook
const useTypewriter = (text: string, speed: number = 100) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    
    if (text.length === 0) return;

    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isComplete };
};

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
`;

const FormTitle = styled.h2`
  color: #2c3e50;
  margin: 0;
  padding: 24px 24px 16px;
  font-size: 24px;
  font-weight: 600;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    font-size: 20px;
    padding: 20px 16px 12px;
  }
`;

const FormContent = styled.div`
  padding: 24px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const FormSection = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const SectionTitle = styled.h3`
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 15px;
    margin-bottom: 12px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
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

const SubmitButton = styled.button<{ $isLoading: boolean }>`
  background: ${props => props.$isLoading ? '#95a5a6' : '#3498db'};
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.$isLoading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 8px;

  &:hover {
    background: ${props => props.$isLoading ? '#95a5a6' : '#2980b9'};
    transform: ${props => props.$isLoading ? 'none' : 'translateY(-1px)'};
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 14px 24px;
    font-size: 15px;
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

const DikiliKontrolButton = styled.button`
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 4px;

  &:hover {
    background: linear-gradient(135deg, #229954, #27ae60);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 13px;
  }
`;



// Animasyonlu Select Container
const AnimatedSelectContainer = styled.div`
  position: relative;
`;

const AnimatedSelect = styled.select<{ $hasValue?: boolean }>`
  padding: 12px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  width: 100%;
  background: white;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;

  &:focus {
    outline: none;
    border-color: #3498db;
  }

  &:invalid {
    border-color: #e74c3c;
  }

  option:first-child {
    color: #999;
  }
`;

const TypewriterPlaceholder = styled.div<{ $show?: boolean }>`
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: #999;
  font-size: 16px;
  pointer-events: none;
  opacity: ${props => props.$show ? 1 : 0};
  transition: opacity 0.2s ease;
  font-family: inherit;
  
  .cursor {
    animation: ${blink} 1s infinite;
  }
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
  selectedCoordinate?: { lat: number; lng: number } | null;
}

const CalculationForm: React.FC<CalculationFormComponentProps> = ({
  calculationType,
  onResult,
  onCalculationStart,
  selectedCoordinate
}) => {
  const { structureTypeLabels } = useStructureTypes();
  const [formData, setFormData] = useState<DetailedCalculationInput>({
    alan_m2: 0,
    arazi_vasfi: '' // Başlangıçta boş olacak ki placeholder görünsün
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [araziTipleri, setAraziTipleri] = useState<AraziTipi[]>([]);
  const [araziTipleriLoading, setAraziTipleriLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectFocused, setSelectFocused] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  
  // Dikili alan kontrolü için
  const [dikiliKontrolOpen, setDikiliKontrolOpen] = useState(false);
  const [dikiliKontrolSonucu, setDikiliKontrolSonucu] = useState<any>(null);
  
  // Typewriter efekti için
  const { displayedText } = useTypewriter('Arazi vasfınızı seçiniz', 80);

  // API'den arazi tiplerini çek
  useEffect(() => {
    const fetchAraziTipleri = async () => {
      try {
        setAraziTipleriLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/calculations/arazi-tipleri/');
        const data = await response.json();
        
        if (data.success) {
          setAraziTipleri(data.data);
          // Placeholder görünür kalması için otomatik seçimi kaldırıldı
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

  // Custom event listener for opening dikili kontrol modal
  useEffect(() => {
    const handleOpenDikiliKontrol = () => {
      setDikiliKontrolOpen(true);
    };

    window.addEventListener('openDikiliKontrol', handleOpenDikiliKontrol);
    
    return () => {
      window.removeEventListener('openDikiliKontrol', handleOpenDikiliKontrol);
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'alan_m2' || name === 'silo_taban_alani_m2' || name === 'tarla_alani' || name === 'dikili_alani') ? Number(value) : value
    }));

    // Arazi vasfı seçildiğinde dropdown'ı kapat
    if (name === 'arazi_vasfi' && value) {
      setSelectOpen(false);
    }

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Dikili alan kontrolü handler'ları
  const handleDikiliKontrolOpen = () => {
    setDikiliKontrolOpen(true);
  };

  const handleDikiliKontrolClose = () => {
    setDikiliKontrolOpen(false);
  };

  const handleDikiliKontrolSuccess = (result: any) => {
    setDikiliKontrolSonucu(result);
    console.log('Dikili alan kontrol sonucu:', result);
    
    // Doğrudan aktarım (ağaç hesaplaması olmadan) veya başarılı kontrol sonucu
    const isDirectTransfer = result?.directTransfer === true;
    const isSuccessfulControl = result?.dikiliAlanKontrolSonucu?.type === 'success' && 
                               result?.dikiliAlanKontrolSonucu?.yeterlilik?.yeterli === true;
    
    // Değer aktarım koşulları: Doğrudan aktarım VEYA başarılı kontrol
    // "Dikili vasıflı" için sadece dikiliAlan kontrolü, diğerleri için hem dikiliAlan hem tarlaAlani kontrolü
    const hasRequiredAreas = formData.arazi_vasfi === 'Dikili vasıflı' 
      ? result?.dikiliAlan 
      : (result?.dikiliAlan && result?.tarlaAlani);
    
    if ((isDirectTransfer || isSuccessfulControl) && hasRequiredAreas) {
      
      const dikiliAlan = result.dikiliAlan; // Dikili alan değeri
      const tarlaAlani = result.tarlaAlani; // Tarla alanı
      
      // "Dikili vasıflı" arazi tipi için özel alan_m2 güncellemesi
      if (formData.arazi_vasfi === 'Dikili vasıflı') {
        setFormData(prev => ({
          ...prev,
          alan_m2: dikiliAlan, // Dikili vasıflı için alan_m2 = dikili alan
          dikili_alani: dikiliAlan,
          tarla_alani: tarlaAlani
        }));
        
        // Validation hatalarını temizle (alan_m2 dahil)
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.alan_m2;
          delete newErrors.dikili_alani;
          delete newErrors.tarla_alani;
          return newErrors;
        });
        
        console.log(`🚀 Dikili vasıflı için özel aktarım:`);
        console.log(`  - alan_m2: ${dikiliAlan} m² (dikili alan)`);
        console.log(`  - dikili_alani: ${dikiliAlan} m²`);
        console.log(`  - tarla_alani: ${tarlaAlani} m²`);
      } else {
        // Diğer arazi tipleri için normal aktarım
        setFormData(prev => ({
          ...prev,
          dikili_alani: dikiliAlan,
          tarla_alani: tarlaAlani
        }));
        
        // Validation hatalarını temizle
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.dikili_alani;
          delete newErrors.tarla_alani;
          return newErrors;
        });
      }
      
      // Konsol mesajları
      if (isDirectTransfer) {
        console.log(`🚀 Doğrudan aktarım - Poligon verileri forma aktarıldı:`);
        console.log(`  - Dikili alan: ${dikiliAlan} m²`);
        console.log(`  - Tarla alanı: ${tarlaAlani} m²`);
        console.log(`📝 Not: Ağaç hesaplaması yapılmadı, sadece alan bilgileri aktarıldı`);
      } else {
        console.log(`✅ Dikili alan kontrolü başarılı - Değerler aktarıldı:`);
        console.log(`  - Dikili alan: ${dikiliAlan} m²`);
        console.log(`  - Tarla alanı: ${tarlaAlani} m²`);
        console.log(`📊 Ağaçların teorik kapladığı alan: ${result?.dikiliAlanKontrolSonucu?.alanBilgisi?.kaplanAlan} m² (yoğunluk kontrolü için)`);
        console.log(`🎯 Yeterlilik oranı: %${result?.dikiliAlanKontrolSonucu?.yeterlilik?.oran?.toFixed(1)} (min: %${result?.dikiliAlanKontrolSonucu?.yeterlilik?.minimumOran})`);
      }
    } else {
      console.log('❌ Dikili alan kontrolü başarısız - Yeterlilik kriteri sağlanmadı, değer aktarımı yapılmadı');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Alan_m2 validation - Bağ evi için "Tarla + herhangi bir dikili vasıflı" seçildiğinde gerekli değil
    const isBagEviWithSpecialVasif = calculationType === 'bag-evi' && formData.arazi_vasfi === 'Tarla + herhangi bir dikili vasıflı';
    
    if (!isBagEviWithSpecialVasif) {
      if (!formData.alan_m2 || formData.alan_m2 <= 0) {
        errors.alan_m2 = 'Alan (m²) pozitif bir sayı olmalıdır';
      }
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

    // Bağ evi için özel validation - Sadece "Tarla + herhangi bir dikili vasıflı" seçildiğinde
    if (calculationType === 'bag-evi' && formData.arazi_vasfi === 'Tarla + herhangi bir dikili vasıflı') {
      if (!formData.tarla_alani || formData.tarla_alani <= 0) {
        errors.tarla_alani = 'Tarla alanı pozitif bir sayı olmalıdır';
      }
      if (!formData.dikili_alani || formData.dikili_alani <= 0) {
        errors.dikili_alani = 'Dikili alan (bağ alanı) pozitif bir sayı olmalıdır';
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

      // Bağ evi için özel alan hesaplaması
      if (calculationType === 'bag-evi') {
        if (formData.arazi_vasfi === 'Tarla + herhangi bir dikili vasıflı') {
          // Bağ evi hesaplamalarında alan_m2 tarla_alani ile doldurulur
          finalFormData.alan_m2 = finalFormData.tarla_alani || 0;
          console.log('🍇 Bağ evi için alan_m2 tarla_alani ile ayarlandı:', finalFormData.alan_m2);
          
          // Manuel kontrol sonucunu ekle (eğer varsa)
          if (dikiliKontrolSonucu) {
            finalFormData.manuel_kontrol_sonucu = dikiliKontrolSonucu;
            console.log('🌳 Manuel kontrol sonucu forma eklendi:', dikiliKontrolSonucu);
          }
        } else if (formData.arazi_vasfi === 'Dikili vasıflı') {
          // Dikili vasıflı arazi için alan_m2 doğrudan dikili_alani ile kullanılır
          // Tarla alanı 0 olarak ayarlanır çünkü sadece dikili alan vardır
          finalFormData.dikili_alani = finalFormData.alan_m2 || 0;
          finalFormData.tarla_alani = 0; // Dikili vasıflı arazide tarla alanı yoktur
          console.log('🍇 Dikili vasıflı bağ evi için dikili_alani ayarlandı:', finalFormData.dikili_alani);
          console.log('🍇 Dikili vasıflı bağ evi için tarla_alani 0 olarak ayarlandı');
          
          // Dikili vasıflı için de manuel kontrol sonucunu ekle (eğer varsa)
          if (dikiliKontrolSonucu) {
            finalFormData.manuel_kontrol_sonucu = dikiliKontrolSonucu;
            console.log('🌳 Dikili vasıflı için manuel kontrol sonucu forma eklendi:', dikiliKontrolSonucu);
          }
        }
      }

      // Seçilen koordinat bilgisini form dataya ekle
      if (selectedCoordinate) {
        finalFormData.latitude = selectedCoordinate.lat;
        finalFormData.longitude = selectedCoordinate.lng;
        console.log('📍 Koordinat bilgisi form dataya eklendi:', selectedCoordinate);
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
          // İzin durumunu doğru şekilde map et - hububat silo, tarımsal depo, lisanslı depo, yıkama tesisi, kurutma tesisi, meyve-sebze-kurutma, zeytinyagi-fabrikasi, su-depolama, su-kuyulari, zeytinyagi-uretim-tesisi, soguk-hava-deposu, sut-sigirciligi, besi-sigirciligi, agil-kucukbas, kümes türleri, kaz-ördek, hara, ipek böcekçiliği, evcil hayvan, sera ve bağ evi için özel handling
          izin_durumu: (calculationType === 'hububat-silo' || calculationType === 'tarimsal-depo' || calculationType === 'lisansli-depo' || calculationType === 'yikama-tesisi' || calculationType === 'kurutma-tesisi' || calculationType === 'meyve-sebze-kurutma' || calculationType === 'zeytinyagi-fabrikasi' || calculationType === 'su-depolama' || calculationType === 'su-kuyulari' || calculationType === 'zeytinyagi-uretim-tesisi' || calculationType === 'soguk-hava-deposu' || calculationType === 'sut-sigirciligi' || calculationType === 'besi-sigirciligi' || calculationType === 'agil-kucukbas' || calculationType === 'kumes-gezen' || calculationType === 'kumes-hindi' || calculationType === 'kumes-yumurtaci' || calculationType === 'kumes-etci' || calculationType === 'kaz-ordek' || calculationType === 'hara' || calculationType === 'ipek-bocekciligi' || calculationType === 'evcil-hayvan' || calculationType === 'sera' || calculationType === 'bag-evi')
            ? (apiResult as any).data?.izin_durumu || (apiResult as any).results?.izin_durumu || (apiResult as any).izin_durumu || (apiResult as any).detaylar?.izin_durumu || 'izin_verilemez'
            : (apiResult as any).detaylar?.izin_durumu || 
              ((apiResult as any).sonuc?.includes('YAPILABİLİR') ? 'izin_verilebilir' : 'izin_verilemez'),
          // Ana mesajı ayarla
          ana_mesaj: (apiResult as any).sonuc || (apiResult as any).message,
          // HTML mesajını ayarla - ağıl, kümes türleri, kaz-ördek, hara, ipek böcekçiliği, evcil hayvan, süt sığırcılığı, besi sığırcılığı, sera, kurutma tesisi ve bağ evi için results.html_mesaj öncelikli
          mesaj: (calculationType === 'agil-kucukbas' || calculationType === 'kumes-gezen' || calculationType === 'kumes-hindi' || calculationType === 'kumes-yumurtaci' || calculationType === 'kumes-etci' || calculationType === 'kaz-ordek' || calculationType === 'hara' || calculationType === 'ipek-bocekciligi' || calculationType === 'evcil-hayvan' || calculationType === 'sut-sigirciligi' || calculationType === 'besi-sigirciligi' || calculationType === 'sera' || calculationType === 'kurutma-tesisi' || calculationType === 'bag-evi')
            ? (apiResult as any).results?.html_mesaj || (apiResult as any).results?.mesaj || (apiResult as any).html_mesaj || (apiResult as any).mesaj || (apiResult as any).data?.html_mesaj || (apiResult as any).data?.mesaj
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

      <FormContent>
        {error && <ErrorMessage>{error}</ErrorMessage>}



        <form onSubmit={handleSubmit}>
          {/* Temel Bilgiler */}
          <FormSection>
            <SectionTitle>
              📊 Temel Bilgiler
            </SectionTitle>
            <FormGrid>
              {/* Bağ evi dışındaki hesaplamalar için genel alan inputu */}
              {calculationType !== 'bag-evi' && (
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
              )}

              <FormGroup>
                <Label>
                  Arazi Vasfı <RequiredIndicator>*</RequiredIndicator>
                </Label>
                <AnimatedSelectContainer>
                  <AnimatedSelect
                    name="arazi_vasfi"
                    value={formData.arazi_vasfi}
                    onChange={handleInputChange}
                    onFocus={() => setSelectFocused(true)}
                    onBlur={() => {
                      setSelectFocused(false);
                      setSelectOpen(false);
                    }}
                    onMouseDown={() => setSelectOpen(true)}
                    onClick={() => setSelectOpen(true)}
                    required
                    disabled={araziTipleriLoading}
                    $hasValue={!!formData.arazi_vasfi}
                  >
                    {araziTipleriLoading ? (
                      <option>Arazi tipleri yükleniyor...</option>
                    ) : (
                      <>
                        <option value="" disabled style={{ display: 'none' }}>
                          {/* Gizli placeholder option */}
                        </option>
                        {araziTipleri.map((araziTipi: AraziTipi) => (
                          <option key={araziTipi.id} value={araziTipi.ad}>
                            {araziTipi.ad}
                          </option>
                        ))}
                      </>
                    )}
                  </AnimatedSelect>
                  
                  {/* Animasyonlu placeholder */}
                  <TypewriterPlaceholder 
                    $show={!formData.arazi_vasfi && !selectOpen && !araziTipleriLoading}
                  >
                    {displayedText}
                    {displayedText.length < 'Arazi vasfınızı seçiniz'.length && (
                      <span className="cursor">|</span>
                    )}
                  </TypewriterPlaceholder>
                </AnimatedSelectContainer>
                {validationErrors.arazi_vasfi && (
                  <ErrorMessage>{validationErrors.arazi_vasfi}</ErrorMessage>
                )}
              </FormGroup>

              {/* Bağ evi için Dikili Alan Kontrolü butonu - 3. sütun */}
              {calculationType === 'bag-evi' && (formData.arazi_vasfi === 'Tarla + herhangi bir dikili vasıflı' || formData.arazi_vasfi === 'Dikili vasıflı') && (
                <FormGroup>
                  <Label>
                    Dikili Alan Kontrolü
                  </Label>
                  <DikiliKontrolButton
                    type="button"
                    onClick={handleDikiliKontrolOpen}
                  >
                    🌳 Dikili Alan Kontrolü
                  </DikiliKontrolButton>
                  {dikiliKontrolSonucu && (
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '8px', 
                      background: dikiliKontrolSonucu.directTransfer ? '#e8f5e8' : 
                                 (dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.yeterli === true ? '#d4edda' : '#f8d7da'),
                      border: '1px solid ' + (dikiliKontrolSonucu.directTransfer ? '#c3e6cb' : 
                                             (dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.yeterli === true ? '#c3e6cb' : '#f5c6cb')),
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: dikiliKontrolSonucu.directTransfer ? '#155724' : 
                            (dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.yeterli === true ? '#155724' : '#721c24')
                    }}>
                      {dikiliKontrolSonucu.directTransfer ? (
                        <>
                          🚀 Doğrudan aktarım yapıldı
                          <div style={{ fontSize: '11px', marginTop: '2px' }}>
                            Dikili alan: {dikiliKontrolSonucu.dikiliAlan?.toLocaleString()} m² | Tarla alanı: {dikiliKontrolSonucu.tarlaAlani?.toLocaleString()} m²
                          </div>
                        </>
                      ) : dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.yeterli === true ? (
                        <>
                          ✅ Dikili alan kontrolü başarılı
                        </>
                      ) : (
                        <>
                          ❌ Dikili alan kontrolü başarısız
                          <div style={{ fontSize: '11px', marginTop: '2px' }}>
                            {dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.kriter1 === false && dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.kriter2 === false ?
                              `Dikili alan: ${dikiliKontrolSonucu.dikiliAlan?.toLocaleString()} m² < 5000 m² ve Tarla alanı: ${dikiliKontrolSonucu.tarlaAlani?.toLocaleString()} m² < 20000 m²` :
                              `Yoğunluk yetersiz: %${dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.oran?.toFixed(1)} < %${dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.minimumOran}`}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </FormGroup>
              )}
            </FormGrid>
          </FormSection>

          {/* Özel Parametreler */}
          {(calculationType === 'hububat-silo' || calculationType === 'ipek-bocekciligi' || calculationType === 'bag-evi') && (
            <FormSection>
              <SectionTitle>
                ⚙️ Özel Parametreler
              </SectionTitle>
              <FormGrid>
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

                {/* Bağ evi için özel alanlar */}
                {calculationType === 'bag-evi' && (
                  <>
                    {/* Dikili vasıflı için sadece alan girişi */}
                    {formData.arazi_vasfi === 'Dikili vasıflı' && (
                      <FormGroup>
                        <Label>
                          Dikili Alan (m²) <RequiredIndicator>*</RequiredIndicator>
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
                        <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>
                          Bağ evi için dikili alanınızın en az 5000 m² olması gerekmektedir.
                        </div>
                      </FormGroup>
                    )}
                    
                    {/* Tarla + herhangi bir dikili vasıflı için alan girişleri */}
                    {formData.arazi_vasfi === 'Tarla + herhangi bir dikili vasıflı' && (
                      <>
                        <FormGroup>
                          <Label>
                            Tarla Alanı (m²) <RequiredIndicator>*</RequiredIndicator>
                          </Label>
                          <Input
                            type="number"
                            name="tarla_alani"
                            value={formData.tarla_alani || ''}
                            onChange={handleInputChange}
                            placeholder="Örn: 15000"
                            min="1"
                            step="1"
                            required
                          />
                          {validationErrors.tarla_alani && (
                            <ErrorMessage>{validationErrors.tarla_alani}</ErrorMessage>
                          )}
                        </FormGroup>

                        <FormGroup>
                          <Label>
                            Dikili Alanı (m²) <RequiredIndicator>*</RequiredIndicator>
                          </Label>
                          <Input
                            type="number"
                            name="dikili_alani"
                            value={formData.dikili_alani || ''}
                            onChange={handleInputChange}
                            placeholder="Örn: 12000"
                            min="1"
                            step="1"
                            required
                          />
                          {validationErrors.dikili_alani && (
                            <ErrorMessage>{validationErrors.dikili_alani}</ErrorMessage>
                          )}
                        </FormGroup>

                        <div style={{ 
                          gridColumn: '1 / -1', 
                          background: '#f0f9ff', 
                          border: '1px solid #0ea5e9', 
                          borderRadius: '8px', 
                          padding: '12px',
                          marginTop: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '18px' }}>ℹ️</span>
                            <strong style={{ color: '#0369a1' }}>Bağ Evi Hesaplama Bilgileri</strong>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '20px', color: '#075985', fontSize: '14px' }}>
                            <li>Tarla alanı: Parselin toplam alanıdır</li>
                            <li>Dikili alan: Parsel içerisindeki dikili (asma, meyve ağacı vb.) alanın miktarıdır</li>
                            <li>Bağ evi hesabında bu iki alanın ayrı ayrı belirtilmesi gereklidir</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </>
                )}
              </FormGrid>
            </FormSection>
          )}

          {/* Hesaplama Butonu */}
          <FormSection>
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
          </FormSection>
        </form>
      </FormContent>

      {/* Alan Kontrolü Paneli */}
      <AlanKontrol
        isOpen={dikiliKontrolOpen}
        onClose={handleDikiliKontrolClose}
        onSuccess={handleDikiliKontrolSuccess}
        alanTipi="dikiliAlan"
        araziVasfi={formData.arazi_vasfi || ''}
        initialDikiliAlan={
          formData.arazi_vasfi === 'Dikili vasıflı' 
            ? (formData.alan_m2 || 0) 
            : (formData.dikili_alani || 0)
        }
        initialTarlaAlani={formData.tarla_alani || 0}
      />
    </FormContainer>
  );
};

export default CalculationForm;
