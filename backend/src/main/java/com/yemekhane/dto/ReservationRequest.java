package com.yemekhane.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ReservationRequest {
    @NotNull(message = "Kullanıcı zorunludur.")
    private Long userId;

    @NotNull(message = "Yıl zorunludur.")
    private Integer yil;

    @NotNull(message = "Ay zorunludur.")
    @Min(value = 1, message = "Ay 1 ile 12 arasında olmalıdır.")
    @Max(value = 12, message = "Ay 1 ile 12 arasında olmalıdır.")
    private Integer ay;

    @NotNull(message = "Seçilen gün listesi zorunludur.")
    private List<LocalDate> secilenGunler;
}
