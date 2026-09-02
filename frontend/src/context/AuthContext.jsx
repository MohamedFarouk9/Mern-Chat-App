import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children  }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tok) => {
    try {
      // The interceptor will automatically attach the token, but since we are verifying it,
      // it's already in localStorage.
      const res = await api.get('/api/user/profile');
      setUser(res.data.profile);
    } catch (error) {
      console.error('Token verification failed');
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, confirmPassword, firstName, lastName, username) => {
    try {
      const res = await api.post('/api/auth/register', {
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
        username,
      });
      return { success: true, message: res.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', {
        email,
        password,
      });
      const { token: newToken } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      const profileRes = await api.get('/api/user/profile');
      setUser(profileRes.data.profile);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

