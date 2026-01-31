import React, { useEffect, useState } from 'react';
import { useVideoCall } from '../../contexts/VideoCallContext';
import { useChat } from '../../contexts/ChatContext';
import api from '../../utils/api';

const IncomingCallModal = () => {
  const { incomingCall, answerCall, rejectCall } = useVideoCall();
  const [callerInfo, setCallerInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (incomingCall?.caller) {
      // Fetch caller information
      const fetchCallerInfo = async () => {
        try {
          const response = await api.get(`/auth/user/${incomingCall.caller}`);
          setCallerInfo(response.data.user);
        } catch (error) {
          console.error('Failed to fetch caller info:', error);
        }
      };
      fetchCallerInfo();
    }
  }, [incomingCall]);

  const handleAnswer = async () => {
    if (!incomingCall) return;
    setLoading(true);
    try {
      await answerCall(incomingCall.callId, incomingCall.caller);
    } catch (error) {
      console.error('Failed to answer call:', error);
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!incomingCall) return;
    await rejectCall(incomingCall.callId);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce">
        {/* Caller Avatar */}
        <div className="mb-6">
          {callerInfo?.avatar ? (
            <img
              src={callerInfo.avatar}
              alt={callerInfo.name}
              className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-blue-500"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-semibold ring-4 ring-blue-500">
              {callerInfo?.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>

        {/* Caller Info */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{callerInfo?.name || 'Unknown'}</h2>
        <p className="text-gray-600 mb-8">Đang gọi video...</p>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {/* Reject Button */}
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Từ chối</span>
          </button>

          {/* Answer Button */}
          <button
            onClick={handleAnswer}
            disabled={loading}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
              {loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : (
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">Trả lời</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
