const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo Connection Pool để kết nối tới Aiven
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false // Bắt buộc đối với server Aiven
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối khi khởi động server
async function initDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ DIỆU ÂM TIÊN CẢNH - Đã kết nối thành công tới MySQL Aiven!');

        // Không cần tạo bảng (CREATE TABLE) ở đây nữa vì đạo hữu đã chạy 
        // trực tiếp trong MySQL Workbench thành công rồi.

        connection.release();
        return pool;
    } catch (err) {
        console.error('❌ Lỗi kết nối Database Aiven:', err.message);
        throw err;
    }
}

// =============================================
// HELPER FUNCTIONS (Giữ nguyên tên để ko phải sửa code ở các file khác)
// =============================================

// Thay thế hàm all() cũ
async function query(sql, params = []) {
    const [rows] = await pool.query(sql, params);
    return rows;
}

// Thay thế hàm get() cũ
async function get(sql, params = []) {
    const [rows] = await pool.query(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

// Thay thế hàm run() cũ
async function execute(sql, params = []) {
    const [result] = await pool.execute(sql, params);
    return {
        changes: result.affectedRows,
        insertId: result.insertId
    };
}

// Logic cập nhật Play Count từ Last.fm (Dành cho MySQL)
const axios = require('axios');
async function updatePlayCountsFromLastfm() {
    const [songs] = await pool.query('SELECT id, title, artist FROM songs');

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
                await pool.execute('UPDATE songs SET play_count = ? WHERE id = ?', [parseInt(playCount), song.id]);
                console.log(`✅ Cập nhật Last.fm: ${song.title} - ${playCount} plays`);
            }
        } catch (err) {
            console.error(`❌ Lỗi Last.fm cho ${song.title}:`, err.message);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

module.exports = {
    initDatabase,
    query, // Dùng thay cho all
    get,
    execute, // Dùng thay cho run
    pool,
    updatePlayCountsFromLastfm
};