package com.talenteer.izin_takip.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class OpenAIService {
    @Value("${openai.api.key}")
    private String openaiApiKey;

    public String analyzeLeaves(List<String> leaveRequests) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://api.openai.com/v1/chat/completions";

        String prompt = "Aşağıdaki izin taleplerini şirket kurallarına göre analiz et ve her biri için RED/KABUL önerisi ver. Talepler:\n";
        for (String req : leaveRequests) {
            prompt += "- " + req + "\n";
        }

        Map<String, Object> messages = new HashMap<>();
        messages.put("role", "user");
        messages.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-3.5-turbo");
        body.put("messages", List.of(messages));
        body.put("max_tokens", 500);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        }
        return "AI yanıtı alınamadı.";
    }
} 