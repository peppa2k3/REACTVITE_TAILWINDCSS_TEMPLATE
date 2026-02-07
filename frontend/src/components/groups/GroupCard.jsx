import React from 'react';

const GroupCard = ({ group, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      {/* Cover Image */}
      <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        {group.cover ? (
          <img
            src={group.cover}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-white opacity-50"
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
          </div>
        )}
        
        {/* Group Type Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              group.type === 'public'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {group.type === 'public' ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      {/* Group Info */}
      <div className="p-4">
        {/* Avatar */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 -mt-8 relative z-10">
            {group.avatar ? (
              <img
                src={group.avatar}
                alt={group.name}
                className="w-16 h-16 rounded-lg border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {group.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {group.name}
            </h3>
            <p className="text-sm text-gray-500">
              {group.stats?.totalMembers || 0} member{group.stats?.totalMembers !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {group.description}
          </p>
        )}

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{group.stats?.totalPosts || 0} posts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
