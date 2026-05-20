package com.yemekhane.dto;

import com.yemekhane.entity.MonthlyReservation;
import com.yemekhane.entity.PaymentStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Data
public class MonthlyReservationDto {
    private Long id;
    private UserDto user;
    private Integer yil;
    private Integer ay;
    private Integer secilenGunSayisi;
    private Double toplamTutar;
    private PaymentStatus odemeDurumu;
    private LocalDateTime islemTarihi;
    private List<LocalDate> secilenGunler;

    public static MonthlyReservationDto fromEntity(MonthlyReservation mr) {
        MonthlyReservationDto dto = new MonthlyReservationDto();
        dto.setId(mr.getId());
        dto.setUser(UserDto.fromEntity(mr.getUser()));
        dto.setYil(mr.getYil());
        dto.setAy(mr.getAy());
        dto.setSecilenGunSayisi(mr.getSecilenGunSayisi());
        dto.setToplamTutar(mr.getToplamTutar());
        dto.setOdemeDurumu(mr.getOdemeDurumu());
        dto.setIslemTarihi(mr.getIslemTarihi());
        if (mr.getReservationDays() != null) {
            dto.setSecilenGunler(mr.getReservationDays().stream().map(d -> d.getTarih()).collect(java.util.stream.Collectors.toList()));
        }
        return dto;
    }
}
