import { useState, useCallback } from 'react';
import { Coordinate } from '../components/Map/MapComponent';
import { checkCoordinate, CoordinateCheckResponse } from '../services/apiService';

interface CoordinateValidationResult {
  inIzmir: boolean;
  inClosedArea: boolean;
  inBigPlain: boolean;
  plainName?: string;
  loading: boolean;
  error?: string;
  apiResponse?: CoordinateCheckResponse;
}

export const useCoordinateValidation = () => {
  const [validationResult, setValidationResult] = useState<CoordinateValidationResult>({
    inIzmir: false,
    inClosedArea: false,
    inBigPlain: false,
    loading: false
  });

  const validateCoordinate = useCallback(async (coordinate: Coordinate) => {
    setValidationResult(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const data = await checkCoordinate(coordinate.lat, coordinate.lng);
      
      setValidationResult({
        inIzmir: data.in_izmir || false,
        inClosedArea: data.in_yas_kapali_alan || false,
        inBigPlain: data.inside_polygons && data.inside_polygons.length > 0,
        plainName: data.inside_polygons?.[0],
        loading: false,
        apiResponse: data
      });

    } catch (error) {
      console.error('Koordinat doğrulama hatası:', error);
      setValidationResult(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      }));
    }
  }, []);

  return {
    validationResult,
    validateCoordinate
  };
};

export const useMapState = () => {
  const [selectedCoordinate, setSelectedCoordinate] = useState<Coordinate | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([38.4237, 27.1428]);
  const [mapZoom, setMapZoom] = useState(10);

  const updateMapView = useCallback((center: [number, number], zoom?: number) => {
    setMapCenter(center);
    if (zoom !== undefined) {
      setMapZoom(zoom);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCoordinate(null);
  }, []);

  return {
    selectedCoordinate,
    setSelectedCoordinate,
    mapCenter,
    mapZoom,
    updateMapView,
    clearSelection
  };
};
