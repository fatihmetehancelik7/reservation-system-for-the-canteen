package com.yemekhane.dto;

import com.yemekhane.entity.PaymentTransaction;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PaymentTransactionDto {
    private Long id;
    private Long userId;
    private Integer yil;
    private Integer ay;
    private LocalDateTime islemTarihi;
    private Integer islemGunSayisi;
    private Double islemTutari;
    private String islemTipi;

    public static PaymentTransactionDto fromEntity(PaymentTransaction entity) {
        PaymentTransactionDto dto = new PaymentTransactionDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        dto.setYil(entity.getYil());
        dto.setAy(entity.getAy());
        dto.setIslemTarihi(entity.getIslemTarihi());
        dto.setIslemGunSayisi(entity.getIslemGunSayisi());
        dto.setIslemTutari(entity.getIslemTutari());
        dto.setIslemTipi(entity.getIslemTipi());
        return dto;
    }
}
