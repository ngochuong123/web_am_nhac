document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Kiểm tra ngôn ngữ hiện tại để dịch thông báo
        const savedLang = localStorage.getItem('preferredLang') || 'vi';

        // Kiểm tra mật pháp đồng nhất (client-side)
        if (password !== confirmPassword) {
            const errorMsg = savedLang === 'vi'
                ? 'Cảnh báo: Hai luồng mật pháp không đồng nhất!'
                : 'Warning: The two secret codes do not match!';
            showError(errorMsg);
            return;
        }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, confirmPassword })
            });

            const data = await res.json();

            if (data.success) {
                // Hiệu ứng chuyển cảnh giả lập thăng tiên
                const card = document.querySelector('.register-card');
                if (card) {
                    card.style.transition = '2s';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(-100px) scale(0.9)';
                }

                setTimeout(() => {
                    const successMsg = savedLang === 'vi'
                        ? data.message
                        : `Welcome, Fellow Daoist ${username}, to your cultivation journey!`;
                    alert(successMsg);
                    window.location.href = '/login';
                }, 1500);
            } else {
                showError(data.message);
            }
        } catch (err) {
            const errMsg = savedLang === 'vi'
                ? 'Lỗi kết nối, vui lòng thử lại.'
                : 'Connection error, please try again.';
            showError(errMsg);
        }
    });

    function showError(message) {
        let errorDiv = document.querySelector('.error-msg');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-msg';
            errorDiv.style.cssText = 'background: rgba(255,77,77,0.15); border: 1px solid rgba(255,77,77,0.3); color: #ff6b6b; padding: 10px 15px; border-radius: 10px; margin-bottom: 20px; font-size: 0.85rem;';
            const form = document.getElementById('registerForm');
            form.parentNode.insertBefore(errorDiv, form);
        }
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        errorDiv.style.animation = 'none';
        errorDiv.offsetHeight; // trigger reflow
        errorDiv.style.animation = 'fadeIn 0.3s ease';
    }
});