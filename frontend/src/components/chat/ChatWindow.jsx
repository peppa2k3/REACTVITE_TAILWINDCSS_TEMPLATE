import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useVideoCall } from '../../contexts/VideoCallContext';
import { useSocket } from '../../contexts/SocketContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import EmojiPicker from './EmojiPicker';

const ChatWindow = ({ onBack }) => {
  const { activeConversation, typingUsers } = useChat();
  const { initiateCall } = useVideoCall();
  const { isUserOnline } = useSocket();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (!activeConversation) return null;

  const getConversationInfo = () => {
    const otherParticipant =
      activeConversation.participants?.find(
        (p) => p._id !== activeConversation.participants[0]._id
      ) || activeConversation.participants[0];

    return {
      name:
        activeConversation.conversationType === 'group'
          ? activeConversation.groupName
          : otherParticipant?.name || 'Unknown',
      avatar:
        activeConversation.conversationType === 'group'
          ? activeConversation.groupAvatar
          : otherParticipant?.avatar,
      isOnline:
        activeConversation.conversationType === 'direct'
          ? isUserOnline(otherParticipant?._id)
          : false,
      participant: otherParticipant,
    };
  };

  const info = getConversationInfo();
  const isTyping = typingUsers[activeConversation._id]?.length > 0;

  const handleVideoCall = async () => {
    try {
      await initiateCall(
        activeConversation._id,
        activeConversation.participants.map((p) => p._id)
      );
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Back button for mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
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
          )}

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {info.avatar ? (
              <img
                src={info.avatar}
                alt={info.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                {info.name.charAt(0).toUpperCase()}
              </div>
            )}
            {info.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          {/* Name and Status */}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{info.name}</h2>
            <p className="text-xs text-gray-500">
              {isTyping ? (
                <span className="text-blue-600 font-medium">Đang nhập...</span>
              ) : info.isOnline ? (
                <span className="text-green-600">Đang hoạt động</span>
              ) : (
                <span>Không hoạt động</span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Video Call */}
          <button
            onClick={handleVideoCall}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Video call"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          {/* More Options */}
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="More options"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>

      {/* Message Input */}
      <div className="border-t bg-white">
        <MessageInput showEmojiPicker={showEmojiPicker} setShowEmojiPicker={setShowEmojiPicker} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && <EmojiPicker onClose={() => setShowEmojiPicker(false)} />}
    </div>
  );
};

export default ChatWindow;
