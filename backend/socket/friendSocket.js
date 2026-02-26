// backend/socket/friendSocket.js
// Add this to your server.js socket setup

export const setupFriendSocket = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId || socket.user?._id;

    // Join personal room for friend notifications
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Friend request events are emitted from controller via req.io
    // We just need to ensure rooms are joined properly
    socket.on('join_user_room', (uid) => {
      socket.join(`user:${uid}`);
    });

    socket.on('disconnect', () => {
      if (userId) socket.leave(`user:${userId}`);
    });
  });
};

// In friendController.js, use targeted room emit:
// io.to(`user:${recipientId}`).emit('friend_request', { from: requesterId });
// io.to(`user:${requesterId}`).emit('friend_accepted', { by: recipientId });
