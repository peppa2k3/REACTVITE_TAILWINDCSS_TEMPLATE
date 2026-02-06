import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { content, media, status, visibility, location } = JSON.parse(
      req.body.data,
    );
    const userId = req.user.id;
    console.log(content, media, status, visibility, location);
    // Validate: at least content or media required
    if (!content && (!media || media.length === 0)) {
      return res.status(400).json({
        message: "Post must have content or media",
      });
    }

    const post = new Post({
      author: userId,
      content,
      media,
      status: status || "none",
      visibility: visibility || "public",
      location,
    });

    await post.save();
    await post.populate("author", "username email profilePicture");

    // Emit socket event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("new-post", post);
    }

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      message: "Failed to create post",
      error: error.message,
    });
  }
};

// Get newsfeed posts
export const getNewsfeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's friends
    const user = await User.findById(userId).select("friends");
    const friendIds = user.friends || [];

    // Build query: public posts + friends' posts + own posts
    const query = {
      $or: [
        { visibility: "public" },
        { author: userId },
        {
          author: { $in: friendIds },
          visibility: { $in: ["public", "friends"] },
        },
      ],
    };

    const posts = await Post.find(query)
      .populate("author", "username email profilePicture")
      .populate("originalPost")
      .populate({
        path: "originalPost",
        populate: {
          path: "author",
          select: "username email profilePicture",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add user reaction info to each post
    const postsWithReactions = posts.map((post) => ({
      ...post,
      userReaction:
        post.likes.find((like) => like.user.toString() === userId.toString())
          ?.type || null,
    }));

    const total = await Post.countDocuments(query);

    res.json({
      posts: postsWithReactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get newsfeed error:", error);
    res.status(500).json({
      message: "Failed to load newsfeed",
      error: error.message,
    });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if viewing own profile or friend's profile
    const isOwnProfile = userId === currentUserId;

    let query = { author: userId };

    if (!isOwnProfile) {
      // Check friendship
      const user = await User.findById(currentUserId).select("friends");
      const isFriend = user.friends.some(
        (friendId) => friendId.toString() === userId,
      );

      // Can only see public posts or friends' posts
      query.visibility = isFriend ? { $in: ["public", "friends"] } : "public";
    }

    const posts = await Post.find(query)
      .populate("author", "username email profilePicture")
      .populate("originalPost")
      .populate({
        path: "originalPost",
        populate: {
          path: "author",
          select: "username email profilePicture",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const postsWithReactions = posts.map((post) => ({
      ...post,
      userReaction:
        post.likes.find(
          (like) => like.user.toString() === currentUserId.toString(),
        )?.type || null,
    }));

    const total = await Post.countDocuments(query);

    res.json({
      posts: postsWithReactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({
      message: "Failed to load posts",
      error: error.message,
    });
  }
};

// Get single post
export const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId)
      .populate("author", "username email profilePicture")
      .populate("originalPost")
      .populate({
        path: "originalPost",
        populate: {
          path: "author",
          select: "username email profilePicture",
        },
      })
      .lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check visibility permissions
    if (
      post.visibility === "private" &&
      post.author._id.toString() !== userId
    ) {
      return res.status(403).json({ message: "You cannot view this post" });
    }

    if (post.visibility === "friends") {
      const user = await User.findById(userId).select("friends");
      const isFriend = user.friends.some(
        (friendId) => friendId.toString() === post.author._id.toString(),
      );

      if (!isFriend && post.author._id.toString() !== userId) {
        return res.status(403).json({ message: "You cannot view this post" });
      }
    }

    // Add user reaction
    const postWithReaction = {
      ...post,
      userReaction:
        post.likes.find((like) => like.user.toString() === userId.toString())
          ?.type || null,
    };

    res.json({ post: postWithReaction });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({
      message: "Failed to load post",
      error: error.message,
    });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { content, status, visibility, location } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own posts" });
    }

    // Update fields
    if (content !== undefined) post.content = content;
    if (status !== undefined) post.status = status;
    if (visibility !== undefined) post.visibility = visibility;
    if (location !== undefined) post.location = location;

    await post.save();
    await post.populate("author", "username email profilePicture");

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("post-updated", post);
    }

    res.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({
      message: "Failed to update post",
      error: error.message,
    });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }

    // Delete all comments on this post
    await Comment.deleteMany({ post: postId });

    // Delete the post
    await Post.findByIdAndDelete(postId);

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("post-deleted", { postId });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      message: "Failed to delete post",
      error: error.message,
    });
  }
};

// Like/Unlike post
export const togglePostReaction = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { type } = req.body; // 'like' or 'dislike'

    if (!["like", "dislike"].includes(type)) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find existing reaction
    const existingReactionIndex = post.likes.findIndex(
      (like) => like.user.toString() === userId,
    );

    if (existingReactionIndex !== -1) {
      const existingType = post.likes[existingReactionIndex].type;

      if (existingType === type) {
        // Remove reaction
        post.likes.splice(existingReactionIndex, 1);
        if (type === "like") {
          post.likesCount = Math.max(0, post.likesCount - 1);
        } else {
          post.dislikesCount = Math.max(0, post.dislikesCount - 1);
        }
      } else {
        // Change reaction type
        post.likes[existingReactionIndex].type = type;
        post.likes[existingReactionIndex].createdAt = new Date();

        if (type === "like") {
          post.likesCount += 1;
          post.dislikesCount = Math.max(0, post.dislikesCount - 1);
        } else {
          post.dislikesCount += 1;
          post.likesCount = Math.max(0, post.likesCount - 1);
        }
      }
    } else {
      // Add new reaction
      post.likes.push({ user: userId, type });
      if (type === "like") {
        post.likesCount += 1;
      } else {
        post.dislikesCount += 1;
      }
    }

    await post.save();

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("post-reaction-updated", {
        postId,
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
      });
    }

    res.json({
      message: "Reaction updated successfully",
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      userReaction: post.getUserReaction(userId),
    });
  } catch (error) {
    console.error("Toggle post reaction error:", error);
    res.status(500).json({
      message: "Failed to update reaction",
      error: error.message,
    });
  }
};

// Share post
export const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { shareType, visibility, caption, recipientId } = req.body;

    if (!["message", "timeline"].includes(shareType)) {
      return res.status(400).json({ message: "Invalid share type" });
    }

    const originalPost = await Post.findById(postId);

    if (!originalPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user can view the post
    if (originalPost.visibility === "private") {
      if (originalPost.author.toString() !== userId) {
        return res.status(403).json({ message: "Cannot share private posts" });
      }
    }

    if (shareType === "timeline") {
      // Create a new shared post
      const sharedPost = new Post({
        author: userId,
        content: caption || "",
        visibility: visibility || "public",
        isShared: true,
        originalPost: postId,
      });

      await sharedPost.save();
      await sharedPost.populate("author", "username email profilePicture");
      await sharedPost.populate({
        path: "originalPost",
        populate: {
          path: "author",
          select: "username email profilePicture",
        },
      });

      // Update share count
      originalPost.sharesCount += 1;
      originalPost.shares.push({
        user: userId,
        shareType,
        visibility,
        caption,
      });
      await originalPost.save();

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.emit("new-post", sharedPost);
        io.emit("post-shared", {
          postId,
          sharesCount: originalPost.sharesCount,
        });
      }

      return res.status(201).json({
        message: "Post shared to timeline successfully",
        post: sharedPost,
      });
    } else {
      // Share via message - handled by chat controller
      // Just update the share count
      originalPost.sharesCount += 1;
      originalPost.shares.push({
        user: userId,
        shareType,
        caption,
      });
      await originalPost.save();

      res.json({
        message: "Post link ready to share",
        shareLink: `/post/${postId}`,
        sharesCount: originalPost.sharesCount,
      });
    }
  } catch (error) {
    console.error("Share post error:", error);
    res.status(500).json({
      message: "Failed to share post",
      error: error.message,
    });
  }
};

export default {
  createPost,
  getNewsfeed,
  getUserPosts,
  getPost,
  updatePost,
  deletePost,
  togglePostReaction,
  sharePost,
};
