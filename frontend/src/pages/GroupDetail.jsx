import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroup } from '../contexts/GroupContext';
import { useAuth } from '../contexts/AuthContext';
import GroupHeader from '../components/groups/GroupHeader';
import GroupPostCard from '../components/groups/GroupPostCard';
import CreateGroupPost from '../components/groups/CreateGroupPost';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentGroup,
    groupPosts,
    fetchGroupDetails,
    fetchGroupPosts,
    joinGroup,
    leaveGroup
  } = useGroup();

  const [activeTab, setActiveTab] = useState('feed');
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadGroup();
  }, [id]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const response = await fetchGroupDetails(id);
      setIsMember(response.isMember);
      setUserRole(response.userRole);
      
      if (response.isMember) {
        await fetchGroupPosts(id);
      }
    } catch (error) {
      console.error('Error loading group:', error);
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      await joinGroup(id);
      await loadGroup();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeave = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await leaveGroup(id);
        navigate('/groups');
      } catch (error) {
        console.error('Error leaving group:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentGroup) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Group Header */}
      <GroupHeader
        group={currentGroup}
        isMember={isMember}
        userRole={userRole}
        onJoin={handleJoin}
        onLeave={handleLeave}
      />

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('feed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Members ({currentGroup.stats?.totalMembers || 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isMember ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Join this group to see content
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {currentGroup.type === 'private'
                ? 'Your request will be reviewed by admins'
                : 'Click the button above to join'}
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'feed' && (
              <div className="space-y-6">
                <CreateGroupPost groupId={id} />
                
                {groupPosts.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-500">No posts yet. Be the first to post!</p>
                  </div>
                ) : (
                  groupPosts.map((post) => (
                    <GroupPostCard key={post._id} post={post} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="bg-white rounded-lg shadow-sm" style={{ height: 'calc(100vh - 300px)' }}>
                <div className="p-4 text-center text-gray-500">
                  Group chat will be displayed here
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center text-gray-500">
                  Member list will be displayed here
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;
