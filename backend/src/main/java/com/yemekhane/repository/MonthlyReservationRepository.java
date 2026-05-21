package com.yemekhane.repository;

import com.yemekhane.entity.MonthlyReservation;
import com.yemekhane.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MonthlyReservationRepository extends JpaRepository<MonthlyReservation, Long> {

    List<MonthlyReservation> findByUserIdOrderByIslemTarihiDesc(Long userId);

    Optional<MonthlyReservation> findByUserIdAndYilAndAy(Long userId, Integer yil, Integer ay);

    long countByOdemeDurumu(PaymentStatus status);

    // Sum of toplamTutar for a given payment status
    @Query("SELECT COALESCE(SUM(mr.toplamTutar), 0) FROM MonthlyReservation mr WHERE mr.odemeDurumu = :status")
    double sumToplamTutarByOdemeDurumu(@Param("status") PaymentStatus status);

    // Total revenue across all reservations
    @Query("SELECT COALESCE(SUM(mr.toplamTutar), 0) FROM MonthlyReservation mr")
    double sumAllToplamTutar();

    // Monthly stats: [yil, ay, count, sum]
    @Query("SELECT mr.yil, mr.ay, COUNT(mr), COALESCE(SUM(mr.toplamTutar), 0) FROM MonthlyReservation mr GROUP BY mr.yil, mr.ay ORDER BY mr.yil, mr.ay")
    List<Object[]> findMonthlyStats();

    // Count reservations in current month
    @Query("SELECT COUNT(mr) FROM MonthlyReservation mr WHERE mr.yil = :year AND mr.ay = :month")
    long countByYilAndAy(@Param("year") int year, @Param("month") int month);

    // Count distinct active users (users with at least one reservation)
    @Query("SELECT COUNT(DISTINCT mr.user.id) FROM MonthlyReservation mr")
    long countDistinctUsers();
}
