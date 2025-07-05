const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { uploadAvatar } = require("../services/uploadService");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (!user.status) {
      return res
        .status(403)
        .json({
          message:
            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ.",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Trả về user info theo format frontend cần
    return res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.name, // hoặc đổi backend field thành fullName
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

exports.register = async (req, res) => {
  // Kiểm tra req.body trước khi destructure
  if (!req.body) {
    return res.status(400).json({ message: "Thiếu dữ liệu gửi lên" });
  }

  const { name, email, password, phone } = req.body;
  const avatarFile = req.file; // Lấy file avatar từ multer

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email đã được đăng ký" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Xử lý upload avatar nếu có
    let avatarUrl = null;
    if (avatarFile) {
      try {
        avatarUrl = await uploadAvatar(avatarFile);
      } catch (uploadError) {
        console.error("Lỗi upload avatar:", uploadError);
        return res.status(400).json({ message: "Lỗi upload avatar" });
      }
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      avatar: avatarUrl,
      role: "member", // mặc định là member
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      user: {
        id: newUser._id,
        fullName: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        avatar: newUser.avatar,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("error in register:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ message: "Không tìm thấy người dùng" });

//     // Tạo token reset (ngẫu nhiên, mã hóa)
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     // Lưu token và thời hạn vào DB
//     user.resetPasswordToken = hashedToken;
//     user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
//     await user.save();

//     const resetURL = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;

//     // TODO: gửi resetURL qua email ở đây

//     res.json({
//       message: "Đã gửi link đặt lại mật khẩu",
//       resetURL, // Chỉ để test, thực tế không trả về
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server", error: err.message });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   const { token, email, newPassword } = req.body;

//   try {
//     const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

//     const user = await User.findOne({
//       email,
//       resetPasswordToken: hashedToken,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res
//         .status(400)
//         .json({ message: "Token không hợp lệ hoặc hết hạn" });
//     }

//     user.password = await bcrypt.hash(newPassword, 10);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();

//     res.json({ message: "Đặt lại mật khẩu thành công" });
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi server", error: err.message });
//   }
// };

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 số
    const expires = Date.now() + 15 * 60 * 1000; // 15 phút

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = expires;
    await user.save();

    await sendEmail({
      to: email,
      subject: "Mã OTP đặt lại mật khẩu",
      text: `Mã OTP của bạn là ${otp}. Có hiệu lực trong 15 phút.`,
      html: `<p>Mã OTP của bạn là: <strong>${otp}</strong></p><p>Có hiệu lực trong 15 phút.</p>`,
    });

    res.json({ message: "Đã gửi OTP đến email của bạn" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "OTP không đúng hoặc đã hết hạn" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Xác thực OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "Vui lòng nhập email và mã OTP",
    });
  }

  try {
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "OTP không đúng hoặc đã hết hạn",
      });
    }

    // OTP hợp lệ - trả về thông tin xác thực thành công
    res.json({
      message: "Xác thực OTP thành công",
      verified: true,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi xác thực OTP",
      error: err.message,
    });
  }
};
