import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, UserMinus, Clock, Ban, MessageCircle, Heart, HeartOff, ChevronDown } from 'lucide-react';
import { getRelationship } from '../../utils/api-friends';
import { useFriend } from '../../contexts/FriendContext';

// Used on profile pages to show the relationship action buttons
const FriendActionButton = ({ targetUserId }) => {
  const navigate = useNavigate();
  const {
    handleSendRequest, handleAccept, handleDecline,
    handleCancel, handleUnfriend, handleBlock, handleUnblock,
    handleFollow, handleUnfollow,
  } = useFriend();

  const [rel, setRel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const loadRelationship = async () => {
    try {
      setLoading(true);
      const { data } = await getRelationship(targetUserId);
      setRel(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRelationship(); }, [targetUserId]);

  const withLoading = async (key, fn) => {
    setActionLoading(key);
    try { await fn(); await loadRelationship(); }
    catch (err) { console.error(err); }
    finally { setActionLoading(null); setShowMenu(false); }
  };

  if (loading) return <div className="h-9 w-40 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  if (!rel) return null;

  const { friendStatus, friendDirection, isFollowing } = rel;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Friend button */}
      {friendStatus === 'none' && (
        <button
          onClick={() => withLoading('add', () => handleSendRequest(targetUserId))}
          disabled={actionLoading === 'add'}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
        >
          <UserPlus size={16} />
          {actionLoading === 'add' ? 'Đang gửi...' : 'Kết bạn'}
        </button>
      )}

      {friendStatus === 'pending' && friendDirection === 'sent' && (
        <button
          onClick={() => withLoading('cancel', () => handleCancel(targetUserId))}
          disabled={actionLoading === 'cancel'}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
        >
          <Clock size={16} />
          {actionLoading === 'cancel' ? '...' : 'Đã gửi lời mời'}
        </button>
      )}

      {friendStatus === 'pending' && friendDirection === 'received' && (
        <div className="flex gap-2">
          <button
            onClick={() => withLoading('accept', () => handleAccept(targetUserId))}
            disabled={actionLoading === 'accept'}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <UserCheck size={16} />
            {actionLoading === 'accept' ? '...' : 'Chấp nhận'}
          </button>
          <button
            onClick={() => withLoading('decline', () => handleDecline(targetUserId))}
            disabled={actionLoading === 'decline'}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
          >
            Từ chối
          </button>
        </div>
      )}

      {friendStatus === 'accepted' && (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            <UserCheck size={16} className="text-emerald-500" />
            Bạn bè
            <ChevronDown size={14} />
          </button>
          {showMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl py-1 min-w-44 z-20">
              <button
                onClick={() => withLoading('unfriend', () => handleUnfriend(targetUserId))}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <UserMinus size={16} /> Hủy kết bạn
              </button>
              <button
                onClick={() => withLoading('block', () => handleBlock(targetUserId))}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
              >
                <Ban size={16} /> Chặn người dùng
              </button>
            </div>
          )}
        </div>
      )}

      {friendStatus === 'blocked' && friendDirection === 'blocker' && (
        <button
          onClick={() => withLoading('unblock', () => handleUnblock(targetUserId))}
          disabled={actionLoading === 'unblock'}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 rounded-xl text-sm font-medium transition-colors"
        >
          <Ban size={16} />
          {actionLoading === 'unblock' ? '...' : 'Đã chặn · Bỏ chặn'}
        </button>
      )}

      {/* Follow button */}
      {friendStatus !== 'blocked' && (
        <button
          onClick={() => withLoading('follow', async () => {
            if (isFollowing) await handleUnfollow(targetUserId);
            else await handleFollow(targetUserId);
          })}
          disabled={actionLoading === 'follow'}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            isFollowing
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-500'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isFollowing ? <><HeartOff size={16} /> Bỏ theo dõi</> : <><Heart size={16} /> Theo dõi</>}
        </button>
      )}

      {/* Message button */}
      {friendStatus === 'accepted' && (
        <button
          onClick={() => navigate(`/chat?userId=${targetUserId}`)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <MessageCircle size={16} /> Nhắn tin
        </button>
      )}

      {/* Close menu on outside click */}
      {showMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
};

export default FriendActionButton;
