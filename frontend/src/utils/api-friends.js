import axios from 'axios';
import { API_BASE_URL } from '../env/apiURL';

const api = axios.create({ baseURL: `${API_BASE_URL}/api/friends` });

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// ─── FRIEND ─────────────────────────────────────────────────────
export const sendFriendRequest = (recipientId) => api.post('/request', { recipientId });

export const acceptFriendRequest = (requesterId) => api.post('/accept', { requesterId });

export const declineFriendRequest = (requesterId) => api.post('/decline', { requesterId });

export const cancelFriendRequest = (recipientId) => api.post('/cancel', { recipientId });

export const unfriend = (userId) => api.post('/unfriend', { userId });

// ─── BLOCK ──────────────────────────────────────────────────────
export const blockUser = (userId) => api.post('/block', { userId });

export const unblockUser = (userId) => api.post('/unblock', { userId });

// ─── LISTS ──────────────────────────────────────────────────────
export const getFriends = (params) => api.get('/list', { params });

export const getPendingRequests = () => api.get('/requests/incoming');

export const getSentRequests = () => api.get('/requests/sent');

export const getBlockedUsers = () => api.get('/blocked');

export const getSuggestions = (params) => api.get('/suggestions', { params });

export const getRelationship = (userId) => api.get(`/relationship/${userId}`);

// ─── FOLLOW ─────────────────────────────────────────────────────
export const followUser = (userId) => api.post('/follow', { userId });

export const unfollowUser = (userId) => api.post('/unfollow', { userId });

export const getFollowers = (userId) => api.get(`/followers/${userId}`);

export const getFollowing = (userId) => api.get(`/following/${userId}`);

export const getPeopleToFollow = (params) => api.get('/people-to-follow', { params });
