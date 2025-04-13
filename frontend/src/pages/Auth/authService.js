const API_URL = 'http://localhost:3000';

/**
 * Register a new user
 * @param {Object} userData - User information (email, password, etc.)
 * @returns {Promise} - Response from the register API
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include', // Match login behavior for consistency
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Log in a user
 * @param {Object} credentials - User credentials (email, password)
 * @returns {Promise} - Response from the login API with user data and token
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store token in localStorage for subsequent requests
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      // Also store user data for convenience
      localStorage.setItem('userData', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Log out the current user
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  // If you have a backend logout endpoint, you could call it here
  // Example: return fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
};

/**
 * Get the current authentication token
 * @returns {string|null} - The authentication token or null if not logged in
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user has a token
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Get current user data from localStorage
 * @returns {Object|null} - User data or null if not available
 */
export const getCurrentUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Create headers with authorization token
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} - Headers with auth token
 */
export const getAuthHeaders = (additionalHeaders = {}) => {
  const token = getAuthToken();
  if (token) {
    return {
      ...additionalHeaders,
      'Authorization': `Bearer ${token}`
    };
  }
  return additionalHeaders;
};