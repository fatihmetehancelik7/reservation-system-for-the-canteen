package com.yemekhane.dto;

import com.yemekhane.entity.MonthlyMenu;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class MonthlyMenuDto {
    private Long id;
    private Integer yil;
    private Integer ay;
    private Integer gun;

    @NotNull(message = "Tarih zorunludur.")
    private LocalDate tarih;

    @NotBlank(message = "Yemek listesi zorunludur.")
    private String yemekListesi;
    private Boolean aktifMi;

    public static MonthlyMenuDto fromEntity(MonthlyMenu menu) {
        MonthlyMenuDto dto = new MonthlyMenuDto();
        dto.setId(menu.getId());
        dto.setYil(menu.getYil());
        dto.setAy(menu.getAy());
        dto.setGun(menu.getGun());
        dto.setTarih(menu.getTarih());
        dto.setYemekListesi(menu.getYemekListesi());
        dto.setAktifMi(menu.getAktifMi());
        return dto;
    }
}
