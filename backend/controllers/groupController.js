import Group from "../models/Group.js";
import GroupPost from "../models/GroupPost.js";
import GroupMessage from "../models/GroupMessage.js";

// Create new group
export const createGroup = async (req, res) => {
  try {
    const { name, description, type, avatar, cover } = req.body;
    const userId = req.user._id;

    const group = new Group({
      name,
      description,
      type: type || "public",
      avatar,
      cover,
      creator: userId,
      admins: [userId],
      members: [
        {
          user: userId,
          role: "creator",
          joinedAt: new Date(),
        },
      ],
    });

    await group.save();
    await group.populate("creator", "name email avatar");

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating group",
      error: error.message,
    });
  }
};

// Get all groups (with filters)
export const getGroups = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const groups = await Group.find(query)
      .populate("creator", "name avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Group.countDocuments(query);

    res.json({
      success: true,
      data: groups,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching groups",
      error: error.message,
    });
  }
};

// Get group by ID
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("creator", "name email avatar")
      .populate("members.user", "name email avatar")
      .populate("admins", "name email avatar");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is member
    const isMember = group.members.some(
      (m) => m.user._id.toString() === req.user._id.toString(),
    );

    // For private groups, only members can see full details
    if (group.type === "private" && !isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: group,
      isMember,
      userRole: isMember
        ? group.members.find(
            (m) => m.user._id.toString() === req.user._id.toString(),
          ).role
        : null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching group",
      error: error.message,
    });
  }
};

// Update group
export const updateGroup = async (req, res) => {
  try {
    const { name, description, avatar, cover, settings } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin or creator
    const isAdmin = group.admins.some(
      (admin) => admin.toString() === req.user._id.toString(),
    );
    const isCreator = group.creator.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update group",
      });
    }

    if (name) group.name = name;
    if (description) group.description = description;
    if (avatar) group.avatar = avatar;
    if (cover) group.cover = cover;
    if (settings) group.settings = { ...group.settings, ...settings };

    await group.save();

    res.json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating group",
      error: error.message,
    });
  }
};

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Only creator can delete
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only creator can delete group",
      });
    }

    // Delete all related data
    await GroupPost.deleteMany({ group: group._id });
    await GroupMessage.deleteMany({ group: group._id });
    await group.deleteOne();

    res.json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting group",
      error: error.message,
    });
  }
};

// Join group
export const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const userId = req.user._id;

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if already a member
    const isMember = group.members.some(
      (m) => m.user.toString() === userId.toString(),
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "Already a member",
      });
    }

    // For private groups, add to pending
    if (group.type === "private") {
      const isPending = group.pendingMembers.some(
        (p) => p.user.toString() === userId.toString(),
      );

      if (isPending) {
        return res.status(400).json({
          success: false,
          message: "Request already pending",
        });
      }

      group.pendingMembers.push({
        user: userId,
        requestedAt: new Date(),
      });

      await group.save();

      return res.json({
        success: true,
        message: "Join request sent",
        status: "pending",
      });
    }

    // For public groups, add directly
    group.members.push({
      user: userId,
      role: "member",
      joinedAt: new Date(),
    });

    await group.save();

    res.json({
      success: true,
      message: "Joined group successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error joining group",
      error: error.message,
    });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const userId = req.user._id;

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Creator cannot leave
    if (group.creator.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message:
          "Creator cannot leave group. Transfer ownership or delete group.",
      });
    }

    group.members = group.members.filter(
      (m) => m.user.toString() !== userId.toString(),
    );

    group.admins = group.admins.filter(
      (admin) => admin.toString() !== userId.toString(),
    );

    await group.save();

    res.json({
      success: true,
      message: "Left group successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error leaving group",
      error: error.message,
    });
  }
};

// Approve/Reject join request
export const handleJoinRequest = async (req, res) => {
  try {
    const { userId, action } = req.body; // action: 'approve' or 'reject'
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if requester is admin
    const isAdmin = group.admins.some(
      (admin) => admin.toString() === req.user._id.toString(),
    );

    if (!isAdmin && group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only admins can handle join requests",
      });
    }

    // Find pending request
    const pendingIndex = group.pendingMembers.findIndex(
      (p) => p.user.toString() === userId,
    );

    if (pendingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Join request not found",
      });
    }

    if (action === "approve") {
      group.members.push({
        user: userId,
        role: "member",
        joinedAt: new Date(),
      });
    }

    group.pendingMembers.splice(pendingIndex, 1);
    await group.save();

    res.json({
      success: true,
      message: `Join request ${action}d`,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error handling join request",
      error: error.message,
    });
  }
};

// Add/Remove admin
export const manageAdmin = async (req, res) => {
  try {
    const { userId, action } = req.body; // action: 'add' or 'remove'
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Only creator can manage admins
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only creator can manage admins",
      });
    }

    // Check if user is member
    const member = group.members.find((m) => m.user.toString() === userId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "User is not a member",
      });
    }

    if (action === "add") {
      if (!group.admins.includes(userId)) {
        group.admins.push(userId);
        member.role = "admin";
      }
    } else if (action === "remove") {
      group.admins = group.admins.filter(
        (admin) => admin.toString() !== userId,
      );
      member.role = "member";
    }

    await group.save();

    res.json({
      success: true,
      message: `Admin ${action}ed successfully`,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error managing admin",
      error: error.message,
    });
  }
};

// Remove member
export const removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if requester is admin or creator
    const isAdmin = group.admins.some(
      (admin) => admin.toString() === req.user._id.toString(),
    );
    const isCreator = group.creator.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Only admins can remove members",
      });
    }

    // Cannot remove creator
    if (userId === group.creator.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove creator",
      });
    }

    group.members = group.members.filter((m) => m.user.toString() !== userId);

    group.admins = group.admins.filter((admin) => admin.toString() !== userId);

    await group.save();

    res.json({
      success: true,
      message: "Member removed successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing member",
      error: error.message,
    });
  }
};

// Get user's groups
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({
      "members.user": userId,
    })
      .populate("creator", "name avatar")
      .sort({ "members.joinedAt": -1 })
      .lean();

    res.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user groups",
      error: error.message,
    });
  }
};

export default {
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
};
