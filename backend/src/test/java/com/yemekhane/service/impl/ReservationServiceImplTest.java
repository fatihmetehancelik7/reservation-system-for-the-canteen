package com.yemekhane.service.impl;

import com.yemekhane.dto.ReservationRequest;
import com.yemekhane.entity.MonthlyMenu;
import com.yemekhane.entity.User;
import com.yemekhane.exception.BusinessException;
import com.yemekhane.repository.MonthlyMenuRepository;
import com.yemekhane.repository.MonthlyReservationRepository;
import com.yemekhane.repository.UserRepository;
import com.yemekhane.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:reservation_service_test;DB_CLOSE_DELAY=-1;MODE=LEGACY",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.h2.console.enabled=false",
        "app.constants.active-year=2026",
        "app.constants.daily-price=100.0",
        "app.constants.timezone=Europe/Istanbul",
        "app.security.jwt-secret=reservation-service-test-secret-key-that-is-long-enough"
})
class ReservationServiceImplTest {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MonthlyMenuRepository menuRepository;

    @Autowired
    private MonthlyReservationRepository reservationRepository;

    private User user;

    @BeforeEach
    void setUp() {
        user = userRepository.findByEmailAndActiveTrue("kullanici@yemekhane.com")
                .orElseThrow();
    }

    @Test
    void createsReservationWhenBusinessRulesAreSatisfied() {
        LocalDate date = LocalDate.of(2026, 6, 2);
        createMenu(date);

        ReservationRequest request = request(date);

        var reservation = reservationService.createMonthlyReservation(request);

        assertThat(reservation.getSecilenGunSayisi()).isEqualTo(1);
        assertThat(reservation.getToplamTutar()).isEqualTo(100.0);
        assertThat(reservationRepository.findByUserIdAndYilAndAy(user.getId(), 2026, 6)).isPresent();
    }

    @Test
    void rejectsDuplicateSelectedDays() {
        LocalDate date = LocalDate.of(2026, 6, 3);
        createMenu(date);

        ReservationRequest request = new ReservationRequest();
        request.setUserId(user.getId());
        request.setYil(2026);
        request.setAy(6);
        request.setSecilenGunler(List.of(date, date));

        assertThatThrownBy(() -> reservationService.createMonthlyReservation(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Aynı gün");
    }

    @Test
    void rejectsWeekendReservation() {
        LocalDate saturday = LocalDate.of(2026, 6, 6);
        createMenu(saturday);

        assertThatThrownBy(() -> reservationService.createMonthlyReservation(request(saturday)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Hafta sonu");
    }

    @Test
    void rejectsDateWithoutMenu() {
        LocalDate dateWithoutMenu = LocalDate.of(2026, 6, 4);

        assertThatThrownBy(() -> reservationService.createMonthlyReservation(request(dateWithoutMenu)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Menüsü tanımlanmamış");
    }

    private ReservationRequest request(LocalDate date) {
        ReservationRequest request = new ReservationRequest();
        request.setUserId(user.getId());
        request.setYil(date.getYear());
        request.setAy(date.getMonthValue());
        request.setSecilenGunler(List.of(date));
        return request;
    }

    private void createMenu(LocalDate date) {
        MonthlyMenu menu = new MonthlyMenu();
        menu.setYil(date.getYear());
        menu.setAy(date.getMonthValue());
        menu.setGun(date.getDayOfMonth());
        menu.setTarih(date);
        menu.setYemekListesi("Test Çorba, Test Ana Yemek, Test Pilav");
        menu.setAktifMi(true);
        menuRepository.save(menu);
    }
}
