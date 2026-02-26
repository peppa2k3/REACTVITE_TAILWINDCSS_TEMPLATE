import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroup } from '../contexts/GroupContext';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import GroupCard from '../components/groups/GroupCard';

const Groups = () => {
  const navigate = useNavigate();
  const { groups, fetchMyGroups, fetchGroups, loading } = useGroup();
  const [activeTab, setActiveTab] = useState('my-groups');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allGroups, setAllGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (activeTab === 'my-groups') {
      fetchMyGroups();
    } else {
      loadAllGroups();
    }
  }, [activeTab]);

  const loadAllGroups = async () => {
    const filters = {};
    if (filterType !== 'all') filters.type = filterType;
    if (searchQuery) filters.search = searchQuery;

    const response = await fetchGroups(filters);
    if (response) {
      setAllGroups(response.data);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'discover') {
      loadAllGroups();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Groups</h1>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Group
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-4 border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('my-groups')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'my-groups'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Groups
                </button>
                <button
                  onClick={() => setActiveTab('discover')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'discover'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Discover
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      {activeTab === 'discover' && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'my-groups' ? groups : allGroups).length === 0 ? (
              <div className="col-span-full text-center py-12">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {activeTab === 'my-groups' ? 'No groups yet' : 'No groups found'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'my-groups'
                    ? 'Get started by creating a new group.'
                    : 'Try adjusting your search or filters.'}
                </p>
              </div>
            ) : (
              (activeTab === 'my-groups' ? groups : allGroups).map((group) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  onClick={() => navigate(`/groups/${group._id}`)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && <CreateGroupModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};

export default Groups;
