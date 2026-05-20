package com.yemekhane.config;

import com.yemekhane.entity.*;
import com.yemekhane.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HolidayRepository holidayRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Admin
            User admin = new User();
            admin.setAd("Admin");
            admin.setSoyad("Sistem");
            admin.setEmail("admin@yemekhane.com");
            admin.setSifre("123456");
            admin.setRol(Role.ADMIN);
            userRepository.save(admin);

            // Kullanıcı
            User user = new User();
            user.setAd("Standart");
            user.setSoyad("Kullanıcı");
            user.setEmail("kullanici@yemekhane.com");
            user.setSifre("123456");
            user.setRol(Role.KULLANICI);
            userRepository.save(user);

            // 2. Kullanıcı
            User user2 = new User();
            user2.setAd("Ahmet");
            user2.setSoyad("Yılmaz");
            user2.setEmail("ahmet@yemekhane.com");
            user2.setSifre("123456");
            user2.setRol(Role.KULLANICI);
            userRepository.save(user2);

            // 2026 yılı için örnek 1 resmi tatil (Yılbaşı)
            Holiday holiday = new Holiday();
            holiday.setTarih(LocalDate.of(2026, 1, 1));
            holiday.setAciklama("Yılbaşı");
            holidayRepository.save(holiday);
        }
    }
}
