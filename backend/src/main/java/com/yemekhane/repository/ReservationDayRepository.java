package com.yemekhane.repository;

import com.yemekhane.entity.ReservationDay;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDate;

public interface ReservationDayRepository extends JpaRepository<ReservationDay, Long> {
    List<ReservationDay> findByUserIdAndTarihBetween(Long userId, LocalDate baslangic, LocalDate bitis);
    List<ReservationDay> findByMonthlyReservationId(Long monthlyReservationId);
    List<ReservationDay> findByTarih(LocalDate tarih);
}
