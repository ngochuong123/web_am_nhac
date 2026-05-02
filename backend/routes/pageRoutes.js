const express = require('express');
const router = express.Router();
const { all } = require('../database');

// Trang chủ
router.get('/', (req, res) => {
    const suggestedSongs = all(
        'SELECT * FROM songs ORDER BY play_count DESC LIMIT 6'
    );

    const recentSongs = all(
        'SELECT * FROM songs ORDER BY created_at DESC LIMIT 4'
    );

    const chartSongs = all(
        'SELECT * FROM songs ORDER BY play_count DESC LIMIT 5'
    );

    res.render('index', {
        suggestedSongs,
        recentSongs,
        chartSongs
    });
});

// Trang đăng nhập
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { error: null });
});

// Trang đăng ký
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('register', { error: null });
});

// Trang khám phá
router.get('/explore', (req, res) => {
    const songsByContinent = {};
    const continents = ['asia', 'europe', 'america', 'africa', 'oceania'];

    continents.forEach(continent => {
        songsByContinent[continent] = all(
            'SELECT * FROM songs WHERE continent = ? ORDER BY play_count DESC',
            [continent]
        );
    });

    res.render('explore', { songsByContinent });
});

// Trang upload nhạc
router.get('/upload', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('upload');
});

// Trang admin quản lý bài hát
router.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
    }
    const songs = all('SELECT * FROM songs ORDER BY created_at DESC');
    res.render('admin', { songs });
});

// =============================================
// CÁC TRANG DANH SÁCH (Tìm kiếm, Lịch sử, Yêu thích)
// =============================================

// Trang tìm kiếm
router.get('/search', (req, res) => {
    const query = req.query.q || '';
    const songs = all(
        'SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? OR genre LIKE ? ORDER BY play_count DESC',
        [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    res.render('list', { 
        listTitle: `Kết quả tìm kiếm cho: "${query}"`, 
        songs 
    });
});

// Trang lịch sử nghe nhạc
router.get('/history', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const songs = all(
        `SELECT s.* FROM songs s 
         JOIN play_history h ON s.id = h.song_id 
         WHERE h.user_id = ? 
         ORDER BY h.played_at DESC LIMIT 50`,
        [req.session.user.id]
    );
    // Xóa trùng lặp (nếu nghe 1 bài nhiều lần, chỉ hiện 1 lần)
    const uniqueSongs = songs.filter((song, index, self) =>
        index === self.findIndex((t) => t.id === song.id)
    );
    
    res.render('list', { 
        listTitle: 'Lịch sử nghe nhạc (Gần đây nhất)', 
        songs: uniqueSongs 
    });
});

// Trang yêu thích
router.get('/favorites', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const songs = all(
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
});

// Trang thể loại / nghệ sĩ
router.get('/category/:type', (req, res) => {
    const type = req.params.type;
    let categories = [];
    
    if (type === 'genre') {
        const groups = all('SELECT genre as name, COUNT(*) as count FROM songs GROUP BY genre');
        categories = groups.map(g => ({
            name: g.name,
            count: g.count,
            songs: all('SELECT * FROM songs WHERE genre = ? LIMIT 5', [g.name])
        }));
        res.render('category', { pageTitle: 'Thể Loại', categories });
    } else if (type === 'artist') {
        const groups = all('SELECT artist as name, COUNT(*) as count FROM songs GROUP BY artist');
        categories = groups.map(g => ({
            name: g.name,
            count: g.count,
            songs: all('SELECT * FROM songs WHERE artist = ? LIMIT 5', [g.name])
        }));
        res.render('category', { pageTitle: 'Nghệ Sĩ', categories });
    } else {
        res.redirect('/');
    }
});

// Trang Coming Soon
router.get('/coming-soon', (req, res) => {
    res.render('coming-soon');
});

module.exports = router;
