import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Mock all services and contexts
jest.mock('./services/api');
jest.mock('./contexts/StructureTypesContext', () => ({
  StructureTypesProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useStructureTypes: () => ({
    structureTypes: [],
    structureTypeLabels: {},
    loading: false,
    error: null,
    refreshStructureTypes: jest.fn()
  })
}));

// Mock useMediaQuery hook
jest.mock('./hooks/useMediaQuery', () => ({
  __esModule: true,
  default: () => false, // Always return false for mobile detection
  useIsMobile: () => false, // Mock useIsMobile specifically
}));

// Mock SidebarNavigation component
jest.mock('./components/SidebarNavigation', () => {
  return function MockSidebarNavigation() {
    return <div data-testid="sidebar-navigation">Mock Sidebar</div>;
  };
});

// Mock HomePage component
jest.mock('./pages/HomePage', () => {
  return function MockHomePage() {
    return <div data-testid="home-page">Mock Home Page</div>;
  };
});

// Mock CalculationPage component
jest.mock('./pages/CalculationPage', () => {
  return function MockCalculationPage() {
    return <div data-testid="calculation-page">Mock Calculation Page</div>;
  };
});

// Mock MapTestPage component
jest.mock('./pages/MapTestPage', () => {
  return function MockMapTestPage() {
    return <div data-testid="map-test-page">Mock Map Test Page</div>;
  };
});

test('renders app without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
