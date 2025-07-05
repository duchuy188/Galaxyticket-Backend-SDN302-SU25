const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, requireRole } = require("../middlewares/auth.middleware");

router.use((req, res, next) => {
  console.log("Admin route accessed:", req.method, req.path);
  next();
});

router.get("/test", (req, res) => {
  res.json({ message: "Admin test route OK" });
});

router.use(verifyToken);
// Middleware: chỉ admin được dùng các API này
router.use(requireRole("admin"));

// Lấy danh sách tất cả users
router.get("/users", (req, res, next) => {
  console.log("GET /users route triggered");
  adminController.getAllUsers(req, res, next);
});

// Tạo staff hoặc manager
router.post("/users", (req, res, next) => {
  console.log("POST /users route triggered");
  adminController.createUserByAdmin(req, res, next);
});

router.put("/users/:id", (req, res, next) => {
  console.log(" PUT /users/:id route triggered");
  adminController.updateUser(req, res, next);
});

// Lock account
router.patch("/users/:id/lock", (req, res, next) => {
  console.log("PATCH /users/:id/lock route triggered");
  adminController.lockUser(req, res, next);
});

// Unlock account
router.patch("/users/:id/unlock", (req, res, next) => {
  console.log("PATCH /users/:id/unlock route triggered");
  adminController.unlockUser(req, res, next);
});

router.delete("/users/:id", (req, res, next) => {
  console.log(" DELETE /users/:id route triggered");
  adminController.deleteUser(req, res, next);
});

module.exports = router;
