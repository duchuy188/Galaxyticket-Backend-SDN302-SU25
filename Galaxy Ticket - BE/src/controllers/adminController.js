const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Tạo staff hoặc manager
// exports.createUserByAdmin = async (req, res) => {
//   const { name, email, password, phone, role } = req.body;
//   if (!name || !email || !password || !phone || !role) {
//     return res.status(400).json({ message: "Thiếu trường bắt buộc" });
//   }

//   if (!["staff", "manager"].includes(role)) {
//     return res.status(400).json({ message: "Chỉ được tạo staff hoặc manager" });
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);

//   try {
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       role,
//     });
//     await newUser.save();
//     res
//       .status(201)
//       .json({
//         message: "Tạo người dùng thành công",
//         user: {
//           id: newUser._id,
//           name: newUser.name,
//           email: newUser.email,
//           phone: newUser.phone,
//           role: newUser.role,
//         },
//       });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Lỗi khi tạo người dùng", error: err.message });
//   }
// };

// Tạo staff hoặc manager
exports.createUserByAdmin = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // Log để debug
  console.log("Dữ liệu nhận được từ client:", req.body);

  // Kiểm tra thiếu field
  if (!name || !email || !password || !phone || !role) {
    return res.status(400).json({ message: "Thiếu trường bắt buộc" });
  }

  // Chỉ cho phép tạo role là staff hoặc manager
  if (!["staff", "manager"].includes(role)) {
    return res.status(400).json({ message: "Chỉ được tạo staff hoặc manager" });
  }

  try {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: "Tạo người dùng thành công",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Lỗi khi tạo người dùng:", err);
    res.status(500).json({
      message: "Lỗi khi tạo người dùng",
      error: err.message,
    });
  }
};

// Cập nhật thông tin người dùng (cho mọi role)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  if (updateFields.password) {
    updateFields.password = await bcrypt.hash(updateFields.password, 10);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
    }).select("-password");
    res.json({ message: "Cập nhật thành công", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
};

// Xoá người dùng (cho mọi role)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);
    res.json({ message: "Xoá người dùng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá người dùng", error: err.message });
  }
};
