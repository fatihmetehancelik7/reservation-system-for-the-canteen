package com.yemekhane.repository;

import com.yemekhane.entity.MonthlyMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MonthlyMenuRepository extends JpaRepository<MonthlyMenu, Long> {
    Optional<MonthlyMenu> findByTarih(LocalDate tarih);
    List<MonthlyMenu> findByYilAndAyOrderByGunAsc(Integer yil, Integer ay);
}
