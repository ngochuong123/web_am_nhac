document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        localStorage.setItem('daoHieu', username);
        const pass = document.getElementById('password').value;
        const confirmPass = document.getElementById('confirmPassword').value;

        // Kiểm tra mật pháp đồng nhất
        if (pass !== confirmPass) {
            alert('Cảnh báo: Hai luồng mật pháp không đồng nhất!');
            return;
        }

        // Hiệu ứng chuyển cảnh giả lập thăng tiên
        const card = document.querySelector('.register-card');
        card.style.transition = '2s';
        card.style.opacity = '0';
        card.style.transform = 'translateY(-100px) scale(0.9)';

        setTimeout(() => {
            alert(`Chào mừng đạo hữu ${username} đã bước vào hành trình tu luyện!`);
            window.location.href = 'login.html';
        }, 1500);
    });
});