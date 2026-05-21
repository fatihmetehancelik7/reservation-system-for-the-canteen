package com.yemekhane.controller;

import com.yemekhane.dto.MonthlyReservationDto;
import com.yemekhane.dto.ReservationRequest;
import com.yemekhane.entity.Role;
import com.yemekhane.entity.User;
import com.yemekhane.exception.BusinessException;
import com.yemekhane.service.ReservationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import com.yemekhane.security.UserDetailsImpl;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<MonthlyReservationDto>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MonthlyReservationDto>> getUserReservations(@PathVariable Long userId, HttpServletRequest httpRequest) {
        assertUserCanAccess(userId, httpRequest);
        return ResponseEntity.ok(reservationService.getUserReservations(userId));
    }

    @PostMapping("/reserve")
    public ResponseEntity<MonthlyReservationDto> createReservation(@Valid @RequestBody ReservationRequest request, HttpServletRequest httpRequest) {
        assertUserCanAccess(request.getUserId(), httpRequest);
        return ResponseEntity.ok(reservationService.createMonthlyReservation(request));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MonthlyReservationDto> updateReservation(@PathVariable Long id, @Valid @RequestBody ReservationRequest request, HttpServletRequest httpRequest) {
        assertUserCanAccess(request.getUserId(), httpRequest);
        return ResponseEntity.ok(reservationService.updateMonthlyReservation(id, request));
    }

    private void assertUserCanAccess(Long userId, HttpServletRequest request) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null || "anonymousUser".equals(principal)) {
            throw new BusinessException("Oturum bulunamadı.");
        }
        UserDetailsImpl authenticatedUser = (UserDetailsImpl) principal;
        if (authenticatedUser.getRoleEnum() != Role.ADMIN && !authenticatedUser.getId().equals(userId)) {
            throw new BusinessException("Başka bir kullanıcının verilerine erişemezsiniz.");
        }
    }
}
