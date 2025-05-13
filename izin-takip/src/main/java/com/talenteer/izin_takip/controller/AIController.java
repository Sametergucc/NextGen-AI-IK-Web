package com.talenteer.izin_takip.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeLeave(@RequestBody Map<String, Object> leaveRequest) {
        String pythonApiUrl = "http://localhost:8000/analyze-leave"; // Python FastAPI portunu yaz
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(leaveRequest, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(pythonApiUrl, request, Map.class);

        return ResponseEntity.ok(response.getBody());
    }
} 