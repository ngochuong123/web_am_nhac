require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const { initDatabase } = require('./database'); // Hàm initDatabase mới từ database.js
const pageRoutes = require('./routes/pageRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000; // Ưu tiên lấy cổng từ môi trường (cần thiết khi lên Render)

// =============================================
// MIDDLEWARE
// =============================================

// Template engine - views nằm trong backend/views/
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - serve từ thư mục frontend/
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Static files - serve uploaded audio từ backend/public/ (Dành cho dev local)
app.use('/audio', express.static(path.join(__dirname, 'public', 'audio')));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'dieu-am-tien-canh-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 1 ngày
    }
}));

// Truyền thông tin user vào tất cả views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// =============================================
// ROUTES
// =============================================

// Page routes (render EJS)
app.use('/', pageRoutes);

// API routes (JSON responses)
app.use('/api', apiRoutes);

// =============================================
// KHỞI ĐỘNG SERVER
// =============================================

async function startServer() {
    try {
        // Khởi tạo kết nối tới MySQL Aiven
        // Không cần truyền bcrypt nữa vì logic seed đã nằm trong Workbench
        await initDatabase();

        app.listen(PORT, () => {
            console.log(`\n🎵 ═══════════════════════════════════════`);
            console.log(`   DIỆU ÂM TIÊN CẢNH - Đạo giới đã mở cổng`);
            console.log(`   🌐 Server: http://localhost:${PORT}`);
            console.log(`   💎 Database: MySQL Aiven (Cloud)`);
            console.log(`🎵 ═══════════════════════════════════════\n`);
        });
    } catch (err) {
        console.error('❌ Không thể khởi động đạo giới do lỗi Database:', err.message);
        process.exit(1); // Dừng server nếu không kết nối được DB
    }
}

startServer();