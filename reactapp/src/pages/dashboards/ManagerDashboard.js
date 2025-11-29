import { AccessTime, Assignment, Group, Star } from '@mui/icons-material';
import { Box, Card, CardContent, Container, Grid, Paper, Typography } from '@mui/material';
import { getCurrentUser } from '../../services/authService';

const ManagerDashboard = () =>
{
  const user = getCurrentUser();

  const stats = [
    { title: 'Total Employees Managed', value: '0', icon: <Group />, color: '#1976d2' },
    { title: 'Present Today', value: '0', icon: <AccessTime />, color: '#2e7d32' },
    { title: 'Pending Approvals', value: '0', icon: <Assignment />, color: '#ed6c02' },
    { title: 'Team Efficiency', value: '92%', icon: <Star />, color: '#9c27b0' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome Manager, {user?.fullName || 'User'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your team
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
              Team Activity Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No activities yet
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tasks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No new tasks
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ManagerDashboard;