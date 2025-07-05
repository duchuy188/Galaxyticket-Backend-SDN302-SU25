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

// Cập nhật role của người dùng (chỉ được thay đổi role)
exports.updateUser = async (req, res) => {
  const { id } = req.params;

  console.log("Full request body:", req.body);
  console.log("Request body keys:", Object.keys(req.body));

  const { role, status, ...otherFields } = req.body;

  console.log("Extracted role:", role);
  console.log("Extracted status:", status);
  console.log("Other fields:", otherFields);
  console.log("Other fields keys:", Object.keys(otherFields));

  // Kiểm tra xem có field nào khác ngoài role và status không
  if (Object.keys(otherFields).length > 0) {
    console.log("Rejected - contains other fields:", otherFields);
    return res.status(400).json({
      message:
        "Không được phép thay đổi thông tin cá nhân của user. Chỉ được thay đổi role và status.",
    });
  }

  // Kiểm tra ít nhất phải có role hoặc status
  if (!role && status === undefined) {
    console.log("Rejected - no role or status provided");
    return res
      .status(400)
      .json({ message: "Role hoặc status là trường bắt buộc" });
  }

  try {
    // Kiểm tra user có tồn tại không
    const existingUser = await User.findById(id);
    if (!existingUser) {
      console.log("User not found:", id);
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Tạo object update
    const updateFields = {};
    if (role !== undefined) updateFields.role = role;
    if (status !== undefined) updateFields.status = status;

    console.log("Updating user:", updateFields);
    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
    }).select("-password");

    console.log("Update successful:", updatedUser);
    res.json({
      message: "Cập nhật thành công",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
  }
};

// Lock account (khóa tài khoản)
exports.lockUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra user có tồn tại không
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Không cho phép khóa admin khác
    if (existingUser.role === "admin") {
      return res
        .status(403)
        .json({ message: "Không được phép khóa tài khoản admin khác" });
    }

    // Không cho phép khóa chính mình
    if (existingUser._id.toString() === req.user.userId) {
      return res
        .status(403)
        .json({ message: "Không được phép khóa tài khoản của chính mình" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    ).select("-password");

    res.json({
      message: "Khóa tài khoản thành công",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khóa tài khoản", error: err.message });
  }
};

// Unlock account (mở khóa tài khoản)
exports.unlockUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra user có tồn tại không
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status: true },
      { new: true }
    ).select("-password");

    res.json({
      message: "Mở khóa tài khoản thành công",
      user: updatedUser,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi mở khóa tài khoản", error: err.message });
  }
};

// Lấy danh sách tất cả users với status
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi lấy danh sách users", error: err.message });
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
