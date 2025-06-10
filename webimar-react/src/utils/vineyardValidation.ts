// Validation utilities for vineyard calculations
// Extracted from DikiliAlanKontrol.tsx for better separation of concerns

import { EklenenAgac } from './treeCalculation';
import { AreaValidationResult } from './areaCalculation';

export interface VineyardValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface VineyardValidationResult {
  isValid: boolean;
  errors: VineyardValidationError[];
  warnings: VineyardValidationError[];
  canProceed: boolean;
}

/**
 * Validate tree input data
 */
export const validateTreeInput = (
  selectedTreeType: string,
  treeCount: number,
  availableTreeData: any[]
): AreaValidationResult => {
  if (!selectedTreeType) {
    return {
      isValid: false,
      error: 'Lütfen bir ağaç türü seçin.'
    };
  }

  if (!treeCount || treeCount <= 0) {
    return {
      isValid: false,
      error: 'Ağaç sayısı pozitif bir değer olmalıdır.'
    };
  }

  const treeData = availableTreeData.find(a => a.sira.toString() === selectedTreeType);
  if (!treeData) {
    return {
      isValid: false,
      error: 'Seçilen ağaç türü bulunamadı.'
    };
  }

  if (treeCount > 50000) {
    return {
      isValid: false,
      error: 'Ağaç sayısı çok yüksek görünüyor. Lütfen değeri kontrol edin.'
    };
  }

  return { isValid: true };
};

/**
 * Validate complete vineyard data
 */
export const validateVineyardData = (
  dikiliAlan: number,
  tarlaAlani: number,
  eklenenAgaclar: EklenenAgac[]
): VineyardValidationResult => {
  const errors: VineyardValidationError[] = [];
  const warnings: VineyardValidationError[] = [];

  // Dikili alan validation
  if (dikiliAlan <= 0) {
    errors.push({
      field: 'dikiliAlan',
      message: 'Dikili alan pozitif bir değer olmalıdır.',
      severity: 'error'
    });
  } else if (dikiliAlan < 3000) {
    warnings.push({
      field: 'dikiliAlan',
      message: 'Dikili alan çok küçük. Bağ evi için minimum 5000 m² önerilir.',
      severity: 'warning'
    });
  }

  // Tarla alanı validation
  if (tarlaAlani <= 0) {
    errors.push({
      field: 'tarlaAlani',
      message: 'Tarla alanı pozitif bir değer olmalıdır.',
      severity: 'error'
    });
  } else if (tarlaAlani < dikiliAlan) {
    errors.push({
      field: 'tarlaAlani',
      message: 'Tarla alanı dikili alandan küçük olamaz.',
      severity: 'error'
    });
  } else if (tarlaAlani < 10000) {
    warnings.push({
      field: 'tarlaAlani',
      message: 'Tarla alanı küçük. Büyük tarla kriteri için minimum 20000 m² gerekir.',
      severity: 'warning'
    });
  }

  // Tree data validation
  if (dikiliAlan >= 5000 && tarlaAlani < 20000 && eklenenAgaclar.length === 0) {
    errors.push({
      field: 'agaclar',
      message: 'Bu alan büyüklüğü için ağaç bilgileri gereklidir.',
      severity: 'error'
    });
  }

  // Area ratio validation
  if (dikiliAlan > 0 && tarlaAlani > 0) {
    const dikiliOrani = (dikiliAlan / tarlaAlani) * 100;
    if (dikiliOrani > 90) {
      warnings.push({
        field: 'alanOrani',
        message: 'Dikili alan oranı çok yüksek (%' + dikiliOrani.toFixed(1) + '). Lütfen değerleri kontrol edin.',
        severity: 'warning'
      });
    }
  }

  // Tree coverage validation
  if (eklenenAgaclar.length > 0) {
    const totalTrees = eklenenAgaclar.reduce((sum, agac) => sum + agac.sayi, 0);
    if (totalTrees < 100 && dikiliAlan > 5000) {
      warnings.push({
        field: 'agacSayisi',
        message: 'Toplam ağaç sayısı bu alan için az görünüyor.',
        severity: 'warning'
      });
    }
  }

  const isValid = errors.length === 0;
  const canProceed = isValid || (tarlaAlani >= 20000); // Büyük tarla kriteri varsa devam edilebilir

  return {
    isValid,
    errors,
    warnings,
    canProceed
  };
};

/**
 * Validate tree type selection
 */
export const validateTreeTypeSelection = (
  treeTypeId: string,
  treeSubType: string,
  availableTreeData: any[]
): AreaValidationResult => {
  const treeData = availableTreeData.find(a => a.sira.toString() === treeTypeId);
  
  if (!treeData) {
    return {
      isValid: false,
      error: 'Ağaç türü bulunamadı.'
    };
  }

  // Check if selected subtype is available for this tree
  if (treeSubType === 'bodur' && !treeData.bodur) {
    return {
      isValid: false,
      error: 'Bu ağaç türü için bodur tipi mevcut değil.'
    };
  }

  if (treeSubType === 'yaribodur' && !treeData.yariBodur) {
    return {
      isValid: false,
      error: 'Bu ağaç türü için yarı bodur tipi mevcut değil.'
    };
  }

  return { isValid: true };
};

/**
 * Check for duplicate tree entries
 */
export const checkDuplicateTreeEntries = (
  eklenenAgaclar: EklenenAgac[],
  newTreeType: string,
  newTreeSubType: string
): boolean => {
  return eklenenAgaclar.some(agac => 
    agac.turid === newTreeType && agac.tipi === newTreeSubType
  );
};

/**
 * Validate tree count for specific tree type
 */
export const validateTreeCount = (
  treeCount: number,
  treeType: string,
  dikiliAlan: number
): AreaValidationResult => {
  if (treeCount <= 0) {
    return {
      isValid: false,
      error: 'Ağaç sayısı pozitif olmalıdır.'
    };
  }

  // Check if tree count is reasonable for the area
  const treesPerM2 = treeCount / dikiliAlan;
  
  if (treesPerM2 > 10) {
    return {
      isValid: false,
      error: 'Ağaç sayısı alan için çok yüksek görünüyor.'
    };
  }

  if (treesPerM2 < 0.01) {
    return {
      isValid: false,
      error: 'Ağaç sayısı alan için çok düşük görünüyor.'
    };
  }

  return { isValid: true };
};

/**
 * Generate validation summary message
 */
export const generateValidationSummary = (validationResult: VineyardValidationResult): string => {
  const { isValid, errors, warnings, canProceed } = validationResult;

  if (isValid) {
    return '✅ Tüm veriler geçerli.';
  }

  let summary = '';
  
  if (errors.length > 0) {
    summary += '❌ Hatalar:\n';
    errors.forEach(error => {
      summary += `• ${error.message}\n`;
    });
  }

  if (warnings.length > 0) {
    summary += '\n⚠️ Uyarılar:\n';
    warnings.forEach(warning => {
      summary += `• ${warning.message}\n`;
    });
  }

  if (canProceed && !isValid) {
    summary += '\n💡 Not: Büyük tarla kriteri nedeniyle hesaplama yapılabilir.';
  }

  return summary.trim();
};
