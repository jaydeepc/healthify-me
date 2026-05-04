import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchLeadInfo, exampleUsage, makeAuthenticatedApiCall } from '../src/utils/api-example.js';

// Mock the auth utility
vi.mock('../src/utils/auth.js', () => ({
  getAuthHeaders: vi.fn(),
  isAuthenticated: vi.fn(),
}));

import { getAuthHeaders, isAuthenticated } from '../src/utils/auth.js';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console methods
const consoleMock = {
  log: vi.fn(),
  error: vi.fn(),
};

describe('API Example Utility', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock console
    vi.spyOn(console, 'log').mockImplementation(consoleMock.log);
    vi.spyOn(console, 'error').mockImplementation(consoleMock.error);
  });

  afterEach(() => {
    // Restore console methods
    vi.restoreAllMocks();
  });

  describe('fetchLeadInfo', () => {
    const mockLeadId = 'LADSSA004BE1';
    const expectedUrl = `https://dev1.piramalfinance.com/api/byot/orchestrator/lead-info?leadId=${mockLeadId}`;

    it('should throw error when user is not authenticated', async () => {
      isAuthenticated.mockReturnValue(false);

      await expect(fetchLeadInfo(mockLeadId)).rejects.toThrow('Authentication required');
      
      expect(consoleMock.error).toHaveBeenCalledWith('User is not authenticated. Please login first.');
      expect(isAuthenticated).toHaveBeenCalled();
    });

    it('should make successful API call when authenticated', async () => {
      const mockResponseData = {
        leadId: mockLeadId,
        customerName: 'John Doe',
        status: 'active'
      };

      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponseData)
      });

      const result = await fetchLeadInfo(mockLeadId);

      expect(result).toEqual(mockResponseData);
      expect(isAuthenticated).toHaveBeenCalled();
      expect(getAuthHeaders).toHaveBeenCalledWith({
        'Content-Type': 'application/json'
      });
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      expect(consoleMock.log).toHaveBeenCalledWith('Making API call to fetch lead info...');
      expect(consoleMock.log).toHaveBeenCalledWith('URL:', expectedUrl);
      expect(consoleMock.log).toHaveBeenCalledWith('API call successful!');
      expect(consoleMock.log).toHaveBeenCalledWith('Response data:', mockResponseData);
    });

    it('should throw authentication error when API returns 401', async () => {
      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401
      });

      await expect(fetchLeadInfo(mockLeadId)).rejects.toThrow('Authentication failed');
      
      expect(consoleMock.error).toHaveBeenCalledWith('Authentication failed. Token may be expired.');
    });

    it('should throw error when API returns non-401 error status', async () => {
      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500
      });

      await expect(fetchLeadInfo(mockLeadId)).rejects.toThrow('API call failed with status: 500');
    });

    it('should handle network errors', async () => {
      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });

      const networkError = new Error('Network error');
      mockFetch.mockRejectedValue(networkError);

      await expect(fetchLeadInfo(mockLeadId)).rejects.toThrow('Network error');
      
      expect(consoleMock.error).toHaveBeenCalledWith('Error making API call:', 'Network error');
    });
  });

  describe('exampleUsage', () => {
    it('should demonstrate successful usage', async () => {
      const mockLeadData = {
        leadId: 'LADSSA004BE1',
        customerName: 'John Doe'
      };

      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockLeadData)
      });

      await exampleUsage();

      expect(consoleMock.log).toHaveBeenCalledWith('=== API Call Example ===');
      expect(consoleMock.log).toHaveBeenCalledWith('Lead information retrieved successfully:');
      expect(consoleMock.log).toHaveBeenCalledWith(JSON.stringify(mockLeadData, null, 2));
    });

    it('should handle errors gracefully', async () => {
      isAuthenticated.mockReturnValue(false);

      await exampleUsage();

      expect(consoleMock.log).toHaveBeenCalledWith('=== API Call Example ===');
      expect(consoleMock.log).toHaveBeenCalledWith('Failed to fetch lead information:', 'Authentication required');
    });
  });

  describe('makeAuthenticatedApiCall', () => {
    const mockUrl = 'https://api.example.com/test';

    it('should throw error when user is not authenticated', async () => {
      isAuthenticated.mockReturnValue(false);

      await expect(makeAuthenticatedApiCall(mockUrl)).rejects.toThrow('Authentication required');
      
      expect(isAuthenticated).toHaveBeenCalled();
    });

    it('should make successful GET request', async () => {
      const mockResponseData = { success: true };

      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponseData)
      });

      const result = await makeAuthenticatedApiCall(mockUrl);

      expect(result).toEqual(mockResponseData);
      expect(mockFetch).toHaveBeenCalledWith(mockUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      expect(consoleMock.log).toHaveBeenCalledWith('API call successful:', mockResponseData);
    });

    it('should make successful POST request with data', async () => {
      const mockRequestData = { name: 'John', email: 'john@example.com' };
      const mockResponseData = { id: 1, ...mockRequestData };

      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponseData)
      });

      const result = await makeAuthenticatedApiCall(mockUrl, 'POST', mockRequestData);

      expect(result).toEqual(mockResponseData);
      expect(mockFetch).toHaveBeenCalledWith(mockUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(mockRequestData)
      });

    });

    it('should make successful PUT request with data', async () => {
      const mockRequestData = { id: 1, name: 'John Updated' };
      const mockResponseData = { ...mockRequestData, updated: true };

      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponseData)
      });

      const result = await makeAuthenticatedApiCall(mockUrl, 'PUT', mockRequestData);

      expect(result).toEqual(mockResponseData);
      expect(mockFetch).toHaveBeenCalledWith(mockUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(mockRequestData)
      });
    });

    it('should make DELETE request without body', async () => {
      const mockResponseData = { deleted: true };

      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponseData)
      });

      const result = await makeAuthenticatedApiCall(mockUrl, 'DELETE');

      expect(result).toEqual(mockResponseData);
      expect(mockFetch).toHaveBeenCalledWith(mockUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        mode: 'cors',
        credentials: 'omit'
      });
    });

    it('should throw authentication error when API returns 401', async () => {
      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401
      });

      await expect(makeAuthenticatedApiCall(mockUrl)).rejects.toThrow('Authentication failed');
    });

    it('should throw error when API returns non-401 error status', async () => {
      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      await expect(makeAuthenticatedApiCall(mockUrl)).rejects.toThrow('API call failed with status: 404');
    });

    it('should handle network errors', async () => {
      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });

      const networkError = new Error('Network connection failed');
      mockFetch.mockRejectedValue(networkError);

      await expect(makeAuthenticatedApiCall(mockUrl)).rejects.toThrow('Network connection failed');
      
      expect(consoleMock.error).toHaveBeenCalledWith('API call error:', 'Network connection failed');
    });

    it('should not add body for GET request even if data is provided', async () => {
      const mockRequestData = { filter: 'active' };
      const mockResponseData = { results: [] };

      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponseData)
      });

      await makeAuthenticatedApiCall(mockUrl, 'GET', mockRequestData);

      expect(mockFetch).toHaveBeenCalledWith(mockUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        mode: 'cors',
        credentials: 'omit'
        // Note: no body property should be present for GET request
      });
    });

    it('should handle empty response data', async () => {
      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null)
      });

      const result = await makeAuthenticatedApiCall(mockUrl);

      expect(result).toBeNull();
      expect(consoleMock.log).toHaveBeenCalledWith('API call successful:', null);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle authentication expiry during API call', async () => {
      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer expired-token'
      });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401
      });

      await expect(fetchLeadInfo('TEST123')).rejects.toThrow('Authentication failed');
      
      expect(consoleMock.error).toHaveBeenCalledWith('Authentication failed. Token may be expired.');
    });

    it('should handle malformed JSON response', async () => {
      isAuthenticated.mockReturnValue(true);
      getAuthHeaders.mockReturnValue({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(makeAuthenticatedApiCall('https://api.example.com/test')).rejects.toThrow('Invalid JSON');
    });
  });
});
