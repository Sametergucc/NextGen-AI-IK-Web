import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { login } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    password: false
  });

  const validateForm = () => {
    const errors = {
      email: false,
      password: false
    };
    let hasError = false;

    if (!formData.email) {
      errors.email = true;
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = true;
        hasError = true;
      }
    }

    if (!formData.password) {
      errors.password = true;
      hasError = true;
    }

    setFieldErrors(errors);
    return !hasError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setFieldErrors(prev => ({
      ...prev,
      [name]: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setError('Lütfen tüm alanları doğru şekilde doldurun');
      setLoading(false);
      return;
    }

    try {
      const response = await login(formData);
      const { token, role, userId, name } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      if (userId) {
        localStorage.setItem('userId', userId);
      }
      if (name) {
        localStorage.setItem('userName', name);
      }
      navigate(role === 'hr' ? '/hr' : '/employee');
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Card 
        sx={{ 
          maxWidth: 400, 
          width: '100%',
          boxShadow: 3,
          borderRadius: 2
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 3
            }}
          >
            Giriş Yap
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              error={fieldErrors.email}
              helperText={fieldErrors.email ? 'Geçerli bir email adresi giriniz' : ''}
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Şifre"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              error={fieldErrors.password}
              helperText={fieldErrors.password ? 'Şifre alanı zorunludur' : ''}
              disabled={loading}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                height: 48,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Giriş Yap'
              )}
            </Button>
          </form>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ 
              mt: 3,
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 1
            }}
          >
            Test Kullanıcıları:
            <br />
            HR: hr@example.com / hr123
            <br />
            Çalışan: employee@example.com / emp123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login; 