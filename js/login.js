document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;

        // Hiệu ứng "Nhập Cảnh" - Làm mờ dần và đẩy card lên cao
        const card = document.querySelector('.register-card');
        card.style.transition = '1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '0';
        card.style.transform = 'translateY(-50px) scale(0.95)';
        card.style.filter = 'blur(10px)';

        setTimeout(() => {
            // Hiển thị thông báo phong cách tu tiên
            console.log(`Đạo hữu ${username} đã quy vị.`);
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'index.html'; // Chuyển về trang chủ
        }, 1200);
    });
});