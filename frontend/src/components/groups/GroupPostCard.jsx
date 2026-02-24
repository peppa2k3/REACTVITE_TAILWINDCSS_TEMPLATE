// ============================================
// GroupPostCard.jsx - Responsive post card with full features
// ============================================
import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../env/apiURL';

const GroupPostCard = ({ post }) => {
  const [localPost, setLocalPost] = useState(post);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/groups/posts/${post._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setLocalPost({
        ...localPost,
        stats: { ...localPost.stats, totalLikes: response.data.data.likes },
        isLiked: response.data.data.isLiked,
        isDisliked: false,
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDislike = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/groups/posts/${post._id}/dislike`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setLocalPost({
        ...localPost,
        stats: { ...localPost.stats, totalDislikes: response.data.data.dislikes },
        isDisliked: response.data.data.isDisliked,
        isLiked: false,
      });
    } catch (error) {
      console.error('Error disliking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await axios.post(
        `${API_BASE_URL}/api/groups/comments`,
        {
          postId: post._id,
          content: commentText,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setCommentText('');
      setLocalPost({
        ...localPost,
        stats: { ...localPost.stats, totalComments: localPost.stats.totalComments + 1 },
      });
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={localPost.author.avatar || '/default-avatar.png'}
              alt={localPost.author.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h4 className="font-medium text-gray-900">{localPost.author.name}</h4>
              <p className="text-sm text-gray-500">
                {new Date(localPost.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {localPost.isPinned && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
              Pinned
            </span>
          )}
        </div>

        {/* Content */}
        <div className="mt-4">
          <p className="text-gray-800 whitespace-pre-wrap">{localPost.content}</p>
        </div>

        {/* Media */}
        {localPost.media && localPost.media.length > 0 && (
          <div
            className={`mt-4 grid gap-2 ${
              localPost.media.length === 1
                ? 'grid-cols-1'
                : localPost.media.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-2 sm:grid-cols-3'
            }`}
          >
            {localPost.media.map((item, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden">
                {item.type === 'image' ? (
                  <img src={item.url} alt="" className="w-full h-48 object-cover" />
                ) : (
                  <video src={item.url} controls className="w-full h-48" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
          <div className="flex gap-4">
            <span>{localPost.stats.totalLikes} likes</span>
            <span>{localPost.stats.totalDislikes} dislikes</span>
          </div>
          <span>{localPost.stats.totalComments} comments</span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
              localPost.isLiked ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            Like
          </button>

          <button
            onClick={handleDislike}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
              localPost.isDisliked ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
              />
            </svg>
            Dislike
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Comment
          </button>
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
export default GroupPostCard;
