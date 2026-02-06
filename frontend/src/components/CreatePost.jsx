import { useState, useRef } from 'react';
import {
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  MapPinIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../utils/api';

const STATUS_OPTIONS = [
  { value: 'none', label: 'No status', emoji: '' },
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'excited', label: 'Excited', emoji: '🎉' },
  { value: 'angry', label: 'Angry', emoji: '😠' },
  { value: 'blessed', label: 'Blessed', emoji: '🙏' },
  { value: 'loved', label: 'Loved', emoji: '❤️' },
  { value: 'thankful', label: 'Thankful', emoji: '🙌' },
  { value: 'motivated', label: 'Motivated', emoji: '💪' },
  { value: 'relaxed', label: 'Relaxed', emoji: '😌' },
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', icon: '🌍' },
  { value: 'friends', label: 'Friends', icon: '👥' },
  { value: 'private', label: 'Only me', icon: '🔒' },
];

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('none');
  const [visibility, setVisibility] = useState('public');
  const [location, setLocation] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + mediaFiles.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB

      if (!isImage && !isVideo) {
        toast.error(`${file.name} is not a valid image or video`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} exceeds 100MB limit`);
        return false;
      }
      return true;
    });

    setMediaFiles([...mediaFiles, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews((prev) => [
          ...prev,
          {
            url: reader.result,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
  };

  const handleLocationSelect = () => {
    if (!locationSearch.trim()) {
      setLocation(null);
      setShowLocationInput(false);
      return;
    }

    // In a real app, you'd use Google Places API or similar
    setLocation({
      name: locationSearch,
      latitude: 0,
      longitude: 0,
      address: locationSearch,
    });
    setShowLocationInput(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && mediaFiles.length === 0) {
      toast.error('Post must have content or media');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add media files
      mediaFiles.forEach((file) => {
        formData.append('media', file);
      });

      // Add other data as JSON string
      const postData = {
        content: content.trim(),
        status,
        visibility,
        location,
      };

      formData.append('data', JSON.stringify(postData));

      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Post created successfully!');

      // Reset form
      setContent('');
      setStatus('none');
      setVisibility('public');
      setLocation(null);
      setMediaFiles([]);
      setMediaPreviews([]);
      setLocationSearch('');

      if (onPostCreated) {
        onPostCreated(response.data.post);
      }
    } catch (error) {
      console.error('Create post error:', error);
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === status);
  const selectedVisibility = VISIBILITY_OPTIONS.find((v) => v.value === visibility);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSubmit}>
        {/* Text Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
        />

        {/* Media Previews */}
        {mediaPreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                {preview.type === 'image' ? (
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={preview.url}
                    className="w-full h-40 object-cover rounded-lg"
                    controls
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Status Display */}
        {status !== 'none' && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            Feeling {selectedStatus?.emoji} {selectedStatus?.label}
            <button
              type="button"
              onClick={() => setStatus('none')}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Location Display */}
        {location && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4" />
            at {location.name}
            <button
              type="button"
              onClick={() => setLocation(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Location Input */}
        {showLocationInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              placeholder="Where are you?"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleLocationSelect())}
            />
            <button
              type="button"
              onClick={handleLocationSelect}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowLocationInput(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            {/* Photo/Video Upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Add photos/videos"
            >
              <PhotoIcon className="w-5 h-5 text-green-500" />
              <span className="hidden sm:inline">Photo/Video</span>
            </button>

            {/* Status Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusPicker(!showStatusPicker)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="How are you feeling?"
              >
                <FaceSmileIcon className="w-5 h-5 text-yellow-500" />
                <span className="hidden sm:inline">Feeling</span>
              </button>

              {showStatusPicker && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 w-48">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setStatus(option.value);
                        setShowStatusPicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                        status === option.value ? 'bg-blue-50' : ''
                      }`}
                    >
                      {option.emoji} {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <button
              type="button"
              onClick={() => setShowLocationInput(!showLocationInput)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Check in"
            >
              <MapPinIcon className="w-5 h-5 text-red-500" />
              <span className="hidden sm:inline">Check in</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Visibility Selector */}
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </form>
    </div>
  );
}
