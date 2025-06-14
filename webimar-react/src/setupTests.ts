// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Leaflet images globally
jest.mock('leaflet/dist/images/marker-icon-2x.png', () => 'test-icon-2x.png');
jest.mock('leaflet/dist/images/marker-icon.png', () => 'test-icon.png');
jest.mock('leaflet/dist/images/marker-shadow.png', () => 'test-shadow.png');

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
