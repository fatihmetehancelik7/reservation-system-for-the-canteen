package com.yemekhane.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyReservationStatsDto {
    private int year;
    private int month;
    private String monthName;
    private long reservationCount;
    private double revenue;
    private double refundAmount;
    private double netRevenue;
}
