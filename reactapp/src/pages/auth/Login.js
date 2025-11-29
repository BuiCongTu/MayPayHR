import { Lock, Phone, Visibility, VisibilityOff } from '@mui/icons-material';
import
{
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, login } from '../../services/authService';

const Login = () =>
{
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect nếu đã đăng nhập
  useEffect(() =>
  {
    if (isAuthenticated())
    {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) =>
  {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) =>
  {
    e.preventDefault();

    // Validation
    if (!formData.loginId || !formData.password)
    {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try
    {
      const response = await login(formData.loginId, formData.password);
      console.log('Login response:', response);

      if (response.success)
      {
        // Login successful - redirect to dashboard
        console.log('Login successful, navigating to /');
        navigate('/');
      } else
      {
        console.log('Login failed:', response.message);
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err)
    {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      setError(
        err.response?.data?.message ||
        'Login failed. Please check your email/phone number and password.'
      );
    } finally
    {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () =>
  {
    setShowPassword(!showPassword);
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
              Đăng nhập hệ thống
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email or Phone Number"
              name="loginId"
              value={formData.loginId}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
              placeholder="admin@admin.com or '0123456789'"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              disabled={loading}
            />

            <Box sx={{ mt: 1, mb: 2, textAlign: 'right' }}>
              <Link
                to="/forgot-password"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 2,
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
                'Login'
              )}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Register now
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;