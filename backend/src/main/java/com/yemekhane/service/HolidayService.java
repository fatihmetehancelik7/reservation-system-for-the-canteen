package com.yemekhane.service;

import com.yemekhane.dto.HolidayDto;
import com.yemekhane.dto.RefundRecordDto;
import com.yemekhane.entity.Holiday;
import com.yemekhane.entity.RefundRecord;
import com.yemekhane.entity.ReservationDay;
import com.yemekhane.exception.BusinessException;
import com.yemekhane.repository.HolidayRepository;
import com.yemekhane.repository.RefundRecordRepository;
import com.yemekhane.repository.ReservationDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HolidayService {

    private final HolidayRepository holidayRepository;
    private final ReservationDayRepository reservationDayRepository;
    private final RefundRecordRepository refundRecordRepository;

    public List<HolidayDto> getAllHolidays() {
        return holidayRepository.findAll().stream()
                .map(HolidayDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public HolidayDto createHoliday(HolidayDto request) {
        if (request.getTarih().getYear() != 2026) {
            throw new BusinessException("Sistem yalnızca 2026 yılı için çalışmaktadır.");
        }
        if (holidayRepository.findByTarih(request.getTarih()).isPresent()) {
            throw new BusinessException("Bu tarihte zaten bir tatil tanımlı.");
        }

        Holiday holiday = new Holiday();
        holiday.setTarih(request.getTarih());
        holiday.setAciklama(request.getAciklama());
        Holiday saved = holidayRepository.save(holiday);

        // Process refunds for all users who reserved this day
        processRefundsForDate(request.getTarih(), request.getAciklama());

        return HolidayDto.fromEntity(saved);
    }

    private void processRefundsForDate(LocalDate tarih, String aciklama) {
        List<ReservationDay> affectedDays = reservationDayRepository.findByTarih(tarih);
        for (ReservationDay day : affectedDays) {
            RefundRecord refund = new RefundRecord();
            refund.setUser(day.getUser());
            refund.setTatilTarihi(tarih);
            refund.setTatilAciklama(aciklama);
            refund.setIadeEdilen(100.0); // 100 TL per day
            refundRecordRepository.save(refund);
        }
    }

    public void deleteHoliday(Long id) {
        holidayRepository.deleteById(id);
    }

    public List<RefundRecordDto> getAllRefunds() {
        return refundRecordRepository.findAllByOrderByIslemTarihiDesc().stream()
                .map(RefundRecordDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<RefundRecordDto> getUserRefunds(Long userId) {
        return refundRecordRepository.findByUserIdOrderByIslemTarihiDesc(userId).stream()
                .map(RefundRecordDto::fromEntity)
                .collect(Collectors.toList());
    }
}
