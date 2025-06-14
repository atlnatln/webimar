// Mock for react-leaflet
import React from 'react';

export const MapContainer = ({ children, ...props }) => (
  <div data-testid="map-container" {...props}>
    {children}
  </div>
);

export const TileLayer = (props) => (
  <div data-testid="tile-layer" {...props} />
);

export const Marker = ({ children, ...props }) => (
  <div data-testid="marker" {...props}>
    {children}
  </div>
);

export const Popup = ({ children, ...props }) => (
  <div data-testid="popup" {...props}>
    {children}
  </div>
);

export const Polygon = (props) => (
  <div data-testid="polygon" {...props} />
);

export const useMap = () => ({
  setView: jest.fn(),
  fitBounds: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
});

export const useMapEvent = (event, handler) => {
  // Mock implementation
  return null;
};

export const useMapEvents = (events) => {
  // Mock implementation
  return null;
};
