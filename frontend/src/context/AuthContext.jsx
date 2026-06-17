import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const processToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      // Backend JWT typically stores subject as the email
      // We also need role. Ensure backend sets roles as authorities or claims.
      // Usually Spring Security includes roles in a specific claim.
      // We will parse role and sub.
      const parsedUser = {
        email: decoded.sub,
        role: Array.isArray(decoded.roles) ? decoded.roles[0] : decoded.roles || decoded.role || 'ROLE_STUDENT', // Fallback, we'll verify this
      };
      // Let's also check if authorities is an array like "roles": ["ROLE_ADMIN"] or "role": "ROLE_ADMIN"
      if (decoded.authorities && Array.isArray(decoded.authorities) && decoded.authorities.length > 0) {
        parsedUser.role = decoded.authorities[0].authority || decoded.authorities[0];
      }
      setUser(parsedUser);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Invalid token', e);
      logout();
    }
  };

  useEffect(() => {
    // Check if token exists in local storage
    const token = localStorage.getItem('token');
    if (token) {
      processToken(token);
    }
    setLoading(false);

    // Listen for auth errors from axios interceptor
    const handleAuthError = () => {
      logout();
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { accessToken } = response.data;
      localStorage.setItem('token', accessToken);
      processToken(accessToken);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
