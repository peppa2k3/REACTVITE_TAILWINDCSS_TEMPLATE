import express from "express";
import {
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
  updateContentPreferences,
} from "../controllers/settingsController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all settings
router.get("/", getSettings);

// Theme settings
router.put("/theme", updateTheme);

// Privacy settings
router.put("/privacy", updatePrivacy);

// Notification settings
router.put("/notifications", updateNotifications);

// Account management
router.put("/account", updateAccount);
router.put("/password", changePassword);

// Two-factor authentication
router.post("/2fa/toggle", toggleTwoFactor);
router.post("/2fa/verify", verifyTwoFactor);

// Session management
router.get("/sessions", getActiveSessions);
router.delete("/sessions/:sessionId", revokeSession);

// Account actions
router.post("/account/lock", lockAccount);
router.delete("/account", deleteAccount);

// Localization
router.put("/localization", updateLocalization);

// Content preferences
router.put("/content", updateContentPreferences);

export default router;
