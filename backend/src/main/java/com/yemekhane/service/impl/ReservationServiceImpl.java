package com.yemekhane.service.impl;

import com.yemekhane.dto.MonthlyReservationDto;
import com.yemekhane.dto.ReservationRequest;
import com.yemekhane.entity.MonthlyReservation;
import com.yemekhane.entity.PaymentStatus;
import com.yemekhane.entity.PaymentTransaction;
import com.yemekhane.entity.RefundRecord;
import com.yemekhane.entity.ReservationDay;
import com.yemekhane.entity.Role;
import com.yemekhane.entity.User;
import com.yemekhane.exception.BusinessException;
import com.yemekhane.repository.HolidayRepository;
import com.yemekhane.repository.MonthlyMenuRepository;
import com.yemekhane.repository.MonthlyReservationRepository;
import com.yemekhane.repository.PaymentTransactionRepository;
import com.yemekhane.repository.RefundRecordRepository;
import com.yemekhane.repository.UserRepository;
import com.yemekhane.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private static final int ACTIVE_YEAR = 2026;
    private static final double DAILY_PRICE = 100.0;

    private final MonthlyReservationRepository reservationRepository;
    private final MonthlyMenuRepository menuRepository;
    private final HolidayRepository holidayRepository;
    private final RefundRecordRepository refundRecordRepository;
    private final UserRepository userRepository;
    private final PaymentTransactionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MonthlyReservationDto> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .map(MonthlyReservationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MonthlyReservationDto> getUserReservations(Long userId) {
        return reservationRepository.findByUserIdOrderByIslemTarihiDesc(userId)
                .stream()
                .map(MonthlyReservationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MonthlyReservationDto createMonthlyReservation(ReservationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BusinessException("Kullanıcı bulunamadı."));
        if (user.getRol() != Role.KULLANICI) {
            throw new BusinessException("Yalnızca kullanıcı hesabı için rezervasyon oluşturulabilir.");
        }

        if (request.getSecilenGunler().isEmpty()) {
            throw new BusinessException("En az bir gün seçilmelidir.");
        }
        validateReservationRequest(request, null);

        reservationRepository.findByUserIdAndYilAndAy(request.getUserId(), request.getYil(), request.getAy())
                .ifPresent(r -> {
                    throw new BusinessException("Bu ay için zaten bir rezervasyon mevcut.");
                });

        MonthlyReservation reservation = new MonthlyReservation();
        reservation.setUser(user);
        applyReservationValues(reservation, request);

        List<ReservationDay> days = buildReservationDays(request, reservation, user);
        reservation.setReservationDays(days);

        MonthlyReservation savedReservation = reservationRepository.save(reservation);

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setUser(user);
        transaction.setYil(request.getYil());
        transaction.setAy(request.getAy());
        transaction.setIslemTarihi(savedReservation.getIslemTarihi());
        transaction.setIslemGunSayisi(savedReservation.getSecilenGunSayisi());
        transaction.setIslemTutari(savedReservation.getToplamTutar());
        transaction.setIslemTipi("YENİ REZERVASYON");
        transactionRepository.save(transaction);

        return MonthlyReservationDto.fromEntity(savedReservation);
    }

    @Override
    @Transactional
    public MonthlyReservationDto updateMonthlyReservation(Long id, ReservationRequest request) {
        MonthlyReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Rezervasyon bulunamadı."));

        if (!reservation.getUser().getId().equals(request.getUserId())) {
            throw new BusinessException("Rezervasyon kullanıcı bilgisi ile istek kullanıcı bilgisi uyuşmuyor.");
        }

        validateReservationRequest(request, reservation);
        createRefundsForCancelledDays(reservation, request);

        int oldDays = reservation.getSecilenGunSayisi() != null ? reservation.getSecilenGunSayisi() : 0;
        int newDays = request.getSecilenGunler().size();
        int diffDays = newDays - oldDays;

        applyReservationValues(reservation, request);

        if (reservation.getReservationDays() == null) {
            reservation.setReservationDays(new java.util.ArrayList<>());
        } else {
            reservation.getReservationDays().clear();
        }

        reservation.getReservationDays().addAll(buildReservationDays(request, reservation, reservation.getUser()));

        MonthlyReservation savedReservation = reservationRepository.save(reservation);

        if (diffDays != 0) {
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setUser(reservation.getUser());
            transaction.setYil(request.getYil());
            transaction.setAy(request.getAy());
            transaction.setIslemTarihi(savedReservation.getIslemTarihi());
            transaction.setIslemGunSayisi(diffDays);
            transaction.setIslemTutari(diffDays * DAILY_PRICE);
            transaction.setIslemTipi(diffDays > 0 ? "EK ÖDEME" : "İPTAL");
            transactionRepository.save(transaction);
        }

        return MonthlyReservationDto.fromEntity(savedReservation);
    }

    private void applyReservationValues(MonthlyReservation reservation, ReservationRequest request) {
        reservation.setYil(request.getYil());
        reservation.setAy(request.getAy());
        reservation.setSecilenGunSayisi(request.getSecilenGunler().size());
        reservation.setToplamTutar(request.getSecilenGunler().size() * DAILY_PRICE);
        reservation.setOdemeDurumu(PaymentStatus.ODENDI);
        reservation.setIslemTarihi(LocalDateTime.now(ZoneId.of("Europe/Istanbul")));
    }

    private List<ReservationDay> buildReservationDays(ReservationRequest request, MonthlyReservation reservation, User user) {
        return request.getSecilenGunler().stream()
                .map(date -> {
                    ReservationDay day = new ReservationDay();
                    day.setMonthlyReservation(reservation);
                    day.setUser(user);
                    day.setTarih(date);
                    return day;
                })
                .collect(Collectors.toList());
    }

    private void validateReservationRequest(ReservationRequest request, MonthlyReservation existingReservation) {
        if (request.getYil() != ACTIVE_YEAR) {
            throw new BusinessException("Sistem yalnızca 2026 yılı için çalışmaktadır.");
        }

        Set<LocalDate> uniqueDates = new HashSet<>(request.getSecilenGunler());
        Set<LocalDate> existingDates = existingReservation == null || existingReservation.getReservationDays() == null
                ? Set.of()
                : existingReservation.getReservationDays().stream()
                        .map(ReservationDay::getTarih)
                        .collect(Collectors.toSet());

        if (uniqueDates.size() != request.getSecilenGunler().size()) {
            throw new BusinessException("Aynı gün birden fazla seçilemez.");
        }

        LocalDate today = LocalDate.now(ZoneId.of("Europe/Istanbul"));
        for (LocalDate date : uniqueDates) {
            if (date == null) {
                throw new BusinessException("Seçilen günler boş olamaz.");
            }
            if (date.getYear() != request.getYil() || date.getMonthValue() != request.getAy()) {
                throw new BusinessException("Seçilen günler rezervasyon ayı ve yılı ile uyumlu olmalıdır.");
            }
            boolean existingPastReservationDay = !date.isAfter(today) && existingDates.contains(date);
            if (!date.isAfter(today) && !existingPastReservationDay) {
                throw new BusinessException("Bugün veya geçmiş günler için rezervasyon yapılamaz.");
            }
            if (existingPastReservationDay) {
                continue;
            }
            if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                throw new BusinessException("Hafta sonu için rezervasyon yapılamaz.");
            }
            if (holidayRepository.findByTarih(date).isPresent()) {
                throw new BusinessException("Tatil günü için rezervasyon yapılamaz: " + date);
            }
            if (menuRepository.findByTarih(date).isEmpty()) {
                throw new BusinessException("Menüsü tanımlanmamış gün için rezervasyon yapılamaz: " + date);
            }
        }

        if (existingReservation != null) {
            Set<LocalDate> removedDates = new HashSet<>(existingDates);
            removedDates.removeAll(uniqueDates);

            boolean removesPastOrToday = removedDates.stream().anyMatch(date -> !date.isAfter(today));
            if (removesPastOrToday) {
                throw new BusinessException("Bugün veya geçmiş günlere ait rezervasyonlar iptal edilemez.");
            }
        }
    }

    private void createRefundsForCancelledDays(MonthlyReservation reservation, ReservationRequest request) {
        if (reservation.getReservationDays() == null) {
            return;
        }

        Set<LocalDate> requestedDates = new HashSet<>(request.getSecilenGunler());
        List<LocalDate> cancelledDates = reservation.getReservationDays().stream()
                .map(ReservationDay::getTarih)
                .filter(date -> !requestedDates.contains(date))
                .filter(date -> date.isAfter(LocalDate.now(ZoneId.of("Europe/Istanbul"))))
                .collect(Collectors.toList());

        for (LocalDate date : cancelledDates) {
            if (refundRecordRepository.existsByUserIdAndTatilTarihi(reservation.getUser().getId(), date)) {
                continue;
            }

            RefundRecord refund = new RefundRecord();
            refund.setUser(reservation.getUser());
            refund.setTatilTarihi(date);
            refund.setTatilAciklama("Kullanıcı rezervasyon iptali");
            refund.setIadeEdilen(0.0);
            refundRecordRepository.save(refund);
        }
    }
}
