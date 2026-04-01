package com.example.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/public")
public class PublicController {

    @GetMapping("/hello")
    public Map<String, Object> helloPublic() {
        return Map.of(
            "status", "success",
            "message", "This is a public API for Spring Boot! Anyone can access it without authentication! 🌍",
            "info", "GET /public/hello"
        );
    }
}
