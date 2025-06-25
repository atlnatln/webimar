import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// CSV'den gelen konum verisi için interface
interface LocationData {
  ilce: string;
  tur: 'İLÇE' | 'MAHALLE';
  ad: string;
  dosya: string;
  longitude: number;
  latitude: number;
}

// Türkçe karakterleri normalize etme fonksiyonu
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Unicode normalize
    .replace(/[\u0300-\u036f]/g, '') // Aksanları kaldır
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .trim();
};

// Komponent props
interface LocationAutocompleteProps {
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
}

// Styled components
const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #999;
    transition: color 0.2s ease;
  }
  
  &:focus::placeholder {
    color: #bbb;
  }
  
  &:disabled {
    background-color: #f5f7fa;
    cursor: not-allowed;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingSpinner = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid #e0e6ed;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: translateY(-50%) rotate(360deg); }
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e6ed;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 0;
  padding: 0;
  list-style: none;
`;

const SuggestionItem = styled.li<{ $isHighlighted: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
  background-color: ${props => props.$isHighlighted ? '#f8f9fa' : 'white'};
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const LocationLabel = styled.div`
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
`;

const LocationSubtext = styled.div`
  font-size: 12px;
  color: #666;
`;

const LocationBadge = styled.span<{ $type: 'İLÇE' | 'MAHALLE' }>`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  margin-right: 8px;
  background-color: ${props => props.$type === 'İLÇE' ? '#3498db' : '#27ae60'};
  color: white;
`;

// CSV parser fonksiyonu
const parseCSV = (csvText: string): LocationData[] => {
  const lines = csvText.trim().split('\n');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      ilce: values[0],
      tur: values[1] as 'İLÇE' | 'MAHALLE',
      ad: values[2],
      dosya: values[3],
      longitude: parseFloat(values[4]),
      latitude: parseFloat(values[5])
    };
  }).filter(item => item.longitude && item.latitude); // Geçersiz koordinatları filtrele
};

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onLocationSelect,
  placeholder = "İlçe veya mahalle adı yazın... (örn: Karşıyaka, ödemiş süleymanlar)"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [allLocations, setAllLocations] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false); // Konum seçimi durumu
  const inputRef = useRef<HTMLInputElement>(null);

  // CSV dosyasını yükle
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const response = await fetch('/merkez_koordinatlar.csv');
        const csvText = await response.text();
        const locations = parseCSV(csvText);
        setAllLocations(locations);
        console.log(`📍 ${locations.length} konum yüklendi`);
      } catch (error) {
        console.error('Konum verileri yüklenemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocationData();
  }, []);

  // Arama terimi değiştiğinde suggestions'ı güncelle
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // İlçe + boşluk + mahalle formatında arama desteği
    const searchParts = searchTerm.split(' ');
    const hasMultipleWords = searchParts.length > 1;
    const normalizedSearchTerm = normalizeText(searchTerm);

    let filtered;

    if (hasMultipleWords) {
      // İlçe + boşluk + mahalle formatında arama
      const districtPart = normalizeText(searchParts[0]);
      
      // İlçe adını eşleştirerek mahalleleri filtrele
      filtered = allLocations.filter(location => {
        const normalizedLocationName = normalizeText(location.ad);
        const normalizedDistrictName = normalizeText(location.ilce);

        // İlçe kısmı doğru mu?
        const isDistrictMatch = normalizedDistrictName.includes(districtPart);
        
        if (!isDistrictMatch) return false;
        
        // Mahalle kısmı doğru mu? (tüm arama teriminde olabilir)
        const neighborhoodPart = searchParts.slice(1).join(' ');
        if (neighborhoodPart.length > 0) {
          const normalizedNeighborhoodPart = normalizeText(neighborhoodPart);
          return normalizedLocationName.includes(normalizedNeighborhoodPart);
        }
        
        // Sadece ilçe kısmı eşleşiyorsa, o ilçenin tüm mahallelerini göster
        return isDistrictMatch;
      });
    } else {
      // Tek kelime araması - normal filtre
      filtered = allLocations.filter(location => {
        const normalizedLocationName = normalizeText(location.ad);
        const normalizedDistrictName = normalizeText(location.ilce);
        
        const nameMatch = normalizedLocationName.includes(normalizedSearchTerm);
        const districtMatch = normalizedDistrictName.includes(normalizedSearchTerm);
        
        return nameMatch || districtMatch;
      });
    }

    // İlçeleri önce göster, ardından mahalleleri göster
    filtered = filtered.sort((a, b) => {
      // İlçeleri önce göster
      if (a.tur === 'İLÇE' && b.tur !== 'İLÇE') return -1;
      if (a.tur !== 'İLÇE' && b.tur === 'İLÇE') return 1;
      
      // Aynı türde iseler alfabetik sırala
      return a.ad.localeCompare(b.ad);
    }).slice(0, 10); // İlk 10 sonucu göster

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [searchTerm, allLocations]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleLocationSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Konum seçildiğinde
  const handleLocationSelect = (location: LocationData) => {
    // İlçe seçilmişse sadece ilçe adını göster, mahalle seçilmişse "mahalle / ilçe" şeklinde göster
    const displayText = location.tur === 'İLÇE' 
      ? `${location.ad} (İLÇE)` 
      : `${location.ad} / ${location.ilce}`;
    
    setSearchTerm(displayText);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    setHasSelectedLocation(true); // Konum seçildi işaretini koy
    onLocationSelect(location);
  };

  // Input değiştiğinde
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Kullanıcı manuel yazmaya başladıysa, seçim flag'ini kaldır
    if (hasSelectedLocation) {
      setHasSelectedLocation(false);
    }
  };

  // Input focus'ta
  const handleInputFocus = () => {
    // Eğer daha önce bir konum seçilmişse, input'u temizle ve yeni arama için hazırla
    if (hasSelectedLocation) {
      setSearchTerm('');
      setHasSelectedLocation(false);
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    } else if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Input blur'da (küçük gecikme ile)
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <AutocompleteContainer>
      <SearchInputContainer>
        <SearchIcon>
          🔍
        </SearchIcon>
        <SearchInput
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={isLoading ? "Konum verileri yükleniyor..." : placeholder}
          disabled={isLoading}
        />
        {isLoading && <LoadingSpinner />}
      </SearchInputContainer>
      
      {showSuggestions && suggestions.length > 0 && (
        <SuggestionsList>
          {suggestions.map((location, index) => (
            <SuggestionItem
              key={`${location.ilce}-${location.ad}-${index}`}
              $isHighlighted={index === highlightedIndex}
              onClick={() => handleLocationSelect(location)}
            >
              <LocationLabel>
                <LocationBadge $type={location.tur}>
                  {location.tur}
                </LocationBadge>
                {location.tur === 'İLÇE' ? (
                  <strong>{location.ad}</strong>
                ) : (
                  <>
                    <strong>{location.ad}</strong>
                    <span style={{ color: '#666', fontSize: '0.9em' }}> / {location.ilce}</span>
                  </>
                )}
              </LocationLabel>
              <LocationSubtext>
                {location.tur === 'İLÇE' 
                  ? `İzmir, ${location.ad} ilçesi` 
                  : `${location.ilce} ilçesi, ${location.ad} mahallesi`} • {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </LocationSubtext>
            </SuggestionItem>
          ))}
        </SuggestionsList>
      )}
    </AutocompleteContainer>
  );
};

export default LocationAutocomplete;
