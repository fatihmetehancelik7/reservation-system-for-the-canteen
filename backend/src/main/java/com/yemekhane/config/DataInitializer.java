package com.yemekhane.config;

import com.yemekhane.entity.*;
import com.yemekhane.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HolidayRepository holidayRepository;

    @Override
    public void run(String... args) throws Exception {

        // ── Users ─────────────────────────────────────────────────────────────
        if (userRepository.count() == 0) {

            userRepository.saveAll(List.of(
                user("Admin",   "Sistem",   "admin@yemekhane.com",       Role.ADMIN),
                user("Standart","Kullanıcı","kullanici@yemekhane.com",   Role.KULLANICI),
                user("Ahmet",   "Yılmaz",  "ahmet@yemekhane.com",       Role.KULLANICI),
                user("Ayşe",    "Kaya",    "ayse@yemekhane.com",        Role.KULLANICI),
                user("Mehmet",  "Demir",   "mehmet@yemekhane.com",      Role.KULLANICI),
                user("Zeynep",  "Çelik",   "zeynep@yemekhane.com",      Role.KULLANICI),
                user("Mustafa", "Öztürk",  "mustafa@yemekhane.com",     Role.KULLANICI)
            ));
        }

        // ── 2026 Resmi Tatilleri ───────────────────────────────────────────────
        if (holidayRepository.count() == 0) {
            holidayRepository.saveAll(List.of(
                holiday(LocalDate.of(2026, 1,  1),  "Yılbaşı"),
                holiday(LocalDate.of(2026, 4, 23),  "Ulusal Egemenlik ve Çocuk Bayramı"),
                holiday(LocalDate.of(2026, 5,  1),  "Emek ve Dayanışma Günü"),
                holiday(LocalDate.of(2026, 5, 19),  "Atatürk'ü Anma, Gençlik ve Spor Bayramı"),
                // Ramazan Bayramı 2026 (tahmini 20-23 Mart)
                holiday(LocalDate.of(2026, 3, 20),  "Ramazan Bayramı 1. Gün"),
                holiday(LocalDate.of(2026, 3, 21),  "Ramazan Bayramı 2. Gün"),
                holiday(LocalDate.of(2026, 3, 22),  "Ramazan Bayramı 3. Gün"),
                // Kurban Bayramı 2026 (tahmini 27-30 Mayıs)
                holiday(LocalDate.of(2026, 5, 27),  "Kurban Bayramı 1. Gün"),
                holiday(LocalDate.of(2026, 5, 28),  "Kurban Bayramı 2. Gün"),
                holiday(LocalDate.of(2026, 5, 29),  "Kurban Bayramı 3. Gün"),
                holiday(LocalDate.of(2026, 5, 30),  "Kurban Bayramı 4. Gün"),
                holiday(LocalDate.of(2026, 7, 15),  "Demokrasi ve Millî Birlik Günü"),
                holiday(LocalDate.of(2026, 8, 30),  "Zafer Bayramı"),
                holiday(LocalDate.of(2026, 10, 29), "Cumhuriyet Bayramı")
            ));
        }
    }

    private User user(String ad, String soyad, String email, Role rol) {
        User u = new User();
        u.setAd(ad);
        u.setSoyad(soyad);
        u.setEmail(email);
        u.setSifre("123456");
        u.setRol(rol);
        return u;
    }

    private Holiday holiday(LocalDate tarih, String aciklama) {
        Holiday h = new Holiday();
        h.setTarih(tarih);
        h.setAciklama(aciklama);
        return h;
    }
}
