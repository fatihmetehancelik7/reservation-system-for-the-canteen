package com.yemekhane.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatisticsOverviewDto {
    private long totalReservations;
    private long thisMonthReservations;
    private long todayReservations;
    private double totalRevenue;
    private double totalRefundAmount;
    private double netRevenue;
    private long activeUserCount;
    private long holidayCount;
}
