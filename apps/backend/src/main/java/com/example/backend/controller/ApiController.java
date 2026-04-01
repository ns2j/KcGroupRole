package com.example.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/mock-api")
public class ApiController {

    @GetMapping("/protected-resource")
    public Map<String, Object> getProtectedResource(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Data retrieval from the backend API (Spring Boot) was a great success! 🎉");
        response.put("receivedTokenPrefix",
                jwt.getTokenValue().substring(0, Math.min(20, jwt.getTokenValue().length())) + "...");

        Map<String, Object> secretData = new HashMap<>();
        secretData.put("membershipLevel", "Premium");
        secretData.put("points", 15000);
        secretData.put("tasks", List.of("Spring Boot Setup", "BFF Integration", "Backend Calls"));

        response.put("secretData", secretData);
        return response;
    }

    @GetMapping("/admin-only")
    @PreAuthorize("hasRole('admin')")
    public Map<String, Object> adminOnly() {
        return Map.of("message", "You can see this data because you have the Admin role.");
    }

    @GetMapping("/group-restricted")
    @PreAuthorize("hasRole('super-manager') or (hasAuthority('/A/B') and hasRole('manager'))")
    public Map<String, Object> groupRestricted() {
        return Map.of("message", "You can access this secret data because you have a specific group or manager role.");
    }
}
