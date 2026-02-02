// const express = require("express");
// const router = express.Router();
// const chatController = require("../controllers/chatController");
// const { authenticate } = require("../middleware/auth");
// const multer = require("multer");
// const path = require("path");

//type module
import express from "express";
import chatController from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images and videos
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|pdf|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, videos and documents are allowed.",
      ),
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: fileFilter,
});

// All routes require authentication
router.use(protect);

// Conversation routes
router.get("/conversations", chatController.getConversations);
router.post("/conversations", chatController.getOrCreateConversation);

// Message routes
router.get(
  "/conversations/:conversationId/messages",
  chatController.getMessages,
);
router.post("/messages", chatController.sendMessage);
router.post(
  "/messages/upload",
  upload.single("file"),
  chatController.uploadMedia,
);
router.patch("/conversations/:conversationId/read", chatController.markAsRead);
router.delete("/messages/:messageId", chatController.deleteMessage);

// Search users
router.get("/users/search", chatController.searchUsers);

// module.exports = router;
export default router;
