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
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Group routes
router.post("/", authenticate, createGroup);
router.get("/", authenticate, getGroups);
router.get("/my-groups", authenticate, getUserGroups);
router.get("/:id", authenticate, getGroupById);
router.put("/:id", authenticate, updateGroup);
router.delete("/:id", authenticate, deleteGroup);

// Membership routes
router.post("/:id/join", authenticate, joinGroup);
router.post("/:id/leave", authenticate, leaveGroup);
router.post("/:id/handle-request", authenticate, handleJoinRequest);
router.post("/:id/manage-admin", authenticate, manageAdmin);
router.post("/:id/remove-member", authenticate, removeMember);

// Post routes
router.post("/posts", authenticate, createGroupPost);
router.get("/:groupId/posts", authenticate, getGroupPosts);
router.get("/posts/:postId", authenticate, getGroupPost);
router.put("/posts/:postId", authenticate, updateGroupPost);
router.delete("/posts/:postId", authenticate, deleteGroupPost);
router.post("/posts/:postId/like", authenticate, likeGroupPost);
router.post("/posts/:postId/dislike", authenticate, dislikeGroupPost);
router.post("/posts/:postId/pin", authenticate, togglePinPost);
router.post("/posts/:postId/handle", authenticate, handlePendingPost);

// Comment routes
router.post("/comments", authenticate, createComment);
router.get("/posts/:postId/comments", authenticate, getComments);
router.put("/comments/:commentId", authenticate, updateComment);
router.delete("/comments/:commentId", authenticate, deleteComment);
router.post("/comments/:commentId/like", authenticate, likeComment);

// Chat routes
router.post("/chat/send", authenticate, sendMessage);
router.get("/:groupId/messages", authenticate, getMessages);
router.delete("/messages/:messageId", authenticate, deleteMessage);
router.post("/:groupId/messages/read", authenticate, markAsRead);

export default router;
