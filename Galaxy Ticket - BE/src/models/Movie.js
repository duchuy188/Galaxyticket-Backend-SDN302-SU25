const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true   
  },
  genre: {
    type: String,
    required: true,
    enum: {
      values: [
        'Western', 'War', 'Family', 'Fantasy', 'Thriller', 'Comedy',
        'Action', 'Crime', 'Animation', 'Horror', 'Romance', 'Historical',
        'Mystery', 'Musical', 'Adventure', 'Documentary', 'Drama', 'Mythology',
        'Sports', 'Biography', 'Romance', 'Crime'
      ],
      message: 'Invalid genre'
    }
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  posterUrl: {
    type: String,
    required: true
  },
  trailerUrl: {
    type: String,
    default: null
  },
  releaseDate: {
    type: Date,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  country: {
    type: String,
    required: true
  
  },
  showingStatus: {
    type: String,
    enum: {
      values: ['coming-soon', 'now-showing', 'ended'],
      message: 'Invalid showing status'
    },
    default: 'coming-soon'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);
