import axios from 'axios';

const ORCHESTRATOR_SERVICE_BASE_URL = import.meta.env.VITE_ORCHESTRATOR_SERVICE_BASE_URL;
const AUTH_LOGIN_API_ENDPOINT = import.meta.env.VITE_AUTH_LOGIN_API_ENDPOINT;
const AUTH_LOGOUT_API_ENDPOINT = import.meta.env.VITE_AUTH_LOGOUT_API_ENDPOINT;

const AUTH_TOKEN_KEY = 'authToken';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const LOGGED_IN_USER_KEY = 'loggedInUser';

/**
 * Login function to authenticate user with SSO
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Auth response with tokens
 */
export const loginWithSSO = async (email, password) => {
  try {
    const response = await axios.post(ORCHESTRATOR_SERVICE_BASE_URL + AUTH_LOGIN_API_ENDPOINT, {
      userName: email,
      password: password,
      source: 'OPS_CENTRAL',
      app_name: '{{REPO_NAME}}'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    if (response.data && response.data.accessToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(response.data));

      if (response.data.accessTokenExpiryTime) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, response.data.accessTokenExpiryTime);
      }

      // Store logged in user data
      const loggedInUser = {
        username: email,
        userRoles: []
      };
      localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(loggedInUser));

      return response.data;
    } else {
      throw new Error('Invalid authentication response');
    }
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  const authData = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!authData) return false;

  try {
    const parsedData = JSON.parse(authData);
    if (!parsedData.accessToken) return false;

    if (parsedData.accessTokenExpiryTime) {
      const expiryDate = new Date(parsedData.accessTokenExpiryTime);
      if (expiryDate < new Date()) {
        // Token is expired
        return false;
      }
    }

    return true;
  } catch (e) {
    console.error('Error parsing auth data:', e);
    return false;
  }
};

/**
 * Logout function - clear stored tokens and invalidate on server
 */
export const logout = async () => {
  try {
    const authData = localStorage.getItem(AUTH_TOKEN_KEY);
    const logoutUrl = ORCHESTRATOR_SERVICE_BASE_URL + AUTH_LOGOUT_API_ENDPOINT;
    if (authData) {
      const parsedData = JSON.parse(authData);
      const accessToken = parsedData.accessToken;

      if (accessToken) {
        // Call logout API to invalidate token
        await axios.post(logoutUrl, {
          accessToken: accessToken
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
      }
    }
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(LOGGED_IN_USER_KEY);
  }
};

/**
 * Get access token for API requests
 * @returns {string|null} The current access token or null if not authenticated
 */
export const getAccessToken = () => {
  const authData = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!authData) return null;

  try {
    const parsedData = JSON.parse(authData);
    return parsedData.accessToken || null;
  } catch (e) {
    console.error('Error parsing auth data:', e);
    return null;
  }
};
