package com.yemekhane.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MostReservedDayDto {
    private LocalDate reservationDate;
    private String dayOfWeek;
    private long reservationCount;
    private double estimatedRevenue;
}
