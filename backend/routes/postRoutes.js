import express from "express";
import {
  createPost,
  getNewsfeed,
  getUserPosts,
  getPost,
  updatePost,
  deletePost,
  togglePostReaction,
  sharePost,
} from "../controllers/postController.js";
import {
  createComment,
  getComments,
  getReplies,
  updateComment,
  deleteComment,
  toggleCommentReaction,
} from "../controllers/commentController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Post routes
router.post("/", protect, upload.array("media", 10), createPost);
router.get("/newsfeed", protect, getNewsfeed);
router.get("/user/:userId", protect, getUserPosts);
router.get("/:postId", protect, getPost);
router.put("/:postId", protect, updatePost);
router.delete("/:postId", protect, deletePost);
router.post("/:postId/reaction", protect, togglePostReaction);
router.post("/:postId/share", protect, sharePost);

// Comment routes
router.post("/:postId/comments", protect, createComment);
router.get("/:postId/comments", protect, getComments);
router.get("/comments/:commentId/replies", protect, getReplies);
router.put("/comments/:commentId", protect, updateComment);
router.delete("/comments/:commentId", protect, deleteComment);
router.post("/comments/:commentId/reaction", protect, toggleCommentReaction);

export default router;
