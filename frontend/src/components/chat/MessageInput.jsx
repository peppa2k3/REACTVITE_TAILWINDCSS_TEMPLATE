import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';

const MessageInput = ({ showEmojiPicker, setShowEmojiPicker }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const { activeConversation, sendMessage, sendMedia, startTyping, stopTyping } = useChat();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleTyping = (value) => {
    setMessage(value);

    if (!isTyping && value.trim()) {
      setIsTyping(true);
      startTyping(activeConversation._id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(activeConversation._id);
    }, 1000);
  };

  const handleFileSelect = (files) => {
    const filesArray = Array.from(files);
    setSelectedFiles(filesArray);

    // Create preview URLs
    const urls = filesArray.map((file) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    setPreviewUrls(urls);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!activeConversation) return;

    try {
      // Send files first
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          await sendMedia(activeConversation._id, file);
        }
        setSelectedFiles([]);
        previewUrls.forEach((url) => url && URL.revokeObjectURL(url));
        setPreviewUrls([]);
      }

      // Then send text message if any
      if (message.trim()) {
        await sendMessage(activeConversation._id, message.trim());
        setMessage('');
      }

      if (isTyping) {
        setIsTyping(false);
        stopTyping(activeConversation._id);
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="p-4">
      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex gap-2 flex-wrap">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative">
              {file.type.startsWith('image/') ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={previewUrls[index]}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : file.type.startsWith('video/') ? (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                  <video src={previewUrls[index]} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border-2 border-gray-200">
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
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-700 max-w-[100px] truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex items-end gap-2">
        {/* Attachment Buttons */}
        <div className="flex gap-1">
          {/* Image */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Gửi ảnh"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>

          {/* Video */}
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Gửi video"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          {/* File */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Gửi file"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          {/* Emoji */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Emoji"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            rows="1"
            className="w-full px-4 py-3 bg-gray-100 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
            style={{ minHeight: '48px' }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() && selectedFiles.length === 0}
          className={`p-3 rounded-full transition-colors ${
            message.trim() || selectedFiles.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </form>
    </div>
  );
};

export default MessageInput;
