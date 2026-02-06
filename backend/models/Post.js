import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true,
    maxlength: 10000
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnail: String // For video thumbnails
  }],
  status: {
    type: String,
    enum: ['happy', 'sad', 'excited', 'angry', 'blessed', 'loved', 'thankful', 'motivated', 'relaxed', 'none'],
    default: 'none'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public'
  },
  location: {
    name: String,
    latitude: Number,
    longitude: Number,
    address: String
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'dislike'],
      default: 'like'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    shareType: {
      type: String,
      enum: ['message', 'timeline'],
      required: true
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'public'
    },
    caption: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  isShared: {
    type: Boolean,
    default: false
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  sharesCount: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  dislikesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ 'location.name': 'text', content: 'text' });

// Virtual for total reactions
postSchema.virtual('totalReactions').get(function() {
  return this.likesCount + this.dislikesCount;
});

// Method to check if user liked/disliked post
postSchema.methods.getUserReaction = function(userId) {
  const reaction = this.likes.find(like => like.user.toString() === userId.toString());
  return reaction ? reaction.type : null;
};

const Post = mongoose.model('Post', postSchema);

export default Post;