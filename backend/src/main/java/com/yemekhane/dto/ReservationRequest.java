package com.yemekhane.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ReservationRequest {
    private Long userId;
    private Integer yil;
    private Integer ay;
    private List<LocalDate> secilenGunler;
}
