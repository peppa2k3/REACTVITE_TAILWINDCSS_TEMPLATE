import GroupMessage from "../models/GroupMessage.js";
import Group from "../models/Group.js";

// Send message in group
export const sendMessage = async (req, res) => {
  try {
    const { groupId, content, type, fileUrl, fileName, fileSize } = req.body;
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
        message: "Only members can send messages",
      });
    }

    const message = new GroupMessage({
      group: groupId,
      sender: userId,
      content,
      type: type || "text",
      fileUrl,
      fileName,
      fileSize,
    });

    await message.save();
    await message.populate("sender", "name email avatar");

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
};

// Get messages in group
export const getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
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
        message: "Access denied",
      });
    }

    const messages = await GroupMessage.find({
      group: groupId,
      isDeleted: false,
    })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await GroupMessage.countDocuments({
      group: groupId,
      isDeleted: false,
    });

    res.json({
      success: true,
      data: messages.reverse(),
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await GroupMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const group = await Group.findById(message.group);
    const userId = req.user._id;

    // Check if user is sender, admin, or creator
    const isSender = message.sender.toString() === userId.toString();
    const isAdmin = group.admins.some(
      (admin) => admin.toString() === userId.toString(),
    );
    const isCreator = group.creator.toString() === userId.toString();

    if (!isSender && !isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete message",
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting message",
      error: error.message,
    });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const messages = await GroupMessage.find({
      group: groupId,
      "readBy.user": { $ne: userId },
    });

    for (const message of messages) {
      message.readBy.push({
        user: userId,
        readAt: new Date(),
      });
      await message.save();
    }

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking messages as read",
      error: error.message,
    });
  }
};

export default {
  sendMessage,
  getMessages,
  deleteMessage,
  markAsRead,
};
