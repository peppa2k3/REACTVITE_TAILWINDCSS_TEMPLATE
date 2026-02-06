import { useState } from 'react';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  MapPinIcon,
  HandThumbDownIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  HandThumbDownIcon as HandThumbDownIconSolid,
} from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';
import CommentSection from './CommentSection';
import ShareModal from './ShareModal';

const STATUS_EMOJIS = {
  happy: '😊',
  sad: '😢',
  excited: '🎉',
  angry: '😠',
  blessed: '🙏',
  loved: '❤️',
  thankful: '🙌',
  motivated: '💪',
  relaxed: '😌',
};

export default function PostCard({ post: initialPost, currentUser, onPostUpdate, onPostDelete }) {
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnPost = post.author._id === currentUser?.id;
  const userReaction = post.userReaction;

  const handleReaction = async (type) => {
    try {
      const response = await api.post(`/posts/${post._id}/reaction`, { type });

      setPost((prev) => ({
        ...prev,
        likesCount: response.data.likesCount,
        dislikesCount: response.data.dislikesCount,
        userReaction: response.data.userReaction,
      }));
    } catch (error) {
      console.error('Reaction error:', error);
      toast.error('Failed to update reaction');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success('Post deleted successfully');
      if (onPostDelete) {
        onPostDelete(post._id);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete post');
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  // Handle shared post
  const displayPost = post.isShared && post.originalPost ? post.originalPost : post;
  const isSharedPost = post.isShared && post.originalPost;

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      {/* Shared Post Header */}
      {isSharedPost && (
        <div className="px-6 pt-4 pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ShareIcon className="w-4 h-4" />
            <img
              src={post.author.profilePicture || '/default-avatar.png'}
              alt={post.author.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="font-medium">{post.author.username}</span>
            <span>shared this</span>
          </div>
          {post.content && <p className="mt-2 text-gray-700">{post.content}</p>}
        </div>
      )}

      {/* Post Header */}
      <div className="p-6 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={displayPost.author.profilePicture || '/default-avatar.png'}
              alt={displayPost.author.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{displayPost.author.username}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>
                  {formatDistanceToNow(new Date(displayPost.createdAt), { addSuffix: true })}
                </span>
                {displayPost.status && displayPost.status !== 'none' && (
                  <>
                    <span>•</span>
                    <span>
                      feeling {STATUS_EMOJIS[displayPost.status]} {displayPost.status}
                    </span>
                  </>
                )}
                {displayPost.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {displayPost.location.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Menu */}
          {isOwnPost && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 rounded-t-lg"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete post'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {displayPost.content && (
          <p className="mt-4 text-gray-800 whitespace-pre-wrap">{displayPost.content}</p>
        )}

        {/* Media */}
        {displayPost.media && displayPost.media.length > 0 && (
          <div
            className={`mt-4 grid gap-2 ${
              displayPost.media.length === 1
                ? 'grid-cols-1'
                : displayPost.media.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-2 md:grid-cols-3'
            }`}
          >
            {displayPost.media.map((item, index) => (
              <div key={index} className="relative">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={`Post media ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => window.open(item.url, '_blank')}
                  />
                ) : (
                  <video src={item.url} controls className="w-full h-64 object-cover rounded-lg" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-6 py-2 border-t border-b border-gray-200 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          {post.likesCount > 0 && (
            <span className="flex items-center gap-1">
              <HeartIconSolid className="w-4 h-4 text-red-500" />
              {post.likesCount}
            </span>
          )}
          {post.dislikesCount > 0 && (
            <span className="flex items-center gap-1">
              <HandThumbDownIconSolid className="w-4 h-4 text-gray-500" />
              {post.dislikesCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {post.commentsCount > 0 && <span>{post.commentsCount} comments</span>}
          {post.sharesCount > 0 && <span>{post.sharesCount} shares</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-3 flex items-center justify-around border-b border-gray-200">
        <button
          onClick={() => handleReaction('like')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
            userReaction === 'like' ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          {userReaction === 'like' ? (
            <HeartIconSolid className="w-5 h-5" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
          <span>Like</span>
        </button>

        <button
          onClick={() => handleReaction('dislike')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
            userReaction === 'dislike' ? 'text-gray-700' : 'text-gray-600'
          }`}
        >
          {userReaction === 'dislike' ? (
            <HandThumbDownIconSolid className="w-5 h-5" />
          ) : (
            <HandThumbDownIcon className="w-5 h-5" />
          )}
          <span>Dislike</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span>Comment</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ShareIcon className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && <CommentSection postId={post._id} currentUser={currentUser} />}

      {/* Share Modal */}
      {showShareModal && <ShareModal post={post} onClose={() => setShowShareModal(false)} />}
    </div>
  );
}
