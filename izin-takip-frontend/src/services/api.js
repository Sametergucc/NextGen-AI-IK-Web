import axios from 'axios';
import { generateExcelTemplate } from '../utils/excelGenerator';

// Mock veri kullanımını kapatın
const USE_MOCK_DATA = false;

// API URL'ini yapılandırın
const API_URL = 'http://localhost:8082/api';

// API client'ını oluşturun
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- TOKEN INTERCEPTOR EKLEME ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// --- TOKEN INTERCEPTOR SONU ---

// Status değerlerini eşleştirme fonksiyonu 
const mapStatusForFrontend = (status) => {
  if (!status) return 'pending';
  
  const statusMap = {
    'Bekliyor': 'pending',
    'bekleyen': 'pending',
    'onaylanan': 'approved',
    'reddedilen': 'rejected'
  };
  
  return statusMap[status] || status.toLowerCase();
};

// Status değerlerini backend için eşleştirme
const mapStatusForBackend = (status) => {
  if (!status) return 'Bekliyor';
  
  const statusMap = {
    'pending': 'Bekliyor',
    'approved': 'onaylanan',
    'rejected': 'reddedilen'
  };
  
  return statusMap[status] || status;
};

// API yanıtlarını işleyen yardımcı fonksiyon
const processResponse = (response) => {
  // Tek bir nesne için
  if (response.data && !Array.isArray(response.data)) {
    const processedData = { ...response.data };
    if (processedData.status) {
      processedData.status = mapStatusForFrontend(processedData.status);
    }
    return { data: processedData };
  }
  
  // Dizi için
  if (Array.isArray(response.data)) {
    const processedData = response.data.map(item => {
      const processedItem = { ...item };
      if (processedItem.status) {
        processedItem.status = mapStatusForFrontend(processedItem.status);
      }
      return processedItem;
    });
    return { data: processedData };
  }
  
  return response;
};

// Test için bekletme fonksiyonu
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock veri
const mockRequests = [
  {
    id: 1,
    employeeId: 'user1',
    employee: 'Ahmet Yılmaz',
    startDate: '2024-05-01',
    endDate: '2024-05-05',
    reason: 'Aile ziyareti',
    status: 'pending',
    comments: []
  },
  // ... diğer mock veriler
];

// Auth API
export const login = async (credentials) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    
    // Mock login validation
    if (credentials.email === 'hr@example.com' && credentials.password === 'hr123') {
      return {
        data: {
          token: 'mock-token-hr',
          role: 'hr',
          userId: 'hr1'
        }
      };
    } else if (credentials.email === 'employee@example.com' && credentials.password === 'emp123') {
      return {
        data: {
          token: 'mock-token-employee',
          role: 'employee',
          userId: 'emp1'
        }
      };
    }
    
    throw {
      response: {
        data: {
          message: 'Geçersiz email veya şifre'
        }
      }
    };
  }
  
  // Gerçek API çağrısı
  return await api.post('/auth/login', {
    username: credentials.email,
    password: credentials.password
  });
};

// Leave Request API
export const getAllLeaveRequests = async () => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return { data: mockRequests };
  }
  
  try {
    console.log('API isteği yapılıyor: /leave/all');
    const response = await api.get('/leave/all');
    console.log('API yanıtı alındı:', response.data);
    return processResponse(response);
  } catch (error) {
    console.error('API hatası:', error);
    throw error;
  }
};

export const getEmployeeLeaveRequests = async (employeeId) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return { 
      data: mockRequests.filter(request => request.employeeId === employeeId)
    };
  }
  return processResponse(await api.get(`/leave/my?userId=${employeeId}`));
};

export const createLeaveRequest = async (requestData) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const newRequest = {
      id: mockRequests.length + 1,
      ...requestData,
      status: 'pending'
    };
    mockRequests.push(newRequest);
    return { data: newRequest };
  }
  
  const payload = {
    employeeId: requestData.employeeId,
    startDate: requestData.startDate,
    endDate: requestData.endDate,
    reason: requestData.reason
  };
  
  return processResponse(await api.post('/leave/create', payload));
};

export const updateLeaveStatus = async (requestId, newStatus) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const request = mockRequests.find(r => r.id === requestId);
    if (request) {
      request.status = newStatus;
      return { data: request };
    }
    throw new Error('İzin talebi bulunamadı');
  }
  
  const backendStatus = mapStatusForBackend(newStatus);
  
  if (backendStatus === 'onaylanan') {
    return processResponse(await api.post(`/leave/approve/${requestId}`));
  } else if (backendStatus === 'reddedilen') {
    return processResponse(await api.post(`/leave/reject/${requestId}`));
  } else {
    return processResponse(await api.put(`/leave/update/${requestId}`, { status: backendStatus }));
  }
};

export const analyzeLeaveRequest = async (payload) => {
  const response = await api.post('/ai/analyze', payload);
  return response.data;
};

export const analyzeLeaveRequests = async () => {
  // HR paneli için toplu analiz (örnek)
  // Burada backend'de toplu analiz endpoint'in varsa ona uygun şekilde güncelleyebilirsin.
  return { data: { result: "Toplu analiz özelliği henüz aktif değil." } };
};

// Excel dosyasından içe aktarma API
export const importExcelData = async (excelData) => {
  if (USE_MOCK_DATA) {
    await delay(1000);
    
    // Mock verilere ekle
    const newRequests = excelData.map((item, index) => {
      const newId = mockRequests.length + index + 1;
      return {
        ...item,
        id: newId,
        status: 'bekleyen',
        employeeId: `excel-emp-${newId}`
      };
    });
    
    mockRequests.push(...newRequests);
    
    return { 
      data: {
        success: true,
        message: `${newRequests.length} adet izin talebi başarıyla içe aktarıldı.`,
        importedRequests: newRequests
      }
    };
  }
  
  // Gerçek API çağrısı - FormData oluştur
  const formData = new FormData();
  
  // Excel verisinden dosya oluştur
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData.map(item => ({
    'Çalışan ID': item.employeeId,
    'Ad-Soyad': item.employeeName,
    'Pozisyon': item.position || '',
    'Unvan': item.title || '',
    'İşe Başlama Tarihi': '',
    'Kullanılan İzin (Gün)': item.usedLeave || '',
    'Kalan İzin (Gün)': item.remainingLeave || '',
    'Talep Oluşturma Tarihi': item.requestDate || new Date().toLocaleDateString('tr-TR'),
    'Talep Edilen İzin Tarihleri': `${item.startDate} - ${item.endDate}`,
    'Talep Durumu': item.status || 'bekleyen',
    'Talep Açıklaması': item.reason
  })));
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'İzin Talepleri');
  
  // Dosyayı blob'a dönüştür
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const file = new File([blob], 'izin_talepleri.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  formData.append('file', file);
  
  return await api.post('/leave/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Excel dosyası indirme API
export const downloadExcelTemplate = async () => {
  if (USE_MOCK_DATA) {
    // Mock durumunda client-side şablon oluşturma
    await delay(500);
    generateExcelTemplate();
    return { 
      data: { 
        success: true, 
        message: 'Şablon indirildi' 
      } 
    };
  }
  
  // Gerçek API çağrısı
  try {
    const response = await api.get('/leave/template', { responseType: 'blob' });
    
    if (response.data) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'izin_talepleri_sablonu.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    
    return {
      data: {
        success: true,
        message: 'Şablon indirildi'
      }
    };
  } catch (error) {
    console.error('Excel şablonu indirilirken hata:', error);
    // Sunucu hatası durumunda client-side şablon oluştur
    generateExcelTemplate();
    return {
      data: {
        success: true,
        message: 'Şablon indirildi (yerel olarak oluşturuldu)'
      }
    };
  }
};

export default api;

