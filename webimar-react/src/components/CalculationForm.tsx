import React, { useState, useEffect } from 'react';
import { DetailedCalculationInput, CalculationResult, StructureType } from '../types';
import { apiService } from '../services/api';
import { useStructureTypes } from '../contexts/StructureTypesContext';
import AlanKontrol from './AlanKontrol';
import BagEviCalculator from '../utils/bagEviCalculator';

// Ayrılmış bileşen ve stil import'ları
import SmartDetectionFeedback from './CalculationForm/SmartDetectionFeedback';
import FormField from './CalculationForm/FormField';
import AlanKontrolButtons from './CalculationForm/AlanKontrolButtons';
import FormSectionComponent from './CalculationForm/FormSectionComponent';
import BagEviFormFields from './CalculationForm/BagEviFormFields';
import { FormValidator } from './CalculationForm/FormValidator';
import { useTypewriter } from './CalculationForm/useTypewriter';
import {
  FormContainer,
  FormTitle,
  FormContent,
  FormGrid,
  FormGroup,
  Label,
  SubmitButton,
  ErrorMessage,
  RequiredIndicator,
  AnimatedSelectContainer,
  AnimatedSelect,
  TypewriterPlaceholder
} from './CalculationForm/styles';

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
  onAraziVasfiChange?: (araziVasfi: string) => void;
  emsalTuru?: string; // Seçili emsal türü
  onEmsalTuruChange?: (emsalTuru: string) => void; // Emsal türü değiştiğinde çağrılacak fonksiyon
}

const CalculationForm: React.FC<CalculationFormComponentProps> = ({
  calculationType,
  onResult,
  onCalculationStart,
  selectedCoordinate,
  onAraziVasfiChange,
  emsalTuru,
  onEmsalTuruChange
}) => {
  const { structureTypeLabels } = useStructureTypes();
  
  // Create consolidated calculator instance for bağ evi calculations
  const bagEviCalculator = new BagEviCalculator();
  
  // Create form validator instance
  const formValidator = new FormValidator();
  
  const [formData, setFormData] = useState<DetailedCalculationInput>({
    alan_m2: 0,
    arazi_vasfi: '', // Başlangıçta boş olacak ki placeholder görünsün
    emsal_turu: 'marjinal' // Default olarak marjinal (%20) seçili
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

  // External emsal türü ile senkronizasyon
  useEffect(() => {
    if (emsalTuru && emsalTuru !== formData.emsal_turu) {
      setFormData(prev => ({ ...prev, emsal_turu: emsalTuru as 'marjinal' | 'mutlak_dikili' }));
    }
  }, [emsalTuru]);

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

  // 🎯 Smart Auto-Detection Helper Fonksiyonları
  const getSmartDetectionStatus = (fieldName: string) => {
    if (!dikiliKontrolSonucu) return null;
    
    if (dikiliKontrolSonucu.manualOverride && dikiliKontrolSonucu.overrideField === fieldName) {
      return 'manual';
    }
    
    if (dikiliKontrolSonucu.directTransfer) {
      return 'map';
    }
    
    return null;
  };

  const handleResetToMapValue = (fieldName: string) => {
    if (!dikiliKontrolSonucu?.originalMapValues) return;
    
    const originalValue = dikiliKontrolSonucu.originalMapValues[fieldName];
    if (originalValue !== undefined) {
      console.log(`🔄 ${fieldName} harita değerine geri döndürülüyor: ${originalValue}`);
      
      // Form değerini güncelle
      setFormData(prev => ({
        ...prev,
        [fieldName]: originalValue
      }));
      
      // Akıllı algılamayı sıfırla
      setDikiliKontrolSonucu((prev: any) => ({
        ...prev,
        directTransfer: true,
        manualOverride: false,
        overrideField: undefined
      }));
    }
  };

  const renderSmartDetectionFeedback = (fieldName: string) => {
    const status = getSmartDetectionStatus(fieldName);
    if (!status) return null;

    if (status === 'manual' && dikiliKontrolSonucu?.originalMapValues) {
      const originalValue = dikiliKontrolSonucu.originalMapValues[fieldName];
      
      return (
        <SmartDetectionFeedback 
          variant="manual"
          icon="✏️"
          text={`Manuel değer kullanılıyor (Harita: ${originalValue?.toLocaleString()} m²)`}
          onResetToMap={() => handleResetToMapValue(fieldName)}
        />
      );
    }

    if (status === 'map') {
      return (
        <SmartDetectionFeedback 
          variant="map"
          icon="🗺️"
          text="Harita verisi kullanılıyor - Manuel değişiklik akıllı algılanacak"
        />
      );
    }

    return null;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log(`🔄 CalculationForm - handleInputChange: ${name} = "${value}"`);
    
    // 🎯 AKILLI ALGILA (Çözüm 3): Harita verisi varken manuel değer girilirse otomatik olarak manuel moda geç
    const alanInputlari = ['alan_m2', 'dikili_alani', 'tarla_alani', 'zeytinlik_alani'];
    if (alanInputlari.includes(name) && dikiliKontrolSonucu?.directTransfer && value !== '') {
      const numericValue = Number(value);
      const currentMapValue = name === 'alan_m2' ? dikiliKontrolSonucu.dikiliAlan :  // alan_m2 de dikili alan değerini kullanır
                             name === 'dikili_alani' ? dikiliKontrolSonucu.dikiliAlan :
                             name === 'tarla_alani' ? dikiliKontrolSonucu.tarlaAlani :
                             name === 'zeytinlik_alani' ? dikiliKontrolSonucu.zeytinlikAlani : 0;
      
      // Sadece değer farklıysa akıllı algılamayı tetikle
      if (numericValue !== currentMapValue) {
        console.log(`📝 AKILLI ALGILA: ${name} manuel olarak değiştirildi (${currentMapValue} → ${numericValue})`);
        console.log(`🔄 Harita verisi pasif ediliyor, manuel değer öncelikli hale getiriliyor`);
        
        setDikiliKontrolSonucu((prev: any) => ({
          ...prev,
          directTransfer: false, // Harita verisini pasif et
          manualOverride: true,  // Manuel değer kullanıldığını işaretle
          overrideField: name,   // Hangi alan override edildiğini sakla
          originalMapValues: {   // Orijinal harita değerlerini sakla (geri dönüş için)
            ...prev.originalMapValues,
            alan_m2: prev.dikiliAlan || 0,      // alan_m2 için de dikili alan değerini sakla
            dikili_alani: prev.dikiliAlan || 0,
            tarla_alani: prev.tarlaAlani || 0,
            zeytinlik_alani: prev.zeytinlikAlani || 0
          }
        }));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'alan_m2' || name === 'silo_taban_alani_m2' || name === 'tarla_alani' || name === 'dikili_alani' || name === 'zeytinlik_alani' || name === 'zeytin_agac_sayisi' || name === 'tapu_zeytin_agac_adedi' || name === 'mevcut_zeytin_agac_adedi') ? Number(value) : value
    }));

    console.log(`✅ CalculationForm - State updated for ${name}`);
    
    // Debug: Güncel formData state'ini log'la
    setTimeout(() => {
      console.log(`📊 CalculationForm - Current formData.arazi_vasfi: "${formData.arazi_vasfi}"`);
      console.log(`📊 CalculationForm - Should show Tarla+Zeytinlik inputs: ${formData.arazi_vasfi === 'Tarla + Zeytinlik'}`);
    }, 100);

    // Arazi vasfı seçildiğinde dropdown'ı kapat ve parent'a bildir
    if (name === 'arazi_vasfi' && value) {
      console.log(`🎯 CalculationForm - Arazi vasfı seçildi: "${value}"`);
      setSelectOpen(false);
      // Parent component'a arazi vasfı değiştiğini bildir
      onAraziVasfiChange?.(value);
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
    console.log('🔍 DEBUG - handleDikiliKontrolSuccess çağrıldı');
    console.log('🔍 DEBUG - result:', result);
    console.log('🔍 DEBUG - mevcut formData.arazi_vasfi:', formData.arazi_vasfi);
    
    // 🔥 YENİ: Temizleme işlemi kontrolü
    if (result?.clearAll === true) {
      console.log('🧹 Temizleme işlemi algılandı - FormData sıfırlanıyor');
      setFormData(prev => ({
        ...prev,
        dikili_alani: 0,
        tarla_alani: 0,
        zeytinlik_alani: 0,
        alan_m2: formData.arazi_vasfi === 'Dikili vasıflı' ? 0 : prev.alan_m2
      }));
      
      // Validation hatalarını da temizle
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.dikili_alani;
        delete newErrors.tarla_alani;
        delete newErrors.zeytinlik_alani;
        if (formData.arazi_vasfi === 'Dikili vasıflı') {
          delete newErrors.alan_m2;
        }
        return newErrors;
      });
      
      console.log('✅ Form tamamen temizlendi - Harita verileri sıfırlandı');
      setDikiliKontrolOpen(false);
      return; // Temizleme işleminde sonraki kodları çalıştırma
    }
    
    // Doğrudan aktarım (ağaç hesaplaması olmadan) veya başarılı kontrol sonucu
    const isDirectTransfer = result?.directTransfer === true;
    const isSuccessfulControl = result?.dikiliAlanKontrolSonucu?.type === 'success' && 
                               result?.dikiliAlanKontrolSonucu?.yeterlilik?.yeterli === true;
    
    console.log('🔍 DEBUG - isDirectTransfer:', isDirectTransfer);
    console.log('🔍 DEBUG - isSuccessfulControl:', isSuccessfulControl);
    
    // Değer aktarım koşulları: Doğrudan aktarım VEYA başarılı kontrol
    // "Dikili vasıflı" için sadece dikiliAlan kontrolü, 
    // "Tarla + Zeytinlik" için tarlaAlani ve zeytinlikAlani kontrolü,
    // "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf" için sadece dikiliAlan kontrolü,
    // diğerleri için hem dikiliAlan hem tarlaAlani kontrolü
    const hasRequiredAreas = formData.arazi_vasfi === 'Dikili vasıflı' 
      ? result?.dikiliAlan 
      : formData.arazi_vasfi === 'Tarla + Zeytinlik'
      ? (result?.tarlaAlani && result?.zeytinlikAlani)
      : formData.arazi_vasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf'
      ? result?.dikiliAlan
      : formData.arazi_vasfi === '… Adetli Zeytin Ağacı bulunan tarla'
      ? result?.tarlaAlani
      : (result?.dikiliAlan && result?.tarlaAlani);
    
    console.log('🔍 DEBUG - hasRequiredAreas hesaplama:');
    console.log('  - arazi_vasfi check:', formData.arazi_vasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf');
    console.log('  - result.dikiliAlan:', result?.dikiliAlan);
    console.log('  - hasRequiredAreas final:', hasRequiredAreas);
    
    const shouldEnterIfBlock = (isDirectTransfer || isSuccessfulControl) && hasRequiredAreas;
    console.log('🔍 DEBUG - shouldEnterIfBlock:', shouldEnterIfBlock);
    
    if ((isDirectTransfer || isSuccessfulControl) && hasRequiredAreas) {
      console.log('🔍 DEBUG - IF BLOCK ENTERED - Area transfer başlıyor');
      
      const dikiliAlan = result.dikiliAlan; // Dikili alan değeri
      const tarlaAlani = result.tarlaAlani; // Tarla alanı
      const zeytinlikAlani = result.zeytinlikAlani; // Zeytinlik alanı
      
      console.log('🔍 DEBUG - Alan değerleri:');
      console.log('  - dikiliAlan:', dikiliAlan);
      console.log('  - tarlaAlani:', tarlaAlani);
      console.log('  - zeytinlikAlani:', zeytinlikAlani);
      
      // "Dikili vasıflı" arazi tipi için özel alan_m2 güncellemesi
      if (formData.arazi_vasfi === 'Dikili vasıflı') {
        console.log('🔍 DEBUG - Dikili vasıflı branch');
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
      } else if (formData.arazi_vasfi === 'Tarla + Zeytinlik') {
        console.log('🔍 DEBUG - Tarla + Zeytinlik branch');
        // "Tarla + Zeytinlik" arazi tipi için özel aktarım
        setFormData(prev => ({
          ...prev,
          tarla_alani: tarlaAlani,
          zeytinlik_alani: zeytinlikAlani
        }));
        
        // Validation hatalarını temizle
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.tarla_alani;
          delete newErrors.zeytinlik_alani;
          return newErrors;
        });
        
        console.log(`🚀 Tarla + Zeytinlik için aktarım:`);
        console.log(`  - tarla_alani: ${tarlaAlani} m²`);
        console.log(`  - zeytinlik_alani: ${zeytinlikAlani} m²`);
      } else if (formData.arazi_vasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf') {
        console.log('🔍 DEBUG - … Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf branch ENTERED');
        console.log('🔍 DEBUG - setFormData çağrılıyor, dikiliAlan:', dikiliAlan);
        console.log('🔍 DEBUG - mevcut formData.dikili_alani (değişmeden önce):', formData.dikili_alani);
        
        // "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf" arazi tipi için özel aktarım
        setFormData(prev => {
          console.log('🔍 DEBUG - setFormData içinde prev:', prev);
          const newData = {
            ...prev,
            dikili_alani: dikiliAlan // Sadece dikili alanı güncelle
          };
          console.log('🔍 DEBUG - setFormData içinde newData:', newData);
          return newData;
        });
        
        // Validation hatalarını temizle
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.dikili_alani;
          console.log('🔍 DEBUG - Validation errors temizlendi, dikili_alani hatası silindi');
          return newErrors;
        });
        
        console.log(`🚀 … Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf için aktarım:`);
        console.log(`  - dikili_alani: ${dikiliAlan} m²`);
        
        // Extra debug - check after state update (with timeout to allow state to settle)
        setTimeout(() => {
          console.log('🔍 DEBUG - 100ms sonra formData kontrolü (state güncellendikten sonra)');
          console.log('🔍 DEBUG - setFormData sonrası beklenen dikili_alani:', dikiliAlan);
        }, 100);
        
      } else {
        console.log('🔍 DEBUG - Diğer arazi tipleri branch');
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
      
      console.log('🔍 DEBUG - Area transfer tamamlandı');
      
      // Konsol mesajları
      if (isDirectTransfer) {
        if (formData.arazi_vasfi === 'Tarla + Zeytinlik') {
          console.log(`🚀 Doğrudan aktarım - Poligon verileri forma aktarıldı:`);
          console.log(`  - Tarla alanı: ${tarlaAlani} m²`);
          console.log(`  - Zeytinlik alanı: ${zeytinlikAlani} m²`);
          console.log(`📝 Not: Bu arazi tipinde ağaç hesaplaması gerekmez`);
        } else if (formData.arazi_vasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf') {
          console.log(`🚀 Doğrudan aktarım - Poligon verileri forma aktarıldı:`);
          console.log(`  - Dikili alan: ${dikiliAlan} m²`);
          console.log(`📝 Not: Bu arazi tipinde sadece dikili alan bilgisi alınır`);
        } else {
          console.log(`🚀 Doğrudan aktarım - Poligon verileri forma aktarıldı:`);
          console.log(`  - Dikili alan: ${dikiliAlan} m²`);
          console.log(`  - Tarla alanı: ${tarlaAlani} m²`);
          console.log(`📝 Not: Ağaç hesaplaması yapılmadı, sadece alan bilgileri aktarıldı`);
        }
      } else {
        console.log(`✅ Dikili alan kontrolü başarılı - Değerler aktarıldı:`);
        console.log(`  - Dikili alan: ${dikiliAlan} m²`);
        console.log(`  - Tarla alanı: ${tarlaAlani} m²`);
        console.log(`📊 Ağaçların teorik kapladığı alan: ${result?.dikiliAlanKontrolSonucu?.alanBilgisi?.kaplanAlan} m² (yoğunluk kontrolü için)`);
        console.log(`🎯 Yeterlilik oranı: %${result?.dikiliAlanKontrolSonucu?.yeterlilik?.oran?.toFixed(1)} (min: %${result?.dikiliAlanKontrolSonucu?.yeterlilik?.minimumOran})`);
      }
    } else {
      console.log('🔍 DEBUG - IF BLOCK SKIPPED - Area transfer yapılmadı');
      console.log('🔍 DEBUG - Sebep analizi:');
      console.log('  - (isDirectTransfer || isSuccessfulControl):', (isDirectTransfer || isSuccessfulControl));
      console.log('  - hasRequiredAreas:', hasRequiredAreas);
      console.log('  - Combined condition:', (isDirectTransfer || isSuccessfulControl) && hasRequiredAreas);
      console.log('❌ Dikili alan kontrolü başarısız - Yeterlilik kriteri sağlanmadı, değer aktarımı yapılmadı');
    }
  };

  const validateForm = (): boolean => {
    // Use the separated FormValidator
    const validationResult = formValidator.validateForm(formData, calculationType);
    setValidationErrors(validationResult.errors);
    return validationResult.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 CalculationForm - handleSubmit triggered');
    
    if (!validateForm()) {
      console.log('❌ CalculationForm - Form validation failed');
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log('📞 CalculationForm - Calling onCalculationStart');
    onCalculationStart();
    console.log('✅ CalculationForm - onCalculationStart called');

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

      // Bağ evi için konsolide hesaplama motoru ile form verisini hazırla
      if (calculationType === 'bag-evi') {
        const bagEviFormData = {
          calculationType,
          arazi_vasfi: formData.arazi_vasfi,
          alan_m2: formData.alan_m2,
          tarla_alani: formData.tarla_alani,
          dikili_alani: formData.dikili_alani,
          zeytinlik_alani: formData.zeytinlik_alani,
          zeytin_agac_sayisi: formData.zeytin_agac_sayisi,
          zeytin_agac_adedi: formData.zeytin_agac_adedi,
          tapu_zeytin_agac_adedi: formData.tapu_zeytin_agac_adedi,
          mevcut_zeytin_agac_adedi: formData.mevcut_zeytin_agac_adedi,
          manuel_kontrol_sonucu: dikiliKontrolSonucu || formData.manuel_kontrol_sonucu,
          latitude: formData.latitude,
          longitude: formData.longitude
        };

        // Konsolide hesaplama motoru ile backend için hazırla
        const preparedData = bagEviCalculator.prepareFormDataForBackend(bagEviFormData);
        
        // Hazırlanan verileri finalFormData'ya aktar
        Object.assign(finalFormData, preparedData);
        
        console.log('🍇 Bağ evi için konsolide hesaplama motoru kullanıldı');
        console.log('🔄 Arazi vasfı:', formData.arazi_vasfi);
        console.log('📊 Hazırlanan veriler:', preparedData);
      }

      // Seçilen koordinat bilgisini form dataya ekle
      if (selectedCoordinate) {
        finalFormData.latitude = selectedCoordinate.lat;
        finalFormData.longitude = selectedCoordinate.lng;
        console.log('📍 Koordinat bilgisi form dataya eklendi:', selectedCoordinate);
      }

      // Emsal türü bilgisini ekle (bağ evi hariç)
      if (calculationType !== 'bag-evi') {
        finalFormData.emsal_turu = formData.emsal_turu || 'marjinal';
        console.log(`📐 Emsal türü eklendi: ${finalFormData.emsal_turu} (${finalFormData.emsal_turu === 'marjinal' ? '%20' : '%5'})`);
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
          // Ana mesajı ayarla - Bağ evi için özel mapping
          ana_mesaj: calculationType === 'bag-evi' 
            ? (apiResult as any).mesaj || (apiResult as any).data?.mesaj || (apiResult as any).sonuc || (apiResult as any).message
            : (apiResult as any).sonuc || (apiResult as any).message,
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
      console.log('📞 CalculationForm - Calling onResult with:', result);
      onResult(result);
      console.log('✅ CalculationForm - onResult called successfully');
    } catch (err) {
      console.log('❌ CalculationForm - Error occurred:', err);
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
      
      console.log('📞 CalculationForm - Calling onResult with error:', errorResult);
      onResult(errorResult);
      console.log('✅ CalculationForm - onResult called with error');
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
          <FormSectionComponent title="📊 Temel Bilgiler">
            <FormGrid>
              {/* Bağ evi dışındaki hesaplamalar için genel alan inputu */}
              {calculationType !== 'bag-evi' && (
                <FormField
                  label="Alan (m²)"
                  name="alan_m2"
                  type="number"
                  value={formData.alan_m2 || ''}
                  onChange={handleInputChange}
                  placeholder="Örn: 5000"
                  min="1"
                  max="200000"
                  step="1"
                  required
                  error={validationErrors.alan_m2}
                />
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

              {/* Alan Kontrol Butonları - Konsolide Edilmiş */}
              {calculationType === 'bag-evi' && (
                formData.arazi_vasfi === 'Tarla + herhangi bir dikili vasıflı' ||
                formData.arazi_vasfi === 'Dikili vasıflı' ||
                formData.arazi_vasfi === 'Tarla + Zeytinlik' ||
                formData.arazi_vasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf' ||
                formData.arazi_vasfi === '… Adetli Zeytin Ağacı bulunan tarla' ||
                formData.arazi_vasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf'
              ) && (
                <AlanKontrolButtons
                  dikiliKontrolSonucu={dikiliKontrolSonucu}
                  onOpenDikiliKontrol={handleDikiliKontrolOpen}
                  formData={formData}
                />
              )}
            </FormGrid>

            {/* Emsal Türü Seçimi artık ResultDisplay bileşeninde */}
          </FormSectionComponent>

          {/* Özel Parametreler */}
          {(calculationType === 'hububat-silo' || calculationType === 'ipek-bocekciligi' || calculationType === 'bag-evi') && (
            <FormSectionComponent title="⚙️ Özel Parametreler">
              <FormGrid>
                {/* Hububat silo için özel alan */}
                {calculationType === 'hububat-silo' && (
                  <FormField
                    label="Planlanan Silo Taban Alanı (m²)"
                    name="silo_taban_alani_m2"
                    type="number"
                    value={formData.silo_taban_alani_m2 || ''}
                    onChange={handleInputChange}
                    placeholder="Örn: 1000"
                    min="1"
                    max="200000"
                    step="1"
                    required
                    error={validationErrors.silo_taban_alani_m2}
                  />
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

                {/* Bağ evi için özel alanlar - Modular component */}
                {calculationType === 'bag-evi' && (
                  <BagEviFormFields
                    formData={formData}
                    validationErrors={validationErrors}
                    onInputChange={handleInputChange}
                    renderSmartDetectionFeedback={renderSmartDetectionFeedback}
                  />
                )}
              </FormGrid>
            </FormSectionComponent>
          )}

          {/* Hesaplama Butonu */}
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
