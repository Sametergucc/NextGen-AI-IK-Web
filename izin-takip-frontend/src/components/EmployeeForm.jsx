import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { createLeaveRequest } from '../services/api';

const EmployeeForm = ({ employeeId, onRequestCreated }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [leaveType, setLeaveType] = useState('annual');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Lütfen tarih aralığını seçin');
      return;
    }

    try {
      await createLeaveRequest({
        employeeId,
        startDate,
        endDate,
        leaveType,
        description,
        status: 'pending'
      });
      onRequestCreated();
      setStartDate(null);
      setEndDate(null);
      setLeaveType('annual');
      setDescription('');
      setError('');
    } catch (err) {
      setError('İzin talebi oluşturulurken hata oluştu');
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Yeni İzin Talebi Oluştur
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Başlangıç Tarihi"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => (
              <TextField {...params} fullWidth margin="normal" required />
            )}
          />
          <DatePicker
            label="Bitiş Tarihi"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => (
              <TextField {...params} fullWidth margin="normal" required />
            )}
          />
        </LocalizationProvider>
        <FormControl fullWidth margin="normal">
          <InputLabel>İzin Türü</InputLabel>
          <Select
            value={leaveType}
            label="İzin Türü"
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <MenuItem value="annual">Yıllık İzin</MenuItem>
            <MenuItem value="sick">Hastalık İzni</MenuItem>
            <MenuItem value="emergency">Acil Durum</MenuItem>
            <MenuItem value="birthday">Doğum Günü İzni</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="normal"
          fullWidth
          label="Açıklama"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Talep Gönder
        </Button>
      </Box>
    </Paper>
  );
};

export default EmployeeForm;