import { getAuthHeaders } from '../utils/auth';

// # AI: Start
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL 
  ? `${import.meta.env.VITE_BACKEND_URL}/health-tracker/api`
  : '/health-tracker/api';

// Get all available health metrics with benchmarks
export const getHealthMetrics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health-metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    throw error;
  }
};

// Add a new health entry
export const addHealthEntry = async (entryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/health-metrics/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(entryData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding health entry:', error);
    throw error;
  }
};

// Get user's latest values for all metrics
export const getUserLatestEntries = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/health-metrics/entries/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user entries:', error);
    throw error;
  }
};

// Get historical data for a specific metric
export const getMetricHistory = async (userId, metricId, options = {}) => {
  try {
    const { limit = 30, days = 90 } = options;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      days: days.toString()
    });

    const response = await fetch(
      `${API_BASE_URL}/health-metrics/entries/${userId}/${metricId}/history?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching metric history:', error);
    throw error;
  }
};

// Set or update a personal goal
export const setUserGoal = async (goalData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/health-metrics/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(goalData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error setting goal:', error);
    throw error;
  }
};

// Get user's active goals
export const getUserGoals = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/health-metrics/goals/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user goals:', error);
    throw error;
  }
};

// Get dashboard summary data
export const getDashboardData = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/health-metrics/dashboard/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Helper function to determine benchmark status
export const getBenchmarkStatus = (value, benchmarks) => {
  if (!benchmarks || value === null || value === undefined) {
    return 'unknown';
  }

  const { excellent, good, average, poor } = benchmarks;

  // Check excellent range
  if (excellent.min !== null && excellent.max !== null) {
    if (value >= excellent.min && value <= excellent.max) return 'excellent';
  } else if (excellent.min !== null && value >= excellent.min) {
    return 'excellent';
  } else if (excellent.max !== null && value <= excellent.max) {
    return 'excellent';
  }

  // Check good range
  if (good.min !== null && good.max !== null) {
    if (value >= good.min && value <= good.max) return 'good';
  } else if (good.min !== null && value >= good.min) {
    return 'good';
  } else if (good.max !== null && value <= good.max) {
    return 'good';
  }

  // Check average range
  if (average.min !== null && average.max !== null) {
    if (value >= average.min && value <= average.max) return 'average';
  } else if (average.min !== null && value >= average.min) {
    return 'average';
  } else if (average.max !== null && value <= average.max) {
    return 'average';
  }

  // Default to poor if doesn't fit other categories
  return 'poor';
};

// Helper function to get status color
export const getStatusColor = (status) => {
  switch (status) {
    case 'excellent':
      return 'text-green-600 bg-green-100';
    case 'good':
      return 'text-blue-600 bg-blue-100';
    case 'average':
      return 'text-yellow-600 bg-yellow-100';
    case 'poor':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Save user preferences
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const response = await fetch(`${API_BASE_URL}/health-metrics/preferences/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(preferences)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
};

// Get user preferences
export const getUserPreferences = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/health-metrics/preferences/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    throw error;
  }
};

// Update an existing health entry
export const updateHealthEntry = async (entryId, entryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/health-metrics/entries/${entryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(entryData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating health entry:', error);
    throw error;
  }
};

// Delete a health entry
export const deleteHealthEntry = async (entryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/health-metrics/entries/${entryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting health entry:', error);
    throw error;
  }
};

// Get all entries for a specific metric (for editing purposes)
export const getAllMetricEntries = async (userId, metricId, options = {}) => {
  try {
    const { limit = 50 } = options;
    const queryParams = new URLSearchParams({
      limit: limit.toString()
    });

    const response = await fetch(
      `${API_BASE_URL}/health-metrics/entries/${userId}/${metricId}/all?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all metric entries:', error);
    throw error;
  }
};

// Helper function to format metric values
export const formatMetricValue = (value, unit, dataType) => {
  if (value === null || value === undefined) return 'No data';

  if (dataType === 'duration' && unit === 'seconds') {
    if (value >= 60) {
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }
    return `${value}s`;
  }

  if (dataType === 'duration' && unit === 'hours') {
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  // Format numbers with appropriate decimal places
  const formattedValue = typeof value === 'number' ? 
    (value % 1 === 0 ? value.toString() : value.toFixed(1)) : 
    value;

  return `${formattedValue} ${unit}`;
};
// # AI: End
