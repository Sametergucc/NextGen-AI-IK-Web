import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import { format } from 'date-fns';
import { analyzeLeaveRequest } from '../services/api';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

const HRRequestList = ({ requests, onStatusChange, onAnalyze }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [aiLoading, setAiLoading] = useState({}); // {requestId: true/false}
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState('');

  const handleStatusChange = async (requestId, newStatus) => {
    await onStatusChange(requestId, newStatus);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // İzinleri durumlarına göre filtreleme
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');

  // Aktif sekmeye göre izin taleplerini gösterme
  const displayRequests = () => {
    switch (activeTab) {
      case 0:
        return pendingRequests;
      case 1:
        return approvedRequests;
      case 2:
        return rejectedRequests;
      default:
        return requests;
    }
  };

  const getStatusChip = (status) => {
    const statusText = status === 'approved' ? 'Onaylandı' : status === 'rejected' ? 'Reddedildi' : 'Beklemede';
    const statusColor = status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning';
    
    return <Chip label={statusText} color={statusColor} />;
  };

  // AI analizi sadece butona basınca çalışacak şekilde fonksiyon
  const handleAiAnalyze = (req) => {
    console.log('AI için gönderilen izin:', req);
    if (!req.userId || !req.firstName || !req.lastName || !req.department) {
      setDialogContent('AI için eksik bilgi');
      setOpenDialog(true);
      return;
    }
    setAiLoading(prev => ({ ...prev, [req.id]: true }));
    analyzeLeaveRequest({
      employeeId: req.userId,
      firstName: req.firstName,
      lastName: req.lastName,
      startDate: req.startDate,
      endDate: req.endDate,
      department: req.department || '',
      reason: req.reason
    })
      .then(res => {
        const result = res.result || res.error || 'AI cevabı alınamadı.';
        setDialogContent(result);
        setOpenDialog(true);
      })
      .catch(() => {
        setDialogContent('AI cevabı alınamadı.');
        setOpenDialog(true);
      })
      .finally(() => {
        setAiLoading(prev => ({ ...prev, [req.id]: false }));
      });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">İzin Talepleri</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onAnalyze}
        >
          AI Analiz
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label={`Bekleyen (${pendingRequests.length})`} />
          <Tab label={`Onaylanan (${approvedRequests.length})`} />
          <Tab label={`Reddedilen (${rejectedRequests.length})`} />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>İsim</TableCell>
              <TableCell>Soyisim</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Başlangıç</TableCell>
              <TableCell>Bitiş</TableCell>
              <TableCell>Sebep</TableCell>
              <TableCell>Durum</TableCell>
              {activeTab === 0 && <TableCell>İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayRequests().map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.firstName || ''}</TableCell>
                <TableCell>{request.lastName || ''}</TableCell>
                <TableCell>{request.email || ''}</TableCell>
                <TableCell>{format(new Date(request.startDate), 'dd.MM.yyyy')}</TableCell>
                <TableCell>{format(new Date(request.endDate), 'dd.MM.yyyy')}</TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>{getStatusChip(request.status)}</TableCell>
                {activeTab === 0 && (
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                    <Button 
                        variant="outlined"
                        color="info"
                        onClick={() => handleAiAnalyze(request)}
                        startIcon={<TipsAndUpdatesIcon />}
                        disabled={aiLoading[request.id]}
                    >
                        {aiLoading[request.id] ? <CircularProgress size={18} /> : 'Öneri'}
                    </Button>
                    <Button 
                        variant="contained"
                        color="success"
                        onClick={() => handleStatusChange(request.id, 'approved')}
                        startIcon={<CheckIcon />}
                      />
                      <Button
                        variant="contained"
                      color="error" 
                      onClick={() => handleStatusChange(request.id, 'rejected')}
                        startIcon={<CloseIcon />}
                      />
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {displayRequests().length === 0 && (
              <TableRow>
                <TableCell colSpan={activeTab === 0 ? 7 : 6} align="center">
                  Bu kategoride izin talebi bulunmamaktadır.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* AI Analiz Sonucu Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Analiz Sonucu</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {dialogContent}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HRRequestList;
