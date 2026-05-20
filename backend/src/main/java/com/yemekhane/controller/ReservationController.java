package com.yemekhane.controller;

import com.yemekhane.dto.MonthlyReservationDto;
import com.yemekhane.dto.ReservationRequest;
import com.yemekhane.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ResponseEntity<List<MonthlyReservationDto>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MonthlyReservationDto>> getUserReservations(@PathVariable Long userId) {
        return ResponseEntity.ok(reservationService.getUserReservations(userId));
    }

    @PostMapping("/reserve")
    public ResponseEntity<MonthlyReservationDto> createReservation(@RequestBody ReservationRequest request) {
        return ResponseEntity.ok(reservationService.createMonthlyReservation(request));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MonthlyReservationDto> updateReservation(@PathVariable Long id, @RequestBody ReservationRequest request) {
        return ResponseEntity.ok(reservationService.updateMonthlyReservation(id, request));
    }
}
