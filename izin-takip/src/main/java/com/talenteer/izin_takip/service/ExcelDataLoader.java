package com.talenteer.izin_takip.service;

import com.talenteer.izin_takip.model.User;
import com.talenteer.izin_takip.model.LeaveRequest;
import com.talenteer.izin_takip.repository.UserRepository;
import com.talenteer.izin_takip.repository.LeaveRequestRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.nio.file.Files;
import java.nio.file.Paths;

// Bu sınıfı devre dışı bırakıyoruz çünkü com.talenteer.izintakip.config.DataInitializer sınıfı zaten veri yükleme işlemini yapıyor
 @Component
public class ExcelDataLoader implements CommandLineRunner {
    private final UserRepository userRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public ExcelDataLoader(UserRepository userRepository, LeaveRequestRepository leaveRequestRepository) {
        this.userRepository = userRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            double d = cell.getNumericCellValue();
            if (d == (int) d) {
                return String.valueOf((int) d);
            } else {
                return String.valueOf(d);
            }
        } else {
            return "";
        }
    }

    @Override
    public void run(String... args) throws Exception {
        // Her başlatmada flag dosyasını mutlak yol ile sil
        String flagFile = new File("src/main/resources/excels/loader_done.flag").getAbsolutePath();
        try {
            if (Files.exists(Paths.get(flagFile))) {
                Files.delete(Paths.get(flagFile));
                System.out.println("Flag dosyası bulundu ve silindi. Yükleme tekrar yapılacak.");
            }
        } catch (Exception e) {
            System.out.println("Flag dosyası silinemedi: " + e.getMessage());
        }
        System.out.println("ExcelDataLoader başlatıldı. Tüm Excel dosyaları okunacak...");

        // Excel dosyalarının bulunduğu klasör
        String excelFolderPath = "src/main/resources/excels";
        File folder = new File(excelFolderPath);

        if (!folder.exists() || !folder.isDirectory()) {
            System.out.println("Excel klasörü bulunamadı: " + excelFolderPath);
            return;
        }

        File[] files = folder.listFiles((dir, name) -> name.endsWith(".xlsx"));
        if (files == null || files.length == 0) {
            System.out.println("Hiç Excel dosyası bulunamadı.");
            return;
        }

        for (File file : files) {
            System.out.println("İşleniyor: " + file.getName());
            try (FileInputStream fis = new FileInputStream(file)) {
                Workbook workbook = new XSSFWorkbook(fis);
                Sheet sheet = workbook.getSheetAt(0);
                DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
                Map<Long, User> userMap = new HashMap<>();

                for (int i = 1; i <= sheet.getLastRowNum(); i++) { // 0. satır başlık
                    Row row = sheet.getRow(i);
                    if (row == null) continue;

                    // ID hücresini güvenli oku
                    Cell idCell = row.getCell(0);
                    if (idCell == null || idCell.getCellType() != CellType.NUMERIC) continue;
                    Long calisanId = (long) idCell.getNumericCellValue();

                    String adSoyad = getCellStringValue(row.getCell(1));
                    String[] isimParcalar = adSoyad.trim().split(" ");
                    String firstName = isimParcalar.length > 0 ? isimParcalar[0] : "";
                    String lastName = isimParcalar.length > 1 ? String.join(" ", java.util.Arrays.copyOfRange(isimParcalar, 1, isimParcalar.length)) : "";
                    String email = firstName.toLowerCase() + "." + lastName.toLowerCase().replace(" ", "") + "@example.com";
                    String pozisyon = getCellStringValue(row.getCell(2));
                    String unvan = getCellStringValue(row.getCell(3));
                    String iseBaslama = getCellStringValue(row.getCell(4));

                    // Kullanılan izin ve kalan izin için güvenli okuma
                    Cell kullanilanIzinCell = row.getCell(5);
                    if (kullanilanIzinCell == null || kullanilanIzinCell.getCellType() != CellType.NUMERIC) continue;
                    int kullanilanIzin = (int) kullanilanIzinCell.getNumericCellValue();

                    Cell kalanIzinCell = row.getCell(6);
                    if (kalanIzinCell == null || kalanIzinCell.getCellType() != CellType.NUMERIC) continue;
                    int kalanIzin = (int) kalanIzinCell.getNumericCellValue();

                    String talepOlusturma = getCellStringValue(row.getCell(7));
                    String talepTarihleri = getCellStringValue(row.getCell(8));
                    String talepDurumu = getCellStringValue(row.getCell(9));
                    String talepAciklama = getCellStringValue(row.getCell(10));

                    // User ekle (ID'ye göre tekrar ekleme)
                    User user = userMap.get(calisanId);
                    if (user == null) {
                        user = new User();
                        user.setUsername(adSoyad.replace(" ", "").toLowerCase() + "@example.com");
                        user.setPassword("1234");
                        user.setRole(unvan.equalsIgnoreCase("İK") ? "HR" : "EMPLOYEE");
                        user.setDepartment(pozisyon);
                        user.setFirstName(firstName);
                        user.setLastName(lastName);
                        user.setEmail(email);
                        user = userRepository.save(user);
                        userMap.put(calisanId, user);
                    }

                    // Talep edilen izin tarihlerini ayır
                    if (talepTarihleri == null || !talepTarihleri.contains("-")) continue;
                    String[] tarihAralik = talepTarihleri.split("-");
                    if (tarihAralik.length < 2) continue;
                    LocalDate startDate = LocalDate.parse(tarihAralik[0].trim(), dateFormatter);
                    LocalDate endDate = LocalDate.parse(tarihAralik[1].trim(), dateFormatter);

                    LeaveRequest leave = new LeaveRequest();
                    leave.setUser(user);
                    leave.setStartDate(startDate);
                    leave.setEndDate(endDate);
                    leave.setReason(talepAciklama);
                    leave.setStatus(talepDurumu);
                    leaveRequestRepository.save(leave);
                }
                workbook.close();
            } catch (Exception e) {
                System.out.println("Hata oluştu: " + e.getMessage());
            }
        }
        System.out.println("Tüm Excel dosyaları işlendi.");
        // Flag dosyasını oluştur
        Files.createFile(Paths.get(flagFile));

        // Tüm izin taleplerini 'Bekliyor' durumuna getir
        leaveRequestRepository.findAll().forEach(lr -> {
            lr.setStatus("Bekliyor");
            leaveRequestRepository.save(lr);
        });
    }
} 