import axios from 'axios';

const API_URL = '/api/auth';

// Lưu token và thông tin user
export const login = async (loginId, password) =>
{
  const response = await axios.post(`${API_URL}/login`, { loginId, password });
  if (response.data.success && response.data.data)
  {
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Set default authorization header cho tất cả requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return response.data;
};

// Đăng ký
export const register = async (userData) =>
{
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

// Logout
export const logout = () =>
{
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
};

// Lấy thông tin user hiện tại
export const getCurrentUser = () =>
{
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Lấy token
export const getToken = () =>
{
  return localStorage.getItem('token');
};

// Kiểm tra đã đăng nhập chưa
export const isAuthenticated = () =>
{
  const token = getToken();
  return !!token;
};

// Setup axios interceptor để tự động thêm token
export const setupAxiosInterceptors = () =>
{
  const token = getToken();
  if (token)
  {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Response interceptor để handle 401 Unauthorized
  axios.interceptors.response.use(
    (response) => response,
    (error) =>
    {
      if (error.response && error.response.status === 401)
      {
        logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  setupAxiosInterceptors
};
