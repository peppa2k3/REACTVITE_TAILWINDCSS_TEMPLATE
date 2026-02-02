import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import VideoCall from "../models/VideoCall.js";

// Store active users and their socket IDs
const activeUsers = new Map();

export const initializeSocket = (io) => {
  // Authentication middleware for socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Store user's socket ID
    activeUsers.set(socket.userId, socket.id);

    // Emit user online status
    socket.broadcast.emit("user:online", { userId: socket.userId });

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Join conversation rooms
    socket.on("conversation:join", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (conversation && conversation.isParticipant(socket.userId)) {
          socket.join(`conversation:${conversationId}`);
          console.log(
            `User ${socket.userId} joined conversation ${conversationId}`,
          );
        }
      } catch (error) {
        console.error("Join conversation error:", error);
      }
    });

    // Leave conversation room
    socket.on("conversation:leave", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Send message
    socket.on("message:send", async (data) => {
      try {
        const { conversationId, content, messageType, replyTo } = data;

        // Verify conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.isParticipant(socket.userId)) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        // Create message
        const message = await Message.create({
          conversationId,
          sender: socket.userId,
          messageType: messageType || "text",
          content,
          replyTo: replyTo || null,
          readBy: [{ userId: socket.userId, readAt: new Date() }],
        });

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          lastMessageAt: new Date(),
        });

        // Populate message
        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "name email avatar")
          .populate("replyTo");

        // Emit to conversation room
        io.to(`conversation:${conversationId}`).emit(
          "message:new",
          populatedMessage,
        );

        // Send notification to offline users
        conversation.participants.forEach((participantId) => {
          if (participantId.toString() !== socket.userId) {
            io.to(`user:${participantId}`).emit("conversation:update", {
              conversationId,
              lastMessage: populatedMessage,
            });
          }
        });
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing:start", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:user", {
        userId: socket.userId,
        conversationId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:user", {
        userId: socket.userId,
        conversationId,
        isTyping: false,
      });
    });

    // Mark messages as read
    socket.on("messages:read", async ({ conversationId }) => {
      try {
        await Message.updateMany(
          {
            conversationId,
            sender: { $ne: socket.userId },
            "readBy.userId": { $ne: socket.userId },
          },
          {
            $push: {
              readBy: {
                userId: socket.userId,
                readAt: new Date(),
              },
            },
          },
        );

        // Notify other participants
        socket.to(`conversation:${conversationId}`).emit("messages:read", {
          conversationId,
          userId: socket.userId,
        });
      } catch (error) {
        console.error("Mark as read error:", error);
      }
    });

    // Video call signaling
    socket.on("call:initiate", async (data) => {
      try {
        const { conversationId, callId } = data;

        const conversation = await Conversation.findById(
          conversationId,
        ).populate("participants", "_id");

        if (!conversation) return;

        // Notify other participants
        conversation.participants.forEach((participant) => {
          if (participant._id.toString() !== socket.userId) {
            const participantSocketId = activeUsers.get(
              participant._id.toString(),
            );
            if (participantSocketId) {
              io.to(participantSocketId).emit("call:incoming", {
                callId,
                conversationId,
                caller: socket.userId,
              });
            }
          }
        });
      } catch (error) {
        console.error("Call initiate error:", error);
      }
    });

    // WebRTC signaling
    socket.on("webrtc:offer", ({ to, offer, callId }) => {
      const recipientSocketId = activeUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("webrtc:offer", {
          from: socket.userId,
          offer,
          callId,
        });
      }
    });

    socket.on("webrtc:answer", ({ to, answer, callId }) => {
      const recipientSocketId = activeUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("webrtc:answer", {
          from: socket.userId,
          answer,
          callId,
        });
      }
    });

    socket.on("webrtc:ice-candidate", ({ to, candidate, callId }) => {
      const recipientSocketId = activeUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("webrtc:ice-candidate", {
          from: socket.userId,
          candidate,
          callId,
        });
      }
    });

    socket.on("call:reject", async ({ callId }) => {
      try {
        const call = await VideoCall.findById(callId);
        if (call) {
          call.status = "rejected";
          call.endedAt = new Date();
          await call.save();

          // Notify caller
          const callerSocketId = activeUsers.get(call.caller.toString());
          if (callerSocketId) {
            io.to(callerSocketId).emit("call:rejected", { callId });
          }
        }
      } catch (error) {
        console.error("Call reject error:", error);
      }
    });

    socket.on("call:end", async ({ callId, conversationId }) => {
      // Notify all participants in the call
      io.to(`conversation:${conversationId}`).emit("call:ended", { callId });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
      activeUsers.delete(socket.userId);

      // Emit user offline status
      socket.broadcast.emit("user:offline", { userId: socket.userId });
    });
  });

  return io;
};
