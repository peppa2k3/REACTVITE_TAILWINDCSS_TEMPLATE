import mongoose from "mongoose";

const groupPostSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        thumbnail: String,
      },
    ],
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    dislikes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupComment",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    stats: {
      totalLikes: {
        type: Number,
        default: 0,
      },
      totalDislikes: {
        type: Number,
        default: 0,
      },
      totalComments: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
groupPostSchema.index({ group: 1, createdAt: -1 });
groupPostSchema.index({ author: 1 });
groupPostSchema.index({ status: 1 });
groupPostSchema.index({ isPinned: -1, createdAt: -1 });

// Update stats
groupPostSchema.pre("save", function (next) {
  this.stats.totalLikes = this.likes.length;
  this.stats.totalDislikes = this.dislikes.length;
  this.stats.totalComments = this.comments.length;
  next();
});

const GroupPost = mongoose.model("GroupPost", groupPostSchema);

export default GroupPost;
