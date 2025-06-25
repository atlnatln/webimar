import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { checkKMLLocation, KMLCheckResult } from '../utils/kmlChecker';

interface LocationValidationState {
  selectedPoint: { lat: number; lng: number } | null;
  kmlCheckResult: KMLCheckResult | null;
  isValidating: boolean;
  error: string | null;
  canProceedWithForm: boolean;
  suTahsisBelgesi: boolean | null;
}

interface LocationValidationContextType {
  state: LocationValidationState;
  setSelectedPoint: (point: { lat: number; lng: number } | null) => void;
  validateLocation: (point: { lat: number; lng: number }) => Promise<void>;
  setSuTahsisBelgesi: (value: boolean) => void;
  clearValidation: () => void;
  canUserProceedWithCalculation: (calculationType?: string) => boolean;
}

const LocationValidationContext = createContext<LocationValidationContextType | undefined>(undefined);

const initialState: LocationValidationState = {
  selectedPoint: null,
  kmlCheckResult: null,
  isValidating: false,
  error: null,
  canProceedWithForm: false,
  suTahsisBelgesi: null
};

export const LocationValidationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LocationValidationState>(initialState);

  const setSelectedPoint = useCallback((point: { lat: number; lng: number } | null) => {
    setState(prev => ({
      ...prev,
      selectedPoint: point,
      kmlCheckResult: null,
      error: null,
      canProceedWithForm: false,
      suTahsisBelgesi: null
    }));
  }, []);

  const validateLocation = useCallback(async (point: { lat: number; lng: number }) => {
    setState(prev => ({ ...prev, isValidating: true, error: null }));
    
    try {
      console.log('🔍 LocationValidation: Checking point', point);
      const result = await checkKMLLocation(point);
      console.log('✅ LocationValidation: KML check result', result);
      
      setState(prev => ({
        ...prev,
        kmlCheckResult: result,
        isValidating: false,
        canProceedWithForm: result.izmirinIcinde
      }));
    } catch (error) {
      console.error('❌ LocationValidation: KML check failed', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Konum doğrulama hatası',
        isValidating: false,
        canProceedWithForm: false
      }));
    }
  }, []);

  const setSuTahsisBelgesi = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, suTahsisBelgesi: value }));
  }, []);

  const clearValidation = useCallback(() => {
    setState(initialState);
  }, []);

  const canUserProceedWithCalculation = useCallback((calculationType?: string) => {
    const { kmlCheckResult, suTahsisBelgesi } = state;
    
    // Konum seçilmemişse false
    if (!kmlCheckResult) {
      return false;
    }
    
    // İzmir dışındaysa false
    if (!kmlCheckResult.izmirinIcinde) {
      return false;
    }
    
    // Su tahsis belgesi gereken tesisler
    const waterDependentFacilities = [
      'sut-sigirciligi',
      'besi-sigirciligi',
      'agil-kucukbas',
      'yumurta-tavukciligi',
      'et-tavukciligi',
      'hindi-yetistiriciligi',
      'kaz-yetistiriciligi',
      'serbest-dolasan-tavukculuk',
      'kanatliyem-uretimi',
      'tarimsal-urun-yikama'
    ];

    // Su tahsis belgesi gerekiyorsa ve kullanıcı cevaplamadıysa false
    if (calculationType && 
        waterDependentFacilities.includes(calculationType) && 
        kmlCheckResult.kapaliSuHavzasiIcinde &&
        suTahsisBelgesi === null) {
      return false;
    }
    
    // Su tahsis belgesi gerekiyorsa ve yoksa false
    if (calculationType && 
        waterDependentFacilities.includes(calculationType) && 
        kmlCheckResult.kapaliSuHavzasiIcinde &&
        suTahsisBelgesi === false) {
      return false;
    }
    
    return true;
  }, [state]);

  // Auto validate when point changes
  useEffect(() => {
    if (state.selectedPoint && !state.kmlCheckResult && !state.isValidating) {
      validateLocation(state.selectedPoint);
    }
  }, [state.selectedPoint, state.kmlCheckResult, state.isValidating, validateLocation]);

  const contextValue: LocationValidationContextType = {
    state,
    setSelectedPoint,
    validateLocation,
    setSuTahsisBelgesi,
    clearValidation,
    canUserProceedWithCalculation
  };

  return (
    <LocationValidationContext.Provider value={contextValue}>
      {children}
    </LocationValidationContext.Provider>
  );
};

export const useLocationValidation = () => {
  const context = useContext(LocationValidationContext);
  if (context === undefined) {
    throw new Error('useLocationValidation must be used within a LocationValidationProvider');
  }
  return context;
};
