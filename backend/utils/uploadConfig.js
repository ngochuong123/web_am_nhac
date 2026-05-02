const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Cấu hình Cloudinary từ biến môi trường (.env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình Multer để lưu file vào bộ nhớ tạm (RAM) trước khi upload lên Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // Giới hạn file 20MB
    }
});

module.exports = {
    cloudinary,
    upload
};
