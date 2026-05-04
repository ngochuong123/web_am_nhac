// 1. TỪ ĐIỂN NGÔN NGỮ (DICTIONARY)
const translations = {
    vi: {
        // --- Menu Sidebar ---
        home_menu: "Trang chủ",
        explore_menu: "Khám phá",
        radio_menu: "Radio",
        playlist_menu: "Playlist",
        library_menu: "Thư viện",
        favorite_menu: "Yêu thích",
        history_menu: "Lịch sử",

        // --- Top Nav ---
        genre_menu: "Thể loại",
        artist_menu: "Nghệ thuật",

        // --- Header & Auth ---
        search_placeholder: "Tìm kiếm bài hát, nghệ sĩ, thể loại...",
        nav_login: "Đăng nhập",
        nav_register: "Đăng ký",
        logout: "Xuất thế",
        hello: "Chào",
        admin_link: "Admin",

        // --- Hero Banner ---
        hero_cat: "ÂM NHẠC",
        hero_title: "KẾT NỐI THẾ GIỚI",
        hero_desc: "Chiêm ngưỡng vũ trụ âm thanh với những giai điệu tiên cảnh, kết nối tâm hồn bạn với những bản nhạc tuyệt vời từ khắp thế giới",
        explore_now: "Khám phá ngay",

        // --- Music Sections ---
        suggest_title: "GỢI Ý DÀNH CHO BẠN",
        recent_title: "GẦN ĐÂY CỦA BẠN",
        view_all: "Xem tất cả",
        chart_title: "KHÁM PHÁ ÂM NHẠC",
        million: "triệu",
        songs_count: "bài",
        no_data: "Chưa có dữ liệu.",

        // --- Premium Box ---
        premium_title: "Gói Cao Cấp",
        premium_desc: "Trải nghiệm không giới hạn với chất lượng cao nhất",
        upgrade_now: "Nâng cấp ngay",

        // --- Effects & Loading ---
        logout_loading: "Đang nghịch chuyển thời không, rời khỏi tiên cảnh...",
        no_song: "Chưa có bài hát",
        search_no_results: "Không tìm thấy bài hát nào",
        search_suggest: "Gợi ý kết quả",
        logo_text: "DIỆU ÂM <br>TIÊN CẢNH",
        no_data_alert: "Bài hát này chưa có dữ liệu!",

        // --- Trang Đăng Nhập (Login) ---
        login_header: "LINH ĐÀI NHẬP CẢNH",
        login_sub: "Xác nhận đạo tâm, tiếp tục hành trình tu luyện",
        user_placeholder: "Đạo hiệu hoặc Email",
        pass_placeholder: "Mật pháp (Mật khẩu)",
        forgot_pass: "Thất lạc mật pháp?",
        login_btn: "VẬN KHÍ NHẬP CẢNH",
        no_account: "Chưa có linh căn?",
        go_reg: "Khai mở ngay",

        // --- Trang Đăng Ký (Register) ---
        reg_header: "KHAI MỞ LINH CĂN",
        reg_sub: "Khắc tên vào bảng vàng, khởi đầu lộ trình tìm kiếm chân đạo",
        email_placeholder: "Phúc địa (Email)",
        confirm_pass: "Xác nhận mật pháp",
        reg_btn: "GIA NHẬP TIÊN MÔN",
        have_account: "Đã có cơ duyên?",
        go_login: "Trở về đăng nhập",

        // --- Trang Khám Phá (Explore) ---
        map_header: "ÂM LUẬT TỨ HẢI",
        song_list_title: "Danh sách bài hát",
        music_of: "Âm Nhạc",
        asia_label: "Đông Phương",
        asia_name: "CHÂU Á",
        europe_label: "Tây Dương",
        europe_name: "CHÂU ÂU",
        america_label: "Tân Thế Giới",
        america_name: "CHÂU MỸ",
        africa_label: "Hoang Mạc",
        africa_name: "CHÂU PHI",
        oceania_label: "Vạn Đảo",
        oceania_name: "CHÂU ĐẠI DƯƠNG",

        // --- Favorites & History ---
        empty_list_title: "Nơi này tĩnh lặng, chưa có âm thanh nào...",
        empty_list_desc: "Hãy khám phá thêm nhạc giới để điền vào đây nhé!",

        // --- Coming Soon ---
        coming_soon_header: "Khu Vực Đang Phong Ấn",
        coming_soon_desc: "Bí cảnh này hiện đang được các Trưởng Lão bế quan tu luyện để rèn đúc thêm tính năng mới. Đạo hữu vui lòng quay lại sau khi phong ấn được gỡ bỏ!",
        back_home: "Quay Về Trang Chủ",

        // --- Browser Titles ---
        index_title: "Diệu Âm Tiên Cảnh - Giao diện nghe nhạc",
        explore_page_title: "Tinh Không Khám Phá | Diệu Âm Tiên Cảnh",
        login_page_title: "Linh Đài Nhập Cảnh | Diệu Âm Tiên Cảnh",
        register_page_title: "Gia Nhập Tiên Môn | Diệu Âm Tiên Cảnh",
        coming_soon_page_title: "Khu Vực Phong Ấn - Diệu Âm Tiên Cảnh",
        admin_page_title: "Admin - Quản lý Bài hát | Diệu Âm Tiên Cảnh",

        // --- Titles ---
        history_title: "Lịch sử nghe nhạc (Gần đây nhất)",
        favorite_title: "Bài hát Yêu thích",
        genres_title: "Thể Loại",
        artists_title: "Nghệ Sĩ",
        search_results_title: "Kết quả cho",

        // --- Admin Panel ---
        admin_title: "Quản lý Bài hát",
        add_song: "Thêm bài hát",
        id_col: "ID",
        title_col: "Tiêu đề",
        artist_col: "Nghệ sĩ",
        genre_col: "Thể loại",
        continent_col: "Châu lục",
        plays_col: "Lượt nghe",
        actions_col: "Thao tác",
        edit_btn: "Sửa",
        delete_btn: "Xóa",
        save_btn: "Lưu",
        cancel_btn: "Hủy",
        add_new_title: "Thêm bài hát mới",
        edit_song_title: "Sửa bài hát",
        confirm_delete: "Bạn có chắc muốn xóa bài hát này?",

        // --- Form Labels ---
        title_label: "Tiêu đề:",
        artist_label: "Nghệ sĩ:",
        duration_label: "Thời lượng (vd: 3:45):",
        genre_label: "Thể loại:",
        continent_label: "Châu lục:",
        cover_url_label: "URL ảnh bìa:",
        audio_url_label: "URL file nhạc:",
        or_upload_label: "Hoặc upload file:",
        play_count_label: "Lượt nghe:",

        // --- Messages ---
        error_saving: "Lỗi lưu bài hát",
        error_deleting: "Lỗi xóa bài hát"
    },
    en: {
        // --- Menu Sidebar ---
        home_menu: "Home",
        explore_menu: "Explore",
        radio_menu: "Radio",
        playlist_menu: "Playlist",
        library_menu: "Library",
        favorite_menu: "Favorite",
        history_menu: "History",

        // --- Top Nav ---
        genre_menu: "Genres",
        artist_menu: "Artists",

        // --- Header & Auth ---
        search_placeholder: "Search songs, artists, genres...",
        nav_login: "Login",
        nav_register: "Register",
        logout: "Logout",
        hello: "Hello",
        admin_link: "Admin",

        // --- Hero Banner ---
        hero_cat: "MUSIC",
        hero_title: "CONNECT THE WORLD",
        hero_desc: "Admire the sound universe with celestial melodies, connecting your soul with wonderful music from around the world",
        explore_now: "Explore now",

        // --- Music Sections ---
        suggest_title: "SUGGESTED FOR YOU",
        recent_title: "YOUR RECENT",
        view_all: "View all",
        chart_title: "EXPLORE MUSIC",
        million: "million",
        songs_count: "songs",
        no_data: "No data available.",

        // --- Premium Box ---
        premium_title: "Premium Plan",
        premium_desc: "Unlimited experience with the highest quality",
        upgrade_now: "Upgrade now",

        // --- Effects & Loading ---
        logout_loading: "Reversing space-time, leaving the celestial realm...",
        no_song: "No song playing",
        search_no_results: "No songs found",
        search_suggest: "Suggested results",
        logo_text: "CELESTIAL <br>MELODY",
        no_data_alert: "This song has no data!",

        // --- Login ---
        login_header: "SPIRITUAL GATEWAY",
        login_sub: "Verify your Dao-heart to continue cultivation",
        user_placeholder: "Dao Title or Email",
        pass_placeholder: "Secret Code (Password)",
        forgot_pass: "Lost your secret code?",
        login_btn: "ENTER REALM",
        no_account: "No spirit root yet?",
        go_reg: "Awaken now",

        // --- Register ---
        reg_header: "SPIRIT ROOT AWAKENING",
        reg_sub: "Inscribe your name, begin your path to immortality",
        email_placeholder: "Spirit Land (Email)",
        confirm_pass: "Confirm Secret Code",
        reg_btn: "JOIN SECT",
        have_account: "Already an immortal?",
        go_login: "Return to Gateway",

        // --- Explore ---
        map_header: "WORLD RHYTHMS",
        song_list_title: "Song List",
        music_of: "Music of",
        asia_label: "Oriental",
        asia_name: "ASIA",
        europe_label: "Western",
        europe_name: "EUROPE",
        america_label: "New World",
        america_name: "AMERICA",
        africa_label: "Desert",
        africa_name: "AFRICA",
        oceania_label: "Archipelago",
        oceania_name: "OCEANIA",

        // --- Favorites & History ---
        empty_list_title: "This place is silent, no sounds yet...",
        empty_list_desc: "Explore the music realm to fill this space!",

        // --- Coming Soon ---
        coming_soon_header: "Sealed Area",
        coming_soon_desc: "This secret realm is currently being refined by the Elders for new features. Please return after the seal is lifted!",
        back_home: "Return Home",

        // --- Browser Titles ---
        index_title: "Celestial Melody - Music Player Interface",
        explore_page_title: "Starry Exploration | Celestial Melody",
        login_page_title: "Spiritual Gateway | Celestial Melody",
        register_page_title: "Join Sect | Celestial Melody",
        coming_soon_page_title: "Sealed Area - Celestial Melody",
        admin_page_title: "Admin - Song Management | Celestial Melody",

        // --- Titles ---
        history_title: "Listening History (Most Recent)",
        favorite_title: "Favorite Songs",
        genres_title: "Genres",
        artists_title: "Artists",
        search_results_title: "Results for",

        // --- Admin Panel ---
        admin_title: "Song Management",
        add_song: "Add Song",
        id_col: "ID",
        title_col: "Title",
        artist_col: "Artist",
        genre_col: "Genre",
        continent_col: "Continent",
        plays_col: "Plays",
        actions_col: "Actions",
        edit_btn: "Edit",
        delete_btn: "Delete",
        save_btn: "Save",
        cancel_btn: "Cancel",
        add_new_title: "Add New Song",
        edit_song_title: "Edit Song",
        confirm_delete: "Are you sure you want to delete this song?",

        // --- Form Labels ---
        title_label: "Title:",
        artist_label: "Artist:",
        duration_label: "Duration (e.g., 3:45):",
        genre_label: "Genre:",
        continent_label: "Continent:",
        cover_url_label: "Cover URL:",
        audio_url_label: "Audio URL:",
        or_upload_label: "Or upload file:",
        play_count_label: "Plays:",

        // --- Messages ---
        error_saving: "Error saving song",
        error_deleting: "Error deleting song"
    }
};

// 2. LOGIC XỬ LÝ CHUYỂN ĐỔI
function applyLanguage(lang) {
    const dict = translations[lang];
    if (!dict) return;

    // Cập nhật các thẻ có data-lang
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (dict[key]) {
            // Nếu chuỗi dịch có chứa thẻ HTML (như <br>), dùng innerHTML
            if (dict[key].includes('<')) {
                // Giữ lại các icon nếu có
                const icon = el.querySelector('i');
                el.innerHTML = dict[key];
                if (icon) el.prepend(icon);
            } else {
                // Tìm text node và thay thế, giữ nguyên HTML elements (icons)
                let foundTextNode = false;
                for (let node of el.childNodes) {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                        node.textContent = dict[key];
                        foundTextNode = true;
                        break;
                    }
                }
                if (!foundTextNode) {
                    // Nếu el rỗng, tạo text node mới
                    el.appendChild(document.createTextNode(dict[key]));
                }
            }
        }
    });

    // Cập nhật placeholder cho các ô input
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
        const key = el.getAttribute('data-lang-placeholder');
        if (dict[key]) el.placeholder = dict[key];
    });

    // Lưu lựa chọn vào localStorage để các trang khác dùng chung
    localStorage.setItem('preferredLang', lang);

    // Cập nhật tiêu đề trang (Browser Title)
    updateDocumentTitle(dict);

    // Cập nhật các tiêu đề danh sách/trang động
    updateDynamicTitles(dict);

    // Cập nhật trạng thái nút bấm (nếu đạo hữu có làm nút chọn ngôn ngữ)
    updateLangUI(lang);
}

function updateDocumentTitle(dict) {
    const currentPath = window.location.pathname;
    let titleKey = '';

    if (currentPath === '/') titleKey = 'index_title';
    else if (currentPath === '/explore') titleKey = 'explore_page_title';
    else if (currentPath === '/login') titleKey = 'login_page_title';
    else if (currentPath === '/register') titleKey = 'register_page_title';
    else if (currentPath === '/coming-soon') titleKey = 'coming_soon_page_title';
    else if (currentPath === '/admin') titleKey = 'admin_page_title';

    if (titleKey && dict[titleKey]) {
        document.title = dict[titleKey];
    }
}

function updateDynamicTitles(dict) {
    // 1. Trang danh sách (History / Favorites)
    const listTitleEl = document.getElementById('list-title-el');
    if (listTitleEl) {
        const key = listTitleEl.getAttribute('data-lang');
        if (key && dict[key]) {
            listTitleEl.textContent = dict[key];
        }
    }

    // 2. Trang thể loại/nghệ sĩ
    const pageTitleEl = document.getElementById('page-title-el');
    if (pageTitleEl) {
        const key = pageTitleEl.getAttribute('data-lang');
        if (key && dict[key]) {
            pageTitleEl.textContent = dict[key];
        }
    }
}

function updateLangUI(lang) {
    const btnVi = document.getElementById('btn-vi');
    const btnEn = document.getElementById('btn-en');

    if (btnVi) btnVi.classList.toggle('active', lang === 'vi');
    if (btnEn) btnEn.classList.toggle('active', lang === 'en');
}

// Hàm lấy chuỗi dịch theo key (dùng cho JS)
function getTranslation(key) {
    const lang = localStorage.getItem('preferredLang') || 'vi';
    return translations[lang][key] || key;
}

// Hàm này để đạo hữu gọi từ nút bấm ngoài HTML
function changeLanguage(lang) {
    applyLanguage(lang);
    // Phát sự kiện để các file JS khác biết ngôn ngữ đã thay đổi
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

// 3. KHI TRANG LOAD XONG
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLang') || 'vi';
    applyLanguage(savedLang);
});