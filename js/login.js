document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;

        // Kiểm tra ngôn ngữ hiện tại để đưa ra lời chào phù hợp trong console hoặc thông báo
        const savedLang = localStorage.getItem('preferredLang') || 'vi';
        const welcomeMsg = savedLang === 'vi'
            ? `Đạo hữu ${username} đã quy vị.`
            : `Fellow Daoist ${username} has returned.`;

        // Hiệu ứng "Nhập Cảnh" - Làm mờ dần và đẩy card lên cao
        const card = document.querySelector('.register-card');
        if (card) {
            card.style.transition = '1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '0';
            card.style.transform = 'translateY(-50px) scale(0.95)';
            card.style.filter = 'blur(10px)';
        }

        setTimeout(() => {
            // Hiển thị thông báo phong cách tu tiên (Đã được dịch)
            console.log(welcomeMsg);

            // Cấp lệnh bài đăng nhập
            localStorage.setItem('isLoggedIn', 'true');

            // Tiến vào trang chủ
            window.location.href = 'index.html';
        }, 1200);
    });
});