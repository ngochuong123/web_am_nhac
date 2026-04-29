// Đợi cho đến khi toàn bộ nội dung HTML được tải xong
document.addEventListener('DOMContentLoaded', () => {

    // 1. CHỨC NĂNG CHUYỂN TRẠNG THÁI ACTIVE MENU
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            // Xóa class active ở tất cả các nút
            menuItems.forEach(i => i.classList.remove('active'));

            // Thêm class active vào nút được nhấn
            this.classList.add('active');

            // Log ra console để kiểm tra (có thể xóa sau này)
            console.log('Đã chuyển sang mục:', this.querySelector('span').innerText);
        });
    });

    // CHỨC NĂNG CHUYỂN TRẠNG THÁI ACTIVE CHO TOP NAV (THANH TRÊN)
    const topNavItems = document.querySelectorAll('.top-nav span');

    topNavItems.forEach(item => {
        item.addEventListener('click', function () {
            // Xóa class active ở tất cả các nút trên thanh top-nav
            topNavItems.forEach(nav => nav.classList.remove('active'));

            // Thêm class active vào nút vừa nhấn
            this.classList.add('active');
        });
    });

    const authZone = document.getElementById('auth-zone');

    // Kiểm tra trong túi trữ vật xem đã đăng nhập chưa
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const daoHieu = localStorage.getItem('daoHieu');
    const savedLang = localStorage.getItem('preferredLang') || 'vi'; // Kiểm tra ngôn ngữ hiện tại

    // Thiết lập chữ "Chào" hoặc "Hello" dựa trên ngôn ngữ
    const helloText = savedLang === 'vi' ? 'Chào' : 'Hello';
    const logoutText = savedLang === 'vi' ? 'Xuất thế' : 'Logout';

    // Xử lý hiển thị thông tin người dùng
    if (isLoggedIn === 'true' && daoHieu) {
        authZone.innerHTML = `
        <div class="user-profile">
            <span class="user-name">${helloText}, ${daoHieu} <i class="fas fa-crown" style="color: #fdd835; font-size: 0.8rem;"></i></span>
            <button id="logout-btn" class="btn-logout" data-lang="logout">${logoutText}</button>
        </div>
    `;

        // Sự kiện click nút logout
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();

            // 1. Hiện màn hình load
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.style.display = 'flex';
                overlay.style.animation = 'fadeIn 0.5s forwards';
            }

            // 2. Xóa dữ liệu đăng nhập
            localStorage.removeItem('isLoggedIn');

            // 3. Đợi 2 giây rồi mới tải lại trang
            setTimeout(() => {
                location.reload();
            }, 2000);
        });
    }

    // 2. NƠI ĐỂ BẠN THÊM CÁC CHỨC NĂNG KHÁC TRONG TƯƠNG LAI
});