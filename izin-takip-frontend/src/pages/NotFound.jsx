import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SentimentDissatisfied as SadIcon } from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        p: 3
      }}
    >
      <SadIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h3" component="h1" gutterBottom>
        404 - Sayfa Bulunamadı
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => navigate('/')}
        sx={{ mt: 2 }}
      >
        Ana Sayfaya Dön
      </Button>
    </Box>
  );
};

export default NotFound; 