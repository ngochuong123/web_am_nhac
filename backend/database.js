const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'music.db');

let db = null;

// Hàm lưu database xuống file
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

// Hàm khởi tạo database (async vì sql.js cần load WASM)
async function initDatabase(bcrypt) {
    const SQL = await initSqlJs();

    // Nếu đã có file database, load lên
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // =============================================
    // TẠO BẢNG (TABLES)
    // =============================================

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Thêm cột role nếu chưa có (cho database cũ)
    try {
        db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
    } catch (err) {
        // Column đã tồn tại, bỏ qua
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            duration TEXT DEFAULT '0:00',
            genre TEXT DEFAULT 'unknown',
            continent TEXT DEFAULT 'asia',
            cover_url TEXT DEFAULT '/images/default-cover.jpg',
            audio_url TEXT DEFAULT '',
            play_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS play_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            song_id INTEGER,
            played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (song_id) REFERENCES songs(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            song_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (song_id) REFERENCES songs(id),
            UNIQUE(user_id, song_id)
        )
    `);

    // =============================================
    // SEED DỮ LIỆU MẪU (NẾU BẢNG TRỐNG)
    // =============================================

    const result = db.exec('SELECT COUNT(*) as count FROM songs');
    const songCount = result[0].values[0][0];

    if (songCount === 0) {
        const seedSongs = [
            // Châu Á
            ['Thiên Lý Chi Ngoại', 'Chu Kiệt Luân', '6:12', 'C-Pop', 'asia', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 0],
            ['Hoa Hải Đường', 'Jack', '7:05', 'V-Pop', 'asia', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 0],
            ['Lạc Trôi', 'Sơn Tùng M-TP', '5:44', 'V-Pop', 'asia', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 0],
            ['Sakura', 'Ikimono Gakari', '5:02', 'J-Pop', 'asia', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 0],
            ['Dynamite', 'BTS', '5:53', 'K-Pop', 'asia', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 0],
            // Châu Âu
            ['Bohemian Rhapsody', 'Queen', '5:55', 'Rock', 'europe', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 0],
            ['Shape of You', 'Ed Sheeran', '3:53', 'Pop', 'europe', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 0],
            ['Nuvole Bianche', 'Ludovico Einaudi', '5:57', 'Classical', 'europe', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 0],
            // Châu Mỹ
            ['Blinding Lights', 'The Weeknd', '3:20', 'Synthwave', 'america', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 0],
            ['Despacito', 'Luis Fonsi', '4:41', 'Latin Pop', 'america', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 0],
            ['Billie Jean', 'Michael Jackson', '4:54', 'Pop', 'america', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 0],
            // Châu Phi
            ['Waka Waka', 'Shakira', '3:22', 'World', 'africa', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 0],
            ['Pata Pata', 'Miriam Makeba', '3:05', 'Afro', 'africa', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 0],
            // Châu Đại Dương
            ['Royals', 'Lorde', '3:10', 'Indie Pop', 'oceania', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 0],
            ['Somebody That I Used to Know', 'Gotye', '4:04', 'Indie', 'oceania', '/images/default-cover.jpg', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', 0],
        ];

        const stmt = db.prepare(
            'INSERT INTO songs (title, artist, duration, genre, continent, cover_url, audio_url, play_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        seedSongs.forEach(song => {
            stmt.run(song);
        });

        stmt.free();
        saveDatabase();
        console.log(`✅ Đã seed ${seedSongs.length} bài hát vào database`);

        // Seed admin user nếu bảng users trống
        const userResult = db.exec('SELECT COUNT(*) as count FROM users');
        const userCount = userResult[0].values[0][0];

        if (userCount === 0) {
            const adminHash = bcrypt.hashSync('admin123', 10);
            db.run(
                'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['admin', 'admin@dieuam.com', adminHash, 'admin']
            );
            console.log('✅ Đã tạo tài khoản admin: username=admin, password=admin123');
        }

        // Cập nhật play count từ Last.fm
        updatePlayCountsFromLastfm().then(() => {
            console.log('✅ Đã cập nhật play count từ Last.fm');
        }).catch(err => {
            console.error('❌ Lỗi cập nhật play count:', err);
        });
    }

    saveDatabase();
    return db;
}

// =============================================
// HELPER FUNCTIONS
// =============================================

function all(sql, params = []) {
    const result = db.exec(sql, params);
    if (result.length === 0) return [];

    const columns = result[0].columns;
    return result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        return obj;
    });
}

function get(sql, params = []) {
    const rows = all(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

function run(sql, params = []) {
    db.run(sql, params);
    const changes = db.getRowsModified();
    const lastId = all('SELECT last_insert_rowid() as id');
    saveDatabase();
    return {
        changes,
        lastInsertRowid: lastId.length > 0 ? lastId[0].id : 0
    };
}

const axios = require('axios');

async function updatePlayCountsFromLastfm() {
    const songs = all('SELECT id, title, artist FROM songs');
    
    for (const song of songs) {
        try {
            const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
                params: {
                    method: 'track.getInfo',
                    artist: song.artist,
                    track: song.title,
                    api_key: process.env.LASTFM_API_KEY,
                    format: 'json'
                },
                timeout: 5000
            });
            
            const playCount = response.data?.track?.playcount;
            if (playCount && !isNaN(playCount)) {
                db.run('UPDATE songs SET play_count = ? WHERE id = ?', [parseInt(playCount), song.id]);
                saveDatabase();
                console.log(`✅ Cập nhật ${song.title} - ${song.artist}: ${playCount} plays`);
            } else {
                console.log(`⚠️ Không tìm thấy play count cho ${song.title} - ${song.artist}`);
            }
        } catch (err) {
            console.error(`❌ Lỗi lấy play count cho ${song.title}:`, err.message);
        }
        
        // Delay 1 giây để tránh rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

module.exports = {
    initDatabase,
    all,
    get,
    run,
    saveDatabase,
    updatePlayCountsFromLastfm
};
