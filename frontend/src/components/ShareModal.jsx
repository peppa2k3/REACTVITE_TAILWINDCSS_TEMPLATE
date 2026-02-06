import { useState } from 'react';
import { XMarkIcon, LinkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../utils/api';

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', icon: '🌍' },
  { value: 'friends', label: 'Friends', icon: '👥' },
  { value: 'private', label: 'Only me', icon: '🔒' },
];

export default function ShareModal({ post, onClose }) {
  const [shareType, setShareType] = useState('timeline');
  const [visibility, setVisibility] = useState('public');
  const [caption, setCaption] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const handleCopyLink = () => {
    const postLink = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postLink);
    toast.success('Link copied to clipboard!');
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const response = await api.post(`/posts/${post._id}/share`, {
        shareType,
        visibility,
        caption,
      });

      if (shareType === 'timeline') {
        toast.success('Post shared to your timeline!');
      } else {
        toast.success('Share link ready! You can now send it via message.');
      }

      onClose();
    } catch (error) {
      console.error('Share error:', error);
      toast.error(error.response?.data?.message || 'Failed to share post');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Share Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Share Options */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setShareType('timeline')}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                shareType === 'timeline'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">📢</div>
                <div>
                  <h3 className="font-semibold">Share to Timeline</h3>
                  <p className="text-sm text-gray-600">Post this on your profile</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔗</div>
                <div>
                  <h3 className="font-semibold">Copy Link</h3>
                  <p className="text-sm text-gray-600">Copy link to share anywhere</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShareType('message')}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                shareType === 'message'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">💬</div>
                <div>
                  <h3 className="font-semibold">Share via Message</h3>
                  <p className="text-sm text-gray-600">Send this post in a message</p>
                </div>
              </div>
            </button>
          </div>

          {/* Timeline Share Options */}
          {shareType === 'timeline' && (
            <div className="space-y-4">
              {/* Visibility Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who can see this?
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {VISIBILITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a caption (optional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Say something about this..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              {/* Post Preview */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={post.author.profilePicture || '/default-avatar.png'}
                    alt={post.author.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-semibold text-sm">{post.author.username}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {post.content || 'Shared a post'}
                </p>
                {post.media && post.media.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {post.media.slice(0, 3).map((item, index) => (
                      <div key={index} className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                        {item.type === 'image' && (
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                    {post.media.length > 3 && (
                      <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center text-sm font-semibold">
                        +{post.media.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {isSharing ? 'Sharing...' : 'Share to Timeline'}
              </button>
            </div>
          )}

          {/* Message Share Info */}
          {shareType === 'message' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  After clicking Share, you'll be able to send this post in your messages. The post
                  link will be ready to share.
                </p>
              </div>

              <button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {isSharing ? 'Preparing...' : 'Get Share Link'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
