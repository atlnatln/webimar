// Mock for @turf/turf
export const area = jest.fn(() => 1000);

export const polygon = jest.fn((coords) => ({
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: coords,
  },
  properties: {},
}));

export const point = jest.fn((coords) => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: coords,
  },
  properties: {},
}));

export const buffer = jest.fn(() => ({
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
  },
  properties: {},
}));

export const difference = jest.fn(() => ({
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
  },
  properties: {},
}));

export const intersect = jest.fn(() => ({
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
  },
  properties: {},
}));

export const union = jest.fn(() => ({
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
  },
  properties: {},
}));

export const booleanIntersects = jest.fn(() => true);

export const booleanContains = jest.fn(() => true);

export const booleanWithin = jest.fn(() => false);

export default {
  area,
  polygon,
  point,
  buffer,
  difference,
  intersect,
  union,
  booleanIntersects,
  booleanContains,
  booleanWithin,
};
