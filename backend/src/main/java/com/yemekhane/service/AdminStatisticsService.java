package com.yemekhane.service;

import com.yemekhane.dto.*;
import com.yemekhane.entity.MonthlyMenu;
import com.yemekhane.entity.PaymentStatus;
import com.yemekhane.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Month;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminStatisticsService {

    // Per-day meal price constant – single source of truth
    static final double DAILY_MEAL_PRICE = 100.0;

    private final MonthlyReservationRepository reservationRepository;
    private final ReservationDayRepository reservationDayRepository;
    private final RefundRecordRepository refundRecordRepository;
    private final HolidayRepository holidayRepository;
    private final MonthlyMenuRepository menuRepository;

    // -------------------------------------------------------------------------
    // 1. Overview
    // -------------------------------------------------------------------------
    public AdminStatisticsOverviewDto getOverview() {
        LocalDate today = LocalDate.now(ZoneId.of("Europe/Istanbul"));
        int currentYear  = today.getYear();
        int currentMonth = today.getMonthValue();

        long totalReservations     = reservationRepository.count();
        long thisMonthReservations = reservationRepository.countByYilAndAy(currentYear, currentMonth);
        long todayReservations     = reservationDayRepository.countTodayReservations(today);
        double totalRevenue        = reservationRepository.sumAllToplamTutar();
        double totalRefundAmount   = refundRecordRepository.findAll()
                                          .stream()
                                          .mapToDouble(r -> Optional.ofNullable(r.getIadeEdilen()).orElse(0.0))
                                          .sum();
        double netRevenue          = totalRevenue - totalRefundAmount;
        long activeUserCount       = reservationRepository.countDistinctUsers();
        long holidayCount          = holidayRepository.count();

        return AdminStatisticsOverviewDto.builder()
                .totalReservations(totalReservations)
                .thisMonthReservations(thisMonthReservations)
                .todayReservations(todayReservations)
                .totalRevenue(totalRevenue)
                .totalRefundAmount(totalRefundAmount)
                .netRevenue(netRevenue)
                .activeUserCount(activeUserCount)
                .holidayCount(holidayCount)
                .build();
    }

    // -------------------------------------------------------------------------
    // 2. Most reserved days
    // -------------------------------------------------------------------------
    public List<MostReservedDayDto> getMostReservedDays(int limit) {
        List<Object[]> rows = reservationDayRepository.findMostReservedDays();
        return rows.stream()
                .limit(limit)
                .map(row -> {
                    LocalDate date = (LocalDate) row[0];
                    long count     = ((Number) row[1]).longValue();
                    return MostReservedDayDto.builder()
                            .reservationDate(date)
                            .dayOfWeek(date.getDayOfWeek()
                                    .getDisplayName(TextStyle.FULL, new Locale("tr")))
                            .reservationCount(count)
                            .estimatedRevenue(count * DAILY_MEAL_PRICE)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // 3. Favorite (most reserved) menus
    //    Logic: join MonthlyMenu.tarih == ReservationDay.tarih
    //    Metric name is "En Çok Rezerve Edilen Menüler" – not "liked menus"
    // -------------------------------------------------------------------------
    public List<FavoriteMenuDto> getFavoriteMenus(int limit) {
        List<Object[]> mostReserved = reservationDayRepository.findMostReservedDays();
        long grandTotal = reservationDayRepository.count();

        return mostReserved.stream()
                .limit(limit)
                .map(row -> {
                    LocalDate date = (LocalDate) row[0];
                    long count     = ((Number) row[1]).longValue();

                    String menuName = menuRepository.findByTarih(date)
                            .map(MonthlyMenu::getYemekListesi)
                            .orElse("Menü bulunamadı");

                    double percentage = grandTotal > 0
                            ? Math.round((count * 100.0 / grandTotal) * 10.0) / 10.0
                            : 0.0;

                    return FavoriteMenuDto.builder()
                            .menuName(menuName)
                            .serviceDate(date)
                            .reservationCount(count)
                            .totalRevenue(count * DAILY_MEAL_PRICE)
                            .percentageShare(percentage)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // 4. Monthly reservation trend
    // -------------------------------------------------------------------------
    public List<MonthlyReservationStatsDto> getMonthlyStats() {
        List<Object[]> rows = reservationRepository.findMonthlyStats();

        // Build refund map: (yil, ay) -> sum of refunds
        Map<String, Double> refundByMonth = new HashMap<>();
        refundRecordRepository.findAll().forEach(r -> {
            if (r.getTatilTarihi() != null) {
                String key = r.getTatilTarihi().getYear() + "-" + r.getTatilTarihi().getMonthValue();
                refundByMonth.merge(key, Optional.ofNullable(r.getIadeEdilen()).orElse(0.0), Double::sum);
            }
        });

        return rows.stream()
                .map(row -> {
                    int year   = ((Number) row[0]).intValue();
                    int month  = ((Number) row[1]).intValue();
                    long count = ((Number) row[2]).longValue();
                    double rev = ((Number) row[3]).doubleValue();
                    double ref = refundByMonth.getOrDefault(year + "-" + month, 0.0);

                    String monthName = Month.of(month)
                            .getDisplayName(TextStyle.FULL, new Locale("tr"));

                    return MonthlyReservationStatsDto.builder()
                            .year(year)
                            .month(month)
                            .monthName(monthName)
                            .reservationCount(count)
                            .revenue(rev)
                            .refundAmount(ref)
                            .netRevenue(rev - ref)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // 5. Payment summary
    // -------------------------------------------------------------------------
    public PaymentSummaryDto getPaymentSummary() {
        long paid    = reservationRepository.countByOdemeDurumu(PaymentStatus.ODENDI);
        long pending = reservationRepository.countByOdemeDurumu(PaymentStatus.BEKLIYOR);
        double totalRev = reservationRepository.sumAllToplamTutar();
        double totalRef = refundRecordRepository.findAll()
                .stream()
                .mapToDouble(r -> Optional.ofNullable(r.getIadeEdilen()).orElse(0.0))
                .sum();

        return PaymentSummaryDto.builder()
                .paidReservationCount(paid)
                .pendingReservationCount(pending)
                .totalRevenue(totalRev)
                .totalRefundAmount(totalRef)
                .netRevenue(totalRev - totalRef)
                .build();
    }

    // -------------------------------------------------------------------------
    // 6. Refund summary
    // -------------------------------------------------------------------------
    public RefundSummaryDto getRefundSummary() {
        var allRefunds = refundRecordRepository.findAll();
        long total     = allRefunds.size();
        long holiday   = allRefunds.stream()
                .filter(r -> r.getTatilTarihi() != null)
                .count();
        double amount  = allRefunds.stream()
                .mapToDouble(r -> Optional.ofNullable(r.getIadeEdilen()).orElse(0.0))
                .sum();

        // Days with most refunds
        Map<LocalDate, Long> refundsByDay = allRefunds.stream()
                .filter(r -> r.getTatilTarihi() != null)
                .collect(Collectors.groupingBy(
                        com.yemekhane.entity.RefundRecord::getTatilTarihi,
                        Collectors.counting()
                ));

        List<MostReservedDayDto> topRefundDays = refundsByDay.entrySet().stream()
                .sorted(Map.Entry.<LocalDate, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> MostReservedDayDto.builder()
                        .reservationDate(e.getKey())
                        .dayOfWeek(e.getKey().getDayOfWeek()
                                .getDisplayName(TextStyle.FULL, new Locale("tr")))
                        .reservationCount(e.getValue())
                        .estimatedRevenue(e.getValue() * DAILY_MEAL_PRICE)
                        .build())
                .collect(Collectors.toList());

        return RefundSummaryDto.builder()
                .totalRefundRecords(total)
                .holidayRefundCount(holiday)
                .totalRefundAmount(amount)
                .mostRefundedDays(topRefundDays)
                .build();
    }
}
