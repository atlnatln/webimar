// API Service for Webimar Calculation Endpoints
import axios from 'axios';
import { CalculationResult, StructureType, STRUCTURE_TYPE_TO_ID } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Common calculation data interface
export interface CalculationInput {
  alan_m2: number;
  arazi_vasfi: string;
  additional_data?: Record<string, any>;
}

// Yapı türü interface'i
export interface YapiTuru {
  id: number;
  ad: string;
}

// Arazi tipi interface'i  
export interface AraziTipi {
  id: number;
  ad: string;
}

// Health check
export const healthCheck = async (): Promise<CalculationResult> => {
  try {
    const response = await apiClient.get('/health/');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Health check failed');
  }
};

// Generic calculation function with ID mapping support
export const calculateStructure = async (
  structureType: StructureType,
  data: CalculationInput
): Promise<CalculationResult> => {
  try {
    // Backend ID'sini al
    const structureId = STRUCTURE_TYPE_TO_ID[structureType];
    if (!structureId) {
      throw new Error(`Unsupported structure type: ${structureType}`);
    }

    // Endpoint'e structureType kullan (URL için)
    const response = await apiClient.post(`/calculations/${structureType}/`, {
      ...data,
      yapi_turu_id: structureId // Backend için ID ekle
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || `${structureType} calculation failed`);
  }
};

// Dynamic calculation functions generator - backend constants.py ile uyumlu 28 yapı türü
const generateCalculationFunctions = () => {
  const funcs: Record<string, (data: CalculationInput) => Promise<CalculationResult>> = {};
  
  // Her StructureType için dinamik olarak fonksiyon oluştur
  Object.keys(STRUCTURE_TYPE_TO_ID).forEach((structureType) => {
    const key = structureType.replace(/-/g, '_'); // Function name için - yerine _ kullan
    funcs[key] = (data: CalculationInput) => calculateStructure(structureType as StructureType, data);
  });
  
  return funcs;
};

// 28 yapı türü için calculation functions
export const calculations = generateCalculationFunctions();

// Constants API methods
export const getAraziTipleri = async (): Promise<AraziTipi[]> => {
  try {
    const response = await apiClient.get('/calculations/arazi-tipleri/');
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Arazi tipleri çekilemedi');
    }
  } catch (error) {
    console.error('Arazi tipleri API hatası:', error);
    throw error;
  }
};

export const getYapiTurleri = async (): Promise<YapiTuru[]> => {
  try {
    const response = await apiClient.get('/calculations/yapi-turleri/');
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Yapı türleri çekilemedi');
    }
  } catch (error) {
    console.error('Yapı türleri API hatası:', error);
    throw error;
  }
};

// Named export for calculations and other functions
export const apiService = {
  calculations,
  healthCheck,
  calculateStructure,
  getAraziTipleri,
  getYapiTurleri
};

// Global debug access in development
if (process.env.NODE_ENV === 'development') {
  (window as any).apiService = apiService;
  (window as any).STRUCTURE_TYPE_TO_ID = STRUCTURE_TYPE_TO_ID;
}

export default apiClient;
