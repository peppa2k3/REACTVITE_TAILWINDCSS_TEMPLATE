import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import NewChatModal from '../components/chat/NewChatModal';
import IncomingCallModal from '../components/chat/IncomingCallModal';
import VideoCallWindow from '../components/chat/VideoCallWindow';
import { useVideoCall } from '../contexts/VideoCallContext';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [showNewChat, setShowNewChat] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);

  const { loadConversations, activeConversation } = useChat();
  const { incomingCall, activeCall } = useVideoCall();
  const navigate = useNavigate();
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle responsive view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);

      // On mobile, hide conversation list when chat is active
      if (mobile && activeConversation) {
        setShowConversationList(false);
      } else if (!mobile) {
        setShowConversationList(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeConversation]);

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        {' '}
        <button
          onClick={() => navigate('/home')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
        <button
          onClick={() => setShowNewChat(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div
          className={`${
            isMobileView ? (showConversationList ? 'w-full' : 'hidden') : 'w-full md:w-80 lg:w-96'
          } bg-white border-r flex-shrink-0 overflow-hidden`}
        >
          <ConversationList />
        </div>

        {/* Chat Window */}
        <div
          className={`${
            isMobileView ? (!showConversationList ? 'w-full' : 'hidden') : 'flex-1'
          } bg-gray-50 overflow-hidden`}
        >
          {activeConversation ? (
            <ChatWindow onBack={isMobileView ? handleBackToList : null} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg
                  className="w-24 h-24 mx-auto mb-4 text-gray-300"
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
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}

      {incomingCall && <IncomingCallModal />}

      {activeCall && <VideoCallWindow />}
    </div>
  );
};

export default Chat;
