const Screening = require('../models/Screening');

// Tạo suất chiếu mới
exports.createScreening = async (req, res) => {
  try {
    const screening = new Screening(req.body);
    await screening.save();
    res.status(201).json(screening);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy danh sách suất chiếu (có thể lọc theo query)
exports.getAllScreenings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.movieId) filter.movieId = req.query.movieId;
    if (req.query.roomId) filter.roomId = req.query.roomId;
    if (req.query.status !== undefined) filter.status = req.query.status;
    if (req.query.startTime) filter.startTime = { $gte: new Date(req.query.startTime) };
    if (req.query.endTime) filter.endTime = { $lte: new Date(req.query.endTime) };
    const screenings = await Screening.find(filter);
    res.json(screenings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết suất chiếu theo ID
exports.getScreeningById = async (req, res) => {
  try {
    const screening = await Screening.findById(req.params.id);
    if (!screening) return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
    res.json(screening);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật suất chiếu
exports.updateScreening = async (req, res) => {
  try {
    const screening = await Screening.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!screening) return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
    res.json(screening);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa suất chiếu
exports.deleteScreening = async (req, res) => {
  try {
    const screening = await Screening.findByIdAndDelete(req.params.id);
    if (!screening) return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
