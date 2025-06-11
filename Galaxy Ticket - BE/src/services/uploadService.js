const cloudinary = require('../config/cloudinary.config');
const multer = require('multer');

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB


const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_FORMATS.includes(file.mimetype)) {
            cb(new Error('Unsupported file type. Please upload one of the following formats: JPG, PNG, JPEG, WEBP'), false);
            return;
        }
        cb(null, true);
    }
});

const uploadImage = async (file) => {
    try {
     
        if (!file) {
            throw new Error('No file found to upload');
        }

     
        if (!ALLOWED_FORMATS.includes(file.mimetype)) {
            throw new Error('Unsupported file format');
        }

      
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
 
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'movies',
            resource_type: 'auto',
            transformation: [
                { quality: 'auto' }, 
                { fetch_format: 'auto' }
            ]
        });
        
        if (!result || !result.secure_url) {
            throw new Error('Failed to get URL from Cloudinary');
        }
        
        return result.secure_url;
    } catch (error) {
        throw new Error(`Image upload failed: ${error.message}`);
    }
};

module.exports = { upload, uploadImage };