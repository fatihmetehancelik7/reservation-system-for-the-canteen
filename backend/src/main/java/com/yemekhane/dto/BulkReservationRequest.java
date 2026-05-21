package com.yemekhane.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class BulkReservationRequest {

    @NotNull(message = "Kullanıcı bilgisi boş olamaz.")
    private Long userId;

    @NotNull(message = "Yıl bilgisi boş olamaz.")
    private Integer yil;

    private List<MonthSelection> selections;

    @Data
    public static class MonthSelection {
        @NotNull(message = "Ay bilgisi boş olamaz.")
        private Integer ay;

        @NotNull(message = "Seçilen günler listesi boş olamaz.")
        private List<LocalDate> secilenGunler;

        private Long existingReservationId;
    }
}
