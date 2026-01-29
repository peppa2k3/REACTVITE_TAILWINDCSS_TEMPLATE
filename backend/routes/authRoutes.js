import express from "express";
import passport from "passport";
import {
  register,
  verifyEmail,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyEmailValidation,
} from "../validators/authValidator.js";
import { generateToken, generateRefreshToken } from "../utils/helpers.js";

const router = express.Router();

// Regular Auth Routes
router.post("/register", registerValidation, validate, register);
router.post("/verify-email", verifyEmailValidation, validate, verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/login", loginValidation, validate, login);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validate,
  forgotPassword,
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  validate,
  resetPassword,
);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    session: false,
  }),
  async (req, res) => {
    try {
      // Generate tokens
      const accessToken = generateToken(req.user._id);
      const refreshToken = generateRefreshToken(req.user._id);

      // Save refresh token
      req.user.refreshToken = refreshToken;
      await req.user.save();

      // Redirect to frontend with token
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`,
      );
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  },
);

export default router;
