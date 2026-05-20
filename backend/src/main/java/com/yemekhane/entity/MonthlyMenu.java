package com.yemekhane.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "monthly_menus")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyMenu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer yil;
    private Integer ay;
    private Integer gun;

    @Column(unique = true, nullable = false)
    private LocalDate tarih; // Yıl, ay, gün kombinasyonunun kolay erişimi için

    private String yemekListesi; // Örn: "Mercimek Çorbası, Tavuk Sote, Pilav"
    
    private Boolean aktifMi = true;
}
