// Mock for API services
export const getYapiTurleri = jest.fn().mockResolvedValue([
  { id: 1, name: 'Test Yapı Türü', key: 'test-yapi' }
]);

export const calculateBagEvi = jest.fn().mockResolvedValue({
  success: true,
  result: 'Test sonucu'
});

export const calculateStructure = jest.fn().mockResolvedValue({
  success: true,
  result: 'Test sonucu'
});

// Default export mock
export default {
  getYapiTurleri,
  calculateBagEvi,
  calculateStructure
};
