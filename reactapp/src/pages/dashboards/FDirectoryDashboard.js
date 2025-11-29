import { AttachMoney, Business, Insights, TrendingUp } from '@mui/icons-material';
import { Box, Card, CardContent, Container, Grid, Paper, Typography } from '@mui/material';
import { getCurrentUser } from '../../services/authService';

const FDirectoryDashboard = () =>
{
  const user = getCurrentUser();

  const stats = [
    { title: 'Total Departments', value: '0', icon: <Business />, color: '#1976d2' },
    { title: 'Growth', value: '+5%', icon: <TrendingUp />, color: '#2e7d32' },
    { title: 'Revenue', value: '0đ', icon: <AttachMoney />, color: '#ed6c02' },
    { title: 'Efficiency', value: '94%', icon: <Insights />, color: '#9c27b0' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.fullName || 'Director'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Factory Management Overview
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
              Overview Report
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No reports available
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Important Decisions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No new decisions
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FDirectoryDashboard;