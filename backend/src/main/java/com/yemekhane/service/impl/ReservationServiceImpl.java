package com.yemekhane.service.impl;

import com.yemekhane.dto.MonthlyReservationDto;
import com.yemekhane.dto.ReservationRequest;
import com.yemekhane.entity.MonthlyReservation;
import com.yemekhane.entity.PaymentStatus;
import com.yemekhane.entity.PaymentTransaction;
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
import com.yemekhane.service.factory.ReservationFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
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

    @Value("${app.constants.daily-price:100.0}")
    private double dailyPrice;

    @Value("${app.constants.active-year:2026}")
    private int activeYear;

    @Value("${app.constants.timezone:Europe/Istanbul}")
    private String timezone;

    private final MonthlyReservationRepository reservationRepository;
    private final MonthlyMenuRepository menuRepository;
    private final HolidayRepository holidayRepository;
    private final RefundRecordRepository refundRecordRepository;
    private final UserRepository userRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final ReservationFactory reservationFactory;

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
        if (Boolean.FALSE.equals(user.getActive())) {
            throw new BusinessException("Pasif kullanıcı için rezervasyon oluşturulamaz.");
        }
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
        applyReservationValues(reservation, request, PaymentStatus.PAID);
        reservation.setReservationDays(buildReservationDays(request, reservation, user));

        try {
            MonthlyReservation savedReservation = reservationRepository.save(reservation);
            createPaymentTransaction(user, request.getYil(), request.getAy(), savedReservation.getIslemTarihi(), savedReservation.getSecilenGunSayisi(), savedReservation.getToplamTutar(), "YENİ REZERVASYON");
            return MonthlyReservationDto.fromEntity(savedReservation);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException("Bu ay için zaten bir rezervasyon mevcut.");
        }
    }

    @Override
    @Transactional
    public MonthlyReservationDto updateMonthlyReservation(Long id, ReservationRequest request) {
        MonthlyReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Rezervasyon bulunamadı."));

        if (!reservation.getUser().getId().equals(request.getUserId())) {
            throw new BusinessException("Rezervasyon kullanıcı bilgisi ile istek kullanıcı bilgisi uyuşmuyor.");
        }
        if (Boolean.FALSE.equals(reservation.getUser().getActive())) {
            throw new BusinessException("Pasif kullanıcı rezervasyonu güncellenemez.");
        }

        int oldDays = reservation.getSecilenGunSayisi() != null ? reservation.getSecilenGunSayisi() : 0;
        int newDays = request.getSecilenGunler().size();
        int diffDays = newDays - oldDays;

        validateReservationRequest(request, reservation);
        createRefundsForCancelledDays(reservation, request, diffDays);

        PaymentStatus nextStatus = diffDays < 0 ? PaymentStatus.REFUND_PENDING : PaymentStatus.PAID;
        applyReservationValues(reservation, request, nextStatus);

        if (reservation.getReservationDays() == null) {
            reservation.setReservationDays(new java.util.ArrayList<>());
        } else {
            reservation.getReservationDays().clear();
        }
        reservation.getReservationDays().addAll(buildReservationDays(request, reservation, reservation.getUser()));

        MonthlyReservation savedReservation = reservationRepository.save(reservation);

        if (diffDays != 0) {
            createPaymentTransaction(
                    reservation.getUser(),
                    request.getYil(),
                    request.getAy(),
                    savedReservation.getIslemTarihi(),
                    diffDays,
                    Math.abs(diffDays * dailyPrice),
                    diffDays > 0 ? "EK ÖDEME" : "İPTAL"
            );
        }

        return MonthlyReservationDto.fromEntity(savedReservation);
    }

    @Override
    @Transactional
    public List<MonthlyReservationDto> processBulkReservations(com.yemekhane.dto.BulkReservationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BusinessException("Kullanıcı bulunamadı."));
        if (Boolean.FALSE.equals(user.getActive())) {
            throw new BusinessException("Pasif kullanıcı için rezervasyon işlemi yapılamaz.");
        }

        if (request.getYil() != activeYear) {
            throw new BusinessException("Sistem yalnızca " + activeYear + " yılı için çalışmaktadır.");
        }

        int totalOldDays = 0;
        int totalNewDays = 0;
        List<LocalDate> allNetCancelledDates = new java.util.ArrayList<>();
        List<MonthlyReservation> savedReservations = new java.util.ArrayList<>();

        for (com.yemekhane.dto.BulkReservationRequest.MonthSelection selection : request.getSelections()) {
            totalNewDays += selection.getSecilenGunler().size();

            if (selection.getExistingReservationId() != null) {
                MonthlyReservation reservation = reservationRepository.findById(selection.getExistingReservationId())
                        .orElseThrow(() -> new BusinessException("Rezervasyon bulunamadı."));

                if (!reservation.getUser().getId().equals(request.getUserId())) {
                    throw new BusinessException("Rezervasyon kullanıcı bilgisi ile istek kullanıcı bilgisi uyuşmuyor.");
                }

                int oldDays = reservation.getSecilenGunSayisi() != null ? reservation.getSecilenGunSayisi() : 0;
                totalOldDays += oldDays;

                Set<LocalDate> requestedDates = new HashSet<>(selection.getSecilenGunler());
                List<LocalDate> cancelledDates = reservation.getReservationDays() != null ?
                        reservation.getReservationDays().stream()
                        .map(ReservationDay::getTarih)
                        .filter(date -> !requestedDates.contains(date))
                        .filter(date -> date.isAfter(LocalDate.now(ZoneId.of(timezone))))
                        .collect(Collectors.toList()) : new java.util.ArrayList<>();
                allNetCancelledDates.addAll(cancelledDates);

                ReservationRequest tempReq = new ReservationRequest();
                tempReq.setUserId(user.getId());
                tempReq.setYil(request.getYil());
                tempReq.setAy(selection.getAy());
                tempReq.setSecilenGunler(selection.getSecilenGunler());
                validateReservationRequest(tempReq, reservation);
                applyReservationValues(reservation, tempReq, PaymentStatus.PAID);

                if (reservation.getReservationDays() == null) {
                    reservation.setReservationDays(new java.util.ArrayList<>());
                } else {
                    reservation.getReservationDays().clear();
                }
                reservation.getReservationDays().addAll(buildReservationDays(tempReq, reservation, user));
                savedReservations.add(reservationRepository.save(reservation));
            } else {
                ReservationRequest tempReq = new ReservationRequest();
                tempReq.setUserId(user.getId());
                tempReq.setYil(request.getYil());
                tempReq.setAy(selection.getAy());
                tempReq.setSecilenGunler(selection.getSecilenGunler());
                validateReservationRequest(tempReq, null);

                MonthlyReservation reservation = new MonthlyReservation();
                reservation.setUser(user);
                applyReservationValues(reservation, tempReq, PaymentStatus.PAID);
                reservation.setReservationDays(buildReservationDays(tempReq, reservation, user));
                savedReservations.add(reservationRepository.save(reservation));
            }
        }

        int globalDiffDays = totalNewDays - totalOldDays;

        if (globalDiffDays < 0) {
            int netCancelledCount = Math.abs(globalDiffDays);
            List<LocalDate> datesToRefund = allNetCancelledDates.stream()
                    .limit(netCancelledCount)
                    .collect(Collectors.toList());

            refundRecordRepository.saveAll(reservationFactory.buildRefundRecords(user, datesToRefund, dailyPrice));
            savedReservations.forEach(reservation -> reservation.setOdemeDurumu(PaymentStatus.REFUND_PENDING));
        }

        if (globalDiffDays != 0) {
            createPaymentTransaction(
                    user,
                    request.getYil(),
                    request.getSelections().isEmpty() ? 1 : request.getSelections().get(0).getAy(),
                    LocalDateTime.now(ZoneId.of(timezone)),
                    Math.abs(globalDiffDays),
                    Math.abs(globalDiffDays * dailyPrice),
                    globalDiffDays > 0 ? "EK ÖDEME" : "İPTAL"
            );
        }

        return savedReservations.stream().map(MonthlyReservationDto::fromEntity).collect(Collectors.toList());
    }

    private void applyReservationValues(MonthlyReservation reservation, ReservationRequest request, PaymentStatus status) {
        reservationFactory.applyReservationValues(reservation, request.getYil(), request.getAy(), request.getSecilenGunler().size(), dailyPrice, status);
        reservation.setIslemTarihi(LocalDateTime.now(ZoneId.of(timezone)));
    }

    private void createPaymentTransaction(User user, Integer yil, Integer ay, LocalDateTime islemTarihi, Integer gunSayisi, Double tutar, String islemTipi) {
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setUser(user);
        transaction.setYil(yil);
        transaction.setAy(ay);
        transaction.setIslemTarihi(islemTarihi);
        transaction.setIslemGunSayisi(gunSayisi);
        transaction.setIslemTutari(tutar);
        transaction.setIslemTipi(islemTipi);
        transactionRepository.save(transaction);
    }

    private List<ReservationDay> buildReservationDays(ReservationRequest request, MonthlyReservation reservation, User user) {
        return reservationFactory.buildReservationDays(request.getSecilenGunler(), reservation, user);
    }

    private void validateReservationRequest(ReservationRequest request, MonthlyReservation existingReservation) {
        if (request.getYil() != activeYear) {
            throw new BusinessException("Sistem yalnızca " + activeYear + " yılı için çalışmaktadır.");
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

        LocalDate today = LocalDate.now(ZoneId.of(timezone));
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

    private void createRefundsForCancelledDays(MonthlyReservation reservation, ReservationRequest request, int diffDays) {
        if (reservation.getReservationDays() == null || diffDays >= 0) {
            return;
        }

        Set<LocalDate> requestedDates = new HashSet<>(request.getSecilenGunler());
        List<LocalDate> cancelledDates = reservation.getReservationDays().stream()
                .map(ReservationDay::getTarih)
                .filter(date -> !requestedDates.contains(date))
                .filter(date -> date.isAfter(LocalDate.now(ZoneId.of(timezone))))
                .collect(Collectors.toList());

        int netCancelledCount = Math.abs(diffDays);
        List<LocalDate> netCancelledDates = cancelledDates.stream()
                .limit(netCancelledCount)
                .collect(Collectors.toList());

        refundRecordRepository.saveAll(reservationFactory.buildRefundRecords(reservation.getUser(), netCancelledDates, dailyPrice));
    }
}
