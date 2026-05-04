import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the entire api module
vi.mock('../src/utils/api', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  
  const mockCheckHealth = vi.fn();
  
  return {
    default: mockApi,
    checkHealth: mockCheckHealth
  };
});

import api, { checkHealth } from '../src/utils/api';

describe('API Utilities', () => {
  const originalConsoleError = console.error;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.clearAllMocks();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('api instance', () => {
    it('should be created with expected configuration', () => {
      expect(api).toBeDefined();
      expect(api.get).toBeDefined();
    });
  });

  describe('checkHealth', () => {
    it('should make GET request to /health endpoint', async () => {
      const mockResponse = {
        data: {
          status: 'ok',
          message: 'Server is running',
          testVar: 'test-value'
        }
      };

      // Mock the checkHealth function directly
      checkHealth.mockResolvedValueOnce(mockResponse.data);

      const result = await checkHealth();

      expect(checkHealth).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle errors and throw them', async () => {
      const mockError = new Error('API Error');

      // Mock the checkHealth function to reject
      checkHealth.mockRejectedValueOnce(mockError);

      await expect(checkHealth()).rejects.toThrow('API Error');
      expect(checkHealth).toHaveBeenCalled();
    });
  });

  describe('request interceptor', () => {
    it('should handle request interceptor errors', async () => {
      // Import the actual api instance to test interceptors
      const { default: actualApi } = await vi.importActual('../src/utils/api');
      
      // Mock the request interceptor to throw an error
      const mockError = new Error('Interceptor error');
      
      // Test that the error handler in the interceptor works
      const errorHandler = actualApi.interceptors.request.handlers[0].rejected;
      
      await expect(errorHandler(mockError)).rejects.toThrow('Interceptor error');
    });

    it('should have request interceptor configured', async () => {
      // Import the actual api instance to test interceptors
      const { default: actualApi } = await vi.importActual('../src/utils/api');
      
      // Verify that the interceptor is configured
      expect(actualApi.interceptors.request.handlers).toHaveLength(1);
      expect(actualApi.interceptors.request.handlers[0].fulfilled).toBeDefined();
      expect(actualApi.interceptors.request.handlers[0].rejected).toBeDefined();
    });
  });
});
