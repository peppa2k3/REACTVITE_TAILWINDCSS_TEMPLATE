// ============================================
// GroupHeader.jsx - Responsive group header
// ============================================
import React from 'react';

const GroupHeader = ({ group, isMember, userRole, onJoin, onLeave }) => {
  const isAdmin = userRole === 'admin' || userRole === 'creator';

  return (
    <div className="bg-white shadow-sm">
      {/* Cover Photo */}
      <div className="h-48 sm:h-64 lg:h-80 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        {group.cover && (
          <img src={group.cover} alt={group.name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Group Info */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-12 sm:-mt-16">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {group.avatar ? (
              <img
                src={group.avatar}
                alt={group.name}
                className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg border-4 border-white shadow-xl object-cover"
              />
            ) : (
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-3xl sm:text-4xl">
                  {group.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name & Actions */}
          <div className="flex-1 min-w-0 mt-4 sm:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{group.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      group.type === 'public'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {group.type}
                  </span>
                  <span>{group.stats?.totalMembers || 0} members</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!isMember ? (
                  <button
                    onClick={onJoin}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {group.type === 'private' ? 'Request to Join' : 'Join Group'}
                  </button>
                ) : (
                  <>
                    {isAdmin && (
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Manage
                      </button>
                    )}
                    <button
                      onClick={onLeave}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Leave Group
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <div className="mt-6 pb-6">
            <p className="text-gray-600">{group.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default GroupHeader;
