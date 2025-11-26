import axios from 'axios';
import { useState } from 'react';
import CameraCapture from '../../components/attendance/CameraCapture';

const CheckInPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  // format time
  const formatTime = (timeString) => timeString ? timeString.substring(0, 5) : "-";

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // CALL API CHECK-IN
  const handleCheckIn = async (imageBase64) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem("token"); // lấy token đăng nhập

      const response = await axios.post(
        "/api/face-scan/attendance",
        {
          imageBase64,
          scanType: "CHECK_IN",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setCapturedImage(imageBase64);
        setResult(response.data.data); // <-- CHỈ lấy phần "data"!
      } else {
        setError(response.data.message || "Lỗi nhận diện khuôn mặt.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi kết nối máy chủ";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Check-In</h1>
        <p style={styles.subtitle}>Nhìn vào camera để chấm công</p>
      </div>

      {/* Camera */}
      {!result && !error && (
        <CameraCapture
          onCapture={(img) => {
            setCapturedImage(img);
            handleCheckIn(img);
          }}
        />
      )}

      {/* Preview */}
      {capturedImage && !result && (
        <div style={styles.previewBox}>
          <h3>Ảnh Preview</h3>
          <img src={capturedImage} alt="Preview" style={{ maxWidth: "100%" }} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner}></div>
          <p>Đang nhận diện khuôn mặt...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <h3>❌ Thất bại</h3>
          <p>{error}</p>
          <button onClick={reset} style={styles.retryButton}>
            Thử lại
          </button>
        </div>
      )}

      {/* SUCCESS */}
      {result && (
        <div style={styles.successBox}>
          <div style={styles.successIcon}>✅</div>
          <h2>Check-In Thành Công!</h2>

          <div style={styles.infoGrid}>
            <Info label="Nhân viên" value={result.fullName} />
            <Info label="Ngày" value={formatDate(result.date)} />
            <Info label="Thời gian" value={formatTime(result.timeIn)} />
            <Info
              label="Trạng thái"
              value={result.status === "SUCCESS" ? "✓ Đúng giờ" : "⚠ Trễ"}
              color={result.status === "SUCCESS" ? "#4CAF50" : "#ff9800"}
            />
          </div>

          <div style={styles.actions}>
            <button onClick={reset} style={styles.doneButton}>
              Hoàn tất
            </button>
            <a href="/attendance/history" style={styles.historyLink}>
              Xem lịch sử
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
const Info = ({ label, value, color }) => (
  <div style={styles.infoItem}>
    <span style={styles.infoLabel}>{label}</span>
    <span style={{ ...styles.infoValue, color }}>{value}</span>
  </div>
);

const styles = {
  container: { maxWidth: "800px", margin: "0 auto", padding: "20px" },
  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "36px", marginBottom: "10px" },
  subtitle: { fontSize: "18px", color: "#666" },

  previewBox: {
    background: "#fff",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  loadingOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    zIndex: "1000",
  },

  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #eee",
    borderTop: "5px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  errorBox: {
    background: "#ffebee",
    border: "2px solid #f44336",
    padding: "25px",
    marginTop: "20px",
    textAlign: "center",
    borderRadius: "10px",
  },

  retryButton: {
    marginTop: "20px",
    padding: "10px 30px",
    background: "#f44336",
    color: "white",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
  },

  successBox: {
    background: "#e8f5e9",
    border: "3px solid #4CAF50",
    padding: "40px",
    marginTop: "20px",
    borderRadius: "15px",
    textAlign: "center",
  },

  successIcon: {
    fontSize: "70px",
    marginBottom: "20px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "20px",
  },

  infoItem: {
    background: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  infoLabel: { fontSize: "14px", color: "#666" },

  infoValue: {
    marginTop: "5px",
    fontSize: "18px",
    fontWeight: "bold",
  },

  actions: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },

  doneButton: {
    padding: "12px 40px",
    background: "#4CAF50",
    color: "white",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
  },

  historyLink: {
    padding: "12px 40px",
    background: "#2196F3",
    color: "white",
    borderRadius: "5px",
    textDecoration: "none",
  },
};


const spinnerAnimation = `
@keyframes spin { 0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);} }
`;
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = spinnerAnimation;
  document.head.appendChild(style);
}

export default CheckInPage;
