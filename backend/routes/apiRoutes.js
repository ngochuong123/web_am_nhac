const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const streamifier = require('streamifier');
const { all, get, run } = require('../database');
const { cloudinary, upload } = require('../utils/uploadConfig');

// =============================================
// ĐĂNG KÝ
// =============================================
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Kiểm tra mật khẩu trùng khớp
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Hai luồng mật pháp không đồng nhất!'
            });
        }

        // Không cho phép đăng ký username 'admin'
        if (username.toLowerCase() === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Đạo hiệu này đã được sử dụng bởi Thiên Đạo!'
            });
        }

        // Kiểm tra username hoặc email đã tồn tại
        const existing = get(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Đạo hiệu hoặc phúc địa đã được sử dụng!'
            });
        }

        // Hash mật khẩu
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Set role: admin nếu username là 'admin', else user
        const role = username.toLowerCase() === 'admin' ? 'admin' : 'user';

        // Lưu vào database
        run(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, passwordHash, role]
        );

        res.json({
            success: true,
            message: `Chào mừng đạo hữu ${username} đã bước vào hành trình tu luyện!`
        });

    } catch (err) {
        console.error('Lỗi đăng ký:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại.'
        });
    }
});

// =============================================
// ĐĂNG NHẬP
// =============================================
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Tìm user theo username hoặc email
        const user = get(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Đạo hiệu không tồn tại trong thiên đạo!'
            });
        }

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mật pháp không chính xác!'
            });
        }

        // Lưu session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.json({
            success: true,
            message: `Đạo hữu ${user.username} đã quy vị.`,
            user: {
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại.'
        });
    }
});

// =============================================
// ĐĂNG XUẤT
// =============================================
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});

// =============================================
// DANH SÁCH BÀI HÁT
// =============================================
router.get('/songs', (req, res) => {
    const { continent, limit = 20, sort = 'play_count', q = '' } = req.query;

    let query = 'SELECT * FROM songs WHERE 1=1';
    const params = [];

    if (continent) {
        query += ' AND continent = ?';
        params.push(continent);
    }

    // Tìm kiếm theo tên bài hát, nghệ sĩ, hoặc thể loại
    if (q) {
        query += ' AND (title LIKE ? OR artist LIKE ? OR genre LIKE ?)';
        params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const validSorts = ['play_count', 'created_at', 'title'];
    const sortField = validSorts.includes(sort) ? sort : 'play_count';
    query += ` ORDER BY ${sortField} DESC LIMIT ?`;
    params.push(parseInt(limit));

    const songs = all(query, params);
    res.json({ success: true, songs });
});

// =============================================
// THÔNG TIN USER
// =============================================
router.get('/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
    res.json({ success: true, user: req.session.user });
});

// =============================================
// UPLOAD BÀI HÁT MỚI
// =============================================
router.post('/upload-song', upload.single('audioFile'), async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn một file âm thanh (MP3)' });
        }

        const { title, artist, duration, genre, continent, cover_url } = req.body;

        // Bọc stream upload trong một Promise
        const uploadFromBuffer = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "dieu-am-tien-canh/songs", resource_type: "video" }, // audio được coi là video trong cloudinary
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                // Ghi buffer vào stream bằng streamifier
                const streamifier = require('streamifier');
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await uploadFromBuffer(req);

        // Lưu vào DB
        run(
            'INSERT INTO songs (title, artist, duration, genre, continent, cover_url, audio_url, play_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, artist, duration || '0:00', genre || 'unknown', continent || 'asia', cover_url || '/images/default-cover.jpg', result.secure_url, 0]
        );

        res.json({
            success: true,
            message: 'Tải bài hát lên Tiên Giới thành công!',
            songUrl: result.secure_url
        });

    } catch (err) {
        console.error('Lỗi upload nhạc:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi tải nhạc lên.'
        });
    }
});

// =============================================
// LƯU LỊCH SỬ NGHE NHẠC
// =============================================
router.post('/history/:id', (req, res) => {
    try {
        const songId = req.params.id;
        
        // Luôn tăng lượt nghe (play_count) của bài hát, dù đăng nhập hay chưa
        run('UPDATE songs SET play_count = play_count + 1 WHERE id = ?', [songId]);

        // Nếu có đăng nhập, lưu vào play_history
        if (req.session.user) {
            run(
                'INSERT INTO play_history (user_id, song_id) VALUES (?, ?)',
                [req.session.user.id, songId]
            );
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Lỗi lưu lịch sử:', err);
        res.status(500).json({ success: false });
    }
});

// =============================================
// THẢ TIM / YÊU THÍCH BÀI HÁT
// =============================================

// GET - Kiểm tra trạng thái yêu thích
router.get('/favorite/:id', (req, res) => {
    try {
        if (!req.session.user) {
            return res.json({ success: true, isFavorite: false });
        }

        const userId = req.session.user.id;
        const songId = req.params.id;

        const existing = get(
            'SELECT id FROM favorites WHERE user_id = ? AND song_id = ?',
            [userId, songId]
        );

        res.json({ success: true, isFavorite: !!existing });
    } catch (err) {
        console.error('Lỗi kiểm tra yêu thích:', err);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống.' });
    }
});

router.post('/favorite/:id', (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: 'Cần đăng nhập để thả tim!' });
        }

        const userId = req.session.user.id;
        const songId = req.params.id;

        // Kiểm tra xem đã thả tim chưa
        const existing = get(
            'SELECT id FROM favorites WHERE user_id = ? AND song_id = ?',
            [userId, songId]
        );

        if (existing) {
            // Đã thả tim -> Xóa tim (Unlike)
            run('DELETE FROM favorites WHERE id = ?', [existing.id]);
            return res.json({ success: true, isFavorite: false, message: 'Đã hủy yêu thích.' });
        } else {
            // Chưa thả tim -> Thêm tim (Like)
            run('INSERT INTO favorites (user_id, song_id) VALUES (?, ?)', [userId, songId]);
            return res.json({ success: true, isFavorite: true, message: 'Đã thêm vào danh sách yêu thích!' });
        }

    } catch (err) {
        console.error('Lỗi thả tim:', err);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống.' });
    }
});

// =============================================
// API QUẢN LÝ BÀI HÁT (ADMIN)
// =============================================

// Lấy chi tiết 1 bài hát
router.get('/songs/:id', (req, res) => {
    try {
        const song = get('SELECT * FROM songs WHERE id = ?', [req.params.id]);
        if (!song) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài hát.' });
        }
        res.json(song);
    } catch (err) {
        console.error('Lỗi lấy chi tiết bài hát:', err);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống.' });
    }
});

// Thêm bài hát mới
router.post('/songs', (req, res) => {
    try {
        const { title, artist, duration, genre, continent, cover_url, audio_url, play_count } = req.body;
        
        const result = run(
            'INSERT INTO songs (title, artist, duration, genre, continent, cover_url, audio_url, play_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, artist, duration || '0:00', genre, continent, cover_url || '/images/default-cover.jpg', audio_url || '', play_count || 0]
        );
        
        res.json({ success: true, message: 'Đã thêm bài hát thành công!', id: result.lastInsertRowid });
    } catch (err) {
        console.error('Lỗi thêm bài hát:', err);
        res.status(500).json({ success: false, message: 'Lỗi thêm bài hát.' });
    }
});

// Cập nhật bài hát
router.put('/songs/:id', (req, res) => {
    try {
        const { title, artist, duration, genre, continent, cover_url, audio_url, play_count } = req.body;
        
        run(
            'UPDATE songs SET title = ?, artist = ?, duration = ?, genre = ?, continent = ?, cover_url = ?, audio_url = ?, play_count = ? WHERE id = ?',
            [title, artist, duration, genre, continent, cover_url, audio_url, play_count, req.params.id]
        );
        
        res.json({ success: true, message: 'Đã cập nhật bài hát thành công!' });
    } catch (err) {
        console.error('Lỗi cập nhật bài hát:', err);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật bài hát.' });
    }
});

// Xóa bài hát
router.delete('/songs/:id', (req, res) => {
    try {
        // Xóa play_history và favorites liên quan
        run('DELETE FROM play_history WHERE song_id = ?', [req.params.id]);
        run('DELETE FROM favorites WHERE song_id = ?', [req.params.id]);
        
        // Xóa bài hát
        run('DELETE FROM songs WHERE id = ?', [req.params.id]);
        
        res.json({ success: true, message: 'Đã xóa bài hát thành công!' });
    } catch (err) {
        console.error('Lỗi xóa bài hát:', err);
        res.status(500).json({ success: false, message: 'Lỗi xóa bài hát.' });
    }
});

module.exports = router;
