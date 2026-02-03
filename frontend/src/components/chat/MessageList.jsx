import React, { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { API_BASE_URL } from '../../env/apiURL';
const MessageList = () => {
  const { messages, loading } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);

    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return `Hôm qua ${format(messageDate, 'HH:mm')}`;
    } else {
      return format(messageDate, 'dd/MM/yyyy HH:mm');
    }
  };

  const renderMessageContent = (message) => {
    if (message.isDeleted) {
      return <div className="italic text-gray-400 text-sm">Tin nhắn đã bị xóa</div>;
    }

    switch (message.messageType) {
      case 'text':
      case 'emoji':
        return <p className="whitespace-pre-wrap break-words">{message.content}</p>;

      case 'image':
        return (
          <div className="max-w-sm">
            <img
              src={`${API_BASE_URL}${message.mediaUrl}`}
              alt="Image"
              className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(`${API_BASE_URL}${message.mediaUrl}`, '_blank')}
            />
            {message.content && (
              <p className="mt-2 whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="max-w-sm">
            <video
              controls
              className="rounded-lg w-full"
              src={`${API_BASE_URL}${message.mediaUrl}`}
            />
            {message.content && (
              <p className="mt-2 whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <a
            href={`${API_BASE_URL}${message.mediaUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {message.mediaMetadata?.fileName || 'File'}
              </p>
              <p className="text-sm text-gray-500">
                {message.mediaMetadata?.fileSize
                  ? `${(message.mediaMetadata.fileSize / 1024 / 1024).toFixed(2)} MB`
                  : 'Unknown size'}
              </p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <svg
            className="w-20 h-20 mx-auto mb-4 text-gray-300"
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
          <p className="text-lg font-medium">Chưa có tin nhắn</p>
          <p className="text-sm mt-1">Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto p-4 space-y-4"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {messages.map((message, index) => {
        const isOwnMessage = message.sender?._id === user?.id;
        const showAvatar =
          !isOwnMessage &&
          (index === messages.length - 1 ||
            messages[index + 1]?.sender?._id !== message.sender?._id);

        return (
          <div
            key={message._id}
            className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar for received messages */}
            {!isOwnMessage && (
              <div className="flex-shrink-0">
                {showAvatar ? (
                  message.sender?.avatar ? (
                    <img
                      src={message.sender.avatar}
                      alt={message.sender.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {message.sender?.name?.charAt(0).toUpperCase()}
                    </div>
                  )
                ) : (
                  <div className="w-8"></div>
                )}
              </div>
            )}

            {/* Message bubble */}
            <div
              className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-xs md:max-w-md lg:max-w-lg`}
            >
              {/* Sender name for group chats */}
              {!isOwnMessage && showAvatar && (
                <span className="text-xs text-gray-600 mb-1 ml-2">{message.sender?.name}</span>
              )}

              <div
                className={`
                  rounded-2xl px-4 py-2 shadow-sm
                  ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white text-gray-900 rounded-tl-sm'
                  }
                  ${message.messageType === 'emoji' ? 'text-4xl bg-transparent shadow-none px-2 py-1' : ''}
                `}
              >
                {renderMessageContent(message)}

                {/* Time and read status */}
                <div
                  className={`flex items-center gap-1 mt-1 ${
                    message.messageType === 'emoji' ? 'hidden' : ''
                  }`}
                >
                  <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatMessageTime(message.createdAt)}
                  </span>

                  {isOwnMessage && (
                    <svg
                      className={`w-4 h-4 ${
                        message.readBy?.length > 1 ? 'text-blue-200' : 'text-blue-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {message.readBy?.length > 1 ? (
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      ) : (
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
