import { CheckCircle, Factory, Speed, Warning } from '@mui/icons-material';
import { Box, Card, CardContent, Container, Grid, Paper, Typography } from '@mui/material';
import { getCurrentUser } from '../../services/authService';

const FManagerDashboard = () =>
{
  const user = getCurrentUser();

  const stats = [
    { title: 'Số dây sản xuất', value: '0', icon: <Factory />, color: '#1976d2' },
    { title: 'Hoàn thành hôm nay', value: '0', icon: <CheckCircle />, color: '#2e7d32' },
    { title: 'Cảnh báo', value: '0', icon: <Warning />, color: '#ed6c02' },
    { title: 'Hiệu suất', value: '88%', icon: <Speed />, color: '#9c27b0' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Chào mừng, {user?.fullName || 'Factory Manager'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý sản xuất
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
              Tiến độ sản xuất
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chưa có dữ liệu
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Vấn đề cần xử lý
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Không có vấn đề
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FManagerDashboard;