import GroupMessage from "../models/GroupMessage.js";
import Group from "../models/Group.js";

export const initGroupSocket = (io) => {
  // Store active users in groups
  const groupUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User connected to group socket:", socket.id);

    // Join group room
    socket.on("group:join", async ({ groupId, userId }) => {
      try {
        const group = await Group.findById(groupId);

        if (!group) {
          socket.emit("error", { message: "Group not found" });
          return;
        }

        // Check if user is member
        const isMember = group.members.some(
          (m) => m.user.toString() === userId.toString(),
        );

        if (!isMember) {
          socket.emit("error", { message: "Not a member of this group" });
          return;
        }

        socket.join(`group:${groupId}`);

        // Track active users
        if (!groupUsers.has(groupId)) {
          groupUsers.set(groupId, new Set());
        }
        groupUsers.get(groupId).add(userId);

        // Notify others
        socket.to(`group:${groupId}`).emit("group:user-joined", {
          userId,
          groupId,
          activeUsers: Array.from(groupUsers.get(groupId)),
        });

        // Send active users to the joining user
        socket.emit("group:active-users", {
          groupId,
          activeUsers: Array.from(groupUsers.get(groupId)),
        });

        console.log(`User ${userId} joined group ${groupId}`);
      } catch (error) {
        console.error("Error joining group:", error);
        socket.emit("error", { message: "Failed to join group" });
      }
    });

    // Leave group room
    socket.on("group:leave", ({ groupId, userId }) => {
      socket.leave(`group:${groupId}`);

      if (groupUsers.has(groupId)) {
        groupUsers.get(groupId).delete(userId);

        if (groupUsers.get(groupId).size === 0) {
          groupUsers.delete(groupId);
        }
      }

      socket.to(`group:${groupId}`).emit("group:user-left", {
        userId,
        groupId,
        activeUsers: groupUsers.has(groupId)
          ? Array.from(groupUsers.get(groupId))
          : [],
      });

      console.log(`User ${userId} left group ${groupId}`);
    });

    // Send message in group
    socket.on("group:send-message", async (data) => {
      try {
        const {
          groupId,
          senderId,
          content,
          type,
          fileUrl,
          fileName,
          fileSize,
        } = data;

        const message = new GroupMessage({
          group: groupId,
          sender: senderId,
          content,
          type: type || "text",
          fileUrl,
          fileName,
          fileSize,
        });

        await message.save();
        await message.populate("sender", "name email avatar");

        // Broadcast to all users in the group
        io.to(`group:${groupId}`).emit("group:new-message", message);

        console.log(`Message sent in group ${groupId}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("group:typing", ({ groupId, userId, userName, isTyping }) => {
      socket.to(`group:${groupId}`).emit("group:user-typing", {
        groupId,
        userId,
        userName,
        isTyping,
      });
    });

    // Delete message
    socket.on("group:delete-message", async ({ messageId, groupId }) => {
      try {
        const message = await GroupMessage.findById(messageId);

        if (message) {
          message.isDeleted = true;
          message.deletedAt = new Date();
          await message.save();

          io.to(`group:${groupId}`).emit("group:message-deleted", {
            messageId,
            groupId,
          });
        }
      } catch (error) {
        console.error("Error deleting message:", error);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });

    // New post notification
    socket.on("group:new-post", (data) => {
      const { groupId, post } = data;
      socket.to(`group:${groupId}`).emit("group:post-created", post);
    });

    // Post updated
    socket.on("group:update-post", (data) => {
      const { groupId, post } = data;
      io.to(`group:${groupId}`).emit("group:post-updated", post);
    });

    // Post deleted
    socket.on("group:delete-post", (data) => {
      const { groupId, postId } = data;
      io.to(`group:${groupId}`).emit("group:post-deleted", { postId });
    });

    // Like/Unlike post
    socket.on("group:post-reaction", (data) => {
      const { groupId, postId, type, stats } = data;
      socket.to(`group:${groupId}`).emit("group:post-reaction-updated", {
        postId,
        type,
        stats,
      });
    });

    // New comment
    socket.on("group:new-comment", (data) => {
      const { groupId, postId, comment } = data;
      socket.to(`group:${groupId}`).emit("group:comment-created", {
        postId,
        comment,
      });
    });

    // Comment deleted
    socket.on("group:delete-comment", (data) => {
      const { groupId, postId, commentId } = data;
      socket.to(`group:${groupId}`).emit("group:comment-deleted", {
        postId,
        commentId,
      });
    });

    // Member joined
    socket.on("group:member-joined", (data) => {
      const { groupId, member } = data;
      io.to(`group:${groupId}`).emit("group:new-member", member);
    });

    // Member removed
    socket.on("group:member-removed", (data) => {
      const { groupId, userId } = data;
      io.to(`group:${groupId}`).emit("group:member-left", { userId });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      // Remove user from all group rooms
      groupUsers.forEach((users, groupId) => {
        users.forEach((userId) => {
          socket.to(`group:${groupId}`).emit("group:user-left", {
            userId,
            groupId,
            activeUsers: Array.from(users),
          });
        });
      });

      console.log("User disconnected from group socket:", socket.id);
    });
  });
};

export default initGroupSocket;
