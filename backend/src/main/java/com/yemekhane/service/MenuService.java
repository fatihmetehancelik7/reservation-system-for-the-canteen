package com.yemekhane.service;

import com.yemekhane.dto.MonthlyMenuDto;
import com.yemekhane.entity.MonthlyMenu;
import com.yemekhane.exception.BusinessException;
import com.yemekhane.repository.HolidayRepository;
import com.yemekhane.repository.MonthlyMenuRepository;
import com.yemekhane.repository.ReservationDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MonthlyMenuRepository menuRepository;
    private final HolidayRepository holidayRepository;
    private final ReservationDayRepository reservationDayRepository;

    public List<MonthlyMenuDto> getMenusByMonth(Integer yil, Integer ay) {
        return menuRepository.findByYilAndAyOrderByGunAsc(yil, ay).stream()
                .map(MonthlyMenuDto::fromEntity)
                .collect(Collectors.toList());
    }

    public MonthlyMenuDto createMenu(MonthlyMenuDto request) {
        if (request.getTarih().getYear() != 2026) {
            throw new BusinessException("Sistem yalnızca 2026 yılı için menü kabul etmektedir.");
        }
        
        DayOfWeek day = request.getTarih().getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            throw new BusinessException("Hafta sonu için menü oluşturulamaz.");
        }

        if (holidayRepository.findByTarih(request.getTarih()).isPresent()) {
            throw new BusinessException("Seçilen gün resmi tatil olduğu için menü oluşturulamaz.");
        }

        if (menuRepository.findByTarih(request.getTarih()).isPresent()) {
            throw new BusinessException("Bu tarihte zaten bir menü mevcut.");
        }

        MonthlyMenu menu = new MonthlyMenu();
        menu.setYil(request.getTarih().getYear());
        menu.setAy(request.getTarih().getMonthValue());
        menu.setGun(request.getTarih().getDayOfMonth());
        menu.setTarih(request.getTarih());
        menu.setYemekListesi(request.getYemekListesi());
        menu.setAktifMi(true);

        return MonthlyMenuDto.fromEntity(menuRepository.save(menu));
    }

    public void deleteMenu(Long id) {
        MonthlyMenu menu = menuRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Menü bulunamadı."));
        if (reservationDayRepository.existsByTarih(menu.getTarih())) {
            throw new BusinessException("Bu güne ait rezervasyon bulunduğu için menü silinemez.");
        }
        menuRepository.deleteById(id);
    }
}
