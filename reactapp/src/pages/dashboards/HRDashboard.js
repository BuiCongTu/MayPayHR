import { CheckCircle, People, Schedule, TrendingUp } from '@mui/icons-material';
import { Box, Card, CardContent, Container, Grid, Paper, Typography } from '@mui/material';
import Sidebar from '../../components/layout/Sidebar';
import { getCurrentUser } from '../../services/authService';

const HRDashboard = () =>
{
  const user = getCurrentUser();

  const stats = [
    { title: 'Nhân viên mới', value: '0', icon: <People />, color: '#1976d2' },
    { title: 'Chấm công hôm nay', value: '0', icon: <CheckCircle />, color: '#2e7d32' },
    { title: 'Đơn chờ duyệt', value: '0', icon: <Schedule />, color: '#ed6c02' },
    { title: 'Hiệu suất', value: '95%', icon: <TrendingUp />, color: '#9c27b0' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Chào mừng HR, {user?.fullName || 'User'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý nhân sự MayPayHR
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        backgroundColor: stat.color,
                        color: 'white',
                        borderRadius: '50%',
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" component="div">
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Đơn từ cần xử lý
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chưa có đơn từ nào
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Nhắc nhở
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Không có nhắc nhở
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HRDashboard;