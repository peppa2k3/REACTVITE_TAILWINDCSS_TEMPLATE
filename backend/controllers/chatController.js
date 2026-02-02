import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs/promises";

// Get all conversations for a user
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true,
    })
      .populate("participants", "name email avatar")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 })
      .lean();

    // Format conversations with unread count
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: userId },
          "readBy.userId": { $ne: userId },
        });

        return {
          ...conv,
          unreadCount,
        };
      }),
    );

    res.json({ conversations: formattedConversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get or create conversation
const getOrCreateConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.id;

    if (participantId === userId) {
      return res
        .status(400)
        .json({ message: "Cannot create conversation with yourself" });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      conversationType: "direct",
      participants: { $all: [userId, participantId], $size: 2 },
    })
      .populate("participants", "name email avatar")
      .populate("lastMessage");

    // Create new conversation if not exists
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, participantId],
        conversationType: "direct",
      });

      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "name email avatar",
      );
    }

    res.json({ conversation });
  } catch (error) {
    console.error("Get/Create conversation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({
      conversationId,
      isDeleted: false,
    })
      .populate("sender", "name email avatar")
      .populate("replyTo")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Message.countDocuments({
      conversationId,
      isDeleted: false,
    });

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = "text", replyTo } = req.body;
    const userId = req.user.id;

    // Verify conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      sender: userId,
      messageType,
      content,
      replyTo: replyTo || null,
      readBy: [{ userId, readAt: new Date() }],
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

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload media
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { conversationId, replyTo } = req.body;
    const userId = req.user.id;
    const file = req.file;

    // Verify conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Determine message type
    let messageType = "file";
    if (file.mimetype.startsWith("image/")) {
      messageType = "image";
    } else if (file.mimetype.startsWith("video/")) {
      messageType = "video";
    }

    // Create message with media
    const message = await Message.create({
      conversationId,
      sender: userId,
      messageType,
      mediaUrl: `/uploads/${file.filename}`,
      mediaMetadata: {
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
      replyTo: replyTo || null,
      readBy: [{ userId, readAt: new Date() }],
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

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error("Upload media error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isParticipant(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update unread messages
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        "readBy.userId": { $ne: userId },
      },
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date(),
          },
        },
      },
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ message: "Message deleted" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search users for new conversation
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    if (!query || query.length < 2) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("name email avatar")
      .limit(10);

    res.json({ users });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  uploadMedia,
  markAsRead,
  deleteMessage,
  searchUsers,
};
