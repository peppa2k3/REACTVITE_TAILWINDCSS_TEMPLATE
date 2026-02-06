import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Newsfeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (pageNum = 1) => {
    try {
      const response = await api.get(`/posts/newsfeed?page=${pageNum}&limit=10`);

      if (pageNum === 1) {
        setPosts(response.data.posts);
      } else {
        setPosts((prev) => [...prev, ...response.data.posts]);
      }

      setHasMore(response.data.pagination.page < response.data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Load posts error:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdate = (postId, updates) => {
    setPosts(posts.map((post) => (post._id === postId ? { ...post, ...updates } : post)));
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter((post) => post._id !== postId));
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    loadPosts(page + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading newsfeed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Newsfeed</h1>
          <p className="text-gray-600 mt-1">See what's happening</p>
        </div>

        {/* Create Post */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Posts List */}
        <div>
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h2>
              <p className="text-gray-500">Be the first to share something!</p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={user}
                  onPostUpdate={handlePostUpdate}
                  onPostDelete={handlePostDelete}
                />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center py-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                        Loading...
                      </span>
                    ) : (
                      'Load More Posts'
                    )}
                  </button>
                </div>
              )}

              {!hasMore && posts.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>You've reached the end!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
