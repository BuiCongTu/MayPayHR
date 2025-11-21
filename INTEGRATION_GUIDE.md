# Hệ Thống Chấm Công Nhân Viên - Face Recognition

## Tổng Quan Kiến Trúc

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────────┐
│                 │         │                  │         │                     │
│  React Frontend │ <──────>│  Spring Boot API │ <──────>│ Python Face Service │
│                 │  HTTP   │                  │  HTTP   │   (Flask REST API)  │
└─────────────────┘         └──────────────────┘         └─────────────────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │                  │
                             │  MySQL Database  │
                             │  (TbUser,        │
                             │   TbAttendance)  │
                             └──────────────────┘
```

## Các Thành Phần Chính

### 1. **Python Face Recognition Service** (Flask API)
- **File**: `face_attendant_svm/face_api_service.py`
- **Port**: 5000
- **Chức năng**:
  - Đăng ký khuôn mặt nhân viên
  - Nhận diện khuôn mặt (check-in/check-out)
  - Huấn luyện mô hình SVM
  - Phát hiện khẩu trang (mask detection)

**Endpoints**:
```
GET  /health                    - Health check
POST /api/face/register         - Đăng ký khuôn mặt
POST /api/face/recognize        - Nhận diện khuôn mặt
POST /api/face/train            - Huấn luyện model
DELETE /api/face/delete/:userId - Xóa face data
```

### 2. **Spring Boot Backend**
- **Controllers**:
  - `AttendanceController.java` - Quản lý chấm công
  - `FaceTrainingController.java` - Quản lý training (có sẵn)
  - `FaceScanController.java` - Quản lý scan log (có sẵn)

- **Services**:
  - `FaceRecognitionService.java` - Gọi Python API
  - `AttendanceService.java` - Logic nghiệp vụ chấm công

- **Repositories**:
  - `AttendanceRepository.java` - Truy vấn TbAttendance
  - `UserRepository.java` - Truy vấn TbUser

**Endpoints**:
```
POST /api/attendance/checkin           - Chấm công vào
POST /api/attendance/checkout          - Chấm công ra
POST /api/attendance/register-face     - Đăng ký khuôn mặt (HR/Admin)
POST /api/attendance/train-model       - Training model (HR/Admin)
GET  /api/attendance/history/:userId   - Lịch sử chấm công
```

### 3. **React Frontend**
- **Pages**:
  - `/attendance/checkin` - Trang check-in
  - `/attendance/checkout` - Trang check-out
  - `/attendance/register` - Trang đăng ký khuôn mặt (HR)
  - `/attendance/history` - Lịch sử chấm công

- **Components**:
  - `CameraCapture.jsx` - Component quay camera và capture ảnh
  - `FaceRecognition.jsx` - Component nhận diện khuôn mặt
  - `AttendanceStatus.jsx` - Hiển thị trạng thái chấm công

## Cài Đặt và Chạy

### Bước 1: Cài Python Face Service

```bash
cd face_attendant_svm

# Tạo virtual environment
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows

# Cài dependencies
pip install -r requirements_api.txt

# Nếu gặp lỗi với numpy/dlib trên Python 3.12+ (đặc biệt trên macOS ARM):
# 1) Nâng cấp công cụ build trước khi cài
python -m pip install --upgrade pip setuptools wheel
# 2) Khuyến nghị dùng Python 3.10 (ổn định nhất với dlib/face-recognition)
#    Cài bằng pyenv (tuỳ chọn):
# brew install pyenv
# echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
# echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
# echo 'eval "$(pyenv init -)"' >> ~/.zshrc
# exec $SHELL
# pyenv install 3.10.13
# pyenv local 3.10.13   # ngay tại thư mục face_attendant_svm
# python3.10 -m venv .venv && source .venv/bin/activate
# python -m pip install --upgrade pip setuptools wheel
# pip install -r requirements_api.txt

# Chạy service
python face_api_service.py
```

Service sẽ chạy tại: `http://localhost:5000`

Hoặc dùng script (tự tạo venv, chọn Python 3.10/3.11 nếu có):
```bash
cd face_attendant_svm
chmod +x start_python_service.sh
# Ưu tiên dùng Python 3.10 nếu đã cài (pyenv/brew)
PY_CMD=python3.10 ./start_python_service.sh
```

### Bước 2: Cấu Hình Spring Boot

Thêm vào `application.properties`:
```properties
# Face Recognition Service URL
face.recognition.api.url=http://localhost:5000

# RestTemplate bean (nếu chưa có)
```

Thêm RestTemplate bean vào Configuration:
```java
@Configuration
public class AppConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

### Bước 3: Chạy Spring Boot

```bash
cd springbootapp
./mvnw spring-boot:run
```

API sẽ chạy tại: `http://localhost:8080`

### Bước 4: Chạy React Frontend

```bash
cd reactapp
npm install
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## Quy Trình Sử Dụng

### 1. Đăng Ký Khuôn Mặt Nhân Viên Mới

**Vai trò**: HR/Admin

1. Truy cập `/attendance/register`
2. Chọn nhân viên từ danh sách
3. Bật camera và chụp ảnh khuôn mặt
4. Hệ thống kiểm tra:
   - ✅ Chỉ có 1 khuôn mặt trong ảnh
   - ✅ KHÔNG đeo khẩu trang
   - ✅ Đủ ánh sáng, rõ nét
5. Nếu hợp lệ → Gửi lên server → Lưu vào database
6. Sau khi đăng ký đủ nhân viên → Nhấn "Train Model"

**API Flow**:
```
React → Spring Boot → Python Service
      POST /api/attendance/register-face
            {userId, imageBase64}
                      → POST /api/face/register
                         {userId, imageBase64, fullName}
                         ← {success, embedding}
      ← {success, message}
```

### 2. Huấn Luyện Model

**Vai trò**: HR/Admin

1. Sau khi đăng ký xong tất cả nhân viên
2. Nhấn "Train Model"
3. Hệ thống sẽ:
   - Load tất cả embeddings
   - Train SVM classifier
   - Lưu model

**API Flow**:
```
React → Spring Boot → Python Service
      POST /api/attendance/train-model
                      → POST /api/face/train
                         ← {success, numSamples, numUsers}
      ← {success, message}
```

### 3. Check-In (Chấm Công Vào)

**Vai trò**: Nhân viên

1. Nhân viên đến công ty, truy cập `/attendance/checkin`
2. Bật camera và nhìn vào
3. Hệ thống:
   - Tự động detect face
   - Gửi ảnh lên server nhận diện
   - Nếu nhận diện thành công → Tạo attendance record
   - Hiển thị thông báo: "Chào [Tên NV], check-in lúc [Giờ]"

**API Flow**:
```
React → Spring Boot → Python Service
      POST /api/attendance/checkin
            {imageBase64}
                      → POST /api/face/recognize
                         {imageBase64, scanType: "CHECK_IN"}
                         ← {success, userId, confidence}
            
            Spring Boot:
            - Lưu TbAttendance: {userId, date, timeIn, status}
      
      ← {success, fullName, timeIn, status}
```

### 4. Check-Out (Chấm Công Ra)

**Vai trò**: Nhân viên

1. Khi tan ca, truy cập `/attendance/checkout`
2. Bật camera và nhìn vào
3. Hệ thống:
   - Nhận diện khuôn mặt
   - Cập nhật timeOut cho attendance record hôm nay
   - Tính số giờ làm việc
   - Hiển thị: "Tạm biệt [Tên NV], làm việc [X] giờ"

**API Flow**:
```
React → Spring Boot → Python Service
      POST /api/attendance/checkout
            {imageBase64}
                      → POST /api/face/recognize
                         {imageBase64, scanType: "CHECK_OUT"}
                         ← {success, userId, confidence}
            
            Spring Boot:
            - Update TbAttendance: set timeOut
            - Tính workingHours
      
      ← {success, fullName, timeOut, workingHours}
```

### 5. Xem Lịch Sử Chấm Công

**Vai trò**: Nhân viên / Manager

1. Truy cập `/attendance/history`
2. Chọn ngày muốn xem
3. Hiển thị:
   - Thời gian check-in
   - Thời gian check-out
   - Số giờ làm việc
   - Trạng thái (SUCCESS/LATE)

**API Flow**:
```
React → Spring Boot
      GET /api/attendance/history/:userId?date=2025-11-18
      ← {success, attendance: {timeIn, timeOut, status}}
```

## Database Schema

### TbUser (Có sẵn)
```sql
CREATE TABLE tbUser (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    department_id INT,
    role_id INT,
    status ENUM('Active', 'Inactive'),
    ...
);
```

### TbAttendance (Có sẵn)
```sql
CREATE TABLE tbAttendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    time_in TIME,
    time_out TIME,
    status ENUM('SUCCESS', 'LATE', 'MANUAL', 'ERROR'),
    reason TEXT,
    manual_updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbUser(user_id)
);
```

### Python Face Data
```
face_attendant_svm/data/
  ├── embeddings.npy  - Face embeddings của tất cả nhân viên
  └── labels.npy      - User IDs tương ứng

face_attendant_svm/models/
  ├── svm_model.pkl      - Trained SVM classifier
  └── normalizer.pkl     - StandardScaler
```

## Xử Lý Lỗi

### Lỗi Thường Gặp

1. **"No face detected"**
   - Nguyên nhân: Không phát hiện khuôn mặt trong ảnh
   - Giải pháp: Đảm bảo đủ ánh sáng, khuôn mặt nhìn thẳng camera

2. **"Mask detected"** (khi register)
   - Nguyên nhân: Phát hiện khẩu trang
   - Giải pháp: Tháo khẩu trang hoàn toàn

3. **"Face not recognized"**
   - Nguyên nhân: Confidence thấp (<0.55) hoặc chưa đăng ký
   - Giải pháp: 
     - Kiểm tra nhân viên đã đăng ký chưa
     - Thử lại với ánh sáng tốt hơn
     - Re-train model nếu cần

4. **"Already checked in today"**
   - Nguyên nhân: Đã check-in rồi
   - Giải pháp: Chuyển sang check-out

5. **"Model not trained"**
   - Nguyên nhân: Chưa train model sau khi đăng ký
   - Giải pháp: HR chạy "Train Model"

6. **Python Service không chạy**
   - Nguyên nhân: Flask service chưa start
   - Giải pháp: Chạy `python face_api_service.py`

## Security & Best Practices

### 1. Authentication
- Tất cả endpoints đều cần authentication (JWT)
- `/register-face` và `/train-model` chỉ cho HR/Admin

### 2. Data Privacy
- Face embeddings được mã hóa và lưu an toàn
- Ảnh gốc KHÔNG lưu trữ, chỉ lưu embeddings
- HTTPS bắt buộc ở production

### 3. Performance
- Python service cache models trong memory
- Spring Boot cache user data
- React debounce camera capture

### 4. Accuracy
- Threshold: 0.55 (có thể điều chỉnh)
- Min confidence gap: 0.15
- Mask detection: Multi-region analysis

## Troubleshooting

### Python Service
```bash
# Check service running
curl http://localhost:5000/health

# View logs
tail -f logs/face_service.log

# Restart service
pkill -f face_api_service
python face_api_service.py
```

### Spring Boot
```bash
# Check attendance API
curl -X POST http://localhost:8080/api/attendance/checkin \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "..."}'

# View logs
tail -f logs/spring-boot.log
```

### React
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules
npm install

# Check camera permission
# Chrome: Settings → Privacy → Camera
```

## Roadmap

### Phase 1 (Hiện tại)
- ✅ Python Face API Service
- ✅ Spring Boot Integration
- ✅ Basic check-in/check-out
- ⏳ React UI components

### Phase 2 (Tương lai)
- [ ] Real-time dashboard
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Statistical reports
- [ ] Multi-camera support
- [ ] Cloud deployment

## Support

Nếu gặp vấn đề, kiểm tra:
1. Python service đang chạy: `http://localhost:5000/health`
2. Spring Boot đang chạy: `http://localhost:8080/actuator/health`
3. Database connection OK
4. Logs của cả 3 services

---

**Lưu ý**: Đây là hệ thống tích hợp phức tạp. Hãy test từng phần một:
1. Test Python service riêng (Postman)
2. Test Spring Boot endpoints (Postman)
3. Test React UI (browser)
