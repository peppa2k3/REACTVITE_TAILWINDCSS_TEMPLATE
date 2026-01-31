import React from 'react';
import { useChat } from '../../contexts/ChatContext';

const EmojiPicker = ({ onClose }) => {
  const { activeConversation, sendMessage } = useChat();

  const emojiCategories = {
    'Cảm xúc': [
      '😀',
      '😃',
      '😄',
      '😁',
      '😆',
      '😅',
      '🤣',
      '😂',
      '🙂',
      '🙃',
      '😉',
      '😊',
      '😇',
      '🥰',
      '😍',
      '🤩',
      '😘',
      '😗',
      '😚',
      '😙',
      '😋',
      '😛',
      '😜',
      '🤪',
      '😝',
      '🤑',
      '🤗',
      '🤭',
      '🤫',
      '🤔',
      '🤐',
      '🤨',
      '😐',
      '😑',
      '😶',
      '😏',
      '😒',
      '🙄',
      '😬',
      '🤥',
      '😌',
      '😔',
      '😪',
      '🤤',
      '😴',
    ],
    'Tình cảm': [
      '❤️',
      '🧡',
      '💛',
      '💚',
      '💙',
      '💜',
      '🖤',
      '🤍',
      '🤎',
      '💔',
      '❣️',
      '💕',
      '💞',
      '💓',
      '💗',
      '💖',
      '💘',
      '💝',
      '💟',
    ],
    'Cử chỉ': [
      '👍',
      '👎',
      '👌',
      '✌️',
      '🤞',
      '🤟',
      '🤘',
      '🤙',
      '👈',
      '👉',
      '👆',
      '👇',
      '☝️',
      '✋',
      '🤚',
      '🖐️',
      '🖖',
      '👋',
      '🤝',
      '🙏',
      '💪',
      '🦾',
      '🦿',
      '🦵',
      '🦶',
      '👂',
      '🦻',
      '👃',
      '🧠',
    ],
    'Hoạt động': [
      '🏃',
      '🚶',
      '🧘',
      '🧗',
      '🤺',
      '🏇',
      '⛷️',
      '🏂',
      '🏌️',
      '🏄',
      '🚣',
      '🏊',
      '⛹️',
      '🏋️',
      '🚴',
      '🚵',
      '🤸',
      '🤼',
      '🤽',
      '🤾',
      '🤹',
    ],
    'Thiên nhiên': [
      '🌸',
      '💮',
      '🏵️',
      '🌹',
      '🥀',
      '🌺',
      '🌻',
      '🌼',
      '🌷',
      '🌱',
      '🌲',
      '🌳',
      '🌴',
      '🌵',
      '🌾',
      '🌿',
      '☘️',
      '🍀',
      '🍁',
      '🍂',
      '🍃',
    ],
  };

  const handleEmojiClick = async (emoji) => {
    if (activeConversation) {
      await sendMessage(activeConversation._id, emoji, 'emoji');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[70vh] sm:max-h-[600px] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Chọn Emoji</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
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
          </button>
        </div>

        {/* Emoji Grid */}
        <div className="overflow-y-auto p-4 space-y-6" style={{ maxHeight: 'calc(70vh - 80px)' }}>
          {Object.entries(emojiCategories).map(([category, emojis]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{category}</h4>
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl sm:text-3xl p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;
