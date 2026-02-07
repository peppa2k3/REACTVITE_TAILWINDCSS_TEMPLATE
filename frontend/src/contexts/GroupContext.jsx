import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { API_URL } from '../env/apiURL';

const GroupContext = createContext();

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within GroupProvider');
  }
  return context;
};

export const GroupProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [groupPosts, setGroupPosts] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's groups
  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/groups/my-groups`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setGroups(response.data.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all groups
  const fetchGroups = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await axios.get(`${API_URL}/api/groups?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create group
  const createGroup = async (groupData) => {
    try {
      const response = await axios.post(`${API_URL}/api/groups`, groupData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setGroups([response.data.data, ...groups]);
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  // Join group
  const joinGroup = async (groupId) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/groups/${groupId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      await fetchMyGroups();
      return response.data;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  };

  // Leave group
  const leaveGroup = async (groupId) => {
    try {
      await axios.post(
        `${API_URL}/api/groups/${groupId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setGroups(groups.filter((g) => g._id !== groupId));
      if (currentGroup?._id === groupId) {
        setCurrentGroup(null);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  };

  // Fetch group details
  const fetchGroupDetails = async (groupId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCurrentGroup(response.data.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching group details:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch group posts
  const fetchGroupPosts = async (groupId, page = 1) => {
    try {
      const response = await axios.get(`${API_URL}/api/groups/${groupId}/posts?page=${page}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setGroupPosts(response.data.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  };

  // Create post
  const createPost = async (postData) => {
    try {
      const response = await axios.post(`${API_URL}/api/groups/posts`, postData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Emit socket event
      if (socket) {
        socket.emit('group:new-post', {
          groupId: postData.groupId,
          post: response.data.data,
        });
      }

      setGroupPosts([response.data.data, ...groupPosts]);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  // Fetch group messages
  const fetchGroupMessages = async (groupId) => {
    try {
      const response = await axios.get(`${API_URL}/api/groups/${groupId}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setGroupMessages(response.data.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  };

  // Send message
  const sendMessage = (groupId, messageData) => {
    if (socket) {
      socket.emit('group:send-message', {
        groupId,
        senderId: user._id,
        ...messageData,
      });
    }
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket || !currentGroup) return;

    const groupId = currentGroup._id;

    // Join group room
    socket.emit('group:join', {
      groupId,
      userId: user._id,
    });

    // Listen for new messages
    socket.on('group:new-message', (message) => {
      setGroupMessages((prev) => [...prev, message]);
    });

    // Listen for active users
    socket.on('group:active-users', (data) => {
      setActiveUsers(data.activeUsers);
    });

    // Listen for user joined
    socket.on('group:user-joined', (data) => {
      setActiveUsers(data.activeUsers);
    });

    // Listen for user left
    socket.on('group:user-left', (data) => {
      setActiveUsers(data.activeUsers);
    });

    // Listen for new posts
    socket.on('group:post-created', (post) => {
      setGroupPosts((prev) => [post, ...prev]);
    });

    // Listen for post updates
    socket.on('group:post-updated', (post) => {
      setGroupPosts((prev) => prev.map((p) => (p._id === post._id ? post : p)));
    });

    // Listen for post deleted
    socket.on('group:post-deleted', ({ postId }) => {
      setGroupPosts((prev) => prev.filter((p) => p._id !== postId));
    });

    // Listen for message deleted
    socket.on('group:message-deleted', ({ messageId }) => {
      setGroupMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isDeleted: true } : m))
      );
    });

    return () => {
      socket.emit('group:leave', { groupId, userId: user._id });
      socket.off('group:new-message');
      socket.off('group:active-users');
      socket.off('group:user-joined');
      socket.off('group:user-left');
      socket.off('group:post-created');
      socket.off('group:post-updated');
      socket.off('group:post-deleted');
      socket.off('group:message-deleted');
    };
  }, [socket, currentGroup, user]);

  const value = {
    groups,
    currentGroup,
    groupPosts,
    groupMessages,
    activeUsers,
    loading,
    setCurrentGroup,
    fetchMyGroups,
    fetchGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    fetchGroupDetails,
    fetchGroupPosts,
    createPost,
    fetchGroupMessages,
    sendMessage,
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};
