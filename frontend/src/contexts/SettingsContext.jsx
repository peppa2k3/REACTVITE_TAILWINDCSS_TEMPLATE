import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../env/apiURL';
const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState({
    mode: 'light',
    primaryColor: '#3B82F6',
    fontSize: 'medium',
    fontFamily: 'system',
  });

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/settings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setSettings(response.data.data);
      setTheme(response.data.data.theme);

      // Apply theme
      applyTheme(response.data.data.theme);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update theme
  const updateTheme = async (themeData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/settings/theme`, themeData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      setTheme(response.data.data);
      setSettings({ ...settings, theme: response.data.data });
      applyTheme(response.data.data);

      return response.data;
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  };

  // Update privacy
  const updatePrivacy = async (privacyData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/settings/privacy`, privacyData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      setSettings({ ...settings, privacy: response.data.data });
      return response.data;
    } catch (error) {
      console.error('Error updating privacy:', error);
      throw error;
    }
  };

  // Update notifications
  const updateNotifications = async (notificationData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/settings/notifications`,
        notificationData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      setSettings({ ...settings, notifications: response.data.data });
      return response.data;
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  };

  // Update account
  const updateAccount = async (accountData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/settings/account`, accountData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/settings/password`, passwordData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  // Delete account
  const deleteAccount = async (deleteData) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/settings/account`, {
        data: deleteData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  // Apply theme to document
  const applyTheme = (themeData) => {
    const root = document.documentElement;

    // Apply dark mode
    if (themeData.mode === 'dark') {
      root.classList.add('dark');
    } else if (themeData.mode === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.fontSize = fontSizes[themeData.fontSize] || '16px';

    // Apply font family
    const fontFamilies = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      sans: 'Inter, system-ui, sans-serif',
      serif: 'Georgia, serif',
      mono: '"Fira Code", monospace',
    };
    root.style.fontFamily = fontFamilies[themeData.fontFamily] || fontFamilies.system;
  };

  // Load settings on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, []);

  const value = {
    settings,
    theme,
    loading,
    fetchSettings,
    updateTheme,
    updatePrivacy,
    updateNotifications,
    updateAccount,
    changePassword,
    deleteAccount,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
