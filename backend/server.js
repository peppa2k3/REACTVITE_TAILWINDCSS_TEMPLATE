// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const http = require("http");
// const { Server } = require("socket.io");
// const path = require("path");
// const connectDB = require("./config/database");
// const authRoutes = require("./routes/authRoutes");
// const adminRoutes = require("./routes/adminRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const videoCallRoutes = require("./routes/videoCallRoutes");
// const initializeSocket = require("./socket/chatSocket");

// dotenv.config();

// const app = express();
// const server = http.createServer(app);

//import type module
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import path from "path";

import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import videoCallRoutes from "./routes/videoCallRoutes.js";
import { initializeSocket } from "./socket/chatSocket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

//unchange
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB(process.env.MONGODB_URI);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
import { fileURLToPath } from "url";
// Serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create uploads directory if it doesn't exist
// const fs = require("fs");
import fs from "fs";
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Socket.IO
initializeSocket(io);

// Make io accessible to routes
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/video", videoCallRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready`);
});

export default { app, io };
