package com.yemekhane.service;

import com.yemekhane.dto.MonthlyReservationDto;
import com.yemekhane.dto.ReservationRequest;
import java.util.List;

import com.yemekhane.dto.BulkReservationRequest;

public interface ReservationService {
    List<MonthlyReservationDto> getAllReservations();
    List<MonthlyReservationDto> getUserReservations(Long userId);
    MonthlyReservationDto createMonthlyReservation(ReservationRequest request);
    MonthlyReservationDto updateMonthlyReservation(Long id, ReservationRequest request);
    List<MonthlyReservationDto> processBulkReservations(BulkReservationRequest request);
}
