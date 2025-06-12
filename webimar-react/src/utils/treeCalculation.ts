// Tree calculation utility functions
// Extracted from DikiliAlanKontrol.tsx for better separation of concerns

export interface AgacVerisi {
  sira: number;
  tur: string;
  normal?: number;
  bodur?: number;
  yariBodur?: number;
}

export interface EklenenAgac {
  turid: string;
  turAdi: string;
  tipi: 'normal' | 'bodur' | 'yaribodur';
  sayi: number;
  gerekliAgacSayisi: number;
}

export interface AgacDetay {
  turAdi: string;
  sayi: number;
  kaplanAlan: number;
  binMetrekareBasinaGerekli: number;
}

export interface YeterlilikSonucu {
  yeterli: boolean;
  oran: number;
  minimumOran: number;
  kriter1?: boolean;
  kriter2?: boolean;
  eksikOran?: number;
  dikiliAlanYeterli?: boolean;
  agacYogTlugu?: number;
}

export interface HesaplamaSonucu {
  type: 'success' | 'error';
  message: string;
  yeterlilik: YeterlilikSonucu;
  alanBilgisi?: {
    kaplanAlan: number;
    oran: number;
    agacDetaylari: AgacDetay[];
  };
  details?: Array<{
    turAdi: string;
    girilenSayi: number;
    gerekliSayi: number;
  }>;
}

/**
 * Default tree data for vineyard calculations
 */
export const getDefaultTreeData = (): AgacVerisi[] => {
  return [
    { sira: 1, tur: "Üzüm/Asma", normal: 550 },
    { sira: 2, tur: "Elma", normal: 185, bodur: 450, yariBodur: 280 },
    { sira: 3, tur: "Armut", normal: 160, bodur: 280, yariBodur: 220 },
    { sira: 4, tur: "Ayva", normal: 135 },
    { sira: 5, tur: "Kayısı", normal: 130 },
    { sira: 6, tur: "Şeftali", normal: 130 },
    { sira: 7, tur: "Vişne", normal: 280 },
    { sira: 8, tur: "Kiraz", normal: 160 },
    { sira: 9, tur: "Erik", normal: 220 },
    { sira: 10, tur: "İncir", normal: 100 },
    { sira: 11, tur: "Nar", normal: 280 },
    { sira: 12, tur: "Ceviz", normal: 65 },
    { sira: 13, tur: "Badem", normal: 130 },
    { sira: 14, tur: "Fındık", normal: 1000 },
    { sira: 15, tur: "Antep Fıstığı", normal: 100 },
    { sira: 16, tur: "Kestane", normal: 100 },
    { sira: 17, tur: "Zeytin", normal: 110 },
    { sira: 18, tur: "Turunçgil (Portakal)", normal: 160, bodur: 330, yariBodur: 220 },
    { sira: 19, tur: "Turunçgil (Mandalina)", normal: 280, bodur: 660, yariBodur: 400 },
    { sira: 20, tur: "Turunçgil (Limon)", normal: 220, bodur: 440, yariBodur: 330 },
    { sira: 21, tur: "Turunçgil (Greyfurt)", normal: 135, bodur: 280, yariBodur: 200 },
    { sira: 22, tur: "Avokado", normal: 110 },
    { sira: 23, tur: "Muz", normal: 1650 },
    { sira: 24, tur: "Hurma", normal: 100 },
    { sira: 25, tur: "Kivi", normal: 1000 },
    { sira: 26, tur: "Trabzon Hurması", normal: 220 },
    { sira: 27, tur: "Muşmula", normal: 220 },
    { sira: 28, tur: "Yenidünya", normal: 220 },
    { sira: 29, tur: "Dut", normal: 160 },
    { sira: 30, tur: "Kızılcık", normal: 330 },
    { sira: 31, tur: "Kuşburnu", normal: 660 },
    { sira: 32, tur: "Alıç", normal: 440 },
    { sira: 33, tur: "Çilek", normal: 6600 },
    { sira: 34, tur: "Ahudut", normal: 1320 },
    { sira: 35, tur: "Böğürtlen", normal: 1980 },
    { sira: 36, tur: "Frambuaz", normal: 1650 },
    { sira: 37, tur: "Bektaşi Üzümü", normal: 220 },
    { sira: 38, tur: "Frenk Üzümü", normal: 220 },
    { sira: 39, tur: "Mürver", normal: 85 },
    { sira: 40, tur: "Aronya", normal: 170 }
  ];
};

/**
 * Get available tree types for a specific tree variety
 */
export const getAvailableTreeTypes = (agacTuruId: string, agacVerileri: AgacVerisi[]) => {
  const agac = agacVerileri.find(a => a.sira.toString() === agacTuruId);
  if (!agac) return [];
  
  const tipler = [];
  if (agac.normal) tipler.push({ value: 'normal', label: 'Normal' });
  if (agac.bodur) tipler.push({ value: 'bodur', label: 'Bodur' });
  if (agac.yariBodur) tipler.push({ value: 'yaribodur', label: 'Yarı Bodur' });
  
  return tipler;
};

/**
 * Calculate tree coverage area for a list of trees
 */
export const calculateTreeCoverage = (eklenenAgaclar: EklenenAgac[], dikiliAlan: number): {
  toplamKaplanAlan: number;
  agacDetaylari: AgacDetay[];
  yogunlukOrani: number;
} => {
  let toplamKaplanAlan = 0;
  const agacDetaylari: AgacDetay[] = [];

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

  // Yoğunluk oranı hesaplama
  const yogunlukOrani = eklenenAgaclar.length > 0 ? 
    Math.min((toplamKaplanAlan / dikiliAlan) * 100, 100) : 0; // Ağaç yoksa %0

  return {
    toplamKaplanAlan,
    agacDetaylari,
    yogunlukOrani
  };
};

/**
 * Validate vineyard eligibility based on government regulations
 */
export const validateVineyardEligibility = (
  dikiliAlan: number,
  tarlaAlani: number,
  eklenenAgaclar: EklenenAgac[],
  araziVasfi?: string
): YeterlilikSonucu => {
  const MINIMUM_YETERLILIK_ORANI = 100; // %100 minimum ağaç yoğunluğu kriteri
  
  // Tree coverage calculation
  const { yogunlukOrani } = calculateTreeCoverage(eklenenAgaclar, dikiliAlan);
  
  // Bağ evi kriterleri (Backend API ile uyumlu):
  // 1. Dikili alan ≥ 5000 m² (yeterli - ağaç yoğunluğu şartı YOK)
  // 2. Tarla alanı ≥ 20000 m² (tek başına yeterli)
  
  const dikiliAlanYeterli = dikiliAlan >= 5000;
  const buyukTarlaAlani = tarlaAlani >= 20000;
  
  // "Dikili vasıflı" arazi tipi için özel kontrol
  if (araziVasfi === 'Dikili vasıflı') {
    // Dikili vasıflı arazide: 
    // - Sadece dikili alan >= 5000 m² şartı yeterli
    // - Ağaç yoğunluğu şartı ARANIYOR DEĞİL (backend kuralları ile uyumlu)
    
    const kriter1SaglandiMi = dikiliAlanYeterli; // Sadece dikili alan şartı
    const yeterli = kriter1SaglandiMi;
    
    return {
      yeterli,
      oran: yogunlukOrani,
      minimumOran: 0, // "Dikili vasıflı" için ağaç yoğunluğu şartı yok
      kriter1: kriter1SaglandiMi,
      kriter2: false, // Dikili vasıflı arazide kriter2 geçerli değil
      eksikOran: undefined, // Ağaç yoğunluğu şartı olmadığı için eksik oran yok
      dikiliAlanYeterli,
      agacYogTlugu: eklenenAgaclar.length > 0 ? yogunlukOrani : undefined
    };
  }
  
  // "Tarla + herhangi bir dikili vasıflı" için normal kontrol
  // Kriter 1: Dikili alan yeterli (ağaç yoğunluğu şartı olmadan)
  const kriter1SaglandiMi = dikiliAlanYeterli;
  
  // Kriter 2: Büyük tarla alanı
  const kriter2SaglandiMi = buyukTarlaAlani;
  
  const yeterli = kriter1SaglandiMi || kriter2SaglandiMi;
  
  return {
    yeterli,
    oran: yogunlukOrani,
    minimumOran: MINIMUM_YETERLILIK_ORANI,
    kriter1: kriter1SaglandiMi,
    kriter2: kriter2SaglandiMi,
    eksikOran: yeterli ? undefined : (MINIMUM_YETERLILIK_ORANI - yogunlukOrani)
  };
};

/**
 * Calculate detailed vineyard result with message and validation
 */
export const calculateVineyardResult = (
  dikiliAlan: number,
  tarlaAlani: number,
  eklenenAgaclar: EklenenAgac[],
  araziVasfi?: string
): HesaplamaSonucu => {
  // Input validation
  if (dikiliAlan <= 0) {
    return {
      type: 'error',
      message: 'Lütfen geçerli bir dikili alan girin.',
      yeterlilik: {
        yeterli: false,
        oran: 0,
        minimumOran: 100
      }
    };
  }

  // "Dikili vasıflı" arazi tipi için tarla alanı kontrolü yapma
  if (araziVasfi !== 'Dikili vasıflı' && tarlaAlani <= 0) {
    return {
      type: 'error',
      message: 'Lütfen geçerli bir tarla alanı girin. Tarla alanı, dikili alan dahil toplam parsel büyüklüğüdür.',
      yeterlilik: {
        yeterli: false,
        oran: 0,
        minimumOran: 100
      }
    };
  }

  // Kriter 2 kontrolü: Tarla alanı >= 20000 m² ise ağaç kontrolü yapmadan devam et
  const kriter2SaglaniyorMu = tarlaAlani >= 20000;
  
  if (!kriter2SaglaniyorMu) {
    // Kriter 2 sağlanmıyorsa, Kriter 1 için gerekli kontrolleri yap
    if (dikiliAlan < 5000) {
      return {
        type: 'error',
        message: 'Dikili tarım arazilerinde bağ evi yapılabilmesi için dikili alan büyüklüğünün en az 0,5 hektar (5000 m²) olması gerekmektedir.',
        yeterlilik: {
          yeterli: false,
          oran: 0,
          minimumOran: 100
        }
      };
    }

    if (eklenenAgaclar.length === 0) {
      return {
        type: 'error',
        message: 'Lütfen en az bir ağaç türü ekleyin.',
        yeterlilik: {
          yeterli: false,
          oran: 0,
          minimumOran: 100
        }
      };
    }
  }

  // Calculate tree coverage and eligibility
  const coverage = calculateTreeCoverage(eklenenAgaclar, dikiliAlan);
  const yeterlilik = validateVineyardEligibility(dikiliAlan, tarlaAlani, eklenenAgaclar, araziVasfi);

  let message = '';
  let type: 'success' | 'error' = 'error';

  if (yeterlilik.yeterli) {
    if (araziVasfi === 'Dikili vasıflı' && yeterlilik.kriter1) {
      // Dikili vasıflı arazi için özel mesaj
      message = 'Bağ Evi Kontrolü Başarılı (Dikili Vasıflı Arazi - Dikili Alan ≥ 5000 m²)';
      type = 'success';
    } else if (yeterlilik.kriter1) {
      // Normal dikili alan kriteri sağlanıyor
      message = 'Bağ Evi Kontrolü Başarılı (Dikili Alan ≥ 5000 m²)';
      type = 'success';
    } else if (yeterlilik.kriter2) {
      // Büyük tarla alanı kriteri sağlanıyor
      message = eklenenAgaclar.length > 0 ? 
        'Bağ Evi Kontrolü Başarılı (Büyük Tarla Alanı - Ağaç hesabı bilgi amaçlı)' :
        'Bağ Evi Kontrolü Başarılı (Büyük Tarla Alanı ≥ 20000 m²)';
      type = 'success';
    }
  } else {
    // Detaylı hata mesajları
    const dikiliAlanYeterli = dikiliAlan >= 5000;
    const buyukTarlaAlani = tarlaAlani >= 20000;

    if (araziVasfi === 'Dikili vasıflı') {
      // Dikili vasıflı arazi için sadece dikili alan kontrolü
      if (!dikiliAlanYeterli) {
        message = 'Bağ Evi Kontrolü Başarısız (Dikili Vasıflı Arazi - Dikili Alan < 5000 m²)';
      } else {
        // Bu durum teorik olarak olmamalı çünkü dikili alan yeterli ise başarılı olmalı
        message = 'Bağ Evi Kontrolü Başarısız (Dikili Vasıflı Arazi)';
      }
    } else if (!dikiliAlanYeterli && !buyukTarlaAlani) {
      message = 'Bağ Evi Kontrolü Başarısız (Dikili Alan < 5000 m² ve Tarla Alanı < 20000 m²)';
    } else {
      message = 'Bağ Evi Kontrolü Başarısız';
    }
  }

  return {
    type,
    message,
    yeterlilik,
    // Ağaç bilgilerini sadece büyük tarla alanı durumunda göster
    alanBilgisi: (eklenenAgaclar.length > 0 && yeterlilik.kriter2 && !yeterlilik.kriter1) ? {
      kaplanAlan: Math.round(coverage.toplamKaplanAlan),
      oran: parseFloat(coverage.yogunlukOrani.toFixed(1)),
      agacDetaylari: coverage.agacDetaylari
    } : undefined
  };
};

/**
 * Format area values for display
 */
export const formatAreaDisplay = (areaM2: number): { m2: string; donum: string } => {
  return {
    m2: areaM2.toLocaleString(),
    donum: (areaM2 / 1000).toFixed(1)
  };
};
