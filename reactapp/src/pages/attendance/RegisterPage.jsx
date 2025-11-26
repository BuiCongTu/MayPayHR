import axios from 'axios';
import { useEffect, useState } from 'react';
import CameraCapture from '../../components/attendance/CameraCapture';


const RegisterPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Select User, 2: Capture Face, 3: Train Model

  const token = localStorage.getItem('token'); // JWT token từ login

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:9999/api/users`);
          const filtered = response.data.filter(u =>
            u.role?.id === 199010000 || u.role?.id === 199010006
          );
      setAllUsers(filtered);
      setUsers(filtered);
      console.log('Fetched users:', filtered);
    } catch (err) {
      setError('Không thể tải danh sách nhân viên');
    }
  };

  const handleSearch = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) setUsers(allUsers);
    else {
      const filtered = allUsers.filter(u =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
      setUsers(filtered);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(String(userId));
    setStep(2);
    setError(null);
    setResult(null);
  };

  const getSelectedUser = () => allUsers.find(u => String(u.userId) === String(selectedUserId));

  // -------- Capture Face --------
  const handleCapture = async (imageBase64) => {
    if (!token) return alert('Bạn chưa đăng nhập');

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`/api/attendance/register-face`, {
        userId: selectedUserId,
        imageBase64
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setResult(res.data);
        alert('Đăng ký khuôn mặt thành công! Vui lòng huấn luyện mô hình.');
        setStep(3);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi đăng ký khuôn mặt';
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // -------- Train Model --------
  const handleTrainModel = async () => {
    if (!token) return alert('Bạn chưa đăng nhập');

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`/api/attendance/train-model`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert('Huấn luyện mô hình thành công!');
        setResult({ ...result, modelTrained: true, message: res.data.message });
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi huấn luyện mô hình';
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedUserId('');
    setResult(null);
    setError(null);
    setUsers(allUsers);
  };

  // -------- JSX --------
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👤 Đăng Ký Khuôn Mặt</h1>
        <p style={styles.subtitle}>Chỉ dành cho HR/Admin - Đăng ký nhân viên mới</p>
      </div>

      {/* Progress Steps */}
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressStep, ...(step >= 1 ? styles.activeStep : {}) }}>
          <div style={styles.stepNumber}>1</div>
          <span>Chọn Nhân Viên</span>
        </div>
        <div style={styles.progressLine}></div>
        <div style={{ ...styles.progressStep, ...(step >= 2 ? styles.activeStep : {}) }}>
          <div style={styles.stepNumber}>2</div>
          <span>Chụp Khuôn Mặt</span>
        </div>
        <div style={styles.progressLine}></div>
        <div style={{ ...styles.progressStep, ...(step >= 3 ? styles.activeStep : {}) }}>
          <div style={styles.stepNumber}>3</div>
          <span>Huấn Luyện</span>
        </div>
      </div>

      {/* Step 1: Select User */}
      {step === 1 && (
        <div style={styles.userListContainer}>
          <h3 style={styles.sectionTitle}>Chọn Nhân Viên Cần Đăng Ký</h3>
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên theo tên hoặc email..."
            style={styles.searchInput}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div style={styles.userList}>
            {users.length > 0 ? users.map(u => (
              <div key={u.userId} style={styles.userCard} onClick={() => handleUserSelect(u.userId)}>
                <div style={styles.userAvatar}>{u.fullName?.charAt(0) || '?'}</div>
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{u.fullName}</div>
                  <div style={styles.userEmail}>{u.email}</div>
                  <div style={styles.userDepartment}>{u.department?.name || 'N/A'}</div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                Không tìm thấy nhân viên nào
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Capture Face */}
      {step === 2 && (
        <div style={styles.captureContainer}>
          <div style={styles.selectedUserBanner}>
            <strong>Đăng ký khuôn mặt cho:</strong> {getSelectedUser()?.fullName}
          </div>
          <CameraCapture onCapture={handleCapture} />
          <button style={styles.backButton} onClick={reset}>Quay lại</button>
        </div>
      )}

      {/* Step 3: Train Model */}
      {step === 3 && (
        <div style={styles.trainContainer}>
          <h2>Huấn luyện mô hình nhận diện khuôn mặt</h2>
          <p>Bước này giúp hệ thống nhận diện khuôn mặt chính xác hơn.</p>
          <button style={styles.trainButton} onClick={handleTrainModel} disabled={loading}>
            {loading ? 'Đang huấn luyện...' : 'Bắt đầu huấn luyện'}
          </button>
          <div style={styles.actions}>
            <button style={styles.registerAnotherButton} onClick={reset}>
              Đăng ký nhân viên khác
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner}></div>
          <div>Đang xử lý...</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          {error}
          <button style={styles.retryButton} onClick={() => setError(null)}>Đóng</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
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
    fontSize: '16px',
    color: '#999',
  },
  progressBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '10px',
  },
  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    opacity: 0.4,
  },
  activeStep: {
    opacity: 1,
  },
  stepNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  progressLine: {
    width: '80px',
    height: '2px',
    backgroundColor: '#ddd',
    margin: '0 10px',
  },
  userListContainer: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  },
  searchBox: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 20px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
  },
  userList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: 'white',
  },
  userAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    marginRight: '15px',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '3px',
  },
  userEmail: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '3px',
  },
  userDepartment: {
    fontSize: '12px',
    color: '#999',
  },
  captureContainer: {
    position: 'relative',
  },
  selectedUserBanner: {
    backgroundColor: '#e3f2fd',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  backButton: {
    marginTop: '20px',
    padding: '10px 30px',
    fontSize: '16px',
    backgroundColor: '#9e9e9e',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  trainContainer: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  successIcon: {
    fontSize: '72px',
    marginBottom: '20px',
  },
  infoCard: {
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '10px',
    margin: '20px 0',
    textAlign: 'left',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    border: '2px solid #ff9800',
    borderRadius: '10px',
    padding: '20px',
    marginTop: '20px',
  },
  trainButton: {
    marginTop: '30px',
    padding: '15px 50px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  successBox: {
    backgroundColor: '#e8f5e9',
    border: '2px solid #4CAF50',
    borderRadius: '10px',
    padding: '30px',
    marginTop: '20px',
  },
  actions: {
    marginTop: '30px',
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  registerAnotherButton: {
    padding: '12px 30px',
    fontSize: '16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  goToCheckinLink: {
    padding: '12px 30px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    textDecoration: 'none',
    display: 'inline-block',
    fontWeight: 'bold',
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

export default RegisterPage;
