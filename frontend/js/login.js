document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Kiểm tra ngôn ngữ hiện tại để đưa ra lời chào phù hợp
        const savedLang = localStorage.getItem('preferredLang') || 'vi';

        // Hiệu ứng "Nhập Cảnh" - Làm mờ dần và đẩy card lên cao
        const card = document.querySelector('.register-card');
        const errorDiv = document.querySelector('.error-msg');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (data.success) {
                // Hiệu ứng chuyển cảnh thành công
                if (card) {
                    card.style.transition = '1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(-50px) scale(0.95)';
                    card.style.filter = 'blur(10px)';
                }

                setTimeout(() => {
                    console.log(data.message);
                    // Tiến vào trang chủ
                    window.location.href = '/';
                }, 1200);
            } else {
                // Hiển thị lỗi
                showError(data.message, savedLang);
            }
        } catch (err) {
            const errMsg = savedLang === 'vi' 
                ? 'Lỗi kết nối, vui lòng thử lại.' 
                : 'Connection error, please try again.';
            showError(errMsg, savedLang);
        }
    });

    function showError(message) {
        // Xóa thông báo lỗi cũ nếu có
        let errorDiv = document.querySelector('.error-msg');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-msg';
            errorDiv.style.cssText = 'background: rgba(255,77,77,0.15); border: 1px solid rgba(255,77,77,0.3); color: #ff6b6b; padding: 10px 15px; border-radius: 10px; margin-bottom: 20px; font-size: 0.85rem;';
            const form = document.getElementById('loginForm');
            form.parentNode.insertBefore(errorDiv, form);
        }
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        errorDiv.style.animation = 'none';
        errorDiv.offsetHeight; // trigger reflow
        errorDiv.style.animation = 'fadeIn 0.3s ease';
    }
});