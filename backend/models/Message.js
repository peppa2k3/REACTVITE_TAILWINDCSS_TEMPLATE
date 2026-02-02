// const mongoose = require("mongoose");
import mongoose from "mongoose";


const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "file", "emoji"],
      default: "text",
    },
    content: {
      type: String,
      required: function () {
        return this.messageType === "text" || this.messageType === "emoji";
      },
    },
    mediaUrl: {
      type: String,
      required: function () {
        return ["image", "video", "file"].includes(this.messageType);
      },
    },
    mediaMetadata: {
      fileName: String,
      fileSize: Number,
      mimeType: String,
      thumbnail: String,
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

// module.exports = mongoose.model("Message", messageSchema);
const Message = mongoose.model("Message", messageSchema);

export default Message;
