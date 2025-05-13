package com.talenteer.izin_takip.service;

import com.talenteer.izin_takip.model.LeaveRequest;
import com.talenteer.izin_takip.model.User;
import com.talenteer.izin_takip.repository.UserRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportService {
    private final UserRepository userRepository;

    public ExcelExportService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void exportToExcel(List<LeaveRequest> requests, String filePath) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Izinler");

        // Başlık satırı
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("ID");
        header.createCell(1).setCellValue("Kullanıcı Adı");
        header.createCell(2).setCellValue("İsim");
        header.createCell(3).setCellValue("Soyisim");
        header.createCell(4).setCellValue("E-posta");
        header.createCell(5).setCellValue("Başlangıç Tarihi");
        header.createCell(6).setCellValue("Bitiş Tarihi");
        header.createCell(7).setCellValue("Açıklama");
        header.createCell(8).setCellValue("Durum");

        int rowNum = 1;
        for (LeaveRequest req : requests) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(req.getId());
            String username = req.getUser().getUsername();
            row.createCell(1).setCellValue(username);
            row.createCell(2).setCellValue(req.getUser().getFirstName());
            row.createCell(3).setCellValue(req.getUser().getLastName());
            row.createCell(4).setCellValue(req.getUser().getEmail());
            row.createCell(5).setCellValue(req.getStartDate().toString());
            row.createCell(6).setCellValue(req.getEndDate().toString());
            row.createCell(7).setCellValue(req.getReason());
            row.createCell(8).setCellValue(req.getStatus());
        }

        try (FileOutputStream fos = new FileOutputStream(filePath)) {
            workbook.write(fos);
        }
        workbook.close();
    }
} 