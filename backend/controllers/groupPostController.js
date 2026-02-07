import GroupPost from "../models/GroupPost.js";
import GroupComment from "../models/GroupComment.js";
import Group from "../models/Group.js";

// Create post in group
export const createGroupPost = async (req, res) => {
  try {
    const { groupId, content, media } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is member
    const isMember = group.members.some(
      (m) => m.user.toString() === userId.toString(),
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Only members can post",
      });
    }

    // Check if member can post
    if (!group.settings.allowMemberPosts) {
      const isAdmin = group.admins.some(
        (admin) => admin.toString() === userId.toString(),
      );
      const isCreator = group.creator.toString() === userId.toString();

      if (!isAdmin && !isCreator) {
        return res.status(403).json({
          success: false,
          message: "Only admins can post in this group",
        });
      }
    }

    const post = new GroupPost({
      group: groupId,
      author: userId,
      content,
      media: media || [],
      status: group.settings.requirePostApproval ? "pending" : "approved",
    });

    await post.save();
    await post.populate("author", "name email avatar");

    // Update group stats
    if (post.status === "approved") {
      group.stats.totalPosts += 1;
      await group.save();
    }

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message,
    });
  }
};

// Get posts in group
export const getGroupPosts = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is member for private groups
    if (group.type === "private") {
      const isMember = group.members.some(
        (m) => m.user.toString() === userId.toString(),
      );

      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    const query = {
      group: groupId,
      status: "approved",
    };

    const posts = await GroupPost.find(query)
      .populate("author", "name email avatar")
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add user interaction status
    const postsWithStatus = posts.map((post) => ({
      ...post,
      isLiked: post.likes.some(
        (like) => like.user.toString() === userId.toString(),
      ),
      isDisliked: post.dislikes.some(
        (dislike) => dislike.user.toString() === userId.toString(),
      ),
    }));

    const count = await GroupPost.countDocuments(query);

    res.json({
      success: true,
      data: postsWithStatus,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
      error: error.message,
    });
  }
};

// Get single post
export const getGroupPost = async (req, res) => {
  try {
    const post = await GroupPost.findById(req.params.postId)
      .populate("author", "name email avatar")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name email avatar",
        },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId = req.user._id;

    res.json({
      success: true,
      data: {
        ...post.toObject(),
        isLiked: post.likes.some(
          (like) => like.user.toString() === userId.toString(),
        ),
        isDisliked: post.dislikes.some(
          (dislike) => dislike.user.toString() === userId.toString(),
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching post",
      error: error.message,
    });
  }
};

// Update post
export const updateGroupPost = async (req, res) => {
  try {
    const { content, media } = req.body;
    const post = await GroupPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only author can update post",
      });
    }

    if (content) post.content = content;
    if (media) post.media = media;

    await post.save();
    await post.populate("author", "name email avatar");

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating post",
      error: error.message,
    });
  }
};

// Delete post
export const deleteGroupPost = async (req, res) => {
  try {
    const post = await GroupPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const group = await Group.findById(post.group);
    const userId = req.user._id;

    // Check if user is author, admin, or creator
    const isAuthor = post.author.toString() === userId.toString();
    const isAdmin = group.admins.some(
      (admin) => admin.toString() === userId.toString(),
    );
    const isCreator = group.creator.toString() === userId.toString();

    if (!isAuthor && !isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete post",
      });
    }

    // Delete all comments
    await GroupComment.deleteMany({ post: post._id });

    await post.deleteOne();

    // Update group stats
    if (post.status === "approved") {
      group.stats.totalPosts = Math.max(0, group.stats.totalPosts - 1);
      await group.save();
    }

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: error.message,
    });
  }
};

// Like post
export const likeGroupPost = async (req, res) => {
  try {
    const post = await GroupPost.findById(req.params.postId);
    const userId = req.user._id;

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Remove dislike if exists
    post.dislikes = post.dislikes.filter(
      (dislike) => dislike.user.toString() !== userId.toString(),
    );

    // Toggle like
    const likeIndex = post.likes.findIndex(
      (like) => like.user.toString() === userId.toString(),
    );

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push({ user: userId, createdAt: new Date() });
    }

    await post.save();

    res.json({
      success: true,
      data: {
        likes: post.stats.totalLikes,
        dislikes: post.stats.totalDislikes,
        isLiked: likeIndex === -1,
        isDisliked: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error liking post",
      error: error.message,
    });
  }
};

// Dislike post
export const dislikeGroupPost = async (req, res) => {
  try {
    const post = await GroupPost.findById(req.params.postId);
    const userId = req.user._id;

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Remove like if exists
    post.likes = post.likes.filter(
      (like) => like.user.toString() !== userId.toString(),
    );

    // Toggle dislike
    const dislikeIndex = post.dislikes.findIndex(
      (dislike) => dislike.user.toString() === userId.toString(),
    );

    if (dislikeIndex > -1) {
      post.dislikes.splice(dislikeIndex, 1);
    } else {
      post.dislikes.push({ user: userId, createdAt: new Date() });
    }

    await post.save();

    res.json({
      success: true,
      data: {
        likes: post.stats.totalLikes,
        dislikes: post.stats.totalDislikes,
        isLiked: false,
        isDisliked: dislikeIndex === -1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error disliking post",
      error: error.message,
    });
  }
};

// Pin/Unpin post
export const togglePinPost = async (req, res) => {
  try {
    const post = await GroupPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const group = await Group.findById(post.group);
    const userId = req.user._id;

    // Check if user is admin or creator
    const isAdmin = group.admins.some(
      (admin) => admin.toString() === userId.toString(),
    );
    const isCreator = group.creator.toString() === userId.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only admins can pin posts",
      });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      success: true,
      data: post,
      message: `Post ${post.isPinned ? "pinned" : "unpinned"} successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling pin",
      error: error.message,
    });
  }
};

// Approve/Reject pending post
export const handlePendingPost = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const post = await GroupPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const group = await Group.findById(post.group);
    const userId = req.user._id;

    // Check if user is admin or creator
    const isAdmin = group.admins.some(
      (admin) => admin.toString() === userId.toString(),
    );
    const isCreator = group.creator.toString() === userId.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only admins can handle pending posts",
      });
    }

    if (action === "approve") {
      post.status = "approved";
      group.stats.totalPosts += 1;
      await group.save();
    } else {
      post.status = "rejected";
    }

    await post.save();

    res.json({
      success: true,
      message: `Post ${action}d successfully`,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error handling pending post",
      error: error.message,
    });
  }
};

export default {
  createGroupPost,
  getGroupPosts,
  getGroupPost,
  updateGroupPost,
  deleteGroupPost,
  likeGroupPost,
  dislikeGroupPost,
  togglePinPost,
  handlePendingPost,
};
