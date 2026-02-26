import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const ThemeSettings = () => {
  const { theme, updateTheme } = useSettings();
  const [localTheme, setLocalTheme] = useState(theme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const colors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' }
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      await updateTheme(localTheme);
      setMessage('Theme updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating theme');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Appearance
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Customize how your app looks
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Theme Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['light', 'dark', 'auto'].map((mode) => (
              <button
                key={mode}
                onClick={() => setLocalTheme({ ...localTheme, mode })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  localTheme.mode === mode
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${
                    mode === 'light' ? 'bg-white border-2 border-gray-300' :
                    mode === 'dark' ? 'bg-gray-900 border-2 border-gray-700' :
                    'bg-gradient-to-br from-white to-gray-900 border-2 border-gray-500'
                  }`} />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white capitalize">
                      {mode}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {mode === 'auto' ? 'Match system' : `${mode} mode`}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Primary Color
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => setLocalTheme({ ...localTheme, primaryColor: color.value })}
                className={`relative p-4 border-2 rounded-lg transition-all ${
                  localTheme.primaryColor === color.value
                    ? 'border-gray-900 dark:border-white'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div
                  className="w-full h-12 rounded-md"
                  style={{ backgroundColor: color.value }}
                />
                <div className="mt-2 text-xs font-medium text-center text-gray-700 dark:text-gray-300">
                  {color.name}
                </div>
                {localTheme.primaryColor === color.value && (
                  <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Font Size
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'small', label: 'Small', sample: 'Aa' },
              { value: 'medium', label: 'Medium', sample: 'Aa' },
              { value: 'large', label: 'Large', sample: 'Aa' }
            ].map((size) => (
              <button
                key={size.value}
                onClick={() => setLocalTheme({ ...localTheme, fontSize: size.value })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  localTheme.fontSize === size.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className={`font-bold mb-2 ${
                  size.value === 'small' ? 'text-2xl' :
                  size.value === 'medium' ? 'text-3xl' :
                  'text-4xl'
                }`}>
                  {size.sample}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {size.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Font Family
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: 'system', label: 'System Default' },
              { value: 'sans', label: 'Sans Serif' },
              { value: 'serif', label: 'Serif' },
              { value: 'mono', label: 'Monospace' }
            ].map((font) => (
              <button
                key={font.value}
                onClick={() => setLocalTheme({ ...localTheme, fontFamily: font.value })}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  localTheme.fontFamily === font.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className={`text-lg mb-1 ${
                  font.value === 'serif' ? 'font-serif' :
                  font.value === 'mono' ? 'font-mono' :
                  'font-sans'
                }`}>
                  The quick brown fox
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {font.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('Error')
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
          }`}>
            {message}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
