package com.talenteer.izin_takip.controller;

import com.talenteer.izin_takip.model.User;
import com.talenteer.izin_takip.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Frontend URL'sini ekleyin
public class AuthController {
    private final UserRepository userRepository;
    
    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        
        // Test kullanıcıları için özel kontrol
        if ("hr@example.com".equals(username) && "hr123".equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("token", "mock-token-hr");
            response.put("role", "hr");
            response.put("userId", "hr1");
            return response;
        }
        
        if ("employee@example.com".equals(username) && "emp123".equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("token", "mock-token-employee");
            response.put("role", "employee");
            response.put("userId", "emp1");
            return response;
        }
        
        // Normal kullanıcı kontrolü
        User user = userRepository.findByUsername(username);
        if (user != null && user.getPassword() != null && user.getPassword().equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("token", "mock-token-" + user.getRole().toLowerCase());
            response.put("role", user.getRole().toLowerCase());
            if (user.getId() != null) {
                response.put("userId", user.getId());
            }
            return response;
        }
        
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Geçersiz kullanıcı adı veya şifre");
    }
} 