package com.yemekhane.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSummaryDto {
    private long paidReservationCount;
    private long pendingReservationCount;
    private double totalRevenue;
    private double totalRefundAmount;
    private double netRevenue;
}
