import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  EventAvailable as ApprovedIcon,
  EventBusy as RejectedIcon,
  PendingActions as PendingIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

const Dashboard = ({ requests }) => {
  const totalRequests = requests.length;
  const approvedRequests = requests.filter(r => r.status === 'approved').length;
  const rejectedRequests = requests.filter(r => r.status === 'rejected').length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  const calculateAverageDuration = () => {
    const durations = requests.map(request => {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    });
    return durations.length > 0
      ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1)
      : 0;
  };

  const stats = [
    {
      title: 'Toplam Talep',
      value: totalRequests,
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2'
    },
    {
      title: 'Onaylanan',
      value: approvedRequests,
      icon: <ApprovedIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32'
    },
    {
      title: 'Reddedilen',
      value: rejectedRequests,
      icon: <RejectedIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f'
    },
    {
      title: 'Bekleyen',
      value: pendingRequests,
      icon: <PendingIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ortalama İzin Süresi
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={75}
                  size={80}
                  thickness={4}
                  sx={{ color: '#1976d2', mr: 2 }}
                />
                <Typography variant="h4" component="div">
                  {calculateAverageDuration()} gün
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
