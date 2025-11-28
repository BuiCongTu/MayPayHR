import { AccessTime, Assessment, EventNote, People } from '@mui/icons-material';
import { Box, Card, CardContent, Container, Grid, Paper, Typography } from '@mui/material';
import Sidebar from '../../components/layout/Sidebar';
import { getCurrentUser } from '../../services/authService';

const AdminDashboard = () =>
{
  const user = getCurrentUser();

  const stats = [
    { title: 'Tổng nhân viên', value: '0', icon: <People />, color: '#1976d2' },
    { title: 'Chấm công hôm nay', value: '0', icon: <EventNote />, color: '#2e7d32' },
    { title: 'Đang làm việc', value: '0', icon: <AccessTime />, color: '#ed6c02' },
    { title: 'Báo cáo chờ duyệt', value: '0', icon: <Assessment />, color: '#9c27b0' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Chào mừng, {user?.fullName || 'Admin'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tổng quan hệ thống MayPayHR
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
                Hoạt động gần đây
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chưa có hoạt động nào
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thông báo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Không có thông báo mới
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;