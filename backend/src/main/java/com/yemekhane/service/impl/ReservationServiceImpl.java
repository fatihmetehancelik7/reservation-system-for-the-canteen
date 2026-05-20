package com.yemekhane.service.impl;

import com.yemekhane.dto.MonthlyReservationDto;
import com.yemekhane.dto.ReservationRequest;
import com.yemekhane.entity.MonthlyReservation;
import com.yemekhane.entity.PaymentStatus;
import com.yemekhane.entity.ReservationDay;
import com.yemekhane.entity.User;
import com.yemekhane.exception.BusinessException;
import com.yemekhane.repository.MonthlyReservationRepository;
import com.yemekhane.repository.ReservationDayRepository;
import com.yemekhane.repository.UserRepository;
import com.yemekhane.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final MonthlyReservationRepository reservationRepository;
    private final ReservationDayRepository reservationDayRepository;
    private final UserRepository userRepository;

    @Override
    public List<MonthlyReservationDto> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .map(MonthlyReservationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<MonthlyReservationDto> getUserReservations(Long userId) {
        return reservationRepository.findByUserIdOrderByIslemTarihiDesc(userId)
                .stream()
                .map(MonthlyReservationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public MonthlyReservationDto createMonthlyReservation(ReservationRequest request) {
        // Prevent duplicate reservation for same user/month/year
        reservationRepository.findByUserIdAndYilAndAy(request.getUserId(), request.getYil(), request.getAy())
                .ifPresent(r -> {
                    throw new BusinessException("Bu ay için zaten bir rezervasyon mevcut.");
                });

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BusinessException("Kullanıcı bulunamadı."));

        MonthlyReservation reservation = new MonthlyReservation();
        reservation.setUser(user);
        reservation.setYil(request.getYil());
        reservation.setAy(request.getAy());
        reservation.setSecilenGunSayisi(request.getSecilenGunler().size());
        reservation.setToplamTutar(request.getSecilenGunler().size() * 100.0);
        reservation.setOdemeDurumu(PaymentStatus.ODENDI);

        // Create reservation days and bind to reservation object before save
        List<ReservationDay> days = request.getSecilenGunler().stream()
                .map(date -> {
                    ReservationDay d = new ReservationDay();
                    d.setMonthlyReservation(reservation);
                    d.setUser(user);
                    d.setTarih(date);
                    return d;
                })
                .collect(Collectors.toList());
        reservation.setReservationDays(days);

        final MonthlyReservation savedReservation = reservationRepository.save(reservation);
        return MonthlyReservationDto.fromEntity(savedReservation);
    }

    @Override
    public MonthlyReservationDto updateMonthlyReservation(Long id, ReservationRequest request) {
        final MonthlyReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Rezervasyon bulunamadı."));

        // Update basic fields
        reservation.setYil(request.getYil());
        reservation.setAy(request.getAy());
        reservation.setSecilenGunSayisi(request.getSecilenGunler().size());
        reservation.setToplamTutar(request.getSecilenGunler().size() * 100.0);
        reservation.setOdemeDurumu(PaymentStatus.ODENDI);

        // Update reservation days via clear and addAll to preserve the collection reference
        if (reservation.getReservationDays() == null) {
            reservation.setReservationDays(new java.util.ArrayList<>());
        } else {
            reservation.getReservationDays().clear();
        }

        List<ReservationDay> days = request.getSecilenGunler().stream()
                .map(date -> {
                    ReservationDay d = new ReservationDay();
                    d.setMonthlyReservation(reservation);
                    d.setUser(reservation.getUser());
                    d.setTarih(date);
                    return d;
                })
                .collect(Collectors.toList());
        
        reservation.getReservationDays().addAll(days);

        MonthlyReservation saved = reservationRepository.save(reservation);
        return MonthlyReservationDto.fromEntity(saved);
    }
}
