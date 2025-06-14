const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

router.post("/register", authController.register);

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
  authorizeRoles("admin", "staff"),
  userController.dashboard
);

router.get("/profile", authenticate, userController.getProfile);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
module.exports = router;
