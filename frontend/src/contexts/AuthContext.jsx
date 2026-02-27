import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { API_BASE_URL } from './../env/apiURL';
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log('contextauth', context);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  //add setToken
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        //add setToken
        setToken(token);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    const response = await api.post('/auth/login', { email, password, rememberMe });
    const { user, accessToken, refreshToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));

    if (rememberMe && refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    setUser(user);
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  };

  const verifyEmail = async (email, otp) => {
    const response = await api.post('/auth/verify-email', { email, otp });
    return response.data;
  };

  const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const refreshToken = params.get('refreshToken');

      if (token) {
        localStorage.setItem('accessToken', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        // Gọi /me để lấy thông tin user
        try {
          const res = await api.get('/auth/me');
          localStorage.setItem('user', JSON.stringify(res.data.data));
          setUser(res.data.data);
          setToken(token);
        } catch (err) {
          console.error(err);
        }

        // Xóa query params khỏi URL (cho đẹp)
        window.history.replaceState({}, document.title, '/dashboard'); // hoặc trang bạn muốn
      }
    };

    if (window.location.pathname === '/auth/callback') {
      handleCallback();
    }
  }, []);
  const loginWithGoogle = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const value = {
    token,
    user,
    loading,
    login,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
