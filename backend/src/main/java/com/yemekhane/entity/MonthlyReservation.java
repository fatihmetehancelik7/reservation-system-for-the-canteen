package com.yemekhane.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "monthly_reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyReservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Integer yil;
    private Integer ay;

    private Integer secilenGunSayisi;
    private Double toplamTutar;

    @Enumerated(EnumType.STRING)
    private PaymentStatus odemeDurumu = PaymentStatus.ODENDI;

    @OneToMany(mappedBy = "monthlyReservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ReservationDay> reservationDays;

    private LocalDateTime islemTarihi = LocalDateTime.now();
}
