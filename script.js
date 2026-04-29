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
    // 2. NƠI ĐỂ BẠN THÊM CÁC CHỨC NĂNG KHÁC TRONG TƯƠNG LAI
    // Ví dụ: Phát nhạc, xử lý tìm kiếm, hiệu ứng cuộn...

});