import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

// Create comment
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { content, parentCommentId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // If it's a reply, check parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      if (parentComment.post.toString() !== postId) {
        return res
          .status(400)
          .json({ message: "Parent comment does not belong to this post" });
      }
    }

    const comment = new Comment({
      post: postId,
      author: userId,
      content: content.trim(),
      parentComment: parentCommentId || null,
    });

    await comment.save();
    await comment.populate("author", "username email profilePicture");

    // Update post comment count
    post.commentsCount += 1;
    await post.save();

    // Update parent comment reply count
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { repliesCount: 1 },
      });
    }

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("new-comment", {
        postId,
        comment,
        parentCommentId,
      });
      io.emit("post-updated", {
        postId,
        commentsCount: post.commentsCount,
      });
    }

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      message: "Failed to create comment",
      error: error.message,
    });
  }
};

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const parentCommentId = req.query.parentCommentId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Build query
    const query = {
      post: postId,
      parentComment: parentCommentId || null,
    };

    const comments = await Comment.find(query)
      .populate("author", "username email profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add user reaction info to each comment
    const commentsWithReactions = comments.map((comment) => ({
      ...comment,
      userReaction:
        comment.likes.find((like) => like.user.toString() === userId.toString())
          ?.type || null,
    }));

    const total = await Comment.countDocuments(query);

    res.json({
      comments: commentsWithReactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      message: "Failed to load comments",
      error: error.message,
    });
  }
};

// Get replies for a comment
export const getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const replies = await Comment.find({ parentComment: commentId })
      .populate("author", "username email profilePicture")
      .sort({ createdAt: 1 }) // Oldest first for replies
      .skip(skip)
      .limit(limit)
      .lean();

    const repliesWithReactions = replies.map((reply) => ({
      ...reply,
      userReaction:
        reply.likes.find((like) => like.user.toString() === userId.toString())
          ?.type || null,
    }));

    const total = await Comment.countDocuments({ parentComment: commentId });

    res.json({
      replies: repliesWithReactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get replies error:", error);
    res.status(500).json({
      message: "Failed to load replies",
      error: error.message,
    });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own comments" });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate("author", "username email profilePicture");

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("comment-updated", comment);
    }

    res.json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({
      message: "Failed to update comment",
      error: error.message,
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comments" });
    }

    const postId = comment.post;
    const parentCommentId = comment.parentComment;

    // Delete all replies to this comment
    const deletedReplies = await Comment.deleteMany({
      parentComment: commentId,
    });

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Update post comment count
    const totalDeleted = 1 + deletedReplies.deletedCount;
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: -totalDeleted },
    });

    // Update parent comment reply count if exists
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { repliesCount: -1 },
      });
    }

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("comment-deleted", {
        commentId,
        postId,
        parentCommentId,
      });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};

// Toggle comment reaction (like/dislike)
export const toggleCommentReaction = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const { type } = req.body; // 'like' or 'dislike'

    if (!["like", "dislike"].includes(type)) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Find existing reaction
    const existingReactionIndex = comment.likes.findIndex(
      (like) => like.user.toString() === userId,
    );

    if (existingReactionIndex !== -1) {
      const existingType = comment.likes[existingReactionIndex].type;

      if (existingType === type) {
        // Remove reaction
        comment.likes.splice(existingReactionIndex, 1);
        if (type === "like") {
          comment.likesCount = Math.max(0, comment.likesCount - 1);
        } else {
          comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
        }
      } else {
        // Change reaction type
        comment.likes[existingReactionIndex].type = type;
        comment.likes[existingReactionIndex].createdAt = new Date();

        if (type === "like") {
          comment.likesCount += 1;
          comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
        } else {
          comment.dislikesCount += 1;
          comment.likesCount = Math.max(0, comment.likesCount - 1);
        }
      }
    } else {
      // Add new reaction
      comment.likes.push({ user: userId, type });
      if (type === "like") {
        comment.likesCount += 1;
      } else {
        comment.dislikesCount += 1;
      }
    }

    await comment.save();

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("comment-reaction-updated", {
        commentId,
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
      });
    }

    res.json({
      message: "Reaction updated successfully",
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      userReaction: comment.getUserReaction(userId),
    });
  } catch (error) {
    console.error("Toggle comment reaction error:", error);
    res.status(500).json({
      message: "Failed to update reaction",
      error: error.message,
    });
  }
};

export default {
  createComment,
  getComments,
  getReplies,
  updateComment,
  deleteComment,
  toggleCommentReaction,
};
