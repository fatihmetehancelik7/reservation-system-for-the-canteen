package com.yemekhane.controller;

import com.yemekhane.dto.BulkReservationRequest;
import com.yemekhane.dto.MonthlyReservationDto;
import com.yemekhane.dto.ReservationRequest;
import com.yemekhane.entity.Role;
import com.yemekhane.exception.BusinessException;
import com.yemekhane.security.UserDetailsImpl;
import com.yemekhane.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<List<MonthlyReservationDto>> getUserReservations(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetailsImpl authenticatedUser) {
        assertUserCanAccess(userId, authenticatedUser);
        return ResponseEntity.ok(reservationService.getUserReservations(userId));
    }

    @PostMapping("/reserve")
    public ResponseEntity<MonthlyReservationDto> createReservation(
            @Valid @RequestBody ReservationRequest request,
            @AuthenticationPrincipal UserDetailsImpl authenticatedUser) {
        bindRequestToAuthenticatedUser(request, authenticatedUser);
        return ResponseEntity.ok(reservationService.createMonthlyReservation(request));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<MonthlyReservationDto>> processBulkReservations(
            @Valid @RequestBody BulkReservationRequest request,
            @AuthenticationPrincipal UserDetailsImpl authenticatedUser) {
        bindRequestToAuthenticatedUser(request, authenticatedUser);
        return ResponseEntity.ok(reservationService.processBulkReservations(request));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MonthlyReservationDto> updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody ReservationRequest request,
            @AuthenticationPrincipal UserDetailsImpl authenticatedUser) {
        bindRequestToAuthenticatedUser(request, authenticatedUser);
        return ResponseEntity.ok(reservationService.updateMonthlyReservation(id, request));
    }

    private void bindRequestToAuthenticatedUser(ReservationRequest request, UserDetailsImpl authenticatedUser) {
        UserDetailsImpl currentUser = requireAuthenticatedUser(authenticatedUser);
        if (currentUser.getRoleEnum() != Role.ADMIN) {
            request.setUserId(currentUser.getId());
            return;
        }
        if (request.getUserId() == null) {
            throw new BusinessException("Kullanıcı bilgisi zorunludur.");
        }
    }

    private void bindRequestToAuthenticatedUser(BulkReservationRequest request, UserDetailsImpl authenticatedUser) {
        UserDetailsImpl currentUser = requireAuthenticatedUser(authenticatedUser);
        if (currentUser.getRoleEnum() != Role.ADMIN) {
            request.setUserId(currentUser.getId());
            return;
        }
        if (request.getUserId() == null) {
            throw new BusinessException("Kullanıcı bilgisi zorunludur.");
        }
    }

    private void assertUserCanAccess(Long userId, UserDetailsImpl authenticatedUser) {
        UserDetailsImpl currentUser = requireAuthenticatedUser(authenticatedUser);
        if (currentUser.getRoleEnum() != Role.ADMIN && !currentUser.getId().equals(userId)) {
            throw new BusinessException("Başka bir kullanıcının verilerine erişemezsiniz.");
        }
    }

    private UserDetailsImpl requireAuthenticatedUser(UserDetailsImpl authenticatedUser) {
        if (authenticatedUser == null) {
            throw new BusinessException("Oturum bulunamadı.");
        }
        return authenticatedUser;
    }
}
