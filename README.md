# 🌌 Diệu Âm Tiên Cảnh (Celestial Melodies)

**Diệu Âm Tiên Cảnh** là một dự án Web Music Streaming được thiết kế theo phong cách **Tu Tiên (Xianxia)**. Đây là đồ án thực hành môn Công nghệ phần mềm tại **UET - VNU**, tập trung vào việc xử lý dữ liệu Cloud, bảo mật mật mã và tối ưu hóa trải nghiệm người dùng đa thiết bị.

---

## ✨ Đặc điểm nổi bật
* **Giao diện "Linh khí":** UI/UX huyền ảo với hiệu ứng Glow, sương mù và thiết kế Responsive (tương thích Mobile/PC).
* **Hệ thống băm mật pháp:** Sử dụng cơ chế bảo mật **Bcrypt** để mã hóa mật khẩu, bảo vệ "đạo hiệu" người dùng.
* **Lưu trữ Thiên giới:** Tích hợp **Cloudinary API** để lưu trữ âm thanh và hình ảnh bìa bài hát.
* **Quản lý Tiên giới (Admin Dashboard):** Hệ thống CRUD hoàn chỉnh để Thêm, Sửa, Xóa bài hát trực tiếp trên giao diện web.
* **Thần thông đa ngôn ngữ:** Hệ thống chuyển đổi ngôn ngữ Việt - Anh (VN/EN) tức thời.

---

## 🛠 Công nghệ sử dụng
Dự án được xây dựng dựa trên các "mật pháp" công nghệ hiện đại:
* **Frontend:** Pure HTML, CSS (Flexbox/Grid), EJS Templates.
* **Backend:** Node.js, Express framework.
* **Database:** MySQL (Triển khai trên Cloud **Aiven**) sử dụng **Stored Procedures**.
* **Security:** Bcryptjs, Express-session.
* **Cloud Storage:** Cloudinary (Media management).

---

## 📊 Biểu đồ tuần tự (Sequence Diagrams)

Dưới đây là các luồng xử lý dữ liệu chính trong hệ thống, được thiết kế theo chuẩn UML để mô phỏng sự tương tác giữa Client, Server và Database.

### 1. Luồng Đăng ký & Bảo mật Bcrypt
<img width="8155" height="5335" alt="register" src="https://github.com/user-attachments/assets/3e7fb8b7-2cc0-44d0-b4c1-6ac59aa38b0d" />



### 2. Luồng Đăng nhập & Xác thực Session
<img width="8192" height="5003" alt="login" src="https://github.com/user-attachments/assets/db0ed5ec-ba10-4155-9728-54b13bb7ded9" />


### 3. Luồng Tìm kiếm linh hoạt (Search & Debounce)
<img width="8192" height="4302" alt="seach" src="https://github.com/user-attachments/assets/62ef2ed2-d13a-41d9-83ff-ff7fd35d5b55" />


### 4. Luồng Quản lý bài hát (Admin CRUD)
<img width="6743" height="8191" alt="admin" src="https://github.com/user-attachments/assets/804ccfd3-0f50-45fd-9b9a-00ee726785cb" />


### 5. Luồng Thả tim / Yêu thích bài hát (Favorite)
<img width="7787" height="4785" alt="yêu thích" src="https://github.com/user-attachments/assets/c8905abc-0e09-4bf5-b799-6cb90a823071" />

### 6. Luồng danh sách bài hát
<img width="8192" height="2758" alt="danh_sách_nhạc" src="https://github.com/user-attachments/assets/68ceec8e-83d9-48de-a777-21c9fffd9bce" />

