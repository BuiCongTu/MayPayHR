import axios from 'axios';
import { useState } from 'react';
import CameraCapture from '../../components/attendance/CameraCapture';

const CheckOutPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCapture = async (imageBase64) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/attendance/checkout', {
        imageBase64
      });

      if (response.data.success) {
        setResult(response.data);
        
        // Success notification
        showNotification('success', 
          `Tạm biệt ${response.data.fullName}! Check-out thành công lúc ${response.data.timeOut}`
        );
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    // You can use a toast library here (react-toastify, etc.)
    alert(message);
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const formatWorkingHours = (hours) => {
    if (!hours) return 'N/A';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚪 Check-Out</h1>
        <p style={styles.subtitle}>Nhìn vào camera để chấm công ra ca</p>
      </div>

      {!result ? (
        <>
          <CameraCapture 
            onCapture={handleCapture}
            autoCapture={false}
          />

          {loading && (
            <div style={styles.loadingOverlay}>
              <div style={styles.spinner}></div>
              <p>Đang nhận diện khuôn mặt...</p>
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <h3>❌ Thất Bại</h3>
              <p>{error}</p>
              <button onClick={reset} style={styles.retryButton}>
                Thử Lại
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={styles.successBox}>
          <div style={styles.successIcon}>👋</div>
          <h2>Chấm Công Ra Ca Thành Công!</h2>
          
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Nhân viên:</span>
              <span style={styles.infoValue}>{result.fullName}</span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Ngày:</span>
              <span style={styles.infoValue}>{result.date}</span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Giờ vào:</span>
              <span style={styles.infoValue}>{result.timeIn}</span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Giờ ra:</span>
              <span style={styles.infoValue}>{result.timeOut}</span>
            </div>
            
            <div style={{...styles.infoItem, gridColumn: '1 / -1'}}>
              <span style={styles.infoLabel}>Tổng giờ làm việc:</span>
              <span style={{...styles.infoValue, fontSize: '24px', color: '#4CAF50'}}>
                {formatWorkingHours(result.workingHours)}
              </span>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>📊 Tổng Kết Ngày Làm Việc</h3>
            <div style={styles.summaryContent}>
              <div style={styles.summaryItem}>
                <span className="emoji">⏰</span>
                <span>Giờ vào: {result.timeIn}</span>
              </div>
              <div style={styles.summaryItem}>
                <span className="emoji">🏁</span>
                <span>Giờ ra: {result.timeOut}</span>
              </div>
              <div style={styles.summaryItem}>
                <span className="emoji">⏱️</span>
                <span>Làm việc: {formatWorkingHours(result.workingHours)}</span>
              </div>
              <div style={styles.summaryItem}>
                <span className="emoji">{result.status === 'SUCCESS' ? '✅' : '⚠️'}</span>
                <span>{result.status === 'SUCCESS' ? 'Đúng giờ' : 'Trễ'}</span>
              </div>
            </div>
          </div>

          <div style={styles.actions}>
            <button onClick={reset} style={styles.doneButton}>
              Hoàn Tất
            </button>
            <a href="/attendance/history" style={styles.historyLink}>
              Xem Lịch Sử
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    zIndex: 1000,
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    border: '2px solid #f44336',
    borderRadius: '10px',
    padding: '30px',
    textAlign: 'center',
    marginTop: '20px',
  },
  retryButton: {
    marginTop: '20px',
    padding: '10px 30px',
    fontSize: '16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  successBox: {
    backgroundColor: '#e3f2fd',
    border: '3px solid #2196F3',
    borderRadius: '15px',
    padding: '40px',
    textAlign: 'center',
    marginTop: '20px',
  },
  successIcon: {
    fontSize: '72px',
    marginBottom: '20px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginTop: '30px',
    textAlign: 'left',
  },
  infoItem: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  infoLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
  },
  infoValue: {
    display: 'block',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '25px',
    marginTop: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  summaryTitle: {
    fontSize: '20px',
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
  },
  summaryContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    color: '#555',
  },
  actions: {
    marginTop: '30px',
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  doneButton: {
    padding: '12px 40px',
    fontSize: '16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  historyLink: {
    padding: '12px 40px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    textDecoration: 'none',
    display: 'inline-block',
    fontWeight: 'bold',
  },
};

// Add spinner animation
const spinnerAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = spinnerAnimation;
  document.head.appendChild(styleSheet);
}

export default CheckOutPage;
