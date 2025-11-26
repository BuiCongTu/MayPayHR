import { useState } from "react";
import { login } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const nav = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // goi api login
    const res = await login(phone, password);

    if (!res.success) {
      setError(res.message);
      return;
    }

    const user = res.data.user;
    const roleId = user.roleId;

    // phan quyen dung roleId
    const adminRoles = [199010005];
    const factoryManager = [199010002];
    const Manager = [199010001];
    const FactoryDirector = [199010003];
    const HR = [199010004];
    const workerRoles = [199010000];
    const userRoles = [199010006];

    if (adminRoles.includes(roleId)) {
      nav("/dashboard/admin");
    } else if (factoryManager.includes(roleId)) {
      nav("/dashboard/factory-manager");
    } else if (Manager.includes(roleId)) {
      nav("/dashboard/manager");
    } else if (FactoryDirector.includes(roleId)) {
      nav("/dashboard/factory-director");
    } else if (HR.includes(roleId)) {
      nav("/dashboard/hr");
    } else if (workerRoles.includes(roleId)) {
      nav("/dashboard/worker");
    } else if (userRoles.includes(roleId)) {
      nav("/dashboard/user");
    }
  };

  const styles = {
    // Style cho toàn bộ trang
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f0f2f5", // Màu nền nhẹ
      fontFamily: "Arial, sans-serif",
    },
    // Style cho Form Box (Card)
    loginCard: {
      backgroundColor: "#fff",
      padding: "40px",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", // Đổ bóng mềm
      width: "100%",
      maxWidth: "400px",
      textAlign: "center",
    },
    // Style cho tiêu đề
    title: {
      marginBottom: "30px",
      color: "#333",
      fontSize: "28px",
      fontWeight: "600",
    },
    // Style cho group input
    inputGroup: {
      marginBottom: "20px",
      textAlign: "left",
    },
    // Style cho Input
    input: {
      width: "100%",
      padding: "12px 15px",
      margin: "8px 0",
      display: "inline-block",
      border: "1px solid #ccc",
      borderRadius: "6px",
      boxSizing: "border-box", // Đảm bảo padding không làm tăng chiều rộng
      fontSize: "16px",
    },
    // Style cho Button
    button: {
      width: "100%",
      backgroundColor: "#007bff", // Màu xanh dương nổi bật
      color: "white",
      padding: "14px 20px",
      margin: "25px 0 10px 0",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "18px",
      fontWeight: "bold",
      // Thêm chuyển tiếp để có hiệu ứng hover mượt mà
      transition: "background-color 0.3s ease",
    },
    // Style cho thông báo lỗi
    error: {
      color: "#dc3545", // Màu đỏ chuẩn
      marginTop: "15px",
      fontSize: "14px",
      fontWeight: "500",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <h2 style={styles.title}>👋 Đăng nhập Hệ thống</h2>

        <form onSubmit={handleLogin}>
       
          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              type="text"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={styles.button}>
            Đăng nhập
          </button>

          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;