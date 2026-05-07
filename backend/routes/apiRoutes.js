const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const streamifier = require('streamifier');
const db = require('../database'); // Import pool từ database.js mới
const { cloudinary, upload } = require('../utils/uploadConfig');
// backend/routes/apiRoutes.js
// PHẢI ĐẶT LÊN ĐẦU TIÊN
router.get('/search-live', async (req, res) => {
    try {
        const queryStr = req.query.q || '';
        if (queryStr.length < 1) return res.json({ success: true, songs: [] });

        // Dùng db.query (không dùng [songs]) vì helper đã bóc tách rows
        const songs = await db.query(
            'SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? OR genre LIKE ? LIMIT 10',
            [`%${queryStr}%`, `%${queryStr}%`, `%${queryStr}%`]
        );
        res.json({ success: true, songs: songs || [] });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// =============================================
// ĐĂNG KÝ
// =============================================
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Hai luồng mật pháp không đồng nhất!'
            });
        }

        if (username.toLowerCase() === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Đạo hiệu này đã được sử dụng bởi Thiên Đạo!'
            });
        }

        const role = username.toLowerCase() === 'admin' ? 'admin' : 'user';

        // Gọi Stored Procedure
        // 1. Băm mật khẩu bằng Bcrypt trước
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 2. Truyền hashedPassword (mã băm) vào Procedure
        const result = await db.query('CALL sp_register_user(?, ?, ?, ?)', [username, email, hashedPassword, role]);
        // mysql2 trả về mảng cho các kết quả của SP. Phần tử đầu tiên là mảng của lệnh SELECT trong SP.
        const row = result[0] && result[0][0] ? result[0][0] : null;

        if (!row || !row.success) {
            return res.status(400).json({
                success: false,
                message: row ? row.message : 'Đạo hiệu hoặc phúc địa đã được sử dụng!'
            });
        }

        res.json({
            success: true,
            message: row.message
        });

    } catch (err) {
        console.error('Lỗi đăng ký:', err);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống, vui lòng thử lại.' });
    }
});

// =============================================
// ĐĂNG NHẬP
// =============================================
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Gọi Stored Procedure
        // 1. Chỉ gửi username vào SP để lấy thông tin (bao gồm password_hash)
        const result = await db.query('CALL sp_login_user(?)', [username]);
        const row = result[0] && result[0][0] ? result[0][0] : null;

        // 2. Nếu tìm thấy user, dùng bcrypt.compare để đối chiếu mật pháp
        if (row && row.success) {
            const isMatch = await bcrypt.compare(password, row.password_hash);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Mật pháp không chính xác!' });
            }
        } else {
            return res.status(401).json({ success: false, message: row ? row.message : 'Đạo hiệu không tồn tại!' });
        }

        req.session.user = {
            id: row.id,
            username: row.username,
            email: row.email,
            role: row.role
        };

        res.json({
            success: true,
            message: `Đạo hữu ${row.username} đã quy vị.`,
            user: { username: row.username, email: row.email }
        });

    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống, vui lòng thử lại.' });
    }
});

// =============================================
// ĐĂNG XUẤT (Giữ nguyên)
// =============================================
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

// =============================================
// DANH SÁCH BÀI HÁT
// =============================================
router.get('/songs', async (req, res) => {
    try {
        const { continent, limit = 20, sort = 'play_count', q = '' } = req.query;

        let query = 'SELECT * FROM songs WHERE 1=1';
        const params = [];

        if (continent) {
            query += ' AND continent = ?';
            params.push(continent);
        }

        if (q) {
            query += ' AND (title LIKE ? OR artist LIKE ? OR genre LIKE ?)';
            params.push(`%${q}%`, `%${q}%`, `%${q}%`);
        }

        const validSorts = ['play_count', 'created_at', 'title'];
        const sortField = validSorts.includes(sort) ? sort : 'play_count';
        query += ` ORDER BY ${sortField} DESC LIMIT ?`;
        params.push(parseInt(limit));

        const songs = await db.query(query, params);
        res.json({ success: true, songs });
    } catch (err) {
        console.error('Lỗi lấy danh sách nhạc:', err);
        res.status(500).json({ success: false });
    }
});

// =============================================
// UPLOAD BÀI HÁT MỚI
// =============================================
router.post('/upload-song', upload.single('audioFile'), async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
        if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng chọn file âm thanh' });

        const { title, artist, duration, genre, continent, cover_url } = req.body;

        const uploadFromBuffer = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "dieu-am-tien-canh/songs", resource_type: "video" },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await uploadFromBuffer(req);

        await db.execute(
            'INSERT INTO songs (title, artist, duration, genre, continent, cover_url, audio_url, play_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, artist, duration || '0:00', genre || 'unknown', continent || 'asia', cover_url || '/images/default-cover.jpg', result.secure_url, 0]
        );

        res.json({ success: true, message: 'Tải bài hát lên Tiên Giới thành công!', songUrl: result.secure_url });

    } catch (err) {
        console.error('Lỗi upload nhạc:', err);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống khi tải nhạc lên.' });
    }
});

// =============================================
// LƯU LỊCH SỬ NGHE NHẠC
// =============================================
router.post('/history/:id', async (req, res) => {
    try {
        const songId = req.params.id;
        // Tăng lượt nghe (Sử dụng COALESCE để tránh lỗi nếu play_count là NULL)
        await db.execute('UPDATE songs SET play_count = COALESCE(play_count, 0) + 1 WHERE id = ?', [songId]);

        if (req.session.user) {
            await db.execute(
                'INSERT INTO play_history (user_id, song_id) VALUES (?, ?)',
                [req.session.user.id, songId]
            );
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Lỗi cập nhật lượt nghe:', err);
        res.status(500).json({ success: false });
    }
});

// =============================================
// THẢ TIM / YÊU THÍCH BÀI HÁT
// =============================================
router.get('/favorite/:id', async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: true, isFavorite: false });

        // PHẢI dùng db.query để nhận về mảng rows
        const rows = await db.query(
            'SELECT id FROM favorites WHERE user_id = ? AND song_id = ?',
            [req.session.user.id, req.params.id]
        );

        res.json({ success: true, isFavorite: rows && rows.length > 0 });
    } catch (err) {
        console.error('Lỗi check favorite:', err);
        res.status(500).json({ success: false });
    }
});
router.post('/favorite/:id', async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ success: false, message: 'Cần đăng nhập!' });

        const userId = req.session.user.id;
        const songId = req.params.id;

        // Dùng db.query để lấy danh sách kiểm tra tồn tại
        const existing = await db.query(
            'SELECT id FROM favorites WHERE user_id = ? AND song_id = ?',
            [userId, songId]
        );

        if (existing && existing.length > 0) {
            // Đã thích -> Xóa (Dùng execute vì đây là lệnh DELETE)
            await db.execute('DELETE FROM favorites WHERE id = ?', [existing[0].id]);
            return res.json({ success: true, isFavorite: false, message: 'Đã hủy yêu thích.' });
        } else {
            // Chưa thích -> Thêm
            await db.execute('INSERT INTO favorites (user_id, song_id) VALUES (?, ?)', [userId, songId]);
            return res.json({ success: true, isFavorite: true, message: 'Đã thêm vào yêu thích!' });
        }
    } catch (err) {
        console.error('Lỗi POST favorite:', err);
        res.status(500).json({ success: false });
    }
});

// =============================================
// QUẢN LÝ BÀI HÁT (ADMIN)
// =============================================
router.get('/songs/:id', async (req, res) => {
    try {
        const song = await db.get('SELECT * FROM songs WHERE id = ?', [req.params.id]);
        if (!song) return res.status(404).json({ success: false });
        res.json(song);
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

router.post('/songs', async (req, res) => {
    try {
        const { title, artist, duration, genre, continent, cover_url, audio_url, play_count } = req.body;
        const result = await db.execute(
            'INSERT INTO songs (title, artist, duration, genre, continent, cover_url, audio_url, play_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, artist, duration || '0:00', genre, continent, cover_url || '/images/default-cover.jpg', audio_url || '', play_count || 0]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

router.put('/songs/:id', async (req, res) => {
    try {
        const { title, artist, duration, genre, continent, cover_url, audio_url, play_count } = req.body;
        await db.execute(
            'UPDATE songs SET title = ?, artist = ?, duration = ?, genre = ?, continent = ?, cover_url = ?, audio_url = ?, play_count = ? WHERE id = ?',
            [title, artist, duration, genre, continent, cover_url, audio_url, play_count, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

router.get('/songs/:id/stats', async (req, res) => {
    try {
        const songId = req.params.id;
        const { range = '7d' } = req.query;
        
        let interval;
        let dateFormat;
        let limit;

        switch (range) {
            case '30d':
                interval = 'INTERVAL 30 DAY';
                dateFormat = '%Y-%m-%d';
                limit = 30;
                break;
            case '90d':
                interval = 'INTERVAL 90 DAY';
                dateFormat = '%Y-%u'; // Theo tuần
                limit = 13;
                break;
            case '1y':
                interval = 'INTERVAL 1 YEAR';
                dateFormat = '%Y-%m';
                limit = 12;
                break;
            default: // 7d
                interval = 'INTERVAL 7 DAY';
                dateFormat = '%Y-%m-%d';
                limit = 7;
        }

        const stats = await db.query(`
            SELECT DATE_FORMAT(played_at, ?) as date, COUNT(*) as count
            FROM play_history
            WHERE song_id = ? AND played_at >= DATE_SUB(NOW(), ${interval})
            GROUP BY date
            ORDER BY date ASC
        `, [dateFormat, songId]);

        res.json({ success: true, stats });
    } catch (err) {
        console.error('Lỗi lấy thống kê:', err);
        res.status(500).json({ success: false });
    }
});

router.delete('/songs/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM songs WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;