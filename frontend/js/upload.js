document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('audioFile');
    const fileNameDisplay = document.getElementById('file-name-display');
    const form = document.getElementById('upload-form');
    const loadingOverlay = document.getElementById('upload-loading');

    // Hiển thị tên file khi chọn
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = e.target.files[0].name;
            fileNameDisplay.style.color = '#fff';
        } else {
            fileNameDisplay.textContent = 'Chưa chọn file nào';
            fileNameDisplay.style.color = 'var(--accent-cyan)';
        }
    });

    // Xử lý Submit Form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const file = fileInput.files[0];
        if (!file) {
            alert('Vui lòng chọn file âm thanh (MP3)!');
            return;
        }

        // Hiện màn hình loading
        loadingOverlay.style.display = 'flex';

        const formData = new FormData(form);

        try {
            const response = await fetch('/api/upload-song', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert('Tải nhạc lên Tiên Giới thành công!');
                window.location.href = '/'; // Quay về trang chủ
            } else {
                alert('Lỗi: ' + result.message);
                loadingOverlay.style.display = 'none';
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Có lỗi xảy ra trong quá trình tải nhạc lên!');
            loadingOverlay.style.display = 'none';
        }
    });
});
