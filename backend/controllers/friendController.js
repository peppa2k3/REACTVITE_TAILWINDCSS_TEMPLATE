import Friend from '../models/Friend.js';
import Follow from '../models/Follow.js';
import User from '../models/User.js';

// ─── FRIEND REQUEST ──────────────────────────────────────────────

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user._id;

    if (requesterId.toString() === recipientId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    // Check if recipient blocked requester
    const blocked = await Friend.findOne({
      requester: recipientId,
      recipient: requesterId,
      status: 'blocked',
    });
    if (blocked) return res.status(403).json({ message: 'Action not allowed' });

    // Check existing
    const existing = await Friend.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') return res.status(400).json({ message: 'Already friends' });
      if (existing.status === 'pending') return res.status(400).json({ message: 'Request already sent' });
      if (existing.status === 'blocked') return res.status(403).json({ message: 'Action not allowed' });
      // declined -> re-send
      existing.status = 'pending';
      existing.requester = requesterId;
      existing.recipient = recipientId;
      await existing.save();
      req.io?.emit('friend_request', { to: recipientId, from: requesterId });
      return res.json({ message: 'Friend request sent', friend: existing });
    }

    const friend = await Friend.create({ requester: requesterId, recipient: recipientId });
    req.io?.emit('friend_request', { to: recipientId, from: requesterId });
    res.status(201).json({ message: 'Friend request sent', friend });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const recipientId = req.user._id;

    const friend = await Friend.findOne({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending',
    });

    if (!friend) return res.status(404).json({ message: 'Friend request not found' });

    friend.status = 'accepted';
    await friend.save();

    req.io?.emit('friend_accepted', { to: requesterId, by: recipientId });
    res.json({ message: 'Friend request accepted', friend });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Decline friend request
export const declineFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const recipientId = req.user._id;

    const friend = await Friend.findOne({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending',
    });

    if (!friend) return res.status(404).json({ message: 'Friend request not found' });

    friend.status = 'declined';
    await friend.save();

    res.json({ message: 'Friend request declined' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel sent friend request
export const cancelFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user._id;

    const friend = await Friend.findOneAndDelete({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending',
    });

    if (!friend) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Friend request cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unfriend
export const unfriend = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user._id;

    await Friend.findOneAndDelete({
      status: 'accepted',
      $or: [
        { requester: currentUser, recipient: userId },
        { requester: userId, recipient: currentUser },
      ],
    });

    res.json({ message: 'Unfriended successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── BLOCK ───────────────────────────────────────────────────────

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user._id;

    if (currentUser.toString() === userId) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    // Remove any existing friendship
    await Friend.findOneAndDelete({
      $or: [
        { requester: currentUser, recipient: userId },
        { requester: userId, recipient: currentUser },
      ],
    });

    await Friend.create({
      requester: currentUser,
      recipient: userId,
      status: 'blocked',
      blockedBy: currentUser,
    });

    res.json({ message: 'User blocked' });
  } catch (err) {
    if (err.code === 11000) {
      // Already exists, update
      await Friend.findOneAndUpdate(
        {
          $or: [
            { requester: req.user._id, recipient: req.body.userId },
            { requester: req.body.userId, recipient: req.user._id },
          ],
        },
        { status: 'blocked', blockedBy: req.user._id, requester: req.user._id, recipient: req.body.userId },
        { new: true }
      );
      return res.json({ message: 'User blocked' });
    }
    res.status(500).json({ message: err.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user._id;

    await Friend.findOneAndDelete({
      requester: currentUser,
      recipient: userId,
      status: 'blocked',
      blockedBy: currentUser,
    });

    res.json({ message: 'User unblocked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── LISTS ───────────────────────────────────────────────────────

// Get friends list
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, search = '' } = req.query;

    const friendships = await Friend.find({
      status: 'accepted',
      $or: [{ requester: userId }, { recipient: userId }],
    })
      .populate('requester', 'name avatar email username')
      .populate('recipient', 'name avatar email username');

    let friends = friendships.map((f) => {
      const friend = f.requester._id.toString() === userId.toString() ? f.recipient : f.requester;
      return { ...friend.toObject(), friendshipId: f._id, since: f.updatedAt };
    });

    if (search) {
      const q = search.toLowerCase();
      friends = friends.filter(
        (f) => f.name?.toLowerCase().includes(q) || f.username?.toLowerCase().includes(q)
      );
    }

    const total = friends.length;
    const start = (page - 1) * limit;
    friends = friends.slice(start, start + parseInt(limit));

    res.json({ friends, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get pending incoming requests
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await Friend.find({ recipient: userId, status: 'pending' })
      .populate('requester', 'name avatar email username bio')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get sent requests
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await Friend.find({ requester: userId, status: 'pending' })
      .populate('recipient', 'name avatar email username bio')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const blocked = await Friend.find({ requester: userId, status: 'blocked', blockedBy: userId })
      .populate('recipient', 'name avatar email username')
      .sort({ createdAt: -1 });

    res.json({ blocked: blocked.map((b) => ({ ...b.recipient.toObject(), blockId: b._id })) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get people you may know (not friends, not blocked)
export const getSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    // Get all related user IDs
    const relationships = await Friend.find({
      $or: [{ requester: userId }, { recipient: userId }],
    });

    const excludeIds = new Set([userId.toString()]);
    relationships.forEach((r) => {
      excludeIds.add(r.requester.toString());
      excludeIds.add(r.recipient.toString());
    });

    const total = await User.countDocuments({ _id: { $nin: [...excludeIds] } });
    const users = await User.find({ _id: { $nin: [...excludeIds] } })
      .select('name avatar email username bio')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get relationship status between current user and another user
export const getRelationship = async (req, res) => {
  try {
    const currentUser = req.user._id;
    const { userId } = req.params;

    const friendship = await Friend.findOne({
      $or: [
        { requester: currentUser, recipient: userId },
        { requester: userId, recipient: currentUser },
      ],
    });

    const followingThem = await Follow.findOne({ follower: currentUser, following: userId });
    const theyFollowMe = await Follow.findOne({ follower: userId, following: currentUser });

    let friendStatus = 'none';
    let friendDirection = null;
    if (friendship) {
      friendStatus = friendship.status;
      if (friendship.status === 'pending') {
        friendDirection =
          friendship.requester.toString() === currentUser.toString() ? 'sent' : 'received';
      }
      if (friendship.status === 'blocked') {
        friendDirection =
          friendship.blockedBy?.toString() === currentUser.toString() ? 'blocker' : 'blocked';
      }
    }

    res.json({
      friendStatus,
      friendDirection,
      isFollowing: !!followingThem,
      isFollowedBy: !!theyFollowMe,
      friendshipId: friendship?._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── FOLLOW ──────────────────────────────────────────────────────

export const followUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const followerId = req.user._id;

    if (followerId.toString() === userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    await Follow.findOneAndUpdate(
      { follower: followerId, following: userId },
      { follower: followerId, following: userId },
      { upsert: true, new: true }
    );

    res.json({ message: 'Following user' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.body;
    await Follow.findOneAndDelete({ follower: req.user._id, following: userId });
    res.json({ message: 'Unfollowed user' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ following: userId }).populate(
      'follower',
      'name avatar username bio'
    );
    res.json({ followers: follows.map((f) => f.follower) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ follower: userId }).populate(
      'following',
      'name avatar username bio'
    );
    res.json({ following: follows.map((f) => f.following) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPeopleToFollow = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const following = await Follow.find({ follower: userId }).select('following');
    const followingIds = following.map((f) => f.following.toString());
    followingIds.push(userId.toString());

    const blocked = await Friend.find({
      $or: [{ requester: userId, status: 'blocked' }, { recipient: userId, status: 'blocked' }],
    });
    blocked.forEach((b) => {
      followingIds.push(b.requester.toString());
      followingIds.push(b.recipient.toString());
    });

    const uniqueExclude = [...new Set(followingIds)];

    const total = await User.countDocuments({ _id: { $nin: uniqueExclude } });
    const users = await User.find({ _id: { $nin: uniqueExclude } })
      .select('name avatar username bio')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
