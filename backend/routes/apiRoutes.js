const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const streamifier = require('streamifier');
const db = require('../database'); // Import pool từ database.js mới
const { cloudinary, upload } = require('../utils/uploadConfig');

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

        // MySQL trả về [rows, fields], ta lấy rows
        const [existing] = await db.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Đạo hiệu hoặc phúc địa đã được sử dụng!'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const role = username.toLowerCase() === 'admin' ? 'admin' : 'user';

        await db.execute(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, passwordHash, role]
        );

        res.json({
            success: true,
            message: `Chào mừng đạo hữu ${username} đã bước vào hành trình tu luyện!`
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

        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

        const user = users[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Đạo hiệu không tồn tại trong thiên đạo!'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mật pháp không chính xác!'
            });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.json({
            success: true,
            message: `Đạo hữu ${user.username} đã quy vị.`,
            user: { username: user.username, email: user.email }
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

        const [songs] = await db.query(query, params);
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
        await db.execute('UPDATE songs SET play_count = play_count + 1 WHERE id = ?', [songId]);

        if (req.session.user) {
            await db.execute(
                'INSERT INTO play_history (user_id, song_id) VALUES (?, ?)',
                [req.session.user.id, songId]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// =============================================
// THẢ TIM / YÊU THÍCH BÀI HÁT
// =============================================
router.get('/favorite/:id', async (req, res) => {
    try {
        if (!req.session.user) return res.json({ success: true, isFavorite: false });

        const [rows] = await db.execute(
            'SELECT id FROM favorites WHERE user_id = ? AND song_id = ?',
            [req.session.user.id, req.params.id]
        );

        res.json({ success: true, isFavorite: rows.length > 0 });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

router.post('/favorite/:id', async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ success: false, message: 'Cần đăng nhập!' });

        const userId = req.session.user.id;
        const songId = req.params.id;

        const [existing] = await db.execute(
            'SELECT id FROM favorites WHERE user_id = ? AND song_id = ?',
            [userId, songId]
        );

        if (existing.length > 0) {
            await db.execute('DELETE FROM favorites WHERE id = ?', [existing[0].id]);
            return res.json({ success: true, isFavorite: false, message: 'Đã hủy yêu thích.' });
        } else {
            await db.execute('INSERT INTO favorites (user_id, song_id) VALUES (?, ?)', [userId, songId]);
            return res.json({ success: true, isFavorite: true, message: 'Đã thêm vào yêu thích!' });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// =============================================
// QUẢN LÝ BÀI HÁT (ADMIN)
// =============================================
router.get('/songs/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM songs WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

router.post('/songs', async (req, res) => {
    try {
        const { title, artist, duration, genre, continent, cover_url, audio_url, play_count } = req.body;
        const [result] = await db.execute(
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

router.delete('/songs/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM songs WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;