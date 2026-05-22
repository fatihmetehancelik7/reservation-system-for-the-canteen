package com.yemekhane.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(
    name = "monthly_reservations",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_monthly_reservation_user_year_month", columnNames = {"user_id", "yil", "ay"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyReservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Integer yil;
    private Integer ay;

    private Integer secilenGunSayisi;
    private Double toplamTutar;

    @Enumerated(EnumType.STRING)
    private PaymentStatus odemeDurumu = PaymentStatus.PAID;

    @OneToMany(mappedBy = "monthlyReservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ReservationDay> reservationDays;

    private LocalDateTime islemTarihi = LocalDateTime.now(ZoneId.of("Europe/Istanbul"));
}
