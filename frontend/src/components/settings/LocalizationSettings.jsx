// ============================================
// LocalizationSettings.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const LocalizationSettings = () => {
  const { settings, updateLocalization } = useSettings();
  const [localization, setLocalization] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (settings?.localization) {
      setLocalization(settings.localization);
    }
  }, [settings]);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      await updateLocalization(localization);
      setMessage('Settings updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Language & Region</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set your preferred language and regional settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <select
            value={localization.language}
            onChange={(e) => setLocalization({ ...localization, language: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Format
          </label>
          <select
            value={localization.dateFormat}
            onChange={(e) => setLocalization({ ...localization, dateFormat: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        {/* Time Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '12h', label: '12-hour (AM/PM)' },
              { value: '24h', label: '24-hour' },
            ].map((format) => (
              <label
                key={format.value}
                className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  localization.timeFormat === format.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  checked={localization.timeFormat === format.value}
                  onChange={() => setLocalization({ ...localization, timeFormat: format.value })}
                  className="w-4 h-4"
                />
                <span className="font-medium text-gray-900 dark:text-white">{format.label}</span>
              </label>
            ))}
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes('Error')
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalizationSettings;
