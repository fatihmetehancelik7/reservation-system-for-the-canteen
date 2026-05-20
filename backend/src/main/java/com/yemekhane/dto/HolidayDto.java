package com.yemekhane.dto;

import com.yemekhane.entity.Holiday;
import lombok.Data;
import java.time.LocalDate;

@Data
public class HolidayDto {
    private Long id;
    private LocalDate tarih;
    private String aciklama;

    public static HolidayDto fromEntity(Holiday holiday) {
        HolidayDto dto = new HolidayDto();
        dto.setId(holiday.getId());
        dto.setTarih(holiday.getTarih());
        dto.setAciklama(holiday.getAciklama());
        return dto;
    }
}
