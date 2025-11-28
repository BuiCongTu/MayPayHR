import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';

const Logout = () =>
{
  const navigate = useNavigate();

  useEffect(() =>
  {
    // Thực hiện logout
    logout();

    // Hiển thị thông báo
    setTimeout(() =>
    {
      alert('Đăng xuất thành công!');
      // Chuyển về trang login
      navigate('/login');
    }, 500);
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2
      }}
    >
      <CircularProgress />
      <Typography variant="h6">Đang đăng xuất...</Typography>
    </Box>
  );
};

export default Logout;
