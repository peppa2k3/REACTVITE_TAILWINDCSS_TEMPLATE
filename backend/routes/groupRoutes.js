import express from "express";
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  handleJoinRequest,
  manageAdmin,
  removeMember,
  getUserGroups,
} from "../controllers/groupController.js";
import {
  createGroupPost,
  getGroupPosts,
  getGroupPost,
  updateGroupPost,
  deleteGroupPost,
  likeGroupPost,
  dislikeGroupPost,
  togglePinPost,
  handlePendingPost,
} from "../controllers/groupPostController.js";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
} from "../controllers/groupCommentController.js";
import {
  sendMessage,
  getMessages,
  deleteMessage,
  markAsRead,
} from "../controllers/groupChatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
// All routes require authentication
router.use(protect);
// Group routes
router.post("/", createGroup);
router.get("/", protect, getGroups);
router.get("/my-groups", protect, getUserGroups);
router.get("/:id", protect, getGroupById);
router.put("/:id", protect, updateGroup);
router.delete("/:id", protect, deleteGroup);

// Membership routes
router.post("/:id/join", protect, joinGroup);
router.post("/:id/leave", protect, leaveGroup);
router.post("/:id/handle-request", protect, handleJoinRequest);
router.post("/:id/manage-admin", protect, manageAdmin);
router.post("/:id/remove-member", protect, removeMember);

// Post routes
router.post("/posts", protect, createGroupPost);
router.get("/:groupId/posts", protect, getGroupPosts);
router.get("/posts/:postId", protect, getGroupPost);
router.put("/posts/:postId", protect, updateGroupPost);
router.delete("/posts/:postId", protect, deleteGroupPost);
router.post("/posts/:postId/like", protect, likeGroupPost);
router.post("/posts/:postId/dislike", protect, dislikeGroupPost);
router.post("/posts/:postId/pin", protect, togglePinPost);
router.post("/posts/:postId/handle", protect, handlePendingPost);

// Comment routes
router.post("/comments", protect, createComment);
router.get("/posts/:postId/comments", protect, getComments);
router.put("/comments/:commentId", protect, updateComment);
router.delete("/comments/:commentId", protect, deleteComment);
router.post("/comments/:commentId/like", protect, likeComment);

// Chat routes
router.post("/chat/send", protect, sendMessage);
router.get("/:groupId/messages", protect, getMessages);
router.delete("/messages/:messageId", protect, deleteMessage);
router.post("/:groupId/messages/read", protect, markAsRead);

export default router;
