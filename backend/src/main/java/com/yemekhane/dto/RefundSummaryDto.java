package com.yemekhane.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundSummaryDto {
    private long totalRefundRecords;
    private long holidayRefundCount;
    private double totalRefundAmount;
    private List<MostReservedDayDto> mostRefundedDays;
}
