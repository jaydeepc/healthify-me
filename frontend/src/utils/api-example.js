/**
 * Simple API Call Integration Example
 * 
 * This example shows how to make authenticated API calls using the auth utility.
 * Non-tech developers can use this as a reference for integrating other API calls.
 * 
 * Example based on curl:
 * curl --location 'https://dev1.piramalfinance.com/api/byot/orchestrator/lead-info?leadId=LADSSA004BE1' \
 * --header 'Content-Type: application/json' \
 * --header 'Authorization: Bearer [TOKEN]'
 */

import { getAuthHeaders, isAuthenticated } from './auth.js';

/**
 * Simple function to fetch lead information with authentication
 * @param {string} leadId - The lead ID to fetch information for
 * @returns {Promise<Object>} The lead information response
 */
export const fetchLeadInfo = async (leadId) => {
  // Step 1: Check if user is authenticated
  if (!isAuthenticated()) {
    console.error('User is not authenticated. Please login first.');
    throw new Error('Authentication required');
  }

  // Step 2: Prepare the API endpoint
  const apiUrl = `https://dev1.piramalfinance.com/api/byot/orchestrator/lead-info?leadId=${leadId}`;

  // Step 3: Get authentication headers using the auth utility
  const headers = getAuthHeaders({
    'Content-Type': 'application/json'
  });

  // Step 4: Make the API call
  try {
    console.log('Making API call to fetch lead info...');
    console.log('URL:', apiUrl);
    console.log('Headers:', headers);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      credentials: 'omit'
    });

    // Step 5: Handle the response
    if (!response.ok) {
      if (response.status === 401) {
        console.error('Authentication failed. Token may be expired.');
        throw new Error('Authentication failed');
      }
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Step 6: Log and return the response
    console.log('API call successful!');
    console.log('Response data:', data);
    
    return data;

  } catch (error) {
    console.error('Error making API call:', error.message);
    throw error;
  }
};

/**
 * Example usage function - demonstrates how to use the fetchLeadInfo function
 */
export const exampleUsage = async () => {
  console.log('=== API Call Example ===');
  
  try {
    // Replace 'LADSSA004BE1' with actual lead ID
    const leadId = 'LADSSA004BE1';
    const leadInfo = await fetchLeadInfo(leadId);
    
    console.log('Lead information retrieved successfully:');
    console.log(JSON.stringify(leadInfo, null, 2));
    
  } catch (error) {
    console.log('Failed to fetch lead information:', error.message);
  }
};

/**
 * Generic function template for making any authenticated API call
 * Copy and modify this template for other API integrations
 * 
 * @param {string} url - The API endpoint URL
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} data - Request body data (for POST/PUT requests)
 * @returns {Promise<Object>} The API response
 */
export const makeAuthenticatedApiCall = async (url, method = 'GET', data = null) => {
  // Check authentication
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }

  // Prepare headers
  const headers = getAuthHeaders({
    'Content-Type': 'application/json'
  });

  // Prepare request options
  const options = {
    method: method,
    headers: headers,
    mode: 'cors',
    credentials: 'omit'
  };

  // Add request body for POST/PUT requests
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    
    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed');
      }
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('API call successful:', responseData);
    
    return responseData;

  } catch (error) {
    console.error('API call error:', error.message);
    throw error;
  }
};

/**
 * Quick reference for developers:
 * 
 * 1. Import the functions:
 *    import { fetchLeadInfo, makeAuthenticatedApiCall } from './utils/api-example.js';
 * 
 * 2. Use the specific function:
 *    const leadData = await fetchLeadInfo('LEAD123');
 * 
 * 3. Or use the generic template:
 *    const result = await makeAuthenticatedApiCall('https://api.example.com/data', 'GET');
 * 
 * 4. For POST requests with data:
 *    const result = await makeAuthenticatedApiCall(
 *      'https://api.example.com/create', 
 *      'POST', 
 *      { name: 'John', email: 'john@example.com' }
 *    );
 */
