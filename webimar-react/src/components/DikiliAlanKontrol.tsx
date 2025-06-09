import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer } from 'react-leaflet';
import PolygonDrawer, { DrawnPolygon } from './Map/PolygonDrawer';
import 'leaflet/dist/leaflet.css';

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

const DrawingModeContainer = styled.div`
  margin-bottom: 16px;
`;

const DrawingModeButton = styled.button<{ $active: boolean; $color: string }>`
  padding: 8px 16px;
  margin-right: 8px;
  border: 2px solid ${props => props.$color};
  background: ${props => props.$active ? props.$color : 'white'};
  color: ${props => props.$active ? 'white' : props.$color};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$color};
    color: white;
  }
`;

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

// Ağaç türleri verisi (eski sistemden)
interface AgacTuru {
  sira: number;
  tur: string;
  normal?: number;
  bodur?: number;
  yariBodur?: number;
}

interface EklenenAgac {
  turid: string;
  turAdi: string;
  tipi: 'normal' | 'bodur' | 'yaribodur';
  sayi: number;
  gerekliAgacSayisi: number;
}

interface DikiliAlanKontrolProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

const DikiliAlanKontrol: React.FC<DikiliAlanKontrolProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'manuel' | 'harita'>('manuel');
  
  // Mevcut state'ler
  const [agacVerileri, setAgacVerileri] = useState<AgacTuru[]>([]);
  const [eklenenAgaclar, setEklenenAgaclar] = useState<EklenenAgac[]>([]);
  
  // Form alanları
  const [dikiliAlan, setDikiliAlan] = useState<number>(0);
  const [tarlaAlani, setTarlaAlani] = useState<number>(0);
  const [secilenAgacTuru, setSecilenAgacTuru] = useState<string>('');
  const [secilenAgacTipi, setSecilenAgacTipi] = useState<'normal' | 'bodur' | 'yaribodur'>('normal');
  const [agacSayisi, setAgacSayisi] = useState<number>(0);
  
  // Sonuç durumu
  const [hesaplamaSonucu, setHesaplamaSonucu] = useState<any>(null);
  
  // Harita ile ilgili state'ler
  const [drawingMode, setDrawingMode] = useState<'tarla' | 'dikili' | null>(null);
  const [tarlaPolygon, setTarlaPolygon] = useState<DrawnPolygon | null>(null);
  const [dikiliPolygon, setDikiliPolygon] = useState<DrawnPolygon | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // PolygonDrawer external kontrolü için
  const [drawingTrigger, setDrawingTrigger] = useState(false);
  const [stopTrigger, setStopTrigger] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(false);

  // Ağaç verilerini yükle
  useEffect(() => {
    const agacData: AgacTuru[] = [
      { sira: 1, tur: "Kestane", normal: 20 },
      { sira: 2, tur: "Harnup", normal: 21 },
      { sira: 3, tur: "İncir (Kurutmalık)", normal: 16 },
      { sira: 4, tur: "İncir (Taze)", normal: 18 },
      { sira: 5, tur: "Armut", normal: 20, bodur: 220, yariBodur: 70 },
      { sira: 6, tur: "Elma", normal: 20, bodur: 220, yariBodur: 80 },
      { sira: 7, tur: "Trabzon Hurması", normal: 40 },
      { sira: 8, tur: "Kiraz", normal: 25, bodur: 50, yariBodur: 33 },
      { sira: 9, tur: "Ayva", normal: 24, bodur: 100 },
      { sira: 10, tur: "Nar", normal: 40 },
      { sira: 11, tur: "Erik", normal: 18, bodur: 100, yariBodur: 34 },
      { sira: 12, tur: "Kayısı", normal: 16, bodur: 50, yariBodur: 30 },
      { sira: 13, tur: "Zerdali", normal: 20, bodur: 50, yariBodur: 30 },
      { sira: 14, tur: "Muşmula", normal: 25 },
      { sira: 15, tur: "Yenidünya", normal: 21 },
      { sira: 16, tur: "Şeftali", normal: 40, bodur: 100, yariBodur: 67 },
      { sira: 17, tur: "Vişne", normal: 18, bodur: 60, yariBodur: 40 },
      { sira: 18, tur: "Ceviz", normal: 10 },
      { sira: 19, tur: "Dut", normal: 20 },
      { sira: 20, tur: "Üvez", normal: 40 },
      { sira: 21, tur: "Ünnap", normal: 40 },
      { sira: 22, tur: "Kızılcık", normal: 40 },
      { sira: 23, tur: "Limon", normal: 21 },
      { sira: 24, tur: "Portakal", normal: 27 },
      { sira: 25, tur: "Turunç", normal: 27 },
      { sira: 26, tur: "Altıntop", normal: 21 },
      { sira: 27, tur: "Mandarin", normal: 27 },
      { sira: 28, tur: "Avokado", normal: 21 },
      { sira: 29, tur: "Fındık (Düz)", normal: 30 },
      { sira: 30, tur: "Fındık (Eğimli)", normal: 50 },
      { sira: 31, tur: "Gül", normal: 300, yariBodur: 750 },
      { sira: 32, tur: "Çay", normal: 1800 },
      { sira: 33, tur: "Kivi", normal: 60 },
      { sira: 34, tur: "Böğürtlen", normal: 220 },
      { sira: 35, tur: "Ahududu", normal: 600 },
      { sira: 36, tur: "Likapa", normal: 260 },
      { sira: 37, tur: "Muz (Örtü altı)", normal: 170 },
      { sira: 38, tur: "Muz (Açıkta)", normal: 200 },
      { sira: 39, tur: "Kuşburnu", normal: 111 },
      { sira: 40, tur: "Mürver", normal: 85 },
      { sira: 41, tur: "Frenk Üzümü", normal: 220 },
      { sira: 42, tur: "Bektaşi Üzümü", normal: 220 },
      { sira: 43, tur: "Aronya", normal: 170 }
    ];
    
    setAgacVerileri(agacData);
  }, []);

  // Seçilen ağaç türünün mevcut tiplerini al
  const getMevcutTipler = (agacTuruId: string) => {
    const agac = agacVerileri.find(a => a.sira.toString() === agacTuruId);
    if (!agac) return [];
    
    const tipler = [];
    if (agac.normal) tipler.push({ value: 'normal', label: 'Normal' });
    if (agac.bodur) tipler.push({ value: 'bodur', label: 'Bodur' });
    if (agac.yariBodur) tipler.push({ value: 'yaribodur', label: 'Yarı Bodur' });
    
    return tipler;
  };

  // Ağaç ekle
  const agacEkle = () => {
    if (!secilenAgacTuru || !agacSayisi || agacSayisi <= 0) {
      alert('Lütfen ağaç türü ve geçerli bir sayı seçin');
      return;
    }

    const agacTuru = agacVerileri.find(a => a.sira.toString() === secilenAgacTuru);
    if (!agacTuru) return;

    let gerekliSayi = 0;
    switch (secilenAgacTipi) {
      case 'normal':
        gerekliSayi = agacTuru.normal || 0;
        break;
      case 'bodur':
        gerekliSayi = agacTuru.bodur || 0;
        break;
      case 'yaribodur':
        gerekliSayi = agacTuru.yariBodur || 0;
        break;
    }

    const yeniAgac: EklenenAgac = {
      turid: secilenAgacTuru,
      turAdi: agacTuru.tur,
      tipi: secilenAgacTipi,
      sayi: agacSayisi,
      gerekliAgacSayisi: gerekliSayi
    };

    setEklenenAgaclar([...eklenenAgaclar, yeniAgac]);
    setSecilenAgacTuru('');
    setAgacSayisi(0);
  };

  // Ağaç sil
  const agacSil = (index: number) => {
    const yeniListe = eklenenAgaclar.filter((_, i) => i !== index);
    setEklenenAgaclar(yeniListe);
  };

  // Harita fonksiyonları
  const startDrawingMode = (mode: 'tarla' | 'dikili') => {
    console.log('🎯 startDrawingMode çağrıldı:', { mode, isDrawing, currentDrawingMode: drawingMode });
    
    if (isDrawing) {
      // Eğer çizim modundaysa, önce dur, sonra yeni modu başlat
      console.log('⏹️ Önceki çizim durduruluyor...');
      setStopTrigger(prev => !prev);
      setIsDrawing(false);
    }
    
    // State'leri doğru sırayla güncelle
    console.log('🔄 Çizim modu ayarlanıyor:', mode);
    setDrawingMode(mode);
    setIsDrawing(true);
    
    // Çizim tetikleyicisini aktifleştir
    console.log('🚀 Çizim tetikleniyor...');
    setDrawingTrigger(prev => !prev);
  };

  const stopDrawingMode = () => {
    setStopTrigger(prev => !prev); // Toggle state to trigger stop
    setDrawingMode(null);
    setIsDrawing(false);
  };

  const handlePolygonComplete = (polygon: DrawnPolygon) => {
    console.log('✅ Polygon tamamlandı:', { mode: drawingMode, area: polygon.area });
    
    if (drawingMode === 'tarla') {
      setTarlaPolygon(polygon);
      setTarlaAlani(Math.round(polygon.area));
    } else if (drawingMode === 'dikili') {
      setDikiliPolygon(polygon);
      setDikiliAlan(Math.round(polygon.area));
    }
    
    // Çizim modunu sonlandırmak yerine, sadece mevcut çizimi temizle
    // Bu sayede kullanıcı aynı tipte yeni polygon çizebilir
    console.log('🔄 Yeni çizim için hazırlanıyor...');
    setIsDrawing(false);
  };

  const handlePolygonClear = () => {
    if (drawingMode === 'tarla') {
      setTarlaPolygon(null);
      setTarlaAlani(0);
    } else if (drawingMode === 'dikili') {
      setDikiliPolygon(null);
      setDikiliAlan(0);
    }
  };

  // Drawing state change handler'ı kaldırıldı çünkü infinite loop yaratıyordu

  const clearAllPolygons = () => {
    console.log('🗑️ clearAllPolygons çağrıldı, mevcut state:', { 
      isDrawing, 
      drawingMode, 
      tarlaPolygon: !!tarlaPolygon, 
      dikiliPolygon: !!dikiliPolygon 
    });
    
    // Önce çizimi durdur
    if (isDrawing) {
      console.log('⏹️ Aktif çizim durduruluyor...');
      setStopTrigger(prev => !prev);
      setIsDrawing(false);
    }
    
    // Temizleme işlemini gerçekleştir
    console.log('🧹 Tüm poligonlar temizleniyor...');
    setClearTrigger(prev => !prev);
    setTarlaPolygon(null);
    setDikiliPolygon(null);
    setTarlaAlani(0);
    setDikiliAlan(0);
    setDrawingMode(null);
    
    // Hesaplama sonucunu da temizle
    setHesaplamaSonucu(null);
  };

  // Tab değişikliği işleyicisi
  const handleTabChange = (tab: 'manuel' | 'harita') => {
    setActiveTab(tab);
    
    // Haritadan manuel'e geçişte alan bilgilerini koru
    if (tab === 'manuel') {
      // Haritadan alınan alan bilgileri zaten state'te mevcut
      // dikiliAlan ve tarlaAlani değerleri polygon'lardan geldiği için korunacak
    }
  };

  const formatArea = (area: number) => {
    return {
      m2: area.toLocaleString('tr-TR'),
      donum: (area / 1000).toFixed(2),
      hectare: (area / 10000).toFixed(4)
    };
  };

  // Hesaplama yap
  const hesaplamaYap = () => {
    if (dikiliAlan < 5000) {
      setHesaplamaSonucu({
        type: 'error',
        message: 'Dikili tarım arazilerinde bağ evi yapılabilmesi için dikili alan büyüklüğünün en az 0,5 hektar (5000 m²) olması gerekmektedir.'
      });
      return;
    }

    if (tarlaAlani <= 0) {
      setHesaplamaSonucu({
        type: 'error',
        message: 'Lütfen geçerli bir tarla alanı girin.'
      });
      return;
    }

    if (dikiliAlan > tarlaAlani) {
      setHesaplamaSonucu({
        type: 'error',
        message: 'Dikili alan, tarla alanından büyük olamaz.'
      });
      return;
    }

    // Tarla alanı üst limit kontrolü (20000 m² ve üstü için uyarı ama hesaplama devam eder)
    const tarlaAlaniUyarisi = tarlaAlani >= 20000;

    if (eklenenAgaclar.length === 0) {
      setHesaplamaSonucu({
        type: 'error',
        message: 'Lütfen en az bir ağaç türü ekleyin.'
      });
      return;
    }

    // Her ağaç türü için kapladığı alanı hesapla
    let toplamKaplanAlan = 0;
    const agacDetaylari: any[] = [];

    eklenenAgaclar.forEach(agac => {
      // Ağacın kapladığı alanı hesapla
      // Formül: Girilen ağaç sayısı ÷ (1000m²'de gerekli ağaç sayısı) = kaç 1000m²'lik alan kapladığı
      const kaplanAlanHektar = agac.sayi / agac.gerekliAgacSayisi; // 1000m²'lik birim sayısı
      const agacKaplanAlan = kaplanAlanHektar * 1000; // m² cinsinden
      toplamKaplanAlan += agacKaplanAlan;

      agacDetaylari.push({
        turAdi: agac.turAdi,
        sayi: agac.sayi,
        kaplanAlan: Math.round(agacKaplanAlan),
        binMetrekareBasinaGerekli: agac.gerekliAgacSayisi
      });
    });

    // Sonuç hesaplama - dikili alan yeterlilik kontrolü
    const dikiliAlanOrani = Math.min((toplamKaplanAlan / dikiliAlan) * 100, 100); // %100'ü geçmesin
    const MINIMUM_YETERLILIK_ORANI = 100; // %100 minimum ağaç yoğunluğu kriteri

    // Bağ evi yapabilmek için iki farklı kriter:
    // 1. Dikili alan ≥ 5000 m² + %100 ağaç yoğunluğu VEYA
    // 2. Tarla alanı ≥ 20000 m² (ağaç yoğunluğu ne olursa olsun)
    
    const agacYogunluguYeterli = dikiliAlanOrani >= MINIMUM_YETERLILIK_ORANI;
    const dikiliAlanYeterli = dikiliAlan >= 5000;
    const buyukTarlaAlani = tarlaAlani >= 20000;
    
    // Kriter 1: Dikili alan yeterli + ağaç yoğunluğu yeterli
    const kriter1SaglandiMi = dikiliAlanYeterli && agacYogunluguYeterli;
    
    // Kriter 2: Büyük tarla alanı
    const kriter2SaglandiMi = buyukTarlaAlani;
    
    // Genel uygunluk: herhangi bir kriter sağlanırsa uygun
    const bagEviIcinUygun = kriter1SaglandiMi || kriter2SaglandiMi;

    if (bagEviIcinUygun) {
      // Bağ evi için uygun
      let message = '';
      let type: 'success' | 'warning' = 'success';
      
      if (kriter1SaglandiMi && kriter2SaglandiMi) {
        // Her iki kriter de sağlanıyor
        message = 'Bağ Evi Kontrolü Başarılı (Her İki Kriter Sağlanıyor)';
        type = buyukTarlaAlani ? 'warning' : 'success'; // Büyük tarla alanı varsa warning
      } else if (kriter1SaglandiMi) {
        // Sadece dikili alan + ağaç yoğunluğu kriteri sağlanıyor
        message = 'Bağ Evi Kontrolü Başarılı (Dikili Alan + Ağaç Yoğunluğu)';
        type = 'success';
      } else if (kriter2SaglandiMi) {
        // Sadece büyük tarla alanı kriteri sağlanıyor
        message = 'Bağ Evi Kontrolü Başarılı (Büyük Tarla Alanı)';
        type = 'warning';
      }
      
      setHesaplamaSonucu({
        type: type,
        message: message,
        yeterlilik: {
          yeterli: true,
          oran: dikiliAlanOrani,
          minimumOran: MINIMUM_YETERLILIK_ORANI,
          kriter1: kriter1SaglandiMi,
          kriter2: kriter2SaglandiMi
        },
        alanBilgisi: {
          kaplanAlan: Math.round(toplamKaplanAlan),
          oran: Math.round(dikiliAlanOrani * 10) / 10,
          agacDetaylari: agacDetaylari
        },
        tarlaAlaniUyarisi: buyukTarlaAlani
      });
    } else {
      // Bağ evi için uygun değil - hiçbir kriter sağlanmıyor
      let message = 'Bağ Evi Kontrolü Başarısız';
      
      if (!dikiliAlanYeterli && !buyukTarlaAlani) {
        message = 'Bağ Evi Kontrolü Başarısız (Dikili Alan < 5000 m² ve Tarla Alanı < 20000 m²)';
      } else if (!agacYogunluguYeterli && !buyukTarlaAlani) {
        message = 'Bağ Evi Kontrolü Başarısız (Ağaç Yoğunluğu Yetersiz ve Tarla Alanı < 20000 m²)';
      } else if (!dikiliAlanYeterli && !agacYogunluguYeterli) {
        message = 'Bağ Evi Kontrolü Başarısız (Dikili Alan < 5000 m² ve Ağaç Yoğunluğu Yetersiz)';
      }
      
      setHesaplamaSonucu({
        type: 'error',
        message: message,
        yeterlilik: {
          yeterli: false,
          oran: dikiliAlanOrani,
          minimumOran: MINIMUM_YETERLILIK_ORANI,
          eksikOran: MINIMUM_YETERLILIK_ORANI - dikiliAlanOrani,
          kriter1: kriter1SaglandiMi,
          kriter2: kriter2SaglandiMi
        },
        alanBilgisi: {
          kaplanAlan: Math.round(toplamKaplanAlan),
          oran: Math.round(dikiliAlanOrani * 10) / 10,
          agacDetaylari: agacDetaylari
        },
        tarlaAlaniUyarisi: buyukTarlaAlani
      });
    }
  };

  // Başarılı sonuçta devam et
  const devamEt = () => {
    // Herhangi bir kriter sağlanıyorsa (success, warning veya kriter2 sağlanan error durumlarında) değer aktarımına izin ver
    if (hesaplamaSonucu?.yeterlilik?.yeterli === true || hesaplamaSonucu?.yeterlilik?.kriter2 === true) {
      onSuccess({
        dikiliAlanKontrolSonucu: hesaplamaSonucu,
        eklenenAgaclar: eklenenAgaclar,
        dikiliAlan: dikiliAlan,
        tarlaAlani: tarlaAlani
      });
      onClose();
    } else {
      // Hiçbir kriter sağlanmıyor - uyarı göster
      alert('Bağ evi kontrolü başarısız olduğu için değer aktarımı yapılamaz. Lütfen kriterleri sağlayın.');
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
        <KontrolTitle id="kontrol-title">🌳 Dikili Alan Kontrolü</KontrolTitle>
        <KontrolSubtitle>Bağ evi için dikili alan uygunluk kontrolü</KontrolSubtitle>
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
              <InfoBox>
                Dikili tarım arazilerinde bağ evi yapılabilmesi için arazi büyüklüğünün 
                en az 0,5 hektar (5000 m²) olması gerekmektedir.
              </InfoBox>
              
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
                    <div>✅ Tarla Alanı: {formatArea(tarlaPolygon.area).m2} m² ({formatArea(tarlaPolygon.area).donum} dönüm)</div>
                  )}
                  {dikiliPolygon && (
                    <div>✅ Dikili Alan: {formatArea(dikiliPolygon.area).m2} m² ({formatArea(dikiliPolygon.area).donum} dönüm)</div>
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
                  value={dikiliAlan || ''}
                  onChange={(e) => setDikiliAlan(Number(e.target.value))}
                  placeholder="Örn: 12000"
                  min="1"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="tarla-alani-input">Tarla Alanı (m²)</Label>
                <Input
                  id="tarla-alani-input"
                  type="number"
                  value={tarlaAlani || ''}
                  onChange={(e) => setTarlaAlani(Number(e.target.value))}
                  placeholder="Örn: 15000"
                  min="1"
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Toplam parsel alanı (dikili alan + diğer alanlar)
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
                    setSecilenAgacTuru(e.target.value);
                    setSecilenAgacTipi('normal');
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
                    onChange={(e) => setSecilenAgacTipi(e.target.value as any)}
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
                  onChange={(e) => setAgacSayisi(Number(e.target.value))}
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
                      <span>
                        <strong>{agac.turAdi}</strong> ({agac.tipi}) - {agac.sayi} adet
                      </span>
                      <Button onClick={() => agacSil(index)} $variant="danger">
                        🗑️
                      </Button>
                    </AgacItem>
                  ))}
                </AgacListesi>

                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <Button onClick={hesaplamaYap} $variant="primary">
                    🧮 Hesapla
                  </Button>
                  <Button onClick={() => setEklenenAgaclar([])} $variant="secondary">
                    🗑️ Temizle
                  </Button>
                </div>
              </FormSection>
            )}

            {hesaplamaSonucu && (
              <SonucPanel $type={hesaplamaSonucu.type}>
                <h4 style={{ margin: '0 0 12px 0' }}>{hesaplamaSonucu.message}</h4>
                
                {/* Tarla alanı uyarısı gösterimi */}
                {hesaplamaSonucu.tarlaAlaniUyarisi && (
                  <div style={{ 
                    padding: '12px', 
                    borderRadius: '6px', 
                    marginBottom: '12px',
                    background: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    color: '#856404'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                      ⚠️ Tarla Alanı Uyarısı
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      Tarla alanı 20.000 m² ve üzerindedir ({tarlaAlani.toLocaleString()} m²). 
                      Bu büyüklükteki araziler için ek inceleme gerekebilir.
                    </div>
                  </div>
                )}

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

                {hesaplamaSonucu.alanBilgisi && (
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
                  {((hesaplamaSonucu.type === 'success' || hesaplamaSonucu.type === 'warning') && hesaplamaSonucu.yeterlilik?.yeterli === true) || 
                   (hesaplamaSonucu.type === 'error' && hesaplamaSonucu.yeterlilik?.kriter2 === true) ? (
                    <div>
                      <p style={{ background: '#e8f5e8', padding: '8px', borderRadius: '4px', margin: '12px 0', fontSize: '14px' }}>
                        ✅ Bağ evi kontrolü başarılı. Arazide bağ evi yapılabilir.
                        {hesaplamaSonucu.tarlaAlaniUyarisi && (
                          <span style={{ display: 'block', marginTop: '4px', color: '#856404' }}>
                            ⚠️ Tarla alanı büyüklüğü nedeniyle ek inceleme gerekebilir.
                          </span>
                        )}
                      </p>
                      <Button onClick={devamEt} $variant={
                        hesaplamaSonucu.type === 'warning' ? 'warning' : 
                        hesaplamaSonucu.type === 'error' && hesaplamaSonucu.yeterlilik?.kriter2 ? 'warning' : 
                        'success'
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
              
              {/* Çizim modu seçimi */}
              <DrawingModeContainer>
                <div style={{ marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  Çizim Modu:
                </div>
                
                {/* Çizim durumu göstergesi */}
                {isDrawing && drawingMode && (
                  <div style={{ 
                    background: drawingMode === 'tarla' ? '#8B4513' : '#27ae60', 
                    color: 'white', 
                    padding: '6px 12px', 
                    borderRadius: '4px', 
                    marginBottom: '8px',
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
                  <DrawingModeButton
                    $active={drawingMode === 'tarla'}
                    $color="#8B4513"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('🟤 Tarla butonuna tıklandı');
                      startDrawingMode('tarla');
                    }}
                    disabled={false}
                  >
                    🟤 Tarla Alanı Çiz
                  </DrawingModeButton>
                  
                  <DrawingModeButton
                    $active={drawingMode === 'dikili'}
                    $color="#27ae60"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('🟢 Dikili butonuna tıklandı');
                      startDrawingMode('dikili');
                    }}
                    disabled={false}
                  >
                    🟢 Dikili Alan Çiz
                  </DrawingModeButton>
                  
                  {/* Çizimi durdur butonu - sadece çizim aktifken */}
                  {isDrawing && (
                    <Button onClick={stopDrawingMode} $variant="warning">
                      ⏹️ Çizimi Durdur
                    </Button>
                  )}
                  
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('🗑️ Temizle butonuna tıklandı');
                      clearAllPolygons();
                    }} 
                    $variant="secondary"
                  >
                    🗑️ Tümünü Temizle
                  </Button>
                </div>
              </DrawingModeContainer>
              
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
                  
                  {/* Polygon çizim component'i - her zaman render et */}
                  <PolygonDrawer
                    onPolygonComplete={handlePolygonComplete}
                    onPolygonClear={handlePolygonClear}
                    disabled={!drawingMode} // Sadece drawing mode yoksa disabled
                    polygonColor={drawingMode === 'tarla' ? '#8B4513' : '#27ae60'}
                    polygonName={drawingMode === 'tarla' ? 'Tarla Alanı' : 'Dikili Alan'}
                    hideControls={true}
                    externalDrawingTrigger={drawingTrigger}
                    externalStopTrigger={stopTrigger}
                    externalClearTrigger={clearTrigger}
                    existingPolygons={[
                      ...(tarlaPolygon && drawingMode !== 'tarla' ? [{
                        polygon: tarlaPolygon,
                        color: '#8B4513',
                        name: 'Tarla Alanı'
                      }] : []),
                      ...(dikiliPolygon && drawingMode !== 'dikili' ? [{
                        polygon: dikiliPolygon,
                        color: '#27ae60',
                        name: 'Dikili Alan'
                      }] : [])
                    ]}
                  />
                </MapContainer>
              </MapWrapper>
              
              {/* Alan gösterimi */}
              <AreaDisplayContainer>
                <AreaDisplayBox $color="#8B4513">
                  <AreaLabel>🟤 Tarla Alanı</AreaLabel>
                  <AreaValue>
                    {tarlaPolygon ? formatArea(tarlaPolygon.area).m2 : '0'} m²
                  </AreaValue>
                  <AreaSubtext>
                    {tarlaPolygon ? `${formatArea(tarlaPolygon.area).donum} dönüm` : 'Çizilmedi'}
                  </AreaSubtext>
                </AreaDisplayBox>
                
                <AreaDisplayBox $color="#27ae60">
                  <AreaLabel>🟢 Dikili Alan</AreaLabel>
                  <AreaValue>
                    {dikiliPolygon ? formatArea(dikiliPolygon.area).m2 : '0'} m²
                  </AreaValue>
                  <AreaSubtext>
                    {dikiliPolygon ? `${formatArea(dikiliPolygon.area).donum} dönüm` : 'Çizilmedi'}
                  </AreaSubtext>
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
              
              {/* Manuel kontrole geçiş butonu */}
              {tarlaPolygon && dikiliPolygon && (
                <Button 
                  onClick={() => handleTabChange('manuel')} 
                  $variant="primary"
                  style={{ width: '100%' }}
                >
                  📝 Ağaç Bilgilerini Eklemek İçin Manuel Kontrole Geç
                </Button>
              )}
            </FormSection>
          </>
        )}
      </KontrolContent>
    </KontrolPanel>
  );
};

export default DikiliAlanKontrol;
