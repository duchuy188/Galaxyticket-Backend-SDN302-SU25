const cloudinary = require("../config/cloudinary.config");
const multer = require("multer");

const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_FORMATS.includes(file.mimetype)) {
      cb(
        new Error(
          "Unsupported file type. Please upload one of the following formats: JPG, PNG, JPEG, WEBP"
        ),
        false
      );
      return;
    }
    cb(null, true);
  },
});

const uploadImage = async (file) => {
  try {
    if (!file) {
      throw new Error("No file found to upload");
    }

    if (!ALLOWED_FORMATS.includes(file.mimetype)) {
      throw new Error("Unsupported file format");
    }

    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "movies",
      resource_type: "auto",
      transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
    });

    if (!result || !result.secure_url) {
      throw new Error("Failed to get URL from Cloudinary");
    }

    return result.secure_url;
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

const uploadAvatar = async (file) => {
  try {
    if (!file) {
      throw new Error("No file found to upload");
    }

    if (!ALLOWED_FORMATS.includes(file.mimetype)) {
      throw new Error("Unsupported file format");
    }

    // Kiểm tra xem Cloudinary đã được cấu hình chưa
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.warn("Cloudinary chưa được cấu hình, sử dụng fallback URL");
      // Trả về một URL placeholder đáng tin cậy hơn
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0M5Q0FDQyIvPgo8cGF0aCBkPSJNNDAgMTYwQzQwIDE0MCA2MCAxMjAgMTAwIDEyMEMxNDAgMTIwIDE2MCAxNDAgMTYwIDE2MEg0MFoiIGZpbGw9IiNDOUNBQ0MiLz4KPC9zdmc+";
    }

    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "users/avatars",
      resource_type: "auto",
      transformation: [
        { quality: "auto" },
        { fetch_format: "auto" },
        { width: 200, height: 200, crop: "fill", gravity: "face" },
      ],
    });

    if (!result || !result.secure_url) {
      throw new Error("Failed to get URL from Cloudinary");
    }

    return result.secure_url;
  } catch (error) {
    throw new Error(`Avatar upload failed: ${error.message}`);
  }
};

const uploadPromotionImage = async (file) => {
  try {
    if (!file) {
      throw new Error("No file found to upload");
    }

    if (!ALLOWED_FORMATS.includes(file.mimetype)) {
      throw new Error("Unsupported file format");
    }

    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "promotions",
      resource_type: "auto",
      transformation: [
        { quality: "auto" },
        { fetch_format: "auto" },
        { width: 1000, crop: "scale" }
      ],
    });

    if (!result || !result.secure_url) {
      throw new Error("Failed to get URL from Cloudinary");
    }

    return result.secure_url;
  } catch (error) {
    throw new Error(`Promotion image upload failed: ${error.message}`);
  }
};

module.exports = { upload, uploadImage, uploadAvatar, uploadPromotionImage };
