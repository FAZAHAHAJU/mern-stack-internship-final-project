// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      fetchCurrentUser();
    } else {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (jwtToken) => {
    setToken(jwtToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, loading, login, logout, fetchCurrentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}