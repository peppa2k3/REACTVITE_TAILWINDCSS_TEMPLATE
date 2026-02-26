// ============================================
// PrivacySettings.jsx - Privacy controls
// ============================================
import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const PrivacySettings = () => {
  const { settings, updatePrivacy } = useSettings();
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showOnlineStatus: true,
    allowFriendRequests: true,
    allowMessages: 'everyone',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (settings?.privacy) {
      setPrivacy(settings.privacy);
    }
  }, [settings]);

  const handleToggle = (key) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] });
  };

  const handleSelect = (key, value) => {
    setPrivacy({ ...privacy, [key]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      await updatePrivacy(privacy);
      setMessage('Privacy settings updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating privacy settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Privacy Settings</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Control who can see your information
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Profile Visibility
          </label>
          <div className="space-y-2">
            {[
              { value: 'public', label: 'Public', desc: 'Anyone can see your profile' },
              {
                value: 'friends',
                label: 'Friends Only',
                desc: 'Only friends can see your profile',
              },
              { value: 'private', label: 'Private', desc: 'Only you can see your profile' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <input
                  type="radio"
                  checked={privacy.profileVisibility === option.value}
                  onChange={() => handleSelect('profileVisibility', option.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Contact Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Show Email</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Display email on profile
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showEmail}
                  onChange={() => handleToggle('showEmail')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Show Phone</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Display phone on profile
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showPhone}
                  onChange={() => handleToggle('showPhone')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Activity Status */}
        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Show Online Status</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Let others see when you're online
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={privacy.showOnlineStatus}
              onChange={() => handleToggle('showOnlineStatus')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Interactions */}
        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Allow Friend Requests</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Let people send you friend requests
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={privacy.allowFriendRequests}
              onChange={() => handleToggle('allowFriendRequests')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Messages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Who Can Message You
          </label>
          <div className="space-y-2">
            {[
              { value: 'everyone', label: 'Everyone' },
              { value: 'friends', label: 'Friends Only' },
              { value: 'nobody', label: 'Nobody' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <input
                  type="radio"
                  checked={privacy.allowMessages === option.value}
                  onChange={() => handleSelect('allowMessages', option.value)}
                  className="w-4 h-4"
                />
                <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
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
export default PrivacySettings;
