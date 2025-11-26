import axios from 'axios';
import { useEffect, useState } from 'react';

import * as XLSX from 'xlsx';

const HistoryPage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [userId, setUserId] = useState(null);
  const [view, setView] = useState('personal'); // 'personal' or 'department'

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUserId(currentUser.userId);
      fetchAttendance(currentUser.userId, selectedDate);
    }
  }, []);

  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const fetchAttendance = async (uid, date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/attendance/history/${uid}`, { params: { date } });
      if (response.data.success) {
        setAttendanceData(Array.isArray(response.data.data) ? response.data.data : [response.data.data]);
      } else {
        setAttendanceData([]);
      }
    } catch (err) {
      setError('Không thể tải lịch sử chấm công');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentAttendance = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/attendance/department`, { params: { date } });
      if (response.data.success) {
        setAttendanceData(response.data.data);
      } else {
        setAttendanceData([]);
      }
    } catch (err) {
      setError('Không thể tải dữ liệu phòng ban');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (view === 'personal' && userId) fetchAttendance(userId, newDate);
    if (view === 'department') fetchDepartmentAttendance(newDate);
  };

  const handleViewChange = (v) => {
    setView(v);
    if (v === 'personal' && userId) fetchAttendance(userId, selectedDate);
    if (v === 'department') fetchDepartmentAttendance(selectedDate);
  };

  const formatTime = (timeString) => timeString ? timeString.substring(0,5) : '-';

  const formatWorkingHours = (hours) => {
    if (!hours) return 'N/A';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      SUCCESS: { bg: '#e8f5e9', color: '#4CAF50', text: '✓ Đúng giờ' },
      LATE: { bg: '#fff3cd', color: '#ff9800', text: '⚠ Trễ' },
      ABSENT: { bg: '#ffebee', color: '#f44336', text: '✗ Vắng' },
      INCOMPLETE: { bg: '#e3f2fd', color: '#2196F3', text: '◐ Chưa hoàn tất' },
    };
    const style = styles[status] || styles.INCOMPLETE;
    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: '5px 12px',
        borderRadius: '15px',
        fontSize: '14px',
        fontWeight: 'bold',
      }}>
        {style.text}
      </span>
    );
  };

  const calculateTotalHours = () => attendanceData.reduce((total, r) => total + (r.workingHours || 0), 0);

  const exportExcel = () => {
    if (!attendanceData || attendanceData.length === 0) return;
    const wsData = attendanceData.map(r => ({
      'Ngày': new Date(r.date).toLocaleDateString('vi-VN'),
      'Giờ Vào': formatTime(r.timeIn),
      'Giờ Ra': formatTime(r.timeOut),
      'Tổng Giờ': formatWorkingHours(r.workingHours),
      'Trạng Thái': r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_${selectedDate}.xlsx`);
  };

  const printReport = () => window.print();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Lịch Sử Chấm Công</h1>
        <p style={styles.subtitle}>Xem lịch sử check-in/check-out</p>
      </div>

      {/* Controls */}
      <div style={styles.controlsBar}>
        <div style={styles.datePickerContainer}>
          <label style={styles.label}>📅 Chọn Ngày:</label>
          <input type="date" value={selectedDate} onChange={handleDateChange} style={styles.dateInput} />
        </div>
        <div style={styles.viewSelector}>
          <button style={{...styles.viewButton, ...(view==='personal'?styles.activeViewButton:{})}} onClick={()=>handleViewChange('personal')}>👤 Cá Nhân</button>
          <button style={{...styles.viewButton, ...(view==='department'?styles.activeViewButton:{})}} onClick={()=>handleViewChange('department')}>👥 Phòng Ban</button>
        </div>
      </div>

      {/* Summary Cards */}
      {view==='personal' && attendanceData.length>0 && (
        <div style={styles.summaryCards}>
          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}>⏰</div>
            <div style={styles.cardContent}>
              <div style={styles.cardLabel}>Tổng Giờ Làm</div>
              <div style={styles.cardValue}>{formatWorkingHours(calculateTotalHours())}</div>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}>✅</div>
            <div style={styles.cardContent}>
              <div style={styles.cardLabel}>Ngày Đúng Giờ</div>
              <div style={styles.cardValue}>{attendanceData.filter(r=>r.status==='SUCCESS').length}</div>
            </div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}>⚠️</div>
            <div style={styles.cardContent}>
              <div style={styles.cardLabel}>Ngày Trễ</div>
              <div style={styles.cardValue}>{attendanceData.filter(r=>r.status==='LATE').length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <h3>❌ Lỗi</h3>
          <p>{error}</p>
          <button onClick={()=>view==='personal'?fetchAttendance(userId, selectedDate):fetchDepartmentAttendance(selectedDate)} style={styles.retryButton}>Thử Lại</button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && attendanceData.length>0 && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Ngày</th>
                <th style={styles.th}>Giờ Vào</th>
                <th style={styles.th}>Giờ Ra</th>
                <th style={styles.th}>Tổng Giờ</th>
                <th style={styles.th}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((r,i)=>(
                <tr key={i} style={styles.tableRow}>
                  <td style={styles.td}>{new Date(r.date).toLocaleDateString('vi-VN')}</td>
                  <td style={styles.td}>{formatTime(r.timeIn)}</td>
                  <td style={styles.td}>{formatTime(r.timeOut)}</td>
                  <td style={styles.td}>{formatWorkingHours(r.workingHours)}</td>
                  <td style={styles.td}>{getStatusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && attendanceData.length===0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3>Không Có Dữ Liệu</h3>
          <p>Chưa có bản ghi chấm công cho ngày này.</p>
        </div>
      )}

      {/* Export / Print */}
      {attendanceData.length>0 && (
        <div style={styles.exportContainer}>
          <button style={styles.exportButton} onClick={exportExcel}>📥 Xuất Excel</button>
          <button style={styles.printButton} onClick={printReport}>🖨️ In Báo Cáo</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
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
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '10px',
  },
  datePickerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  label: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  dateInput: {
    padding: '10px 15px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '5px',
    outline: 'none',
  },
  viewSelector: {
    display: 'flex',
    gap: '10px',
  },
  viewButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#e0e0e0',
    color: '#666',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  activeViewButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  cardIcon: {
    fontSize: '48px',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  th: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  tableRow: {
    borderBottom: '1px solid #e0e0e0',
  },
  td: {
    padding: '15px',
    fontSize: '15px',
    color: '#333',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '50px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
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
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
  },
  emptyIcon: {
    fontSize: '72px',
    marginBottom: '20px',
  },
  exportContainer: {
    marginTop: '30px',
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  exportButton: {
    padding: '12px 30px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  printButton: {
    padding: '12px 30px',
    fontSize: '16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
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

export default HistoryPage;
