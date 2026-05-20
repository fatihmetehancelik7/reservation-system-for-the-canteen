package com.yemekhane.repository;

import com.yemekhane.entity.MonthlyReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MonthlyReservationRepository extends JpaRepository<MonthlyReservation, Long> {
    List<MonthlyReservation> findByUserIdOrderByIslemTarihiDesc(Long userId);
    Optional<MonthlyReservation> findByUserIdAndYilAndAy(Long userId, Integer yil, Integer ay);
}
