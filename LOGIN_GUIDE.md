# Hướng dẫn đăng nhập MayPayHR

## Phương thức đăng nhập theo Role

### 1. Admin, HR, Manager, Factory Manager, Factory Director
**Đăng nhập bằng EMAIL**
- Nhập email vào trường "Email hoặc Số điện thoại"
- Nhập mật khẩu
- Ví dụ: `admin@maypayhr.com`

### 2. Employee
**Đăng nhập bằng SỐ ĐIỆN THOẠI**
- Nhập số điện thoại vào trường "Email hoặc Số điện thoại"
- Nhập mật khẩu
- Ví dụ: `0123456789`

## Mapping Role ID → Dashboard

Hệ thống tự động hiển thị dashboard tương ứng với role từ database:

| Role ID | Role Name | Dashboard | Login Method |
|---------|-----------|-----------|--------------|
| 199010001 | Admin | AdminDashboard | Email |
| 199010002 | HR | HRDashboard | Email |
| 199010003 | Manager | ManagerDashboard | Email |
| 199010004 | Factory Manager | FManagerDashboard | Email |
| 199010005 | Factory Director | FDirectoryDashboard | Email |
| 199010006 | Employee | AdminDashboard (fallback) | Phone |

## Flow đăng nhập

1. **User nhập email/phone + password**
2. **Backend kiểm tra:**
   - Nếu loginId chứa `@` → Tìm user bằng email
   - Nếu không → Tìm user bằng phone
3. **Xác thực password** với BCrypt
4. **Trả về JWT token + user info** (bao gồm roleId)
5. **Frontend lưu vào localStorage:**
   - `token`: JWT token
   - `user`: JSON object chứa roleId, fullName, email, phone, etc.
6. **DashboardRouter đọc roleId từ localStorage**
7. **Hiển thị dashboard tương ứng**

## Lưu ý

- ✅ RoleId được lấy từ database (TbRole), không hard-code
- ✅ Hỗ trợ cả email và phone trong 1 form
- ✅ Backend tự động phân biệt email/phone
- ✅ Dashboard tự động chọn theo roleId
- ✅ Token được attach tự động vào tất cả requests (axios interceptor)

## Testing

### Tạo user test trong database:

```sql
-- Admin user (roleId = 199010001)
INSERT INTO TbUser (full_name, email, password_hash, phone, role_id, status, created_at)
VALUES ('Admin User', 'admin@maypayhr.com', '$2a$10$...', '0900000001', 199010001, 'Active', GETDATE());

-- HR user (roleId = 199010002)
INSERT INTO TbUser (full_name, email, password_hash, phone, role_id, status, created_at)
VALUES ('HR Manager', 'hr@maypayhr.com', '$2a$10$...', '0900000002', 199010002, 'Active', GETDATE());

-- Manager user (roleId = 199010003)
INSERT INTO TbUser (full_name, email, password_hash, phone, role_id, status, created_at)
VALUES ('Team Manager', 'manager@maypayhr.com', '$2a$10$...', '0900000003', 199010003, 'Active', GETDATE());

-- Employee user (roleId = 199010006)
INSERT INTO TbUser (full_name, email, password_hash, phone, role_id, status, created_at)
VALUES ('Employee User', 'employee@maypayhr.com', '$2a$10$...', '0900000006', 199010006, 'Active', GETDATE());
```

**Note:** Password hash phải được tạo bằng BCrypt với độ mạnh 10. 
Ví dụ password `123456` → hash: `$2a$10$N9qo8uLOickgx2ZMRZoMy.e3POZi8sKBCL.vWKFvpLYGKf5f.XZ5m`

### Khởi động hệ thống:

```bash
# 1. Start Spring Boot backend
cd springbootapp
./mvnw spring-boot:run

# 2. Start React frontend
cd reactapp
npm start

# 3. Truy cập http://localhost:3000/login
```

### Test cases:

1. **Login với Admin (email):**
   - Email: `admin@maypayhr.com`
   - Password: `123456`
   - Expected: Redirect to `/` → AdminDashboard

2. **Login với HR (email):**
   - Email: `hr@maypayhr.com`
   - Password: `123456`
   - Expected: Redirect to `/` → HRDashboard

3. **Login với Employee (phone):**
   - Phone: `0900000006`
   - Password: `123456`
   - Expected: Redirect to `/` → AdminDashboard (fallback)

4. **Login thất bại:**
   - Email/Phone sai: "User not found"
   - Password sai: "Invalid credentials"
