import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Kullanıcı bilgilerini getir
  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('api/v1/users/profile');
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [fetchUserData]);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        await fetchUserData();
        return response.data;
      } else {
        throw new Error('Token alınamadı');
      }
    } catch (error) {
      console.error('Login hatası:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register hatası:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    register,
    logout,
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 