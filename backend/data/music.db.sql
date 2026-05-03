-- 1. Vô hiệu hóa kiểm tra khóa ngoại để khởi tạo bảng dễ dàng
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Xóa bảng cũ nếu đã tồn tại (để làm sạch dữ liệu)
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS play_history;
DROP TABLE IF EXISTS songs;
DROP TABLE IF EXISTS users;

-- 3. Tạo lại cấu trúc bảng chuẩn MySQL
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    duration VARCHAR(20) DEFAULT '0:00',
    genre VARCHAR(100) DEFAULT 'unknown',
    continent VARCHAR(50) DEFAULT 'asia',
    cover_url TEXT,
    audio_url TEXT,
    play_count BIGINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    song_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, song_id),
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_song FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE play_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    song_id INT,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_hist_song FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Kích hoạt lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- 5. Nạp dữ liệu (Dựa trên dữ liệu bạn đã gửi)
INSERT INTO users (id, username, email, password_hash, role, created_at) VALUES 
(1,'admin','admin@dieuam.com','$2a$10$o77kGbir0e3i.Gp76TPqaeusm8wrKmbKeV0k2VNw6OGAZbupGDQKq','admin','2026-05-02 14:16:39'),
(2,'skibidi','skibidi@gmail.com','$2a$10$8yxOkyrbJ6uSzo9cplsEY.Kv1NRtQMrUZ9hmFfqI3jIJ82Pa2DOeS','user','2026-05-03 09:59:21');

INSERT INTO songs (id, title, artist, duration, genre, continent, cover_url, audio_url, play_count, created_at) VALUES 
(16,'Shape of you','Ed Sheeran','4:23','Pop / Dancehall / Tropical House','europe','https://i.ytimg.com/vi/liTfD88dbCo/maxresdefault.jpg','https://res.cloudinary.com/dww88j5ud/video/upload/v1777732399/Ed_Sheeran_-_Shape_of_You_Official_Music_Video_ozzji0.mp3',6713366148,'2026-05-02 14:25:21'),
(17,'Baby','Justin Bieber','3:40','Teen Pop / Dance-Pop / R&B','america','https://th.bing.com/th/id/OIP.gwlET5sQZgiCcIye020mHgHaEK?w=311&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3','https://res.cloudinary.com/dww88j5ud/video/upload/v1777732330/Justin_Bieber_-_Baby_ft._Ludacris_of3i0n.mp3',3617186083,'2026-05-02 14:27:39'),
(18,'We don\'t talk anymore','Charlie Puth','3:50','Pop / Tropical House','america','https://f4.bcbits.com/img/a3600849399_10.jpg','https://res.cloudinary.com/dww88j5ud/video/upload/v1777732330/Charlie_Puth_-_We_Don_t_Talk_Anymore_feat._Selena_Gomez_Official_Video_nnrz2l.mp3',3517594683,'2026-05-02 14:44:50'),
(19,'Despacito','Daddy Yankee','4:41','Reggaeton / Latin Pop','america','https://th.bing.com/th/id/OIP.bcAL40Do7lrZfQL5eHwX9AHaEK?w=308&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3','https://res.cloudinary.com/dww88j5ud/video/upload/v1777732330/Luis_Fonsi_-_Despacito_ft._Daddy_Yankee_iwkeom.mp3',9006223855,'2026-05-02 14:56:36'),
(20,'Faded','Alan Walker','3:32','Electro-House / EDM','europe','https://wallpaperaccess.com/full/2131650.jpg','https://res.cloudinary.com/dww88j5ud/video/upload/v1777734097/Alan_Walker_-_Faded_yg2ric.mp3',3962825171,'2026-05-02 15:03:05'),
(21,'Let Her Go','Passenger','4:14','Indie Folk / Folk-Pop','europe','https://th.bing.com/th/id/R.7bb10853c20899aa819661d3e3264153?rik=%2b98LWWai7uhC%2fA&pid=ImgRaw&r=0','https://res.cloudinary.com/dww88j5ud/video/upload/v1777734436/Passenger_Let_Her_Go_Official_Video_irvnzq.mp3',4052537587,'2026-05-02 15:09:18'),
(22,'Gangnam Style','PSY','4:12','K-Pop / Dance-Electronic','asia','https://files.gqthailand.com/uploads/20220831121524.jpg','https://res.cloudinary.com/dww88j5ud/video/upload/v1777734771/PSY_-_GANGNAM_STYLE_%EA%B0%95%EB%82%A8%EC%8A%A4%ED%83%80%EC%9D%BC_MV_io5ljo.mp3',5925881581,'2026-05-02 15:14:00'),
(23,'Lạc trôi','Sơn Tùng MTP','4:32','Future Bass / Electronic','asia','https://i.ytimg.com/vi/Llw9Q6akRo4/maxresdefault.jpg','https://res.cloudinary.com/dww88j5ud/video/upload/v1777732388/L%E1%BA%A0C_TR%C3%94I_OFFICIAL_MUSIC_VIDEO_S%C6%A0N_T%C3%99NG_M-TP_wkklla.mp3',284746179,'2026-05-02 15:17:37'),
(24,'Sóng Gió','KICM - Jack','5:50','Pop / R&B','asia','https://i.ytimg.com/vi/hzcBvYtr2lY/maxresdefault.jpg','https://res.cloudinary.com/dww88j5ud/video/upload/v1777735270/S%C3%93NG_GI%C3%93_ICM_x_JACK_OFFICIAL_MUSIC_VIDEO_l8f4zt.mp3',473610651,'2026-05-02 15:22:56'),
(25,'Calm Down','Rema, Selena Gomez','3:59','Afrobeats / Afrorave','africa','https://i.ytimg.com/vi/dl15XFLoCA4/maxresdefault.jpg','https://res.cloudinary.com/dww88j5ud/video/upload/v1777735707/Rema_Selena_Gomez_-_Calm_Down_Official_Music_Video_xe9bsx.mp3',1362631388,'2026-05-02 15:29:24'),
(26,'Waka Waka','Shakira','3:30','Pop / Worldbeat / Soca','africa','https://i.ytimg.com/vi/czWcyZRAMtk/maxresdefault.jpg','https://res.cloudinary.com/dww88j5ud/video/upload/v1777735909/Shakira_-_Waka_Waka_This_Time_for_Africa_The_Official_2010_FIFA_World_Cup_Song_xw7uh7.mp3',4512061436,'2026-05-02 15:32:35'),
(27,'Dance Monkey','Tones And I','3:56','Electropop / Indie Pop','oceania','https://th.bing.com/th/id/R.858afe0ed013bfeba7e5b7117ead3522?rik=TsSNm5xLs7Em%2fQ&pid=ImgRaw&r=0','https://res.cloudinary.com/dww88j5ud/video/upload/v1777736157/TONES_AND_I_-_DANCE_MONKEY_OFFICIAL_VIDEO_hcouli.mp3',2289464955,'2026-05-02 15:36:39'),
(28,'Stay','The Kid LAROI, Justin Bieber','2:37','Synth-Pop / Pop-Punk','oceania','https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2021/10/10/962151/The-Kid-LAROI-Justin.jpeg','https://res.cloudinary.com/dww88j5ud/video/upload/v1777736336/The_Kid_LAROI_Justin_Bieber_-_STAY_Official_Video_lctmib.mp3',1088120261,'2026-05-02 15:39:33');

INSERT INTO favorites (id,user_id,song_id,created_at) VALUES (8,1,16,'2026-05-02 14:40:49'), (9,1,17,'2026-05-02 14:40:52'), (10,1,19,'2026-05-02 15:09:49'), (11,1,22,'2026-05-02 15:18:47'), (12,2,20,'2026-05-03 10:45:29');

INSERT INTO play_history (id,user_id,song_id,played_at) VALUES 
(1,1,17,'2026-05-02 14:35:22'), (2,1,16,'2026-05-02 14:35:28'), (3,1,16,'2026-05-02 14:35:39'), (4,1,16,'2026-05-02 14:35:55'), (5,1,17,'2026-05-02 14:35:56'), (6,1,16,'2026-05-02 14:35:57'), (7,1,17,'2026-05-02 14:35:59'), (8,1,17,'2026-05-02 14:36:16'), (9,1,16,'2026-05-02 14:36:19'), (10,1,17,'2026-05-02 14:37:59'), (11,1,17,'2026-05-02 14:38:06'), (12,1,16,'2026-05-02 14:38:14'), (13,1,17,'2026-05-02 14:38:18'), (14,1,16,'2026-05-02 14:38:20'), (15,1,17,'2026-05-02 14:38:21'), (16,1,16,'2026-05-02 14:38:22'), (17,1,17,'2026-05-02 14:39:49'), (18,1,18,'2026-05-02 14:45:00'), (19,1,19,'2026-05-02 14:56:52'), (20,1,20,'2026-05-02 15:03:16'), (21,1,22,'2026-05-02 15:14:11'), (22,1,23,'2026-05-02 15:18:15'), (23,2,27,'2026-05-03 10:00:20'), (24,2,20,'2026-05-03 10:01:29'), (25,2,18,'2026-05-03 10:01:41'), (26,2,19,'2026-05-03 10:03:32'), (27,2,19,'2026-05-03 10:03:34'), (28,2,17,'2026-05-03 10:03:38'), (29,2,25,'2026-05-03 10:03:46'), (30,2,24,'2026-05-03 10:03:56'), (31,2,24,'2026-05-03 10:05:47'), (32,2,25,'2026-05-03 10:06:41'), (33,2,24,'2026-05-03 10:06:43'), (34,2,18,'2026-05-03 10:12:33'), (35,2,27,'2026-05-03 10:16:23'), (36,2,24,'2026-05-03 10:20:20'), (37,2,25,'2026-05-03 10:26:10'), (38,2,19,'2026-05-03 10:30:10'), (39,2,24,'2026-05-03 10:34:51'), (40,2,16,'2026-05-03 10:35:35'), (41,2,21,'2026-05-03 10:40:13'), (42,2,20,'2026-05-03 10:45:26');