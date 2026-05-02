document.addEventListener('DOMContentLoaded', () => {
    const authZone = document.getElementById('auth-zone');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const daoHieu = localStorage.getItem('daoHieu');
    const savedLang = localStorage.getItem('preferredLang') || 'vi';

    // Nhãn ngôn ngữ
    const labels = {
        vi: { hello: 'Chào', logout: 'Xuất thế', login: 'Đăng nhập', reg: 'Đăng ký' },
        en: { hello: 'Hello', logout: 'Logout', login: 'Login', reg: 'Register' }
    };
    const cur = labels[savedLang];

    if (isLoggedIn === 'true' && daoHieu) {
        authZone.innerHTML = `
            <div class="user-profile" style="display: flex; align-items: center; gap: 15px;">
                <span class="user-name" style="color:#fff; font-size:0.85rem;">${cur.hello}, ${daoHieu}</span>
                <button id="logout-btn" class="btn-login" style="padding: 5px 10px;">${cur.logout}</button>
            </div>
        `;
        document.getElementById('logout-btn').onclick = () => {
            localStorage.removeItem('isLoggedIn');
            location.reload();
        };
    } else {
        // SỬ DỤNG CLASS CỦA STYLE.CSS GỐC
        authZone.innerHTML = `
            <button class="btn-login" onclick="window.location.href='login.html'">${cur.login}</button>
            <button class="btn-register" onclick="window.location.href='register.html'">${cur.reg}</button>
        `;
    }
});

function selectContinent(id) {
    alert("Teleporting to " + id.toUpperCase());
}