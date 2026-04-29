document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;

        // 1. Lưu tên đạo hiệu vào túi trữ vật
        localStorage.setItem('daoHieu', username);

        const pass = document.getElementById('password').value;
        const confirmPass = document.getElementById('confirmPassword').value;

        // 2. Kiểm tra ngôn ngữ hiện tại để dịch thông báo
        const savedLang = localStorage.getItem('preferredLang') || 'vi';

        const errorMsg = savedLang === 'vi'
            ? 'Cảnh báo: Hai luồng mật pháp không đồng nhất!'
            : 'Warning: The two secret codes do not match!';

        const successMsg = savedLang === 'vi'
            ? `Chào mừng đạo hữu ${username} đã bước vào hành trình tu luyện!`
            : `Welcome, Fellow Daoist ${username}, to your cultivation journey!`;

        // Kiểm tra mật pháp đồng nhất
        if (pass !== confirmPass) {
            alert(errorMsg);
            return;
        }

        // Hiệu ứng chuyển cảnh giả lập thăng tiên
        const card = document.querySelector('.register-card');
        if (card) {
            card.style.transition = '2s';
            card.style.opacity = '0';
            card.style.transform = 'translateY(-100px) scale(0.9)';
        }

        setTimeout(() => {
            alert(successMsg);
            window.location.href = 'login.html';
        }, 1500);
    });
});