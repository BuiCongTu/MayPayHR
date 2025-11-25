# 🎯 Face Attendance System with SVM

**Hệ thống điểm danh nhận diện khuôn mặt thông minh với AI/ML**

## 🚀 Tính Năng Nổi Bật

### 🔥 **MỚI: Điểm Danh Tự Động**
- ✅ **Tự động ghi nhận** khi nhận diện thành công
- ✅ **Phân chia ca học**: Sáng, Chiều, Tối
- ✅ **Thông báo real-time** trên video
- ✅ **Kiểm tra trùng lặp** thông minh
- ✅ **Database hoàn chỉnh** SQLite

### 🤖 **AI/ML Engine**
- **SVM Classifier** độ chính xác cao
- **Face Recognition** dựa trên dlib
- **Simple Matching** cho trường hợp ít data
- **Tự động chọn model** phù hợp

### ⚡ **Hiệu Suất Cao**
- **Tối ưu cho macOS** với camera backend
- **Xử lý thời gian thực** 15+ FPS
- **Memory efficient** với caching
- **Frame skipping** thông minh

---

## 📋 Danh Sách Files

### 🐍 **Python Scripts**
- `registerFace.py` - Đăng ký khuôn mặt mới
- `train.py` - Huấn luyện mô hình AI
- `checkFace.py` - **Nhận diện + Điểm danh**
- `checkFace_fast.py` - Phiên bản tối ưu tốc độ
- `check_db.py` - Kiểm tra database

### 🔧 **Config & Data**
- `run.sh` - Menu chính interative
- `students.db` - Database SQLite
- `requirements.txt` - Dependencies
- `models/` - Thư mục chứa AI models
- `student-face/` - Dữ liệu khuôn mặt

### 📚 **Documentation**
- `ATTENDANCE_GUIDE.md` - **Hướng dẫn điểm danh**
- `README.md` - File này

---

## 🛠️ Cài Đặt

### 1️⃣ **Cài Đặt Dependencies**
```bash
pip install -r requirements.txt
```

### 2️⃣ **Khởi Động Menu**
```bash
chmod +x run.sh
./run.sh
```

### 3️⃣ **Quy Trình Sử Dụng**
1. **Đăng ký khuôn mặt** (Menu 1)
2. **Huấn luyện mô hình** (Menu 2)  
3. **Nhận diện + Điểm danh** (Menu 3)
4. **Xem danh sách sinh viên** (Menu 4)

---

## 🎯 Tính Năng Điểm Danh

### 📊 **Automatic Attendance**
```
🕐 Ca Sáng: < 12:00
🕐 Ca Chiều: 12:00 - 17:00
🕐 Ca Tối: > 17:00
```

### ⌨️ **Phím Tắt**
- `q` - Thoát hệ thống
- `a` - Xem danh sách điểm danh hôm nay

### 🎨 **Visual Feedback**
- 🟢 **Xanh lá**: Điểm danh thành công
- 🟠 **Cam**: Đã điểm danh rồi
- 🔴 **Đỏ**: Lỗi hệ thống
- 🟡 **Vàng**: Không nhận diện được

---

## 💾 Database Schema

### 👤 **Students Table**
```sql
CREATE TABLE Student (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);
```

### 📋 **Attendance Table**
```sql
CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    session TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    confidence REAL,
    FOREIGN KEY (student_id) REFERENCES Student (id)
);
```

---

## 🔧 Cấu Hình

### ⚙️ **Thông Số Tối Ưu**
```python
THRESHOLD = 0.35              # Ngưỡng nhận diện SVM
PROCESS_EVERY_N_FRAMES = 3    # Xử lý mỗi 3 frame
RESIZE_FACTOR = 0.25          # Giảm 75% kích thước
# Face Attendance (Tóm tắt ngắn gọn)

Hệ thống điểm danh bằng khuôn mặt (Python + OpenCV + face_recognition + SVM). Tài liệu này là bản rút gọn, chỉ giữ những gì cần để chạy và sử dụng hằng ngày.

## 1) Chuẩn bị nhanh

- Yêu cầu: Python 3.10–3.12, camera hoạt động
- Cài thư viện:

```bash
pip install -r requirements.txt
```

Nếu thiếu `dlib/face_recognition` trên macOS, khuyến nghị dùng Python 3.10 hoặc 3.11 và cài lại trong virtualenv.

## 2) Quy trình sử dụng (4 bước)

1. Đăng ký khuôn mặt: chạy `registerFace.py`
2. Huấn luyện mô hình: chạy `train.py`
3. Điểm danh: chạy `checkFace.py`
4. Kiểm tra DB (tuỳ chọn): `check_db.py`

Phím tắt: nhấn `q` để thoát cửa sổ camera.

## 3) Quy định khi đăng ký khuôn mặt

- BẮT BUỘC tháo khẩu trang hoàn toàn. Kéo 1/2 khẩu trang vẫn bị chặn lấy mẫu.
- Ngồi thẳng, cách camera 30–50cm, đủ ánh sáng.
- Khung XANH LÁ = OK (được lấy mẫu); Khung ĐỎ = đang phát hiện khẩu trang → tháo ra.

## 4) Sự cố thường gặp (rất ngắn)

- Không mở được camera: kiểm tra quyền truy cập camera của ứng dụng Terminal/VS Code.
- Lỗi import: tạo virtualenv và cài `requirements.txt` lại; riêng `face_recognition` cần dlib.
- Không lưu mẫu: đảm bảo KHÔNG đeo khẩu trang và khung đang XANH LÁ trước khi chụp.

## 5) Cấu trúc dữ liệu (tối thiểu cần biết)

- `students.db` (SQLite): bảng Student (id, name)
- `data/embeddings.npy`, `data/labels.npy`: dữ liệu huấn luyện
- `models/`: nơi lưu mô hình đã train

## 6) Lệnh nhanh (tuỳ chọn)

```bash
# Đăng ký
python registerFace.py

# Huấn luyện
python train.py

# Điểm danh
python checkFace.py
```

—

Tài liệu chi tiết đã được lược giản để dễ dùng. Nếu cần mở rộng, có thể xem lịch sử commit trước đó.