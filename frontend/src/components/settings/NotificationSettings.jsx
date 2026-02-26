// ============================================
// NotificationSettings.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const NotificationSettings = () => {
  const { settings, updateNotifications } = useSettings();
  const [notifications, setNotifications] = useState({
    email: {
      enabled: true,
      newMessage: true,
      friendRequest: true,
      postLike: true,
      postComment: true,
      groupInvite: true,
    },
    push: {
      enabled: true,
      newMessage: true,
      friendRequest: true,
      postLike: false,
      postComment: true,
      groupInvite: true,
    },
    inApp: {
      sound: true,
      vibration: true,
    },
  });

  useEffect(() => {
    if (settings?.notifications) {
      setNotifications(settings.notifications);
    }
  }, [settings]);

  const handleToggle = async (type, category) => {
    const newValue = !notifications[type][category];

    setNotifications({
      ...notifications,
      [type]: {
        ...notifications[type],
        [category]: newValue,
      },
    });

    try {
      await updateNotifications({ type, category, value: newValue });
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  const NotificationToggle = ({ type, category, label, description }) => (
    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</div>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={notifications[type][category]}
          onChange={() => handleToggle(type, category)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage how you receive notifications
        </p>
      </div>

      <div className="space-y-8">
        {/* Email Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Email Notifications
          </h3>
          <div className="space-y-3">
            <NotificationToggle
              type="email"
              category="enabled"
              label="Enable Email Notifications"
              description="Receive notifications via email"
            />
            {notifications.email.enabled && (
              <>
                <NotificationToggle type="email" category="newMessage" label="New Messages" />
                <NotificationToggle type="email" category="friendRequest" label="Friend Requests" />
                <NotificationToggle type="email" category="postLike" label="Post Likes" />
                <NotificationToggle type="email" category="postComment" label="Post Comments" />
                <NotificationToggle type="email" category="groupInvite" label="Group Invitations" />
              </>
            )}
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Push Notifications
          </h3>
          <div className="space-y-3">
            <NotificationToggle
              type="push"
              category="enabled"
              label="Enable Push Notifications"
              description="Receive notifications on your device"
            />
            {notifications.push.enabled && (
              <>
                <NotificationToggle type="push" category="newMessage" label="New Messages" />
                <NotificationToggle type="push" category="friendRequest" label="Friend Requests" />
                <NotificationToggle type="push" category="postLike" label="Post Likes" />
                <NotificationToggle type="push" category="postComment" label="Post Comments" />
                <NotificationToggle type="push" category="groupInvite" label="Group Invitations" />
              </>
            )}
          </div>
        </div>

        {/* In-App Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            In-App Notifications
          </h3>
          <div className="space-y-3">
            <NotificationToggle
              type="inApp"
              category="sound"
              label="Sound"
              description="Play sound for notifications"
            />
            <NotificationToggle
              type="inApp"
              category="vibration"
              label="Vibration"
              description="Vibrate for notifications"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings