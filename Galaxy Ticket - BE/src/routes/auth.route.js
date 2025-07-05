const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const {
  authenticate,
  authorizeRoles,
  checkUserStatus,
} = require("../middlewares/auth.middleware");
const { upload } = require("../services/uploadService");

router.post("/register", upload.single("avatar"), authController.register);

router.post("/login", authController.login);

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

// User xóa avatar
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
