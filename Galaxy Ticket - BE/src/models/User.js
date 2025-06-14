const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
<<<<<<< HEAD
      type: String,
      enum: ["member", "staff", "manager", "admin"],
      default: "member",
=======
        type: String,
        enum: ['member', 'staff', 'manager', 'admin'],
        default: 'member'
>>>>>>> 2bc10c14e6a88c5905d9d713f4f3832713cbcb85
    },
    status: {
      type: Boolean,
      default: true,
    },
    // 👇 Thêm 2 trường này để hỗ trợ quên mật khẩu
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
