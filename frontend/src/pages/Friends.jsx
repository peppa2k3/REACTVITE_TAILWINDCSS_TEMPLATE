import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Clock,
  Ban,
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
  Send,
  Inbox,
} from 'lucide-react';
import { useFriend } from '../contexts/FriendContext';
import UserCard from '../components/friends/UserCard';

const TABS = [
  { id: 'friends', label: 'Bạn bè', icon: Users },
  { id: 'requests', label: 'Lời mời', icon: Inbox },
  { id: 'sent', label: 'Đã gửi', icon: Send },
  { id: 'suggestions', label: 'Gợi ý', icon: UserPlus },
  { id: 'follow', label: 'Theo dõi', icon: Heart },
  { id: 'blocked', label: 'Đã chặn', icon: Ban },
];

const EmptyState = ({ icon: Icon, title, desc }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
      <Icon size={32} className="text-gray-400" />
    </div>
    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
    <p className="text-sm text-gray-400 max-w-xs">{desc}</p>
  </div>
);

const FriendsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'friends';

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 24;

  const {
    friends,
    pendingRequests,
    sentRequests,
    blockedUsers,
    suggestions,
    peopleToFollow,
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
  } = useFriend();

  const [loading, setLoading] = useState(false);

  const setTab = (tab) => {
    setSearchParams({ tab });
    setPage(1);
    setSearch('');
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'friends') res = await loadFriends({ page, limit: LIMIT, search });
      else if (activeTab === 'requests') await loadPendingRequests();
      else if (activeTab === 'sent') await loadSentRequests();
      else if (activeTab === 'blocked') await loadBlockedUsers();
      else if (activeTab === 'suggestions') res = await loadSuggestions({ page, limit: LIMIT });
      else if (activeTab === 'follow') res = await loadPeopleToFollow({ page, limit: LIMIT });
      if (res) setTotalPages(res.pages || 1);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [load]);

  const currentData = {
    friends,
    requests: pendingRequests,
    sent: sentRequests,
    blocked: blockedUsers,
    suggestions,
    follow: peopleToFollow,
  };

  const getItems = () => {
    if (activeTab === 'requests')
      return pendingRequests.map((r) => ({ user: r.requester, requestedAt: r.createdAt }));
    if (activeTab === 'sent')
      return sentRequests.map((r) => ({ user: r.recipient, requestedAt: r.createdAt }));
    if (activeTab === 'blocked') return blockedUsers.map((u) => ({ user: u }));
    if (activeTab === 'friends') return friends.map((f) => ({ user: f }));
    if (activeTab === 'suggestions') return suggestions.map((u) => ({ user: u }));
    if (activeTab === 'follow') return peopleToFollow.map((u) => ({ user: u }));
    return [];
  };

  const items = getItems();

  const pendingCount = pendingRequests.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}{' '}
        <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bạn bè</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Quản lý kết nối và mạng lưới của bạn
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-6">
          {' '}
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bạn bè</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý kết nối và mạng lưới của bạn
          </p>
        </div>
        {/* Tabs – scrollable on mobile */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
              }`}
            >
              <Icon size={15} />
              {label}
              {id === 'requests' && pendingCount > 0 && (
                <span className="ml-0.5 bg-red-500 text-white text-xs rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] min-h-[18px] px-1">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Search bar – only for friends & suggestions */}
        {activeTab === 'friends' && (
          <div className="relative mb-5 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white placeholder-gray-400"
            />
          </div>
        )}
        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl h-52 animate-pulse border border-gray-100 dark:border-gray-800"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={TABS.find((t) => t.id === activeTab)?.icon || Users}
            title={
              activeTab === 'friends'
                ? 'Chưa có bạn bè'
                : activeTab === 'requests'
                  ? 'Không có lời mời nào'
                  : activeTab === 'sent'
                    ? 'Chưa gửi lời mời nào'
                    : activeTab === 'blocked'
                      ? 'Chưa chặn ai'
                      : activeTab === 'suggestions'
                        ? 'Không có gợi ý'
                        : 'Không có ai để theo dõi'
            }
            desc={
              activeTab === 'friends'
                ? 'Tìm kiếm và kết bạn với mọi người từ tab Gợi ý'
                : activeTab === 'requests'
                  ? 'Khi ai đó gửi lời mời kết bạn cho bạn, nó sẽ hiện ở đây'
                  : activeTab === 'sent'
                    ? 'Các lời mời bạn đã gửi sẽ xuất hiện ở đây'
                    : activeTab === 'blocked'
                      ? 'Những người bạn chặn sẽ hiển thị ở đây'
                      : 'Hãy mời bạn bè tham gia ứng dụng'
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map(({ user, requestedAt }) => (
              <UserCard
                key={user._id}
                user={user}
                variant={
                  activeTab === 'requests'
                    ? 'request'
                    : activeTab === 'sent'
                      ? 'sent'
                      : activeTab === 'blocked'
                        ? 'blocked'
                        : activeTab === 'friends'
                          ? 'friend'
                          : activeTab === 'follow'
                            ? 'follow'
                            : 'suggestion'
                }
                requestedAt={requestedAt}
                onSendRequest={handleSendRequest}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onCancel={handleCancel}
                onUnfriend={handleUnfriend}
                onBlock={handleBlock}
                onUnblock={handleUnblock}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            ))}
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors text-gray-700 dark:text-gray-300"
            >
              <ChevronLeft size={16} /> Trước
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors text-gray-700 dark:text-gray-300"
            >
              Tiếp <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
