import express from "express";
import { protect } from "../middleware/auth.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  unfriend,
  blockUser,
  unblockUser,
  getFriends,
  getPendingRequests,
  getSentRequests,
  getBlockedUsers,
  getSuggestions,
  getRelationship,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getPeopleToFollow,
} from "../controllers/friendController.js";

const router = express.Router();

// Inject io into req
router.use((req, res, next) => {
  req.io = req.app.get("io");
  next();
});

// Friend actions
router.post("/request", protect, sendFriendRequest);
router.post("/accept", protect, acceptFriendRequest);
router.post("/decline", protect, declineFriendRequest);
router.post("/cancel", protect, cancelFriendRequest);
router.post("/unfriend", protect, unfriend);

// Block actions
router.post("/block", protect, blockUser);
router.post("/unblock", protect, unblockUser);

// Lists
router.get("/list", protect, getFriends);
router.get("/requests/incoming", protect, getPendingRequests);
router.get("/requests/sent", protect, getSentRequests);
router.get("/blocked", protect, getBlockedUsers);
router.get("/suggestions", protect, getSuggestions);
router.get("/relationship/:userId", protect, getRelationship);

// Follow
router.post("/follow", protect, followUser);
router.post("/unfollow", protect, unfollowUser);
router.get("/followers/:userId", getFollowers);
router.get("/following/:userId", getFollowing);
router.get("/people-to-follow", protect, getPeopleToFollow);

export default router;
