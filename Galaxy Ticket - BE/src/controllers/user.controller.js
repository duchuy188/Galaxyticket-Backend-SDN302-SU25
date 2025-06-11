const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  res.json(user);
};

exports.dashboard = (req, res) => {
  res.json({ message: `Xin chào ${req.user.role}` });
};
