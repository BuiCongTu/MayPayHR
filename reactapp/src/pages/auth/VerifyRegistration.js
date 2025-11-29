import
{
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyRegistration } from '../../services/authService';

const VerifyRegistration = () =>
{
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = location.state?.token;
  const verificationMethod = location.state?.verificationMethod;

  useEffect(() =>
  {
    if (!token)
    {
      navigate('/register');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) =>
  {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.trim().length !== 6)
    {
      setError('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }

    setLoading(true);
    try
    {
      await verifyRegistration(token, otp);
      setSuccess('Xác thực thành công! Đang chuyển hướng...');

      setTimeout(() =>
      {
        navigate('/login');
      }, 2000);
    } catch (err)
    {
      setError(err.response?.data?.message || err.message || 'Xác thực thất bại');
      console.error('Verification error:', err);
    } finally
    {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
              MayPayHR
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Xác thực đăng ký
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Mã OTP đã được gửi đến {verificationMethod === 'EMAIL' ? 'email' : 'số điện thoại'} của bạn
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              margin="normal"
              required
              placeholder="Nhập mã OTP 6 chữ số"
              disabled={loading || !!success}
              inputProps={{
                maxLength: 6,
                pattern: '[0-9]*',
                inputMode: 'numeric'
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !!success}
              sx={{
                py: 1.5,
                fontSize: '16px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Xác thực'
              )}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Chưa nhận được mã?{' '}
              <span
                onClick={() =>
                {
                  // TODO: Implement resend OTP
                  setError('Chức năng gửi lại OTP sẽ được cập nhật sau');
                }}
                style={{
                  color: '#667eea',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  textDecoration: 'underline'
                }}
              >
                Gửi lại
              </span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Quay lại{' '}
              <span
                onClick={() => navigate('/register')}
                style={{
                  color: '#667eea',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  textDecoration: 'underline'
                }}
              >
                Đăng ký
              </span>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyRegistration;
