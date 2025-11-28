import
  {
    Badge as BadgeIcon,
    Business as BusinessIcon,
    Cancel as CancelIcon,
    Edit as EditIcon,
    Email as EmailIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Save as SaveIcon
  } from '@mui/icons-material';
import
  {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Paper,
    TextField,
    Typography
  } from '@mui/material';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { getCurrentUser } from '../../services/authService';
import { getUserProfile, updateUserProfile } from '../../services/userService';

const Profile = () =>
{
  const currentUser = getCurrentUser();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });

  // Check if user is Admin or HR (có sidebar)
  const hasSidebar = currentUser?.roleName === 'Admin' || currentUser?.roleName === 'HR';

  useEffect(() =>
  {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () =>
  {
    try
    {
      setLoading(true);
      const data = await getUserProfile();
      setUser(data);
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      });
    } catch (err)
    {
      setError('Không thể tải thông tin người dùng');
      console.error(err);
    } finally
    {
      setLoading(false);
    }
  };

  const handleInputChange = (e) =>
  {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () =>
  {
    setEditMode(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () =>
  {
    setEditMode(false);
    // Reset form data
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    });
    setError('');
    setSuccess('');
  };

  const handleSave = async () =>
  {
    try
    {
      setSaving(true);
      setError('');
      setSuccess('');

      const updatedUser = await updateUserProfile(formData);
      setUser(updatedUser);
      setEditMode(false);
      setSuccess('Cập nhật thông tin thành công!');

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUser }));

    } catch (err)
    {
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin');
      console.error(err);
    } finally
    {
      setSaving(false);
    }
  };

  const getAvatarImage = () =>
  {
    const roleName = user?.roleName;
    const gender = user?.gender;

    if (roleName === 'Admin') return '/images/admin.jpeg';
    if (roleName === 'HR') return '/images/hr.jpeg';
    if (roleName === 'Manager') return '/images/manager.jpeg';
    if (roleName === 'Factory Manager' || roleName === 'FManager') return '/images/fmanager.jpeg';
    if (roleName === 'Factory Director' || roleName === 'FDirector') return '/images/fdirector.jpeg';

    if (gender === 0) return '/images/female.jpeg';
    if (gender === 1) return '/images/male.jpeg';

    return null;
  };

  if (loading)
  {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const avatarImage = getAvatarImage();

  const ProfileContent = (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Thông tin cá nhân
          </Typography>
          {!editMode && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ backgroundColor: '#4b90f9ff' }}
            >
              Chỉnh sửa
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Avatar Section */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Avatar
            src={avatarImage}
            sx={{
              width: 120,
              height: 120,
              fontSize: '3rem',
              bgcolor: avatarImage ? 'transparent' : '#4b90f9ff'
            }}
          >
            {!avatarImage && (user?.fullName?.charAt(0) || 'U')}
          </Avatar>
        </Box>

        {/* Alert Messages */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Profile Information */}
        <Grid container spacing={3}>
          {/* Full Name */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 2, color: '#4b90f9ff' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Họ và tên
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                ) : (
                  <Typography variant="body1">
                    {user?.fullName || 'N/A'}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Email */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ mr: 2, color: '#4b90f9ff' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                ) : (
                  <Typography variant="body1">
                    {user?.email || 'N/A'}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Phone */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon sx={{ mr: 2, color: '#4b90f9ff' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Số điện thoại
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                ) : (
                  <Typography variant="body1">
                    {user?.phone || 'N/A'}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Role */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BadgeIcon sx={{ mr: 2, color: '#4b90f9ff' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Vai trò
                </Typography>
                <Typography variant="body1">
                  {user?.roleName || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Department */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusinessIcon sx={{ mr: 2, color: '#4b90f9ff' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Phòng ban
                </Typography>
                <Typography variant="body1">
                  {user?.departmentName || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Address */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <PersonIcon sx={{ mr: 2, color: '#4b90f9ff', mt: 1 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Địa chỉ
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    name="address"
                    multiline
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                ) : (
                  <Typography variant="body1">
                    {user?.address || 'N/A'}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Action Buttons for Edit Mode */}
        {editMode && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ backgroundColor: '#4b90f9ff' }}
            >
              {saving ? <CircularProgress size={24} /> : 'Lưu'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );

  // Nếu có sidebar (Admin/HR), wrap content với Box flex
  if (hasSidebar)
  {
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        {ProfileContent}
      </Box>
    );
  }

  // Nếu không có sidebar, return trực tiếp content
  return ProfileContent;
};

export default Profile;
