// 1. TỪ ĐIỂN NGÔN NGỮ (DICTIONARY)
const translations = {
    vi: {
        // Menu Sidebar
        home_menu: "Trang chủ",
        explore_menu: "Khám phá",
        radio_menu: "Radio",
        playlist_menu: "Playlist",
        library_menu: "Thư viện",
        favorite_menu: "Yêu thích",
        history_menu: "Lịch sử",

        // Top Nav
        genre_menu: "Thể loại",
        artist_menu: "Nghệ thuật",

        // Header & Auth
        search_placeholder: "Tìm kiếm bài hát, nghệ sĩ...",
        nav_login: "Đăng nhập",
        nav_register: "Đăng ký",
        logout: "Xuất thế", // Dùng cho nút logout sau này
        hello: "Chào",     // Dùng cho câu chào sau khi đăng nhập

        // Hero Banner
        hero_cat: "ÂM NHẠC",
        hero_title: "KẾT NỐI THẾ GIỚI",
        hero_desc: "Chiêm ngưỡng vũ trụ âm thanh với những giai điệu tiên cảnh, kết nối tâm hồn bạn với những bản nhạc tuyệt vời từ khắp thế giới",
        explore_now: "Khám phá ngay",

        // Music Sections
        suggest_title: "GỢI Ý DÀNH CHO BẠN",
        recent_title: "GẦN ĐÂY CỦA BẠN",
        view_all: "Xem tất cả",
        chart_title: "KHÁM PHÁ ÂM NHẠC",
        million: "triệu",

        // Premium Box
        premium_title: "Gói Cao Cấp",
        premium_desc: "Trải nghiệm không giới hạn với chất lượng cao nhất",
        upgrade_now: "Nâng cấp ngay",

        // Effects
        logout_loading: "Đang nghịch chuyển thời không, rời khỏi tiên cảnh...",

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
        confirm_pass: "Xác nhận mật pháp",
        reg_btn: "GIA NHẬP TIÊN MÔN",
        have_account: "Đã có cơ duyên?",
        go_login: "Trở về đăng nhập"
    },
    en: {
        // Menu Sidebar
        home_menu: "Home",
        explore_menu: "Explore",
        radio_menu: "Radio",
        playlist_menu: "Playlist",
        library_menu: "Library",
        favorite_menu: "Favorite",
        history_menu: "History",

        // Top Nav
        genre_menu: "Genres",
        artist_menu: "Artists",

        // Header & Auth
        search_placeholder: "Search songs, artists...",
        nav_login: "Login",
        nav_register: "Register",
        logout: "Logout",
        hello: "Hello",

        // Hero Banner
        hero_cat: "MUSIC",
        hero_title: "CONNECT THE WORLD",
        hero_desc: "Admire the sound universe with celestial melodies, connecting your soul with wonderful music from around the world",
        explore_now: "Explore now",

        // Music Sections
        suggest_title: "SUGGESTED FOR YOU",
        recent_title: "YOUR RECENT",
        view_all: "View all",
        chart_title: "EXPLORE MUSIC",
        million: "million",

        // Premium Box
        premium_title: "Premium Plan",
        premium_desc: "Unlimited experience with the highest quality",
        upgrade_now: "Upgrade now",

        // Effects
        logout_loading: "Reversing space-time, leaving the celestial realm...",

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
        confirm_pass: "Confirm Secret Code",
        reg_btn: "JOIN SECT",
        have_account: "Already an immortal?",
        go_login: "Return to Gateway"
    }
};

// 2. LOGIC XỬ LÝ CHUYỂN ĐỔI
function applyLanguage(lang) {
    const dict = translations[lang];

    // Cập nhật các thẻ có data-lang (innerText)
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (dict[key]) el.innerText = dict[key];
    });

    // Cập nhật placeholder cho các ô input
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
        const key = el.getAttribute('data-lang-placeholder');
        if (dict[key]) el.placeholder = dict[key];
    });

    // Lưu lựa chọn vào localStorage để các trang khác dùng chung
    localStorage.setItem('preferredLang', lang);

    // Cập nhật trạng thái nút bấm (nếu đạo hữu có làm nút chọn ngôn ngữ)
    updateLangUI(lang);
}

function updateLangUI(lang) {
    const btnVi = document.getElementById('btn-vi');
    const btnEn = document.getElementById('btn-en');

    if (btnVi) btnVi.classList.toggle('active', lang === 'vi');
    if (btnEn) btnEn.classList.toggle('active', lang === 'en');
}

// Hàm này để đạo hữu gọi từ nút bấm ngoài HTML
function changeLanguage(lang) {
    applyLanguage(lang);
}

// 3. KHI TRANG LOAD XONG
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLang') || 'vi';
    applyLanguage(savedLang);
});