import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { getEmployeeLeaveRequests, createLeaveRequest, analyzeLeaveRequest } from '../services/api';
import { useNavigate } from 'react-router-dom';

const EmployeePanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    reason: ''
  });
  const [aiResult, setAiResult] = useState('');
  const [userDepartment, setUserDepartment] = useState(localStorage.getItem('department') || '');
  const [userFirstName, setUserFirstName] = useState(localStorage.getItem('firstName') || '');
  const [userLastName, setUserLastName] = useState(localStorage.getItem('lastName') || '');
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchRequests(userId);
    // localStorage'da ad/soyad yoksa, ilk izin talebinden al
    if (!localStorage.getItem('firstName') || !localStorage.getItem('lastName')) {
      getEmployeeLeaveRequests(userId).then(res => {
        if (res.data && res.data.length > 0 && res.data[0].user) {
          if (res.data[0].user.firstName) {
            setUserFirstName(res.data[0].user.firstName);
            localStorage.setItem('firstName', res.data[0].user.firstName);
          }
          if (res.data[0].user.lastName) {
            setUserLastName(res.data[0].user.lastName);
            localStorage.setItem('lastName', res.data[0].user.lastName);
          }
          if (res.data[0].user.department) {
            setUserDepartment(res.data[0].user.department);
            localStorage.setItem('department', res.data[0].user.department);
          }
        }
      });
    }
  }, []);

  const fetchRequests = async (userId) => {
    setLoading(true);
    try {
      const response = await getEmployeeLeaveRequests(userId);
      setRequests(response.data);
      setError('');
    } catch {
      setError('İzin talepleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Kullanıcı oturumu bulunamadı, lütfen tekrar giriş yapın.');
      setLoading(false);
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await createLeaveRequest({
        employeeId: userId,
        startDate: formData.startDate ? formData.startDate.toISOString().slice(0, 10) : '',
        endDate: formData.endDate ? formData.endDate.toISOString().slice(0, 10) : '',
        reason: formData.reason
      });
      setFormData({
        startDate: null,
        endDate: null,
        reason: ''
      });
      await fetchRequests(userId);
      setError('');
      // AI analiz isteği
      const aiPayload = {
        employeeId: userId,
        firstName: userFirstName,
        lastName: userLastName,
        startDate: formData.startDate ? formData.startDate.toISOString().slice(0, 10) : '',
        endDate: formData.endDate ? formData.endDate.toISOString().slice(0, 10) : '',
        department: userDepartment,
        reason: formData.reason
      };
      const aiResponse = await analyzeLeaveRequest(aiPayload);
      setAiResult(aiResponse?.result || aiResponse?.error || 'AI cevabı alınamadı.');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('İzin talebi oluşturulurken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        İzin Talepleri
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Yeni İzin Talebi
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <DatePicker
                label="Başlangıç Tarihi"
                value={formData.startDate}
                onChange={(newValue) => setFormData({ ...formData, startDate: newValue })}
                sx={{ flex: 1 }}
              />
              <DatePicker
                label="Bitiş Tarihi"
                value={formData.endDate}
                onChange={(newValue) => setFormData({ ...formData, endDate: newValue })}
                sx={{ flex: 1 }}
              />
            </Box>
            <TextField
              fullWidth
              label="İzin Nedeni"
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'İzin Talebi Oluştur'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        İzin Geçmişi
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        requests.map((request) => (
          <Card key={request.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1">
                {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {request.reason}
              </Typography>
              <Typography
                color={
                  request.status === 'approved'
                    ? 'success.main'
                    : request.status === 'rejected'
                    ? 'error.main'
                    : 'warning.main'
                }
              >
                Durum: {request.status === 'approved' ? 'Onaylandı' : request.status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}

      {/* AI Analiz Sonucu */}
      {aiResult && (
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" color="primary">AI Analiz Sonucu</Typography>
          <Paper sx={{ p: 2, mt: 1 }}>
            <Typography>{aiResult}</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default EmployeePanel;