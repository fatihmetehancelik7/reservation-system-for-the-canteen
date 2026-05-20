package com.yemekhane.dto;

import com.yemekhane.entity.Holiday;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class HolidayDto {
    private Long id;

    @NotNull(message = "Tarih zorunludur.")
    private LocalDate tarih;

    @NotBlank(message = "Açıklama zorunludur.")
    private String aciklama;

    public static HolidayDto fromEntity(Holiday holiday) {
        HolidayDto dto = new HolidayDto();
        dto.setId(holiday.getId());
        dto.setTarih(holiday.getTarih());
        dto.setAciklama(holiday.getAciklama());
        return dto;
    }
}
