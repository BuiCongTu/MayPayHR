import axios from "axios";

// Định nghĩa base URL
const API_URL = "http://localhost:9999/api/auth/";

// Lấy Token từ Local Storage để sử dụng trong các request cần xác thực
const getToken = () => {
    return localStorage.getItem("token");
};

// Định nghĩa instance Axios có Header Authorization
// Các request sẽ dùng instance này
const authApi = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Thêm interceptor để tự động đính kèm Token
authApi.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * 1. Đăng nhập (Login)
 * @param {string} phone - Số điện thoại
 * @param {string} password - Mật khẩu
 */
export const login = async (phone, password) => {
    try {
        const response = await axios.post(API_URL + "login", {
            phone,
            password,
        });
        
        // Kiểm tra thành công và lưu thông tin
        if (response.data.success) {
            localStorage.setItem("user", JSON.stringify(response.data.data.user));
            localStorage.setItem("token", response.data.data.token);
        }

        return response.data;
    } catch (error) {
        // Trích xuất thông báo lỗi từ response của Spring Boot
        const message = error.response?.data?.message || error.message || "Login failed";
        return { success: false, message: message };
    }
};

/**
 * 2. Đăng ký (Register)
 * @param {object} registerData - Dữ liệu đăng ký (bao gồm phone, email, password, v.v.)
 */
export const register = async (registerData) => {
    try {
        const response = await axios.post(API_URL + "register", registerData);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || "Registration failed";
        return { success: false, message: message };
    }
};

/**
 * 3. Đăng xuất (Logout)
 */
export const logout = async () => {
    try {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        // Gọi API logout (thường chỉ để cleanup session/token trên server nếu cần)
        await authApi.get("logout"); 
        return { success: true, message: "Logout successful" };
    } catch (error) {
        // Đăng xuất client thành công ngay cả khi gọi API thất bại
        return { success: true, message: "Logout successful on client" };
    }
};

/**
 * 4. Lấy thông tin người dùng hiện tại (Get Current User - /me)
 */
export const getCurrentUser = async () => {
    try {
        // Sử dụng authApi để tự động đính kèm token
        const response = await authApi.get("me"); 
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || "Failed to fetch user info";
        return { success: false, message: message };
    }
};

/**
 * 5. Quên mật khẩu (Forgot Password) - Dùng Phone
 * Gửi yêu cầu nhận OTP qua SMS
 * @param {string} phone - Số điện thoại
 */
export const forgotPassword = async (phone) => {
    try {
        // API sử dụng RequestParam: /api/auth/forgot-password?phone=...
        const response = await axios.post(`${API_URL}forgot-password?phone=${phone}`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || "Forgot password failed";
        return { success: false, message: message };
    }
};

/**
 * 6. Đặt lại mật khẩu (Reset Password)
 * @param {string} token - Token/OTP nhận được qua SMS
 * @param {string} newPassword - Mật khẩu mới
 */
export const resetPassword = async (token, newPassword) => {
    try {
        // API sử dụng RequestParam: /api/auth/reset-password?token=...&newPassword=...
        const response = await axios.post(
            `${API_URL}reset-password?token=${token}&newPassword=${newPassword}`
        );
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || "Password reset failed";
        return { success: false, message: message };
    }
};

/**
 * 7. Thay đổi mật khẩu (Change Password) - Cần xác thực
 * @param {string} phone - Số điện thoại (dùng để định danh, nếu backend yêu cầu)
 * @param {string} oldPassword - Mật khẩu cũ
 * @param {string} newPassword - Mật khẩu mới
 */
export const changePassword = async (phone, oldPassword, newPassword) => {
    try {
        // API sử dụng PathVariable: /api/auth/change-password/{phone}
        const response = await authApi.put(`${API_URL}change-password/${phone}`, {
            oldPassword: oldPassword,
            newPassword: newPassword,
        });
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || "Change password failed";
        return { success: false, message: message };
    }
};