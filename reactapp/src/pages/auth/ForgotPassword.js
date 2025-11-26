import React, { useState } from "react";
import { forgotPassword } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const nav = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        // 1. Gọi API yêu cầu gửi OTP (forgotPassword)
        const res = await forgotPassword(phone);

        if (res.success) {
            // 2. Thông báo thành công và chuyển hướng sang trang Reset Password
            setMessage(res.message || "Mã OTP đã được gửi đến SDT của bạn.");
            
            setTimeout(() => {
                // Truyền phone qua state để trang ResetPassword dùng
                nav("/reset-password", { state: { phone } });
            }, 1500); 
        } else {
            setError(res.message || "Gửi yêu cầu thất bại. Vui lòng kiểm tra số điện thoại.");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Quên Mật khẩu</h2>
            <p>Nhập số điện thoại để nhận mã xác thực (OTP) qua SMS.</p>

            <form onSubmit={handleSendOtp}>
                <input
                    type="text"
                    placeholder="Số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
                <br />
                <button type="submit">Gửi Mã Xác Thực</button>
            </form>

            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default ForgotPasswordPage;