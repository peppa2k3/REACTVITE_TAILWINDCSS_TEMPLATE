// const mongoose = require("mongoose");
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    conversationType: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },
    groupName: {
      type: String,
      required: function () {
        return this.conversationType === "group";
      },
    },
    groupAvatar: String,
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for finding conversations by participants
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Method to check if user is participant
conversationSchema.methods.isParticipant = function (userId) {
  return this.participants.some((p) => p.toString() === userId.toString());
};

// module.exports = mongoose.model("Conversation", conversationSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
