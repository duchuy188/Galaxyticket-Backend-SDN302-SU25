const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, truy cập bị từ chối" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập tài nguyên này" });
    }
    next();
  };
};

exports.verifyToken = (req, res, next) => {
  console.log("Verifying token...");
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No token or invalid format");
    return res.status(401).json({ message: "Token không hợp lệ hoặc thiếu" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn" });
  }
};

exports.requireRole = (role) => {
  return (req, res, next) => {
    console.log(" requireRole middleware running");
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Không có quyền truy cập." });
    }
    console.log("Role check passed");
    next();
  };
};

// Kiểm tra user có bị khóa không
exports.checkUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (!user.status) {
      return res.status(403).json({
        message:
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ.",
      });
    }

    next();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Lỗi kiểm tra trạng thái tài khoản" });
  }
};
