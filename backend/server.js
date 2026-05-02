require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const { initDatabase } = require('./database');
const pageRoutes = require('./routes/pageRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = 3000;

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

// Static files - serve uploaded audio từ backend/public/
app.use('/audio', express.static(path.join(__dirname, 'public', 'audio')));

// Session
app.use(session({
    secret: 'dieu-am-tien-canh-secret-key-2024',
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
    await initDatabase(bcrypt);

    app.listen(PORT, () => {
        console.log(`\n🎵 ═══════════════════════════════════════`);
        console.log(`   DIỆU ÂM TIÊN CẢNH - Server đã khởi động`);
        console.log(`   🌐 http://localhost:${PORT}`);
        console.log(`   📁 Backend:  /backend`);
        console.log(`   📁 Frontend: /frontend`);
        console.log(`🎵 ═══════════════════════════════════════\n`);
    });
}

startServer();
