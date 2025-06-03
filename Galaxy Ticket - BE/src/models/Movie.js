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
    enum: [
        'Cao bồi', 'Chiến tranh', 'Gia đình', 'Giả tưởng', 'Giật gân', 'Hài', 
        'Hành động', 'Hình sự', 'Hoạt hình', 'Kinh dị', 'Lãng mạn', 'Lịch sử',
        'Ly kì', 'Nhạc kịch', 'Phiêu lưu', 'Tài liệu', 'Tâm lý', 'Thần thoại',
        'Thể thao', 'Tiểu sử', 'Tình cảm', 'Tội phạm'
      ],
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  posterUrl: {
    type: String,
    default: null
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
  
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);
