const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: [2, 'Title must be at least 2 characters'],
    maxLength: [100, 'Title cannot exceed 500 characters']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minLength: [10, 'Description must be at least 10 characters'],
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  genre: {
    type: String,
    required: true,
    enum: {
      values: [
        'Western', 'War', 'Family', 'Fantasy', 'Thriller', 'Comedy',
        'Action', 'Crime', 'Animation', 'Horror', 'Romance', 'Historical',
        'Mystery', 'Musical', 'Adventure', 'Documentary', 'Drama', 'Mythology',
        'Sports', 'Biography'
      ],
      message: 'Invalid genre'
    }
  },
  duration: {
    type: Number,
    required: true,
    min: [30, 'Duration must be at least 30 minutes'],
    max: [500, 'Duration cannot exceed 500 minutes']
  },
  posterUrl: {
    type: String,
    required: true
  },
  trailerUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; 
        try {
          new URL(v);
          return true;
        } catch (err) {
          return false;
        }
      },
      message: 'Trailer URL must be a valid URL format'
    },
    default: null
  },
  releaseDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const releaseDate = new Date(v);
        releaseDate.setHours(0, 0, 0, 0);
        
        return releaseDate >= today;
      },
      message: 'Release date must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'  
  },
  rejectionReason: {
    type: String,
    default: null,
    maxLength: [500, 'Rejection reason cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
    default: null  
  },
  isActive: {
    type: Boolean,
    default: true  
  },
  country: {
    type: String,
    required: true,
    trim: true,
    minLength: [2, 'Country name must be at least 2 characters'],
    maxLength: [50, 'Country name cannot exceed 50 characters']
  },
  showingStatus: {
    type: String,
    enum: {
      values: ['coming-soon', 'now-showing', 'ended'],
      message: 'Invalid showing status'
    },
    default: 'coming-soon'
  },
  producer: {
    type: String,
    required: true,
    trim: true,
    minLength: [2, 'Producer name must be at least 2 characters'],
    maxLength: [100, 'Producer name cannot exceed 100 characters']
  },
  directors: [{
    type: String,
    required: true,
    trim: true,
    minLength: [2, 'Director name must be at least 2 characters'],
    maxLength: [100, 'Director name cannot exceed 100 characters']
  }],
  actors: [{
    type: String,
    required: true,
    trim: true,
    minLength: [2, 'Actor name must be at least 2 characters'],
    maxLength: [100, 'Actor name cannot exceed 100 characters']
  }]
}, {
  timestamps: true  
});

const uniqueGenres = [...new Set(movieSchema.path('genre').enumValues)];
movieSchema.path('genre').enumValues = uniqueGenres;

module.exports = mongoose.model('Movie', movieSchema);
