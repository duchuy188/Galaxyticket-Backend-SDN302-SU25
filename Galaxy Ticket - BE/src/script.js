const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Thay đổi thông tin kết nối cho phù hợp
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/GalaxyTicket";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  status: Boolean,
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.model("User", userSchema, "users");

async function createAdminUser() {
  await mongoose.connect(MONGODB_URI);

  const password = "admin123"; // Đổi mật khẩu nếu muốn
  const hashedPassword = await bcrypt.hash(password, 10);

  const adminUser = new User({
    name: "Super Admin",
    email: "superadmin@example.com",
    password: hashedPassword,
    phone: "0123456789",
    role: "admin",
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await adminUser.save();
  console.log("Admin user created:", adminUser);
  await mongoose.disconnect();
}

createAdminUser().catch((err) => {
  console.error("Error creating admin user:", err);
  process.exit(1);
});
