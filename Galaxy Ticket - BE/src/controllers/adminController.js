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

  const { role, ...otherFields } = req.body;

  console.log("Extracted role:", role);
  console.log("Other fields:", otherFields);
  console.log("Other fields keys:", Object.keys(otherFields));

  // Kiểm tra xem có field nào khác ngoài role không
  if (Object.keys(otherFields).length > 0) {
    console.log("Rejected - contains other fields:", otherFields);
    return res.status(400).json({
      message:
        "Không được phép thay đổi thông tin cá nhân của user. Chỉ được thay đổi role.",
    });
  }

  // Chỉ cho phép cập nhật role
  if (!role) {
    console.log("Rejected - no role provided");
    return res.status(400).json({ message: "Role là trường bắt buộc" });
  }

  // Chỉ cho phép thay đổi thành role staff hoặc manager (không được thành member hoặc admin)
  // if (!["staff", "manager"].includes(role)) {
  //   console.log("Rejected - invalid role:", role);
  //   return res.status(400).json({
  //     message:
  //       "Chỉ được thay đổi thành staff hoặc manager. Không được thay đổi thành member hoặc admin.",
  //   });
  // }

  try {
    // Kiểm tra user có tồn tại không
    const existingUser = await User.findById(id);
    if (!existingUser) {
      console.log("User not found:", id);
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    console.log("Updating user role from", existingUser.role, "to:", role);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role }, // Chỉ cập nhật role
      { new: true }
    ).select("-password");

    console.log("Update successful:", updatedUser);
    res.json({
      message: "Cập nhật role thành công",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update error:", err);
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
