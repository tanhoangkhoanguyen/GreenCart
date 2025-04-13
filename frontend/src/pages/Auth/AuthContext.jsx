// src/pages/Auth/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { isAuthenticated, getAuthToken, logoutUser } from './authService';

// Create context
const AuthContext = createContext();

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on initial render
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      
      if (isAuth) {
        // Try to get user data from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('authToken', token);
    setUser(userData);
    setAuthenticated(true);
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setAuthenticated(false);
  };

  const value = {
    user,
    authenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;