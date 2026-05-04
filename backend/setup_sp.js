const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function setupStoredProcedures() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');

        await pool.query('DROP PROCEDURE IF EXISTS sp_register_user');
        await pool.query('DROP PROCEDURE IF EXISTS sp_login_user');

        const spRegister = `
            CREATE PROCEDURE sp_register_user(
                IN p_username VARCHAR(255),
                IN p_email VARCHAR(255),
                IN p_password VARCHAR(255),
                IN p_role VARCHAR(50)
            )
            BEGIN
                DECLARE v_count INT;
                
                SELECT COUNT(*) INTO v_count FROM users WHERE username = p_username OR email = p_email;
                
                IF v_count > 0 THEN
                    SELECT FALSE AS success, 'Đạo hiệu hoặc phúc địa đã được sử dụng!' AS message;
                ELSE
                  INSERT INTO users (username, email, password_hash, role)
                    VALUES (p_username, p_email, p_password, p_role); 
                    
                    SELECT TRUE AS success, CONCAT('Chào mừng đạo hữu ', p_username, ' đã bước vào hành trình tu luyện!') AS message;
                END IF;
            END
        `;
        await pool.query(spRegister);
        console.log('Created sp_register_user (returns result set)');

        const spLogin = `
            CREATE PROCEDURE sp_login_user(
                IN p_username VARCHAR(255)
            )
            BEGIN
                DECLARE v_user_id INT;
                DECLARE v_password_hash VARCHAR(255);
                DECLARE v_user_email VARCHAR(255);
                DECLARE v_user_role VARCHAR(50);
                
                SELECT id, password_hash, email, role 
                INTO v_user_id, v_password_hash, v_user_email, v_user_role 
                FROM users 
                WHERE username = p_username LIMIT 1;
                
              -- Procedure lúc này chỉ làm nhiệm vụ lấy thông tin user dựa trên username
            IF v_user_id IS NULL THEN
                SELECT FALSE AS success, 'Đạo hiệu không tồn tại trong thiên đạo!' AS message;
            ELSE
                -- Trả về hash để Backend dùng bcrypt.compare()
                SELECT TRUE AS success, 'Thông tin hợp lệ' AS message, 
                    v_user_id AS id, p_username AS username, v_user_email AS email, 
                    v_user_role AS role, v_password_hash AS password_hash; 
                END IF; 
            END
        `;
        await pool.query(spLogin);
        console.log('Created sp_login_user (returns result set)');

        console.log('Stored Procedures setup complete.');
    } catch (err) {
        console.error('Error setting up Stored Procedures:', err);
    } finally {
        await pool.end();
    }
}

setupStoredProcedures();