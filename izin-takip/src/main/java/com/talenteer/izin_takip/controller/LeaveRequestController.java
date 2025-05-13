package com.talenteer.izin_takip.controller;

import com.talenteer.izin_takip.model.LeaveRequest;
import com.talenteer.izin_takip.model.User;
import com.talenteer.izin_takip.repository.LeaveRequestRepository;
import com.talenteer.izin_takip.repository.UserRepository;
import com.talenteer.izin_takip.service.ExcelExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDate;
import java.util.Arrays;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class LeaveRequestController {
    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    private final ExcelExportService excelExportService;

    // Pozisyon-departman eşlemesi
    public static final Map<String, String> POZISYON_DEPARTMAN_MAP = Map.ofEntries(
        Map.entry("Vinç Operatörü", "Şantiye Yönetimi"),
        Map.entry("Şantiye Şefi", "Şantiye Yönetimi"),
        Map.entry("Mimar", "Mühendislik"),
        Map.entry("İş Güvenliği Uzmanı", "Mühendislik"),
        Map.entry("Proje Yöneticisi", "Mühendislik"),
        Map.entry("Muhasebe Sorumlusu", "Muhasebe"),
        Map.entry("Elektrik Mühendisi", "Mühendislik"),
        Map.entry("Makine Operatörü", "Şantiye Yönetimi"),
        Map.entry("İnşaat İşçisi", "Şantiye Yönetimi"),
        Map.entry("Kalite Kontrol", "Kalite Kontrol")
    );

    @Autowired
    public LeaveRequestController(LeaveRequestRepository leaveRequestRepository, UserRepository userRepository, ExcelExportService excelExportService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.userRepository = userRepository;
        this.excelExportService = excelExportService;
    }

    // Çalışan: Kendi izin taleplerini gör
    @GetMapping("/my")
    public List<LeaveRequest> getMyLeaves(@RequestParam(required = false) String username, @RequestParam(required = false) Long userId) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        } else if (username != null) {
            user = userRepository.findByUsername(username);
        }
        if (user == null) return List.of();
        return leaveRequestRepository.findByUserId(user.getId());
    }

    // Çalışan: Yeni izin talebi oluştur
    @PostMapping("/create")
    public LeaveRequest createLeave(@RequestBody Map<String, String> body) {
        User user = null;
        // Önce employeeId ile bulmayı dene
        if (body.containsKey("employeeId")) {
            try {
                user = userRepository.findById(Long.parseLong(body.get("employeeId"))).orElse(null);
            } catch (Exception e) {
                // id parse edilemiyorsa username ile devam et
            }
        }
        // Eğer employeeId yoksa veya bulunamazsa username ile dene
        if (user == null && body.containsKey("username")) {
            user = userRepository.findByUsername(body.get("username"));
        }
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kullanıcı bulunamadı");
        }
        LeaveRequest leave = new LeaveRequest();
        leave.setUser(user);
        leave.setStartDate(java.time.LocalDate.parse(body.get("startDate")));
        leave.setEndDate(java.time.LocalDate.parse(body.get("endDate")));
        leave.setReason(body.get("reason"));
        leave.setStatus("Bekliyor");
        // Kullanıcıdan pozisyon ve departman al
        String position = user.getDepartment(); // USERS tablosunda DEPARTMENT aslında pozisyon!
        String department = POZISYON_DEPARTMAN_MAP.getOrDefault(position, "Bilinmiyor");
        leave.setPosition(position);
        leave.setDepartment(department);
        LeaveRequest saved = leaveRequestRepository.save(leave);
        System.out.println("Yeni izin kaydedildi: id=" + saved.getId() + ", user=" + user.getUsername() + ", tarih=" + saved.getStartDate() + " - " + saved.getEndDate());
        return saved;
    }

    // DTO sınıfı
    class LeaveRequestDTO {
        private Long id;
        private String reason;
        private String status;
        private String startDate;
        private String endDate;
        private Long userId;
        private String firstName;
        private String lastName;
        private String email;
        private String department;
        private String position;
        // getter/setter
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }
    }

    // İK: Tüm izin taleplerini gör
    @GetMapping("/all")
    public List<LeaveRequestDTO> getAllLeaves() {
        System.out.println("Tüm izin talepleri getiriliyor...");
        List<LeaveRequest> allLeaves = leaveRequestRepository.findAll();
        System.out.println("Toplam " + allLeaves.size() + " izin talebi bulundu.");
        return allLeaves.stream().map(leave -> {
            LeaveRequestDTO dto = new LeaveRequestDTO();
            dto.setId(leave.getId());
            dto.setReason(leave.getReason());
            dto.setStatus(leave.getStatus());
            dto.setStartDate(leave.getStartDate() != null ? leave.getStartDate().toString() : "");
            dto.setEndDate(leave.getEndDate() != null ? leave.getEndDate().toString() : "");
            if (leave.getUser() != null) {
                dto.setUserId(leave.getUser().getId());
                dto.setFirstName(leave.getUser().getFirstName());
                dto.setLastName(leave.getUser().getLastName());
                dto.setEmail(leave.getUser().getEmail());
                dto.setDepartment(leave.getUser().getDepartment());
            }
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }

    // İK: İzin talebini onayla
    @PostMapping("/approve/{id}")
    public LeaveRequest approveLeave(@PathVariable Long id) throws IOException {
        LeaveRequest leave = leaveRequestRepository.findById(id).orElse(null);
        if (leave == null) return null;
        leave.setStatus("onaylanan"); // "APPROVED" yerine "onaylanan" kullanacağız
        LeaveRequest updated = leaveRequestRepository.save(leave);
        // Onaylanan izinleri Excel'e kaydet
        List<LeaveRequest> approvedList = leaveRequestRepository.findAll().stream()
                .filter(l -> "onaylanan".equals(l.getStatus()))
                .collect(Collectors.toList());
        excelExportService.exportToExcel(approvedList, "approved_leaves.xlsx");
        return updated;
    }

    // İK: İzin talebini reddet
    @PostMapping("/reject/{id}")
    public LeaveRequest rejectLeave(@PathVariable Long id) throws IOException {
        LeaveRequest leave = leaveRequestRepository.findById(id).orElse(null);
        if (leave == null) return null;
        leave.setStatus("reddedilen"); // "REJECTED" yerine "reddedilen" kullanacağız
        LeaveRequest updated = leaveRequestRepository.save(leave);
        // Reddedilen izinleri Excel'e kaydet
        List<LeaveRequest> rejectedList = leaveRequestRepository.findAll().stream()
                .filter(l -> "reddedilen".equals(l.getStatus()))
                .collect(Collectors.toList());
        excelExportService.exportToExcel(rejectedList, "rejected_leaves.xlsx");
        return updated;
    }

    // Test endpointi
    @GetMapping("/test-log")
    public String testLog() {
        System.out.println("testLog endpoint çalıştı!");
        return "OK";
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeLeave(@RequestBody LeaveRequestDTO dto) {
        // Pozisyon çatışması kontrolü
        List<String> statusList = Arrays.asList("APPROVED", "PENDING", "onaylanan", "Bekliyor", "bekliyor");
        String position = dto.getPosition();
        if (position == null || position.isBlank()) {
            System.out.println("Uyarı: Pozisyon null veya boş!");
        }
        List<LeaveRequest> conflicts = leaveRequestRepository
            .findByPositionAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                position, statusList, LocalDate.parse(dto.getEndDate()), LocalDate.parse(dto.getStartDate())
            );
        System.out.println("Pozisyon: " + position);
        System.out.println("Çakışan izin sayısı: " + conflicts.size());
        for (LeaveRequest c : conflicts) {
            System.out.println("Çakışan izin: " + c.getId() + " - " + c.getPosition() + " - " + c.getStartDate() + " - " + c.getEndDate());
        }
        if (!conflicts.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "status", "rejected",
                "aiResult", "pozisyon_cakismasi",
                "message", "Aynı pozisyondan başka bir çalışan bu tarihlerde izinli olduğu için talep reddedildi."
            ));
        }
        // Kalan yıllık izin hakkı kontrolü (örnek)
        int year = LocalDate.parse(dto.getStartDate()).getYear();
        List<LeaveRequest> userLeaves = leaveRequestRepository.findByUserId(dto.getUserId());
        int usedDays = userLeaves.stream()
            .filter(lr -> lr.getStartDate() != null && lr.getEndDate() != null &&
                lr.getStartDate().getYear() == year &&
                ("APPROVED".equalsIgnoreCase(lr.getStatus()) || "onaylanan".equalsIgnoreCase(lr.getStatus())))
            .mapToInt(lr -> (int) (lr.getEndDate().toEpochDay() - lr.getStartDate().toEpochDay() + 1))
            .sum();
        int requestedDays = (int) (LocalDate.parse(dto.getEndDate()).toEpochDay() - LocalDate.parse(dto.getStartDate()).toEpochDay() + 1);
        int maxAnnualLeave = 14; // örnek: yıllık izin hakkı
        if (usedDays + requestedDays > maxAnnualLeave) {
            return ResponseEntity.ok(Map.of(
                "status", "rejected",
                "aiResult", "yillik_izin_limit",
                "message", "Yıllık izin hakkınız aşıldığı için talep reddedildi."
            ));
        }
        // ... diğer kurallar ve AI çağrısı ...
        return ResponseEntity.ok(Map.of(
            "status", "approved",
            "aiResult", "onay",
            "message", "İzin talebi onaylandı."
        ));
    }

    @GetMapping("/fix-old-leaves")
    public String fixOldLeaves() {
        List<LeaveRequest> allLeaves = leaveRequestRepository.findAll();
        for (LeaveRequest leave : allLeaves) {
            if (leave.getPosition() == null || leave.getPosition().isBlank()) {
                // Kullanıcıdan pozisyonu al
                User user = leave.getUser();
                if (user != null) {
                    String position = user.getDepartment(); // USERS tablosunda DEPARTMENT aslında pozisyon!
                    leave.setPosition(position);
                    // Departmanı eşle
                    String department = POZISYON_DEPARTMAN_MAP.getOrDefault(position, "Bilinmiyor");
                    leave.setDepartment(department);
                    leaveRequestRepository.save(leave);
                }
            } else if (leave.getDepartment() == null || leave.getDepartment().isBlank()) {
                String department = POZISYON_DEPARTMAN_MAP.getOrDefault(leave.getPosition(), "Bilinmiyor");
                leave.setDepartment(department);
                leaveRequestRepository.save(leave);
            }
        }
        return "Tüm eski izin taleplerinin pozisyon ve departman alanları güncellendi!";
    }
} 