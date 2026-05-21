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
public class FavoriteMenuDto {
    private String menuName;
    private LocalDate serviceDate;
    private long reservationCount;
    private double totalRevenue;
    private double percentageShare; // share out of all reservations on that day
}
