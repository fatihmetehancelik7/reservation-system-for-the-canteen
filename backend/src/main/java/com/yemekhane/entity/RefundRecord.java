package com.yemekhane.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "refund_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefundRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate tatilTarihi;       // The holiday date that triggered refund
    private String tatilAciklama;        // Holiday description
    private Double iadeEdilen;           // Amount refunded (100.0 per day)
    private LocalDateTime islemTarihi;   // When the refund was processed

    @PrePersist
    protected void onCreate() {
        this.islemTarihi = LocalDateTime.now();
    }
}
