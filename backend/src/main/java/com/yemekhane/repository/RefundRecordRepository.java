package com.yemekhane.repository;

import com.yemekhane.entity.RefundRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RefundRecordRepository extends JpaRepository<RefundRecord, Long> {
    List<RefundRecord> findByUserIdOrderByIslemTarihiDesc(Long userId);
    List<RefundRecord> findAllByOrderByIslemTarihiDesc();
}
