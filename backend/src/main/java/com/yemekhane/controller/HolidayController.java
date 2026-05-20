package com.yemekhane.controller;

import com.yemekhane.dto.HolidayDto;
import com.yemekhane.dto.RefundRecordDto;
import com.yemekhane.service.HolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
public class HolidayController {

    private final HolidayService holidayService;

    @GetMapping
    public ResponseEntity<List<HolidayDto>> getAllHolidays() {
        return ResponseEntity.ok(holidayService.getAllHolidays());
    }

    @PostMapping
    public ResponseEntity<HolidayDto> createHoliday(@RequestBody HolidayDto request) {
        return ResponseEntity.ok(holidayService.createHoliday(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHoliday(@PathVariable Long id) {
        holidayService.deleteHoliday(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/refunds")
    public ResponseEntity<List<RefundRecordDto>> getAllRefunds() {
        return ResponseEntity.ok(holidayService.getAllRefunds());
    }

    @GetMapping("/refunds/user/{userId}")
    public ResponseEntity<List<RefundRecordDto>> getUserRefunds(@PathVariable Long userId) {
        return ResponseEntity.ok(holidayService.getUserRefunds(userId));
    }
}
