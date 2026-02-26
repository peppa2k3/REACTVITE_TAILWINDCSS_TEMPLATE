import UserSettings from '../models/UserSettings.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

// Get user settings
export const getSettings = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ user: req.user._id });

    if (!settings) {
      // Create default settings
      settings = new UserSettings({ user: req.user._id });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

// Update theme settings
export const updateTheme = async (req, res) => {
  try {
    const { mode, primaryColor, fontSize, fontFamily } = req.body;

    let settings = await UserSettings.findOne({ user: req.user._id });

    if (!settings) {
      settings = new UserSettings({ user: req.user._id });
    }

    if (mode) settings.theme.mode = mode;
    if (primaryColor) settings.theme.primaryColor = primaryColor;
    if (fontSize) settings.theme.fontSize = fontSize;
    if (fontFamily) settings.theme.fontFamily = fontFamily;

    await settings.save();

    res.json({
      success: true,
      data: settings.theme
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating theme',
      error: error.message
    });
  }
};

// Update privacy settings
export const updatePrivacy = async (req, res) => {
  try {
    const updates = req.body;

    let settings = await UserSettings.findOne({ user: req.user._id });

    if (!settings) {
      settings = new UserSettings({ user: req.user._id });
    }

    Object.keys(updates).forEach(key => {
      if (settings.privacy[key] !== undefined) {
        settings.privacy[key] = updates[key];
      }
    });

    await settings.save();

    res.json({
      success: true,
      data: settings.privacy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating privacy',
      error: error.message
    });
  }
};

// Update notification settings
export const updateNotifications = async (req, res) => {
  try {
    const { type, category, value } = req.body;

    let settings = await UserSettings.findOne({ user: req.user._id });

    if (!settings) {
      settings = new UserSettings({ user: req.user._id });
    }

    if (type === 'email') {
      if (category === 'enabled') {
        settings.notifications.email.enabled = value;
      } else {
        settings.notifications.email[category] = value;
      }
    } else if (type === 'push') {
      if (category === 'enabled') {
        settings.notifications.push.enabled = value;
      } else {
        settings.notifications.push[category] = value;
      }
    } else if (type === 'inApp') {
      settings.notifications.inApp[category] = value;
    }

    await settings.save();

    res.json({
      success: true,
      data: settings.notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notifications',
      error: error.message
    });
  }
};

// Update account info
export const updateAccount = async (req, res) => {
  try {
    const { name, email, phone, bio, avatar, dateOfBirth, gender, location } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email;
      user.isVerified = false; // Require re-verification
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (location) user.location = location;

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        location: user.location
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating account',
      error: error.message
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// Enable/Disable two-factor authentication
export const toggleTwoFactor = async (req, res) => {
  try {
    const { enable } = req.body;

    let settings = await UserSettings.findOne({ user: req.user._id });

    if (!settings) {
      settings = new UserSettings({ user: req.user._id });
    }

    if (enable) {
      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `Social App (${req.user.email})`
      });

      settings.security.twoFactorSecret = secret.base32;
      await settings.save();

      // Generate QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

      res.json({
        success: true,
        data: {
          secret: secret.base32,
          qrCode: qrCodeUrl
        }
      });
    } else {
      settings.security.twoFactorEnabled = false;
      settings.security.twoFactorSecret = undefined;
      await settings.save();

      res.json({
        success: true,
        message: 'Two-factor authentication disabled'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling two-factor authentication',
      error: error.message
    });
  }
};

// Verify two-factor code
export const verifyTwoFactor = async (req, res) => {
  try {
    const { token } = req.body;

    const settings = await UserSettings.findOne({ user: req.user._id });

    if (!settings || !settings.security.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor not set up'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: settings.security.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }

    settings.security.twoFactorEnabled = true;
    await settings.save();

    res.json({
      success: true,
      message: 'Two-factor authentication enabled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying two-factor code',
      error: error.message
    });
  }
};

// Get active sessions
export const getActiveSessions = async (req, res) => {
  try {
    const settings = await UserSettings.findOne({ user: req.user._id });

    if (!settings) {
      return res.json({
        success: true,
        data: []
      });
    }

    res.json({
      success: true,
      data: settings.security.activeSessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions',
      error: error.message
    });
  }
};

// Revoke session
export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const settings = await UserSettings.findOne({ user: req.user._id });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }

    settings.security.activeSessions = settings.security.activeSessions.filter(
      session => session._id.toString() !== sessionId
    );

    await settings.save();

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error revoking session',
      error: error.message
    });
  }
};

// Lock account
export const lockAccount = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isLocked = true;
    user.lockReason = reason || 'User requested';
    user.lockedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'Account locked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error locking account',
      error: error.message
    });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const { password, confirmDelete } = req.body;

    if (!confirmDelete || confirmDelete !== 'DELETE') {
      return res.status(400).json({
        success: false,
        message: 'Please type DELETE to confirm'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Soft delete - mark as deleted
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    // Or hard delete
    // await user.deleteOne();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};

// Update localization
export const updateLocalization = async (req, res) => {
  try {
    const { language, timezone, dateFormat, timeFormat } = req.body;

    let settings = await UserSettings.findOne({ user: req.user._id });

    if (!settings) {
      settings = new UserSettings({ user: req.user._id });
    }

    if (language) settings.localization.language = language;
    if (timezone) settings.localization.timezone = timezone;
    if (dateFormat) settings.localization.dateFormat = dateFormat;
    if (timeFormat) settings.localization.timeFormat = timeFormat;

    await settings.save();

    res.json({
      success: true,
      data: settings.localization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating localization',
      error: error.message
    });
  }
};

// Update content preferences
export const updateContentPreferences = async (req, res) => {
  try {
    const { autoPlayVideos, showSensitiveContent, dataUsage } = req.body;

    let settings = await UserSettings.findOne({ user: req.user._id });

    if (!settings) {
      settings = new UserSettings({ user: req.user._id });
    }

    if (autoPlayVideos !== undefined) settings.content.autoPlayVideos = autoPlayVideos;
    if (showSensitiveContent !== undefined) settings.content.showSensitiveContent = showSensitiveContent;
    if (dataUsage) settings.content.dataUsage = dataUsage;

    await settings.save();

    res.json({
      success: true,
      data: settings.content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating content preferences',
      error: error.message
    });
  }
};

export default {
  getSettings,
  updateTheme,
  updatePrivacy,
  updateNotifications,
  updateAccount,
  changePassword,
  toggleTwoFactor,
  verifyTwoFactor,
  getActiveSessions,
  revokeSession,
  lockAccount,
  deleteAccount,
  updateLocalization,
  updateContentPreferences
};
