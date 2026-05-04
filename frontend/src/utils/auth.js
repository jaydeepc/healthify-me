/**
 * Authentication utility for managing access tokens
 * This utility provides functions to retrieve and validate authentication tokens
 * stored in localStorage during the login process.
 */

// Constants matching those used in frontend/src/client/login.js
const AUTH_TOKEN_KEY = 'authToken';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const LOGGED_IN_USER_KEY = 'loggedInUser';

/**
 * Get the access token from localStorage
 * @returns {string|null} The current access token or null if not available/invalid
 */
export const getAccessToken = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.warn('localStorage is not available in this environment');
    return null;
  }

  try {
    const authData = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!authData) {
      return null;
    }

    const parsedData = JSON.parse(authData);
    return parsedData.accessToken || null;
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return null;
  }
};

/**
 * Get the complete authentication data from localStorage
 * @returns {Object|null} The complete auth data object or null if not available
 */
export const getAuthData = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.warn('localStorage is not available in this environment');
    return null;
  }

  try {
    const authData = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!authData) {
      return null;
    }

    return JSON.parse(authData);
  } catch (error) {
    console.error('Error retrieving auth data:', error);
    return null;
  }
};

/**
 * Get the logged in user data from localStorage
 * @returns {Object|null} The logged in user object with username and userRoles, or null if not available
 */
export const getLoggedInUser = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.warn('localStorage is not available in this environment');
    return null;
  }

  try {
    const userData = localStorage.getItem(LOGGED_IN_USER_KEY);
    if (!userData) {
      return null;
    }

    return JSON.parse(userData);
  } catch (error) {
    console.error('Error retrieving logged in user data:', error);
    return null;
  }
};

/**
 * Get the token expiry time from localStorage
 * @returns {string|null} The token expiry time or null if not available
 */
export const getTokenExpiry = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.warn('localStorage is not available in this environment');
    return null;
  }

  try {
    // First try to get from the main auth data
    const authData = getAuthData();
    if (authData && authData.accessTokenExpiryTime) {
      return authData.accessTokenExpiryTime;
    }

    // Fallback to separate expiry key
    return localStorage.getItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error retrieving token expiry:', error);
    return null;
  }
};

/**
 * Check if the current token is valid (exists and not expired)
 * @returns {boolean} True if token is valid, false otherwise
 */
export const isTokenValid = () => {
  const token = getAccessToken();
  if (!token) {
    return false;
  }

  const expiryTime = getTokenExpiry();
  if (!expiryTime) {
    // If no expiry time is set, assume token is valid
    return true;
  }

  try {
    const expiryDate = new Date(expiryTime);
    const currentDate = new Date();
    
    return expiryDate > currentDate;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

/**
 * Get authorization header value for API requests
 * @param {string} [tokenType='Bearer'] - The token type (default: 'Bearer')
 * @returns {string|null} The authorization header value or null if no valid token
 */
export const getAuthorizationHeader = (tokenType = 'Bearer') => {
  const token = getAccessToken();
  if (!token || !isTokenValid()) {
    return null;
  }

  return `${tokenType} ${token}`;
};

/**
 * Get headers object with authorization for API requests
 * @param {Object} [additionalHeaders={}] - Additional headers to include
 * @param {string} [tokenType='Bearer'] - The token type (default: 'Bearer')
 * @returns {Object} Headers object with authorization or empty object if no valid token
 */
export const getAuthHeaders = (additionalHeaders = {}, tokenType = 'Bearer') => {
  const authHeader = getAuthorizationHeader(tokenType);
  
  if (!authHeader) {
    return additionalHeaders;
  }

  return {
    ...additionalHeaders,
    'Authorization': authHeader
  };
};

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean} True if user is authenticated with valid token
 */
export const isAuthenticated = () => {
  return isTokenValid();
};

/**
 * Clear authentication data from localStorage
 * This is a utility function that can be called during logout
 */
export const clearAuthData = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.warn('localStorage is not available in this environment');
    return;
  }

  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(LOGGED_IN_USER_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Export constants for use in other modules
export const AUTH_CONSTANTS = {
  AUTH_TOKEN_KEY,
  TOKEN_EXPIRY_KEY,
  LOGGED_IN_USER_KEY
};
