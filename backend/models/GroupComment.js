import mongoose from "mongoose";

const groupCommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupPost",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupComment",
      default: null,
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupComment",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
  },
  {
    timestamps: true,
  },
);

// Indexes
groupCommentSchema.index({ post: 1, createdAt: -1 });
groupCommentSchema.index({ author: 1 });
groupCommentSchema.index({ parentComment: 1 });

const GroupComment = mongoose.model("GroupComment", groupCommentSchema);

export default GroupComment;
