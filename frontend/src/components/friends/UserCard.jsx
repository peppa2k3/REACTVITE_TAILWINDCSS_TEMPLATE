import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, UserPlus, UserMinus, MessageCircle, Ban, UserX, Clock, Check, X, Heart, HeartOff } from 'lucide-react';

const AVATAR_FALLBACK = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=6366f1&color=fff&size=128`;

// variant: 'friend' | 'request' | 'sent' | 'blocked' | 'suggestion' | 'follow'
const UserCard = ({
  user,
  variant = 'suggestion',
  onSendRequest,
  onAccept,
  onDecline,
  onCancel,
  onUnfriend,
  onBlock,
  onUnblock,
  onFollow,
  onUnfollow,
  isFollowing = false,
  mutualFriends = 0,
  requestedAt,
}) => {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(null);
  const [localFollowing, setLocalFollowing] = useState(isFollowing);
  const [requestSent, setRequestSent] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const withLoading = async (key, fn) => {
    setActionLoading(key);
    try {
      await fn();
    } finally {
      setActionLoading(null);
    }
  };

  const handleNavigate = () => navigate(`/profile/${user._id}`);

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      {/* Cover gradient */}
      <div className="h-16 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400" />

      {/* Avatar */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <div
          className="w-16 h-16 rounded-2xl border-4 border-white dark:border-gray-900 overflow-hidden cursor-pointer shadow-md hover:scale-105 transition-transform"
          onClick={handleNavigate}
        >
          <img
            src={user.avatar || AVATAR_FALLBACK(user.name)}
            alt={user.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = AVATAR_FALLBACK(user.name); }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 pb-4 px-4 text-center">
        <h3
          className="font-semibold text-gray-900 dark:text-white text-sm cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
          onClick={handleNavigate}
        >
          {user.name}
        </h3>
        {user.username && (
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">@{user.username}</p>
        )}
        {user.bio && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
            {user.bio}
          </p>
        )}
        {mutualFriends > 0 && (
          <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 font-medium">
            {mutualFriends} bạn chung
          </p>
        )}
        {requestedAt && (
          <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
            <Clock size={10} />
            {new Date(requestedAt).toLocaleDateString('vi-VN')}
          </p>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-2 justify-center flex-wrap">
          {variant === 'suggestion' && (
            <>
              {requestSent ? (
                <button
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl cursor-default"
                >
                  <Check size={12} /> Đã gửi
                </button>
              ) : (
                <button
                  onClick={() => withLoading('add', async () => { await onSendRequest?.(user._id); setRequestSent(true); })}
                  disabled={actionLoading === 'add'}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-60"
                >
                  <UserPlus size={12} />
                  {actionLoading === 'add' ? '...' : 'Kết bạn'}
                </button>
              )}
              <button
                onClick={() => withLoading('follow', async () => {
                  if (localFollowing) { await onUnfollow?.(user._id); setLocalFollowing(false); }
                  else { await onFollow?.(user._id); setLocalFollowing(true); }
                })}
                disabled={actionLoading === 'follow'}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl font-medium transition-colors ${
                  localFollowing
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500'
                    : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100'
                }`}
              >
                {localFollowing ? <><HeartOff size={12} /> Bỏ theo dõi</> : <><Heart size={12} /> Theo dõi</>}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={12} />
              </button>
            </>
          )}

          {variant === 'friend' && (
            <>
              <button
                onClick={() => navigate(`/chat?userId=${user._id}`)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                <MessageCircle size={12} /> Nhắn tin
              </button>
              <div className="relative group/menu">
                <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  •••
                </button>
                <div className="absolute right-0 bottom-full mb-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl py-1 min-w-36 hidden group-hover/menu:block z-10">
                  <button
                    onClick={() => withLoading('unfriend', () => onUnfriend?.(user._id))}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <UserMinus size={12} /> Hủy kết bạn
                  </button>
                  <button
                    onClick={() => withLoading('block', () => onBlock?.(user._id))}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                  >
                    <Ban size={12} /> Chặn
                  </button>
                </div>
              </div>
            </>
          )}

          {variant === 'request' && (
            <>
              <button
                onClick={() => withLoading('accept', () => onAccept?.(user._id))}
                disabled={actionLoading === 'accept'}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-60"
              >
                <Check size={12} />
                {actionLoading === 'accept' ? '...' : 'Chấp nhận'}
              </button>
              <button
                onClick={() => withLoading('decline', () => onDecline?.(user._id))}
                disabled={actionLoading === 'decline'}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-medium transition-colors hover:bg-gray-200"
              >
                <X size={12} />
                {actionLoading === 'decline' ? '...' : 'Từ chối'}
              </button>
            </>
          )}

          {variant === 'sent' && (
            <button
              onClick={() => withLoading('cancel', () => onCancel?.(user._id))}
              disabled={actionLoading === 'cancel'}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={12} />
              {actionLoading === 'cancel' ? '...' : 'Thu hồi'}
            </button>
          )}

          {variant === 'blocked' && (
            <button
              onClick={() => withLoading('unblock', () => onUnblock?.(user._id))}
              disabled={actionLoading === 'unblock'}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <UserX size={12} />
              {actionLoading === 'unblock' ? '...' : 'Bỏ chặn'}
            </button>
          )}

          {variant === 'follow' && (
            <button
              onClick={() => withLoading('follow', async () => {
                if (localFollowing) { await onUnfollow?.(user._id); setLocalFollowing(false); }
                else { await onFollow?.(user._id); setLocalFollowing(true); }
              })}
              disabled={actionLoading === 'follow'}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl font-medium transition-colors ${
                localFollowing
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {localFollowing ? <><HeartOff size={12} /> Bỏ theo dõi</> : <><Heart size={12} /> Theo dõi</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
