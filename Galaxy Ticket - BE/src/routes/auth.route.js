const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const User = require("../models/User");
const {
  authenticate,
  authorizeRoles,
  checkUserStatus,
} = require("../middlewares/auth.middleware");
const { upload } = require("../services/uploadService");

router.post("/register", upload.single("avatar"), authController.register);

router.post("/login", authController.login);

router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Import User model (thêm dòng này ở đầu file nếu chưa có)

    // Tìm user trong database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Trả về thông tin user
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status, // true = active, false = locked
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get(
  "/users",
  authenticate,
  authorizeRoles("admin"),
  userController.getAllUsers
);

router.get(
  "/dashboard",
  authenticate,
  checkUserStatus,
  authorizeRoles("admin", "staff"),
  userController.dashboard
);

router.get(
  "/profile",
  authenticate,
  checkUserStatus,
  userController.getProfile
);

// User update profile của chính mình (không được sửa role)
router.put(
  "/profile",
  authenticate,
  checkUserStatus,
  upload.single("avatar"),
  userController.updateProfile
);


router.delete(
  "/profile/avatar",
  authenticate,
  checkUserStatus,
  userController.removeAvatar
);

// User thay đổi mật khẩu
router.put(
  "/change-password",
  authenticate,
  checkUserStatus,
  userController.changePassword
);

// Xác thực OTP
router.post("/verify-otp", authController.verifyOTP);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
