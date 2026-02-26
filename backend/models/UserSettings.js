import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Theme Settings
  theme: {
    mode: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    primaryColor: {
      type: String,
      default: '#3B82F6' // blue-600
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    fontFamily: {
      type: String,
      enum: ['system', 'sans', 'serif', 'mono'],
      default: 'system'
    }
  },
  // Privacy Settings
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    showPhone: {
      type: Boolean,
      default: false
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    allowFriendRequests: {
      type: Boolean,
      default: true
    },
    allowMessages: {
      type: String,
      enum: ['everyone', 'friends', 'nobody'],
      default: 'everyone'
    }
  },
  // Notification Settings
  notifications: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      newMessage: {
        type: Boolean,
        default: true
      },
      friendRequest: {
        type: Boolean,
        default: true
      },
      postLike: {
        type: Boolean,
        default: true
      },
      postComment: {
        type: Boolean,
        default: true
      },
      groupInvite: {
        type: Boolean,
        default: true
      }
    },
    push: {
      enabled: {
        type: Boolean,
        default: true
      },
      newMessage: {
        type: Boolean,
        default: true
      },
      friendRequest: {
        type: Boolean,
        default: true
      },
      postLike: {
        type: Boolean,
        default: false
      },
      postComment: {
        type: Boolean,
        default: true
      },
      groupInvite: {
        type: Boolean,
        default: true
      }
    },
    inApp: {
      sound: {
        type: Boolean,
        default: true
      },
      vibration: {
        type: Boolean,
        default: true
      }
    }
  },
  // Security Settings
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String,
    loginAlerts: {
      type: Boolean,
      default: true
    },
    activeSessions: [{
      deviceName: String,
      deviceType: String,
      location: String,
      ipAddress: String,
      lastActive: Date,
      token: String
    }]
  },
  // Language & Region
  localization: {
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
      default: 'DD/MM/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '24h'
    }
  },
  // Content Preferences
  content: {
    autoPlayVideos: {
      type: Boolean,
      default: true
    },
    showSensitiveContent: {
      type: Boolean,
      default: false
    },
    dataUsage: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  }
}, {
  timestamps: true
});

// Index
userSettingsSchema.index({ user: 1 });

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

export default UserSettings;
