import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    avatar: {
      type: String,
      default: null,
    },
    cover: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        role: {
          type: String,
          enum: ["member", "admin", "creator"],
          default: "member",
        },
      },
    ],
    pendingMembers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      allowMemberPosts: {
        type: Boolean,
        default: true,
      },
      requirePostApproval: {
        type: Boolean,
        default: false,
      },
      allowMemberInvites: {
        type: Boolean,
        default: true,
      },
    },
    stats: {
      totalMembers: {
        type: Number,
        default: 0,
      },
      totalPosts: {
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
groupSchema.index({ creator: 1 });
groupSchema.index({ "members.user": 1 });
groupSchema.index({ type: 1 });
groupSchema.index({ createdAt: -1 });

// Update stats before saving
groupSchema.pre("save", function (next) {
  this.stats.totalMembers = this.members.length;
  next();
});

const Group = mongoose.model("Group", groupSchema);

export default Group;
