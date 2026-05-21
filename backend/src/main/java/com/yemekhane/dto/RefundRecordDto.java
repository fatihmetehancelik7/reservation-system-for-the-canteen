package com.yemekhane.dto;

import com.yemekhane.entity.RefundRecord;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RefundRecordDto {
    private Long id;
    private UserDto user;
    private LocalDate tatilTarihi;
    private String tatilAciklama;
    private Double iadeEdilen;
    private LocalDateTime islemTarihi;
    private Boolean isRefunded;

    public static RefundRecordDto fromEntity(RefundRecord r) {
        RefundRecordDto dto = new RefundRecordDto();
        dto.setId(r.getId());
        dto.setUser(UserDto.fromEntity(r.getUser()));
        dto.setTatilTarihi(r.getTatilTarihi());
        dto.setTatilAciklama(r.getTatilAciklama());
        dto.setIadeEdilen(r.getIadeEdilen());
        dto.setIslemTarihi(r.getIslemTarihi());
        dto.setIsRefunded(r.getIsRefunded());
        return dto;
    }
}
