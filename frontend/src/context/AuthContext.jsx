import React, { createContext, useState, useEffect } from 'react';
import { login as loginService } from '../services/authService';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginService(email, password);
      if (response.token) {
        localStorage.setItem('token', response.token);
        
        // Use user object from backend if provided, else fallback to mock
        const userData = response.user || { email, role: 'ROLE_CUSTOMER', id: 1 };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      return response;
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
