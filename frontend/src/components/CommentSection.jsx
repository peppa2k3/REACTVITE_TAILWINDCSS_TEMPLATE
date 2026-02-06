import { useState, useEffect } from 'react';
import { HeartIcon, HandThumbDownIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid,
} from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';

function Comment({ comment, currentUser, postId, onCommentUpdate, onCommentDelete, depth = 0 }) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const isOwnComment = comment.author._id === currentUser?.id;
  const userReaction = comment.userReaction;

  const loadReplies = async () => {
    if (replies.length > 0) return; // Already loaded

    setIsLoadingReplies(true);
    try {
      const response = await api.get(`/posts/comments/${comment._id}/replies`);
      setReplies(response.data.replies);
    } catch (error) {
      console.error('Load replies error:', error);
      toast.error('Failed to load replies');
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const handleShowReplies = () => {
    if (!showReplies && replies.length === 0) {
      loadReplies();
    }
    setShowReplies(!showReplies);
  };

  const handleReaction = async (type) => {
    try {
      const response = await api.post(`/posts/comments/${comment._id}/reaction`, { type });

      if (onCommentUpdate) {
        onCommentUpdate(comment._id, {
          likesCount: response.data.likesCount,
          dislikesCount: response.data.dislikesCount,
          userReaction: response.data.userReaction,
        });
      }
    } catch (error) {
      console.error('Comment reaction error:', error);
      toast.error('Failed to update reaction');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content: replyText,
        parentCommentId: comment._id,
      });

      setReplies([...replies, response.data.comment]);
      setReplyText('');
      setShowReplyInput(false);
      toast.success('Reply posted');
    } catch (error) {
      console.error('Reply error:', error);
      toast.error('Failed to post reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await api.delete(`/posts/comments/${comment._id}`);
      toast.success('Comment deleted');
      if (onCommentDelete) {
        onCommentDelete(comment._id);
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-12 mt-3' : 'mt-4'}`}>
      <div className="flex gap-3">
        <img
          src={comment.author.profilePicture || '/default-avatar.png'}
          alt={comment.author.username}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1">
          <div className="bg-gray-100 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">{comment.author.username}</h4>
              {isOwnComment && (
                <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-700">
                  Delete
                </button>
              )}
            </div>
            <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
            {comment.isEdited && <span className="text-xs text-gray-500 italic">Edited</span>}
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
            <button
              onClick={() => handleReaction('like')}
              className={`flex items-center gap-1 hover:text-red-500 ${
                userReaction === 'like' ? 'text-red-500 font-semibold' : ''
              }`}
            >
              {userReaction === 'like' ? (
                <HeartIconSolid className="w-4 h-4" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
              {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
            </button>

            <button
              onClick={() => handleReaction('dislike')}
              className={`flex items-center gap-1 hover:text-gray-700 ${
                userReaction === 'dislike' ? 'text-gray-700 font-semibold' : ''
              }`}
            >
              {userReaction === 'dislike' ? (
                <HandThumbDownIconSolid className="w-4 h-4" />
              ) : (
                <HandThumbDownIcon className="w-4 h-4" />
              )}
              {comment.dislikesCount > 0 && <span>{comment.dislikesCount}</span>}
            </button>

            {depth < 2 && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="hover:text-blue-500"
              >
                Reply
              </button>
            )}

            {comment.repliesCount > 0 && depth < 2 && (
              <button
                onClick={handleShowReplies}
                className="flex items-center gap-1 hover:text-blue-500"
              >
                <ChatBubbleLeftIcon className="w-4 h-4" />
                {showReplies ? 'Hide' : 'View'} {comment.repliesCount}{' '}
                {comment.repliesCount === 1 ? 'reply' : 'replies'}
              </button>
            )}

            <span className="text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleReply()}
              />
              <button
                onClick={handleReply}
                disabled={isSubmittingReply || !replyText.trim()}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300"
              >
                {isSubmittingReply ? 'Posting...' : 'Post'}
              </button>
            </div>
          )}

          {/* Replies */}
          {showReplies && (
            <div className="mt-2">
              {isLoadingReplies ? (
                <p className="text-sm text-gray-500">Loading replies...</p>
              ) : (
                replies.map((reply) => (
                  <Comment
                    key={reply._id}
                    comment={reply}
                    currentUser={currentUser}
                    postId={postId}
                    depth={depth + 1}
                    onCommentUpdate={onCommentUpdate}
                    onCommentDelete={(id) => setReplies(replies.filter((r) => r._id !== id))}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Load comments error:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content: commentText,
      });

      setComments([response.data.comment, ...comments]);
      setCommentText('');
      toast.success('Comment posted');
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentUpdate = (commentId, updates) => {
    setComments(
      comments.map((comment) => (comment._id === commentId ? { ...comment, ...updates } : comment))
    );
  };

  const handleCommentDelete = (commentId) => {
    setComments(comments.filter((comment) => comment._id !== commentId));
  };

  return (
    <div className="px-6 py-4 bg-gray-50">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <img
          src={currentUser?.profilePicture || '/default-avatar.png'}
          alt={currentUser?.username}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="mt-4">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              currentUser={currentUser}
              postId={postId}
              onCommentUpdate={handleCommentUpdate}
              onCommentDelete={handleCommentDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
