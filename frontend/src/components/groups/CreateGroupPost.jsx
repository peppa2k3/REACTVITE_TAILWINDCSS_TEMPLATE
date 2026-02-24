// ============================================
// CreateGroupPost.jsx - Create post component
// ============================================
import React, { useState } from 'react';
import { useGroup } from '../../contexts/GroupContext';

const CreateGroupPost = ({ groupId }) => {
  const { createPost } = useGroup();
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      await createPost({
        groupId,
        content,
        media: [],
      });
      setContent('');
      setShowForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 text-left text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          What's on your mind?
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows="4"
          autoFocus
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setContent('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!content.trim() || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default CreateGroupPost;
