const cloudinary = require('cloudinary').v2;
const multer = require('multer');
require('dotenv').config(); // Đảm bảo nạp biến môi trường ngay tại đây nếu file server chưa gọi

// Cấu hình Cloudinary từ biến môi trường (.env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Kiểm tra cấu hình Cloudinary khi khởi động (Dành cho việc debug trên Cloud)
if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('⚠️ Cảnh báo: Chưa tìm thấy cấu hình Cloudinary trong .env');
}

// Cấu hình Multer để lưu file vào bộ nhớ tạm (RAM) trước khi upload lên Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // Giới hạn file 20MB phù hợp với nhạc MP3
    }
});

module.exports = {
    cloudinary,
    upload
};