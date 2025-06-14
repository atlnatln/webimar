// Mock for leaflet
export const map = jest.fn(() => ({
  setView: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  fitBounds: jest.fn(),
}));

export const tileLayer = jest.fn(() => ({
  addTo: jest.fn(),
}));

export const marker = jest.fn(() => ({
  addTo: jest.fn(),
  bindPopup: jest.fn(),
}));

export const polygon = jest.fn(() => ({
  addTo: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

export const FeatureGroup = jest.fn(() => ({
  addTo: jest.fn(),
  clearLayers: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
}));

export const Control = {
  Draw: jest.fn(() => ({
    addTo: jest.fn(),
  })),
};

export const Draw = {
  Event: {
    CREATED: 'draw:created',
    EDITED: 'draw:edited',
    DELETED: 'draw:deleted',
  },
};

// Mock Icon and Icon.Default for Leaflet icon fixes
export const Icon = {
  Default: {
    prototype: {
      _getIconUrl: jest.fn(),
    },
    mergeOptions: jest.fn(),
  },
};

// Create L global object for compatibility
const L = {
  map,
  tileLayer,
  marker,
  polygon,
  FeatureGroup,
  Control,
  Draw,
  Icon,
};

// Make L available globally for tests
global.L = L;

export default L;
