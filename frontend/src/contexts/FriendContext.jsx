import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import * as friendApi from '../utils/api-friends';

const FriendContext = createContext(null);

export const FriendProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [peopleToFollow, setPeopleToFollow] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFriends = useCallback(async (params) => {
    try {
      const { data } = await friendApi.getFriends(params);
      setFriends(data.friends);
      return data;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadPendingRequests = useCallback(async () => {
    try {
      const { data } = await friendApi.getPendingRequests();
      setPendingRequests(data.requests);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadSentRequests = useCallback(async () => {
    try {
      const { data } = await friendApi.getSentRequests();
      setSentRequests(data.requests);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadBlockedUsers = useCallback(async () => {
    try {
      const { data } = await friendApi.getBlockedUsers();
      setBlockedUsers(data.blocked);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadSuggestions = useCallback(async (params) => {
    try {
      const { data } = await friendApi.getSuggestions(params);
      setSuggestions(data.users);
      return data;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadPeopleToFollow = useCallback(async (params) => {
    try {
      const { data } = await friendApi.getPeopleToFollow(params);
      setPeopleToFollow(data.users);
      return data;
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !user) return;

    socket.on('friend_request', ({ from }) => {
      loadPendingRequests();
    });

    socket.on('friend_accepted', ({ by }) => {
      loadFriends();
    });

    return () => {
      socket.off('friend_request');
      socket.off('friend_accepted');
    };
  }, [socket, user]);

  // Actions
  const handleSendRequest = async (recipientId) => {
    await friendApi.sendFriendRequest(recipientId);
    setSuggestions((prev) => prev.filter((u) => u._id !== recipientId));
  };

  const handleAccept = async (requesterId) => {
    await friendApi.acceptFriendRequest(requesterId);
    setPendingRequests((prev) => prev.filter((r) => r.requester._id !== requesterId));
    loadFriends();
  };

  const handleDecline = async (requesterId) => {
    await friendApi.declineFriendRequest(requesterId);
    setPendingRequests((prev) => prev.filter((r) => r.requester._id !== requesterId));
  };

  const handleCancel = async (recipientId) => {
    await friendApi.cancelFriendRequest(recipientId);
    setSentRequests((prev) => prev.filter((r) => r.recipient._id !== recipientId));
  };

  const handleUnfriend = async (userId) => {
    await friendApi.unfriend(userId);
    setFriends((prev) => prev.filter((f) => f._id !== userId));
  };

  const handleBlock = async (userId) => {
    await friendApi.blockUser(userId);
    setFriends((prev) => prev.filter((f) => f._id !== userId));
    setSuggestions((prev) => prev.filter((u) => u._id !== userId));
    loadBlockedUsers();
  };

  const handleUnblock = async (userId) => {
    await friendApi.unblockUser(userId);
    setBlockedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleFollow = async (userId) => {
    await friendApi.followUser(userId);
  };

  const handleUnfollow = async (userId) => {
    await friendApi.unfollowUser(userId);
  };

  return (
    <FriendContext.Provider
      value={{
        friends,
        pendingRequests,
        sentRequests,
        blockedUsers,
        suggestions,
        peopleToFollow,
        loading,
        loadFriends,
        loadPendingRequests,
        loadSentRequests,
        loadBlockedUsers,
        loadSuggestions,
        loadPeopleToFollow,
        handleSendRequest,
        handleAccept,
        handleDecline,
        handleCancel,
        handleUnfriend,
        handleBlock,
        handleUnblock,
        handleFollow,
        handleUnfollow,
      }}
    >
      {children}
    </FriendContext.Provider>
  );
};

export const useFriend = () => {
  const ctx = useContext(FriendContext);
  if (!ctx) throw new Error('useFriend must be used within FriendProvider');
  return ctx;
};
