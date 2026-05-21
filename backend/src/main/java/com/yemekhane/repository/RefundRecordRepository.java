package com.yemekhane.repository;

import com.yemekhane.entity.RefundRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface RefundRecordRepository extends JpaRepository<RefundRecord, Long> {
    List<RefundRecord> findByUserIdOrderByIslemTarihiDesc(Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM RefundRecord e WHERE e.user.id = :userId")
    void deleteByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
    List<RefundRecord> findAllByOrderByIslemTarihiDesc();
    boolean existsByUserIdAndTatilTarihi(Long userId, LocalDate tatilTarihi);
}
