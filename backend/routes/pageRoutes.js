const express = require('express');
const router = express.Router();
const db = require('../database'); // Sử dụng pool từ database.js mới

// Trang chủ
router.get('/', async (req, res) => {
    try {
        // Ta bóc tách trực tiếp phần tử thứ nhất của mỗi kết quả ngay khi nhận được
        const [suggestedRaw, recentRaw, chartRaw] = await Promise.all([
            db.query('SELECT * FROM songs ORDER BY play_count DESC LIMIT 6'),
            db.query('SELECT * FROM songs ORDER BY created_at DESC LIMIT 4'),
            db.query('SELECT * FROM songs ORDER BY play_count DESC LIMIT 5')
        ]);

        // Đảm bảo truyền vào là mảng (rows)
        // Nếu dùng mysql2, [rows, fields] = db.query(...)
        // Vậy nên suggestedRaw[0] chính là rows
        const suggestedSongs = suggestedRaw[0];
        const recentSongs = recentRaw[0];
        const chartSongs = chartRaw[0];

        // Kiểm tra an toàn: Nếu không phải mảng thì gán là mảng rỗng
        res.render('index', {
            suggestedSongs: Array.isArray(suggestedSongs) ? suggestedSongs : [],
            recentSongs: Array.isArray(recentSongs) ? recentSongs : [],
            chartSongs: Array.isArray(chartSongs) ? chartSongs : []
        });
    } catch (err) {
        console.error('Lỗi Trang chủ:', err);
        res.status(500).send('Lỗi hệ thống Tiên Giới');
    }
});

// Trang đăng nhập (Giữ nguyên logic)
router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('login', { error: null });
});

// Trang đăng ký (Giữ nguyên logic)
router.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('register', { error: null });
});

// Trang khám phá
router.get('/explore', async (req, res) => {
    try {
        const songsByContinent = {};
        const continents = ['asia', 'europe', 'america', 'africa', 'oceania'];

        // Chạy vòng lặp lấy nhạc theo từng châu lục
        await Promise.all(continents.map(async (continent) => {
            const [rows] = await db.query(
                'SELECT * FROM songs WHERE continent = ? ORDER BY play_count DESC',
                [continent]
            );
            songsByContinent[continent] = rows;
        }));

        res.render('explore', { songsByContinent });
    } catch (err) {
        console.error('Lỗi Trang khám phá:', err);
        res.redirect('/');
    }
});

// Trang upload nhạc
router.get('/upload', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('upload');
});

// Trang admin quản lý bài hát
router.get('/admin', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.redirect('/');
        }
        const [songs] = await db.query('SELECT * FROM songs ORDER BY created_at DESC');
        res.render('admin', { songs });
    } catch (err) {
        res.redirect('/');
    }
});

// Trang tìm kiếm
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const [songs] = await db.query(
            'SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? OR genre LIKE ? ORDER BY play_count DESC',
            [`%${query}%`, `%${query}%`, `%${query}%`]
        );
        res.render('list', {
            listTitle: `Kết quả tìm kiếm cho: "${query}"`,
            songs
        });
    } catch (err) {
        res.redirect('/');
    }
});

// Trang lịch sử nghe nhạc
router.get('/history', async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/login');

        const [songs] = await db.query(
            `SELECT s.* FROM songs s 
             JOIN play_history h ON s.id = h.song_id 
             WHERE h.user_id = ? 
             ORDER BY h.played_at DESC LIMIT 100`,
            [req.session.user.id]
        );

        // Xóa trùng lặp trong bộ nhớ
        const uniqueSongs = songs.filter((song, index, self) =>
            index === self.findIndex((t) => t.id === song.id)
        ).slice(0, 50);

        res.render('list', {
            listTitle: 'Lịch sử nghe nhạc (Gần đây nhất)',
            songs: uniqueSongs
        });
    } catch (err) {
        res.redirect('/');
    }
});

// Trang yêu thích
router.get('/favorites', async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/login');

        const [songs] = await db.query(
            `SELECT s.* FROM songs s 
             JOIN favorites f ON s.id = f.song_id 
             WHERE f.user_id = ? 
             ORDER BY f.created_at DESC`,
            [req.session.user.id]
        );
        res.render('list', {
            listTitle: 'Bài hát Yêu thích',
            songs
        });
    } catch (err) {
        res.redirect('/');
    }
});

// Trang thể loại / nghệ sĩ
router.get('/category/:type', async (req, res) => {
    try {
        const type = req.params.type;
        let groups = [];

        if (type === 'genre') {
            const [rows] = await db.query('SELECT genre as name, COUNT(*) as count FROM songs GROUP BY genre');
            groups = rows;
        } else if (type === 'artist') {
            const [rows] = await db.query('SELECT artist as name, COUNT(*) as count FROM songs GROUP BY artist');
            groups = rows;
        } else {
            return res.redirect('/');
        }

        // Lấy 5 bài hát cho mỗi danh mục
        const categories = await Promise.all(groups.map(async g => {
            const [songs] = await db.query(
                `SELECT * FROM songs WHERE ${type} = ? LIMIT 5`,
                [g.name]
            );
            return {
                name: g.name,
                count: g.count,
                songs: songs
            };
        }));

        res.render('category', {
            pageTitle: type === 'genre' ? 'Thể Loại' : 'Nghệ Sĩ',
            categories
        });
    } catch (err) {
        console.error('Lỗi Category:', err);
        res.redirect('/');
    }
});

// Trang Coming Soon
router.get('/coming-soon', (req, res) => {
    res.render('coming-soon');
});

module.exports = router;