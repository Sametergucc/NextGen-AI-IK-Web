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
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import * as XLSX from 'xlsx';

const ExcelImporter = ({ onImport }) => {
  const [excelData, setExcelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  
  const handleFileUpload = (e) => {
    setLoading(true);
    setError(null);
    const file = e.target.files[0];
    
    if (!file) {
      setLoading(false);
      return;
    }
    
    // Excel dosyasının MIME tipini kontrol et
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Lütfen geçerli bir Excel dosyası yükleyin (.xlsx veya .xls)');
      setLoading(false);
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        // Excel verisini doğrula
        const validatedData = validateExcelData(json);
        setExcelData(validatedData);
        setOpenConfirmDialog(true);
      } catch (error) {
        console.error('Excel dosyası işlenirken hata oluştu:', error);
        setError('Excel dosyası işlenirken bir hata oluştu. Lütfen doğru formatta bir dosya yüklediğinizden emin olun.');
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Dosya okuma hatası');
      setLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  };
  
    const validateExcelData = (data) => {    // Excel verilerinin doğru formatta olduğunu kontrol et    return data.map((row, index) => {      // Beklenen sütun isimleri      const requiredColumns = ['Çalışan ID', 'Ad-Soyad', 'Talep Edilen İzin Tarihleri', 'Talep Açıklaması'];            // Tüm gerekli alanların var olduğunu kontrol et      let isValid = true;      let missingFields = [];            requiredColumns.forEach(column => {        const columnExists = Object.keys(row).some(key =>           key.toLowerCase() === column.toLowerCase()        );                if (!columnExists) {          isValid = false;          missingFields.push(column);        }      });            // Tarih verilerini ayırma ve işleme      let startDate = '';      let endDate = '';            if (row['Talep Edilen İzin Tarihleri']) {        const dateRange = row['Talep Edilen İzin Tarihleri'].toString().split('-');        if (dateRange.length >= 2) {          startDate = dateRange[0].trim();          endDate = dateRange[1].trim();        } else {          startDate = row['Talep Edilen İzin Tarihleri'];        }      }            // Normalleştirilmiş veri yapısını oluştur      return {        id: `excel-${index}`,        employeeId: row['Çalışan ID'] || '',        employeeName: row['Ad-Soyad'] || '',        position: row['Pozisyon'] || '',        title: row['Unvan'] || '',        startDate: startDate,        endDate: endDate,        reason: row['Talep Açıklaması'] || '',        requestDate: row['Talep Oluşturma Tarihi'] || new Date().toLocaleDateString('tr-TR'),        usedLeave: row['Kullanılan İzin (Gün)'] || '',        remainingLeave: row['Kalan İzin (Gün)'] || '',        status: row['Talep Durumu'] || 'bekleyen',        isValid,        missingFields,        rawData: row      };    });
  };
  
  const handleConfirmImport = () => {
    // Sadece geçerli verileri içe aktar
    const validData = excelData.filter(row => row.isValid);
    if (validData.length > 0) {
      onImport(validData);
    } else {
      setError('İçe aktarılacak geçerli veri bulunamadı.');
    }
    setOpenConfirmDialog(false);
  };
  
  const handleCloseDialog = () => {
    setOpenConfirmDialog(false);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Excel Dosyasından İzinleri İçe Aktar</Typography>
      
      <Box sx={{ mt: 2, mb: 3 }}>
        <input
          accept=".xlsx, .xls"
          id="excel-file-input"
          type="file"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <label htmlFor="excel-file-input">
          <Button
            variant="contained"
            component="span"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Excel Dosyası Seç'}
          </Button>
        </label>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Onay Dialogu */}
      <Dialog open={openConfirmDialog} onClose={handleCloseDialog}>
        <DialogTitle>İzin Taleplerini İçe Aktar</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {excelData?.length || 0} izin talebi bulundu. İzin taleplerini içe aktarmak istediğinize emin misiniz?
          </DialogContentText>
          
          {excelData && excelData.some(row => !row.isValid) && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Bazı veriler eksik veya hatalı olabilir. Lütfen içe aktarılan verileri kontrol edin.
            </Alert>
          )}
          
          {excelData && (
            <TableContainer component={Paper} sx={{ mt: 2, maxHeight: '300px', overflow: 'auto' }}>
              <Table size="small">
                <TableHead>
                                    <TableRow>                    <TableCell>Çalışan ID</TableCell>                    <TableCell>Ad-Soyad</TableCell>                    <TableCell>Pozisyon</TableCell>                    <TableCell>Başlangıç</TableCell>                    <TableCell>Bitiş</TableCell>                    <TableCell>Açıklama</TableCell>                    <TableCell>Durum</TableCell>                  </TableRow>
                </TableHead>
                <TableBody>
                  {excelData.map((row, index) => (
                                        <TableRow                       key={index}                      sx={!row.isValid ? { backgroundColor: '#ffebee' } : {}}                    >                      <TableCell>{row.employeeId}</TableCell>                      <TableCell>{row.employeeName}</TableCell>                      <TableCell>{row.position}</TableCell>                      <TableCell>{row.startDate}</TableCell>                      <TableCell>{row.endDate}</TableCell>                      <TableCell>{row.reason}</TableCell>                      <TableCell>                        {!row.isValid ? (                          <Typography color="error" variant="caption">                            Hatalı ({row.missingFields.join(', ')})                          </Typography>                        ) : row.status}                      </TableCell>                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button 
            onClick={handleConfirmImport} 
            color="primary"
            disabled={!excelData || excelData.length === 0 || !excelData.some(row => row.isValid)}
          >
            İçe Aktar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExcelImporter; 