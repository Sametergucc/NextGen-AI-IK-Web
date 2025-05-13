import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import trLocale from 'date-fns/locale/tr';

// Pages
import Login from './pages/Login';
import HRPanel from './pages/HRPanel';
import EmployeePanel from './pages/EmployeePanel';
import NotFound from './pages/NotFound';
import Home from './pages/Home';

// Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

const App = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            {/* Home açılış ekranı */}
            <Route path="/" element={isLoggedIn ? <Navigate to={localStorage.getItem('userRole') === 'hr' ? '/hr' : '/employee'} replace /> : <Home />} />
            {/* Protected Routes */}
            <Route element={<Layout />}>
              <Route 
                path="/hr" 
                element={
                  <PrivateRoute role="hr">
                    <HRPanel />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/employee" 
                element={
                  <PrivateRoute role="employee">
                    <EmployeePanel />
                  </PrivateRoute>
                } 
              />
            </Route>
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
