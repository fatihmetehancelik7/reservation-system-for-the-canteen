package com.yemekhane.repository;

import com.yemekhane.entity.ReservationDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationDayRepository extends JpaRepository<ReservationDay, Long> {

    List<ReservationDay> findByUserIdAndTarihBetween(Long userId, LocalDate baslangic, LocalDate bitis);

    List<ReservationDay> findByMonthlyReservationId(Long monthlyReservationId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM ReservationDay e WHERE e.user.id = :userId")
    void deleteByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    List<ReservationDay> findByTarih(LocalDate tarih);

    boolean existsByTarih(LocalDate tarih);

    // Returns [tarih, count] ordered by count desc — for "most reserved days"
    @Query("SELECT rd.tarih, COUNT(rd) FROM ReservationDay rd GROUP BY rd.tarih ORDER BY COUNT(rd) DESC")
    List<Object[]> findMostReservedDays();

    // Count reservations on a specific date (for percentage share)
    @Query("SELECT COUNT(rd) FROM ReservationDay rd WHERE rd.tarih = :tarih")
    long countByTarih(@Param("tarih") LocalDate tarih);

    // Count distinct days reserved today (where today = :today)
    @Query("SELECT COUNT(rd) FROM ReservationDay rd WHERE rd.tarih = :today")
    long countTodayReservations(@Param("today") LocalDate today);
}
