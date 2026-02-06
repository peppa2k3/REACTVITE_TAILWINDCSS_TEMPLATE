// Add these socket events to your existing chatSocket.js

export const initializePostSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected to newsfeed:", socket.id);

    // Join user's personal room
    socket.on("join-newsfeed", (userId) => {
      socket.join(`user-${userId}`);
      socket.join("newsfeed"); // Join global newsfeed room
      console.log(`User ${userId} joined newsfeed`);
    });

    // Leave newsfeed
    socket.on("leave-newsfeed", (userId) => {
      socket.leave(`user-${userId}`);
      socket.leave("newsfeed");
      console.log(`User ${userId} left newsfeed`);
    });

    // Real-time post updates are emitted from controllers
    // Listeners are set up on the client side

    socket.on("disconnect", () => {
      console.log("User disconnected from newsfeed:", socket.id);
    });
  });
};

// Events emitted from controllers:
// - 'new-post': When a new post is created
// - 'post-updated': When a post is edited
// - 'post-deleted': When a post is removed
// - 'post-reaction-updated': When someone likes/dislikes
// - 'post-shared': When a post is shared
// - 'new-comment': When a comment is added
// - 'comment-updated': When a comment is edited
// - 'comment-deleted': When a comment is removed
// - 'comment-reaction-updated': When someone reacts to a comment
