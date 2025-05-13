import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Snackbar, 
  Alert,
  Paper, 
  Divider
} from '@mui/material';
import HRRequestList from '../components/HRRequestList';
import AIAnalysisPanel from '../components/AIAnalysisPanel';
import Dashboard from '../components/Dashboard';
import ExcelImporter from '../components/ExcelImporter';
import { 
  getAllLeaveRequests, 
  analyzeLeaveRequests, 
  updateLeaveStatus, 
  importExcelData,
  downloadExcelTemplate 
} from '../services/api';
import axios from 'axios';

const HRPanel = () => {
  const [requests, setRequests] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        // Önce local storage'dan verileri kontrol et
        const savedRequests = localStorage.getItem('leaveRequests');
        
        if (savedRequests) {
          // Local storage'dan verileri yükle
          setRequests(JSON.parse(savedRequests));
          setLoading(false);
        }
        
        // Yine de API'den güncel verileri getir
        const response = await getAllLeaveRequests();
        const newRequests = response.data;
        
        // Onay durumlarını local storage'daki verilerle güncelle
        if (savedRequests) {
          const localRequests = JSON.parse(savedRequests);
          // İzin taleplerini birleştir ve onay durumlarını local storage'dan koru
          const mergedRequests = newRequests.map(req => {
            const localReq = localRequests.find(r => r.id === req.id);
            return localReq ? { ...req, status: localReq.status } : req;
          });
          
          setRequests(mergedRequests);
          localStorage.setItem('leaveRequests', JSON.stringify(mergedRequests));
        } else {
          setRequests(newRequests);
          localStorage.setItem('leaveRequests', JSON.stringify(newRequests));
        }
        
        setError(null);
      } catch (err) {
        console.error('İzin talepleri yüklenirken hata oluştu:', err);
        setError('İzin talepleri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await analyzeLeaveRequests();
      setAnalysis(response.data);
      setTabValue(1);
      setError(null);
    } catch (err) {
      console.error('Analiz yapılırken hata oluştu:', err);
      setError('Analiz yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleStatusChange = async (requestId, newStatus) => {
    setLoading(true);
    try {
      await updateLeaveStatus(requestId, newStatus);
      const response = await getAllLeaveRequests();
      const updatedRequests = response.data;
      setRequests(updatedRequests);
      
      // Değişiklikleri local storage'a kaydet
      localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));
      
      setSuccess(`İzin talebi başarıyla ${newStatus === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
      setError(null);
    } catch (err) {
      console.error('Durum güncellenirken hata oluştu:', err);
      setError('Durum güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportExcel = async (excelData) => {
    setLoading(true);
    try {
      const response = await importExcelData(excelData);
      // Başarılı içe aktarma işleminden sonra izin taleplerini yeniden yükle
      const updatedRequests = await getAllLeaveRequests();
      setRequests(updatedRequests.data);
      
      // Local storage'ı güncelle
      localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests.data));
      
      setSuccess(response.data.message || `${excelData.length} adet izin talebi başarıyla içe aktarıldı.`);
      setError(null);
    } catch (err) {
      console.error('Excel verisi içe aktarılırken hata oluştu:', err);
      setError('Excel verisi içe aktarılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadExcelTemplate();
      
      if (response.data instanceof Blob) {
        // Gerçek API'den dönen blob verisini indirme
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'izin_talepleri_sablonu.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Mock API durumunda sadece başarı mesajı gösterme
        setSuccess('Excel şablonu indirildi.');
      }
    } catch (err) {
      console.error('Şablon indirilirken hata oluştu:', err);
      setError('Şablon indirilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleLoadDefaultExcel = async () => {
    setLoading(true);
    try {
      // Load default Excel data API çağrısı
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api';
      const response = await axios.post(`${API_URL}/leave/load-default`);
      
      if (response.data && response.data.success) {
        // Başarılı yükleme sonrası izin taleplerini yeniden yükle
        const updatedRequests = await getAllLeaveRequests();
        setRequests(updatedRequests.data);
        
        // Local storage'ı güncelle
        localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests.data));
        
        setSuccess(response.data.message || 'Varsayılan veriler başarıyla yüklendi.');
        setError(null);
        // Excel sekmesinden izin listesi sekmesine geç
        setTabValue(0);
      } else {
        setError('Varsayılan veriler yüklenirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Varsayılan veriler yüklenirken hata oluştu:', err);
      setError('Varsayılan veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">İK Yönetim Paneli</Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleLogout}
        >
          Çıkış Yap
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Tüm Talepler" />
        <Tab label="AI Analiz" />
        <Tab label="Dashboard" />
        <Tab label="Excel İçe Aktar" />
      </Tabs>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && tabValue === 0 && (
        <HRRequestList 
          requests={requests} 
          onAnalyze={handleAnalyze}
          onStatusChange={handleStatusChange}
        />
      )}
      
      {!loading && tabValue === 1 && (
        <AIAnalysisPanel analysis={analysis} />
      )}
      
      {!loading && tabValue === 2 && (
        <Dashboard requests={requests} />
      )}
      
      {!loading && tabValue === 3 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Excel İçe Aktarma</Typography>
            <Box>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleDownloadTemplate}
                sx={{ mr: 2 }}
              >
                Excel Şablonu İndir
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleLoadDefaultExcel}
              >
                Varsayılan Verileri Yükle
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <ExcelImporter onImport={handleImportExcel} />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Excel dosyası aşağıdaki zorunlu sütunları içermelidir: Çalışan ID, Ad-Soyad, Talep Edilen İzin Tarihleri, Talep Açıklaması
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Diğer sütunlar: Pozisyon, Unvan, İşe Başlama Tarihi, Kullanılan İzin (Gün), Kalan İzin (Gün), Talep Oluşturma Tarihi, Talep Durumu
            </Typography>
          </Box>
        </Paper>
      )}

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HRPanel;