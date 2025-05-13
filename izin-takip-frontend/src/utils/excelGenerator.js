import * as XLSX from 'xlsx';

/**
 * Excel şablonu oluşturur ve indirir
 */
export const generateExcelTemplate = () => {  // Şablon başlıkları  const headers = [    'Çalışan ID',     'Ad-Soyad',     'Pozisyon',     'Unvan',     'İşe Başlama Tarihi',     'Kullanılan İzin (Gün)',     'Kalan İzin (Gün)',     'Talep Oluşturma Tarihi',     'Talep Edilen İzin Tarihleri',     'Talep Durumu',    'Talep Açıklaması'  ];    // Örnek veri satırı  const sampleRow = [    'EMP001',     'Ahmet Yılmaz',     'Yazılım Geliştirici',     'Uzman',     '01.01.2022',     '5',     '15',     '25.08.2024',     '01.09.2024 - 05.09.2024',     'bekleyen',    'Yıllık izin'  ];    // Worksheet oluştur  const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleRow]);    // Sütun genişliklerini ayarla  const wscols = [    { wch: 12 }, // Çalışan ID    { wch: 20 }, // Ad-Soyad    { wch: 20 }, // Pozisyon    { wch: 15 }, // Unvan    { wch: 18 }, // İşe Başlama Tarihi    { wch: 18 }, // Kullanılan İzin (Gün)    { wch: 18 }, // Kalan İzin (Gün)    { wch: 20 }, // Talep Oluşturma Tarihi    { wch: 25 }, // Talep Edilen İzin Tarihleri    { wch: 15 }, // Talep Durumu    { wch: 40 }  // Talep Açıklaması  ];
  
  worksheet['!cols'] = wscols;
  
  // Workbook oluştur
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'İzin Talepleri');
  
  // Dosyayı oluştur ve indir
  XLSX.writeFile(workbook, 'izin_talepleri_sablonu.xlsx');
};

/**
 * Excel dosyasını okur ve JSON veriye dönüştürür
 * @param {File} file - Excel dosyası
 * @returns {Promise<Array>} - JSON verisi
 */
export const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Dosya okuma hatası'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export default { generateExcelTemplate, readExcelFile }; 