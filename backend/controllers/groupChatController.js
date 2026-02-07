import GroupComment from "../models/GroupComment.js";
import GroupPost from "../models/GroupPost.js";

// Create comment
export const createComment = async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body;
    const userId = req.user._id;

    const post = await GroupPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = new GroupComment({
      post: postId,
      author: userId,
      content,
      parentComment: parentCommentId || null,
    });

    await comment.save();
    await comment.populate("author", "name email avatar");

    // Update post
    if (!parentCommentId) {
      post.comments.push(comment._id);
    } else {
      // Update parent comment
      const parentComment = await GroupComment.findById(parentCommentId);
      if (parentComment) {
        parentComment.replies.push(comment._id);
        await parentComment.save();
      }
    }

    await post.save();

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message,
    });
  }
};

// Get comments for post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const comments = await GroupComment.find({
      post: postId,
      parentComment: null,
    })
      .populate("author", "name email avatar")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "name email avatar",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await GroupComment.countDocuments({
      post: postId,
      parentComment: null,
    });

    res.json({
      success: true,
      data: comments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await GroupComment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only author can update comment",
      });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate("author", "name email avatar");

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating comment",
      error: error.message,
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await GroupComment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const post = await GroupPost.findById(comment.post).populate("group");
    const userId = req.user._id;

    // Check if user is author, admin, or creator
    const isAuthor = comment.author.toString() === userId.toString();
    const isAdmin = post.group.admins.some(
      (admin) => admin.toString() === userId.toString(),
    );
    const isCreator = post.group.creator.toString() === userId.toString();

    if (!isAuthor && !isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete comment",
      });
    }

    // Delete all replies
    if (comment.replies.length > 0) {
      await GroupComment.deleteMany({ _id: { $in: comment.replies } });
    }

    // Remove from parent or post
    if (comment.parentComment) {
      const parentComment = await GroupComment.findById(comment.parentComment);
      if (parentComment) {
        parentComment.replies = parentComment.replies.filter(
          (r) => r.toString() !== comment._id.toString(),
        );
        await parentComment.save();
      }
    } else {
      post.comments = post.comments.filter(
        (c) => c.toString() !== comment._id.toString(),
      );
      await post.save();
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    });
  }
};

// Like comment
export const likeComment = async (req, res) => {
  try {
    const comment = await GroupComment.findById(req.params.commentId);
    const userId = req.user._id;

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const likeIndex = comment.likes.findIndex(
      (like) => like.toString() === userId.toString(),
    );

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      data: {
        likes: comment.likes.length,
        isLiked: likeIndex === -1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error liking comment",
      error: error.message,
    });
  }
};

export default {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
};
