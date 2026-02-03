import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import api from '../utils/api';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const { socket, isConnected } = useSocket();

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Load conversations error:', error);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(
    async (conversationId) => {
      try {
        setLoading(true);
        const response = await api.get(`/chat/conversations/${conversationId}/messages`);
        setMessages(response.data.messages);

        // Mark messages as read
        if (socket) {
          socket.emit('messages:read', { conversationId });
        }
      } catch (error) {
        console.error('Load messages error:', error);
      } finally {
        setLoading(false);
      }
    },
    [socket]
  );

  // Send message
  const sendMessage = useCallback(
    async (conversationId, content, messageType = 'text', replyTo = null) => {
      if (!socket || !isConnected) {
        console.log(socket);
        console.log(isConnected);
        console.error('Socket not connected');
        return;
      }

      socket.emit('message:send', {
        conversationId,
        content,
        messageType,
        replyTo,
      });
    },
    [socket, isConnected]
  );
  // const sendMessage = useCallback(
  //   async (conversationId, content, messageType = 'text', replyTo = null) => {
  //     const { socket, isConnected } = useSocket;

  //     if (!socket || !isConnected) {
  //       console.warn('⛔ Socket not ready yet');
  //       return;
  //     }

  //     socket.emit('message:send', {
  //       conversationId,
  //       content,
  //       messageType,
  //       replyTo,
  //     });
  //   },
  //   [useSocket]
  // );

  // Send media
  const sendMedia = useCallback(async (conversationId, file, replyTo = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);
      if (replyTo) {
        formData.append('replyTo', replyTo);
      }

      const response = await api.post('/chat/messages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.message;
    } catch (error) {
      console.error('Send media error:', error);
      throw error;
    }
  }, []);

  // Create or get conversation
  const createConversation = useCallback(async (participantId) => {
    try {
      const response = await api.post('/chat/conversations', { participantId });
      const newConversation = response.data.conversation;

      setConversations((prev) => {
        const exists = prev.find((c) => c._id === newConversation._id);
        if (exists) return prev;
        return [newConversation, ...prev];
      });

      return newConversation;
    } catch (error) {
      console.error('Create conversation error:', error);
      throw error;
    }
  }, []);

  // Search users
  const searchUsers = useCallback(async (query) => {
    try {
      const response = await api.get('/chat/users/search', {
        params: { query },
      });
      return response.data.users;
    } catch (error) {
      console.error('Search users error:', error);
      return [];
    }
  }, []);

  // Start typing
  const startTyping = useCallback(
    (conversationId) => {
      if (socket && isConnected) {
        socket.emit('typing:start', { conversationId });
      }
    },
    [socket, isConnected]
  );

  // Stop typing
  const stopTyping = useCallback(
    (conversationId) => {
      if (socket && isConnected) {
        socket.emit('typing:stop', { conversationId });
      }
    },
    [socket, isConnected]
  );

  // Delete message
  const deleteMessage = useCallback(async (messageId) => {
    try {
      await api.delete(`/chat/messages/${messageId}`);
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, isDeleted: true } : msg))
      );
    } catch (error) {
      console.error('Delete message error:', error);
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // New message received
    socket.on('message:new', (message) => {
      setMessages((prev) => [...prev, message]);

      // Update conversation last message
      setConversations((prev) =>
        prev
          .map((conv) =>
            conv._id === message.conversationId
              ? { ...conv, lastMessage: message, lastMessageAt: message.createdAt }
              : conv
          )
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    });

    // Conversation updated
    socket.on('conversation:update', ({ conversationId, lastMessage }) => {
      setConversations((prev) =>
        prev
          .map((conv) =>
            conv._id === conversationId
              ? { ...conv, lastMessage, lastMessageAt: lastMessage.createdAt }
              : conv
          )
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    });

    // Typing indicator
    socket.on('typing:user', ({ userId, conversationId, isTyping }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: isTyping
          ? [...(prev[conversationId] || []), userId]
          : (prev[conversationId] || []).filter((id) => id !== userId),
      }));
    });

    // Messages read
    socket.on('messages:read', ({ conversationId, userId }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.conversationId === conversationId) {
            const readBy = msg.readBy || [];
            if (!readBy.some((r) => r.userId === userId)) {
              return {
                ...msg,
                readBy: [...readBy, { userId, readAt: new Date() }],
              };
            }
          }
          return msg;
        })
      );
    });

    return () => {
      socket.off('message:new');
      socket.off('conversation:update');
      socket.off('typing:user');
      socket.off('messages:read');
    };
  }, [socket, isConnected]);

  // Join conversation room
  useEffect(() => {
    if (socket && isConnected && activeConversation) {
      socket.emit('conversation:join', activeConversation._id);

      return () => {
        socket.emit('conversation:leave', activeConversation._id);
      };
    }
  }, [socket, isConnected, activeConversation]);

  const value = {
    conversations,
    activeConversation,
    messages,
    loading,
    typingUsers,
    setActiveConversation,
    loadConversations,
    loadMessages,
    sendMessage,
    sendMedia,
    createConversation,
    searchUsers,
    startTyping,
    stopTyping,
    deleteMessage,
  };
  console.log('chatContext is ok');
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
