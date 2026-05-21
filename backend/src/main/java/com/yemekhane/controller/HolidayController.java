package com.yemekhane.controller;

import com.yemekhane.dto.HolidayDto;
import com.yemekhane.dto.RefundRecordDto;
import com.yemekhane.entity.Role;
import com.yemekhane.entity.User;
import com.yemekhane.exception.BusinessException;
import com.yemekhane.service.HolidayService;
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
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
public class HolidayController {

    private final HolidayService holidayService;

    @GetMapping
    public ResponseEntity<List<HolidayDto>> getAllHolidays() {
        return ResponseEntity.ok(holidayService.getAllHolidays());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<HolidayDto> createHoliday(@Valid @RequestBody HolidayDto request) {
        return ResponseEntity.ok(holidayService.createHoliday(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHoliday(@PathVariable Long id) {
        holidayService.deleteHoliday(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/refunds")
    public ResponseEntity<List<RefundRecordDto>> getAllRefunds() {
        return ResponseEntity.ok(holidayService.getAllRefunds());
    }

    @GetMapping("/refunds/user/{userId}")
    public ResponseEntity<List<RefundRecordDto>> getUserRefunds(@PathVariable Long userId, HttpServletRequest request) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null || "anonymousUser".equals(principal)) {
            throw new BusinessException("Oturum bulunamadı.");
        }
        UserDetailsImpl authenticatedUser = (UserDetailsImpl) principal;
        if (authenticatedUser.getRoleEnum() != Role.ADMIN && !authenticatedUser.getId().equals(userId)) {
            throw new BusinessException("Başka bir kullanıcının iadelerine erişemezsiniz.");
        }
        return ResponseEntity.ok(holidayService.getUserRefunds(userId));
    }

    @PutMapping("/refunds/{id}/mark-refunded")
    public ResponseEntity<Void> markRefunded(@PathVariable Long id) {
        holidayService.markRefunded(id);
        return ResponseEntity.ok().build();
    }
}
