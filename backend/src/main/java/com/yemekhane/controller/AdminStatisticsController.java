package com.yemekhane.controller;

import com.yemekhane.dto.*;
import com.yemekhane.service.AdminStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin-only statistics endpoints.
 * TODO: Add role-based security guard when Spring Security is introduced.
 *       Currently, admin-only access is enforced at the frontend routing layer.
 */
@RestController
@RequestMapping("/api/admin/statistics")
@RequiredArgsConstructor
public class AdminStatisticsController {

    private final AdminStatisticsService statisticsService;

    @GetMapping("/overview")
    public ResponseEntity<AdminStatisticsOverviewDto> getOverview() {
        return ResponseEntity.ok(statisticsService.getOverview());
    }

    @GetMapping("/most-reserved-days")
    public ResponseEntity<List<MostReservedDayDto>> getMostReservedDays(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getMostReservedDays(limit));
    }

    @GetMapping("/most-cancelled-days")
    public ResponseEntity<List<MostReservedDayDto>> getMostCancelledDays(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getMostCancelledDays(limit));
    }

    @GetMapping("/favorite-menus")
    public ResponseEntity<List<FavoriteMenuDto>> getFavoriteMenus(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getFavoriteMenus(limit));
    }

    @GetMapping("/monthly-reservations")
    public ResponseEntity<List<MonthlyReservationStatsDto>> getMonthlyStats() {
        return ResponseEntity.ok(statisticsService.getMonthlyStats());
    }

    @GetMapping("/payment-summary")
    public ResponseEntity<PaymentSummaryDto> getPaymentSummary() {
        return ResponseEntity.ok(statisticsService.getPaymentSummary());
    }

    @GetMapping("/refund-summary")
    public ResponseEntity<RefundSummaryDto> getRefundSummary() {
        return ResponseEntity.ok(statisticsService.getRefundSummary());
    }
}
