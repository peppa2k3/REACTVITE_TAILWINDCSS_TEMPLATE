import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useSocket } from '../../contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const ConversationList = () => {
  const { conversations, activeConversation, setActiveConversation, loadMessages } = useChat();
  const { isUserOnline } = useSocket();

  const handleSelectConversation = async (conversation) => {
    setActiveConversation(conversation);
    await loadMessages(conversation._id);
  };

  const getConversationInfo = (conversation) => {
    // For direct conversations, get the other participant
    const otherParticipant =
      conversation.participants?.find((p) => p._id !== conversation.participants[0]._id) ||
      conversation.participants[0];

    return {
      name:
        conversation.conversationType === 'group'
          ? conversation.groupName
          : otherParticipant?.name || 'Unknown',
      avatar:
        conversation.conversationType === 'group'
          ? conversation.groupAvatar
          : otherParticipant?.avatar,
      isOnline:
        conversation.conversationType === 'direct' ? isUserOnline(otherParticipant?._id) : false,
    };
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';

    const msg = conversation.lastMessage;

    if (msg.messageType === 'image') return '📷 Image';
    if (msg.messageType === 'video') return '🎥 Video';
    if (msg.messageType === 'file') return '📎 File';
    if (msg.messageType === 'emoji') return msg.content;

    return msg.content?.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content || '';
  };

  const formatTime = (date) => {
    if (!date) return '';
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return '';
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm mt-1">Start a new chat to begin messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conversation) => {
        const info = getConversationInfo(conversation);
        const isActive = activeConversation?._id === conversation._id;
        const hasUnread = conversation.unreadCount > 0;

        return (
          <div
            key={conversation._id}
            onClick={() => handleSelectConversation(conversation)}
            className={`
              flex items-center gap-3 p-4 cursor-pointer transition-colors border-b
              ${
                isActive
                  ? 'bg-blue-50 border-l-4 border-l-blue-600'
                  : 'hover:bg-gray-50 border-l-4 border-l-transparent'
              }
            `}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {info.avatar ? (
                <img
                  src={info.avatar}
                  alt={info.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                  {info.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Online indicator */}
              {info.isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>

            {/* Conversation Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3
                  className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}
                >
                  {info.name}
                </h3>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {formatTime(conversation.lastMessageAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p
                  className={`text-sm truncate ${hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'}`}
                >
                  {getLastMessagePreview(conversation)}
                </p>

                {/* Unread badge */}
                {hasUnread && (
                  <span className="ml-2 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
