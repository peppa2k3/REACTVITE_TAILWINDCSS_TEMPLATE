// const mongoose = require("mongoose");
import mongoose from "mongoose";

const videoCallSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: Date,
        leftAt: Date,
      },
    ],
    status: {
      type: String,
      enum: ["calling", "ringing", "active", "ended", "missed", "rejected"],
      default: "calling",
    },
    startedAt: Date,
    endedAt: Date,
    duration: Number, // in seconds
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

videoCallSchema.index({ conversationId: 1, createdAt: -1 });
videoCallSchema.index({ roomId: 1 });

// module.exports = mongoose.model("VideoCall", videoCallSchema);
const VideoCall = mongoose.model("VideoCall", videoCallSchema);

export default VideoCall;
