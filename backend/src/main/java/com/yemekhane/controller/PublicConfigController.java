package com.yemekhane.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicConfigController {

    @Value("${app.constants.active-year:2026}")
    private int activeYear;

    @Value("${app.constants.daily-price:100.0}")
    private double dailyPrice;

    @Value("${app.constants.timezone:Europe/Istanbul}")
    private String timezone;

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getPublicConfig() {
        return ResponseEntity.ok(Map.of(
                "activeYear", activeYear,
                "dailyPrice", dailyPrice,
                "timezone", timezone
        ));
    }
}
