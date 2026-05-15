package com.texdeal.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Lightweight health check endpoint.
 * Used by the frontend to detect cold-start and show a "waking up" screen.
 * No authentication required — this must respond even before the DB is ready.
 */
@RestController
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
