# Frontend Authentication Utilities

This directory contains authentication utilities for managing authentication tokens in the frontend application.

## Files

- **`auth.js`** - Core authentication utility functions for localStorage token management
- **`api-example.js`** - Simple example showing how to make authenticated API calls
- **`api.js`** - Axios instance with authentication interceptors

## Quick Start

### 1. Import the authentication utility

```javascript
import { getAccessToken, isAuthenticated, getAuthHeaders } from './utils/auth.js';
```

### 2. Check if user is authenticated

```javascript
if (isAuthenticated()) {
  console.log('User is logged in');
} else {
  console.log('User needs to login');
}
```

### 3. Make an authenticated API call

```javascript
import { getAuthHeaders } from './utils/auth.js';

const headers = getAuthHeaders({
  'Content-Type': 'application/json'
});

const response = await fetch('https://api.example.com/data', {
  method: 'GET',
  headers: headers
});
```

### 4. Use the example template

```javascript
import { makeAuthenticatedApiCall } from './utils/api-example.js';

// GET request
const data = await makeAuthenticatedApiCall('https://api.example.com/data');

// POST request with data
const result = await makeAuthenticatedApiCall(
  'https://api.example.com/create',
  'POST',
  { name: 'John', email: 'john@example.com' }
);
```

### 5. Use the configured axios instance

```javascript
import api from './utils/api.js';

// The api instance automatically includes authentication headers
const response = await api.get('/protected-endpoint');
const postResponse = await api.post('/create', { data: 'example' });
```

## Available Functions

### Core Authentication Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `getAccessToken()` | Get the current access token | `string \| null` |
| `isAuthenticated()` | Check if user has valid token | `boolean` |
| `getAuthHeaders(additionalHeaders)` | Get headers with authorization | `Object` |
| `getAuthorizationHeader()` | Get authorization header value | `string \| null` |
| `clearAuthData()` | Clear stored authentication data | `void` |

### Example Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `fetchLeadInfo(leadId)` | Fetch lead information (example) | `Promise<Object>` |
| `makeAuthenticatedApiCall(url, method, data)` | Generic authenticated API call | `Promise<Object>` |

## Integration with Login System

The authentication utility reads tokens stored by the login system:

- **Login system** (`../client/login.js`) - Stores tokens in localStorage
- **Auth utility** (`auth.js`) - Reads and validates stored tokens
- **API client** (`api.js`) - Uses auth utility for automatic token injection

## Token Storage

The utility reads authentication tokens from localStorage using these keys:
- `authToken` - Contains the complete authentication data including access token
- `tokenExpiry` - Contains the token expiry time (fallback)

## Error Handling

The utility includes built-in error handling for:
- Missing or invalid tokens
- Expired tokens
- localStorage unavailability (server-side environments)
- Network errors during API calls

## Best Practices

1. **Always check authentication** before making API calls
2. **Handle authentication errors** gracefully (redirect to login)
3. **Use the auth utility** instead of accessing localStorage directly
4. **Clear auth data** when tokens expire or logout occurs
5. **Use the configured axios instance** for automatic token management

## Example Usage in React Components

```javascript
import { isAuthenticated, getAuthHeaders } from '../utils/auth';
import { useEffect, useState } from 'react';

const MyComponent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleApiCall = async () => {
    if (!isAuthenticated()) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/protected-data', {
        headers: headers
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('API call failed:', error);
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <button onClick={handleApiCall}>Fetch Data</button>
      ) : (
        <p>Please log in to continue</p>
      )}
    </div>
  );
};
```

## Using with Axios Instance

```javascript
import api from '../utils/api';

const MyComponent = () => {
  const fetchData = async () => {
    try {
      // Authentication headers are automatically added
      const response = await api.get('/protected-endpoint');
      console.log(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        // Handle authentication error
        window.location.href = '/login';
      }
    }
  };

  return (
    <button onClick={fetchData}>Fetch Protected Data</button>
  );
};
```

## Environment Variables

The authentication system uses these environment variables:

- `VITE_ORCHESTRATOR_SERVICE_BASE_URL` - Base URL for the orchestrator service
- `VITE_AUTH_API_ENDPOINT` - Authentication endpoint path

## Support

For questions or issues with the authentication utility, refer to the example files or check the inline documentation in the source code.
