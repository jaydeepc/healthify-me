import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getAccessToken,
  getAuthData,
  getTokenExpiry,
  isTokenValid,
  getAuthorizationHeader,
  getAuthHeaders,
  isAuthenticated,
  clearAuthData,
  AUTH_CONSTANTS
} from '../src/utils/auth.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock console methods to avoid noise in tests
const consoleMock = {
  warn: vi.fn(),
  error: vi.fn(),
};

describe('Auth Utility', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // Mock console
    vi.spyOn(console, 'warn').mockImplementation(consoleMock.warn);
    vi.spyOn(console, 'error').mockImplementation(consoleMock.error);
  });

  afterEach(() => {
    // Restore console methods
    vi.restoreAllMocks();
  });

  describe('getAccessToken', () => {
    it('should return null when localStorage is not available', () => {
      // Mock window as undefined (server environment)
      const originalWindow = global.window;
      delete global.window;

      const result = getAccessToken();

      expect(result).toBeNull();
      expect(consoleMock.warn).toHaveBeenCalledWith('localStorage is not available in this environment');

      // Restore window
      global.window = originalWindow;
    });

    it('should return null when no auth data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getAccessToken();

      expect(result).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
    });

    it('should return access token when valid auth data exists', () => {
      const mockAuthData = {
        accessToken: 'test-access-token',
        accessTokenExpiryTime: '2024-12-31T23:59:59Z'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

      const result = getAccessToken();

      expect(result).toBe('test-access-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
    });

    it('should return null when auth data is invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = getAccessToken();

      expect(result).toBeNull();
      expect(consoleMock.error).toHaveBeenCalledWith('Error retrieving access token:', expect.any(Error));
    });

    it('should return null when auth data has no accessToken', () => {
      const mockAuthData = {
        someOtherField: 'value'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

      const result = getAccessToken();

      expect(result).toBeNull();
    });
  });

  describe('getAuthData', () => {
    it('should return null when localStorage is not available', () => {
      const originalWindow = global.window;
      delete global.window;

      const result = getAuthData();

      expect(result).toBeNull();
      expect(consoleMock.warn).toHaveBeenCalledWith('localStorage is not available in this environment');

      global.window = originalWindow;
    });

    it('should return null when no auth data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getAuthData();

      expect(result).toBeNull();
    });

    it('should return parsed auth data when valid data exists', () => {
      const mockAuthData = {
        accessToken: 'test-token',
        accessTokenExpiryTime: '2024-12-31T23:59:59Z'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

      const result = getAuthData();

      expect(result).toEqual(mockAuthData);
    });

    it('should return null when auth data is invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = getAuthData();

      expect(result).toBeNull();
      expect(consoleMock.error).toHaveBeenCalledWith('Error retrieving auth data:', expect.any(Error));
    });
  });

  describe('getTokenExpiry', () => {
    it('should return null when localStorage is not available', () => {
      const originalWindow = global.window;
      delete global.window;

      const result = getTokenExpiry();

      expect(result).toBeNull();

      global.window = originalWindow;
    });

    it('should return expiry time from auth data when available', () => {
      const mockAuthData = {
        accessToken: 'test-token',
        accessTokenExpiryTime: '2024-12-31T23:59:59Z'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

      const result = getTokenExpiry();

      expect(result).toBe('2024-12-31T23:59:59Z');
    });

    it('should return expiry time from separate key when auth data has no expiry', () => {
      const mockAuthData = {
        accessToken: 'test-token'
      };
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // First call for authToken
        .mockReturnValueOnce('2024-12-31T23:59:59Z'); // Second call for tokenExpiry

      const result = getTokenExpiry();

      expect(result).toBe('2024-12-31T23:59:59Z');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('tokenExpiry');
    });

    it('should handle errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = getTokenExpiry();

      expect(result).toBeNull();
      expect(consoleMock.error).toHaveBeenCalledWith('Error retrieving token expiry:', expect.any(Error));
    });
  });

  describe('isTokenValid', () => {
    it('should return false when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = isTokenValid();

      expect(result).toBe(false);
    });

    it('should return true when token exists and no expiry is set', () => {
      const mockAuthData = {
        accessToken: 'test-token'
      };
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // First call for getAccessToken
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // Second call for getAuthData in getTokenExpiry
        .mockReturnValueOnce(null); // Third call for fallback TOKEN_EXPIRY_KEY

      const result = isTokenValid();

      expect(result).toBe(true);
    });

    it('should return true when token exists and is not expired', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1); // 1 hour in the future

      const mockAuthData = {
        accessToken: 'test-token',
        accessTokenExpiryTime: futureDate.toISOString()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

      const result = isTokenValid();

      expect(result).toBe(true);
    });

    it('should return false when token is expired', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1); // 1 hour in the past

      const mockAuthData = {
        accessToken: 'test-token',
        accessTokenExpiryTime: pastDate.toISOString()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

      const result = isTokenValid();

      expect(result).toBe(false);
    });

    it('should handle invalid date gracefully', () => {
      const mockAuthData = {
        accessToken: 'test-token',
        accessTokenExpiryTime: 'invalid-date'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

      const result = isTokenValid();

      expect(result).toBe(false);
      // Note: Invalid date creates a valid Date object that returns NaN for getTime()
      // The comparison with current date will be false, but no error is thrown
    });

    it('should handle errors in date comparison and log them', () => {
      const mockAuthData = {
        accessToken: 'test-token',
        accessTokenExpiryTime: '2024-12-31T23:59:59Z'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

      // Mock Date constructor to throw an error
      const originalDate = global.Date;
      global.Date = vi.fn(() => {
        throw new Error('Date construction error');
      });
      global.Date.now = originalDate.now;

      const result = isTokenValid();

      expect(result).toBe(false);
      expect(consoleMock.error).toHaveBeenCalledWith('Error checking token validity:', expect.any(Error));

      // Restore Date
      global.Date = originalDate;
    });
  });

  describe('getAuthorizationHeader', () => {
    it('should return null when no valid token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getAuthorizationHeader();

      expect(result).toBeNull();
    });

    it('should return Bearer token when valid token exists', () => {
      const mockAuthData = {
        accessToken: 'test-token'
      };
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // First call for getAccessToken
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // Second call for getAccessToken in isTokenValid
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // Third call for getAuthData in getTokenExpiry
        .mockReturnValueOnce(null); // Fourth call for fallback TOKEN_EXPIRY_KEY

      const result = getAuthorizationHeader();

      expect(result).toBe('Bearer test-token');
    });

    it('should return custom token type when specified', () => {
      const mockAuthData = {
        accessToken: 'test-token'
      };
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // First call for getAccessToken
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // Second call for getAccessToken in isTokenValid
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // Third call for getAuthData in getTokenExpiry
        .mockReturnValueOnce(null); // Fourth call for fallback TOKEN_EXPIRY_KEY

      const result = getAuthorizationHeader('Token');

      expect(result).toBe('Token test-token');
    });

    it('should return null when token is expired', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const mockAuthData = {
        accessToken: 'test-token',
        accessTokenExpiryTime: pastDate.toISOString()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

      const result = getAuthorizationHeader();

      expect(result).toBeNull();
    });
  });

  describe('getAuthHeaders', () => {
    it('should return only additional headers when no valid token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const additionalHeaders = {
        'Content-Type': 'application/json'
      };

      const result = getAuthHeaders(additionalHeaders);

      expect(result).toEqual(additionalHeaders);
    });

    it('should return headers with authorization when valid token exists', () => {
      const mockAuthData = {
        accessToken: 'test-token'
      };
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // First call for getAccessToken in getAuthorizationHeader
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // Second call for getAccessToken in isTokenValid
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // Third call for getAuthData in getTokenExpiry
        .mockReturnValueOnce(null); // Fourth call for fallback TOKEN_EXPIRY_KEY

      const additionalHeaders = {
        'Content-Type': 'application/json'
      };

      const result = getAuthHeaders(additionalHeaders);

      expect(result).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });
    });

    it('should work with empty additional headers', () => {
      const mockAuthData = {
        accessToken: 'test-token'
      };
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // First call for getAccessToken in getAuthorizationHeader
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // Second call for getAccessToken in isTokenValid
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // Third call for getAuthData in getTokenExpiry
        .mockReturnValueOnce(null); // Fourth call for fallback TOKEN_EXPIRY_KEY

      const result = getAuthHeaders();

      expect(result).toEqual({
        'Authorization': 'Bearer test-token'
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return true when valid token exists', () => {
      const mockAuthData = {
        accessToken: 'test-token'
      };
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // First call for getAccessToken in isTokenValid
        .mockReturnValueOnce(JSON.stringify(mockAuthData)) // Second call for getAuthData in getTokenExpiry
        .mockReturnValueOnce(null); // Third call for fallback TOKEN_EXPIRY_KEY

      const result = isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when token is expired', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const mockAuthData = {
        accessToken: 'test-token',
        accessTokenExpiryTime: pastDate.toISOString()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));

      const result = isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('clearAuthData', () => {
    it('should warn when localStorage is not available', () => {
      const originalWindow = global.window;
      delete global.window;

      clearAuthData();

      expect(consoleMock.warn).toHaveBeenCalledWith('localStorage is not available in this environment');

      global.window = originalWindow;
    });

    it('should remove both auth token keys', () => {
      clearAuthData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tokenExpiry');
    });

    it('should handle errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      clearAuthData();

      expect(consoleMock.error).toHaveBeenCalledWith('Error clearing auth data:', expect.any(Error));
    });
  });

  describe('AUTH_CONSTANTS', () => {
    it('should export correct constants', () => {
      expect(AUTH_CONSTANTS).toEqual({
        AUTH_TOKEN_KEY: 'authToken',
        TOKEN_EXPIRY_KEY: 'tokenExpiry'
      });
    });
  });
});
