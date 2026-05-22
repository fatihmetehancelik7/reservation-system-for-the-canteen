package com.yemekhane.service.factory;

import com.yemekhane.entity.MonthlyReservation;
import com.yemekhane.entity.PaymentStatus;
import com.yemekhane.entity.RefundRecord;
import com.yemekhane.entity.ReservationDay;
import com.yemekhane.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ReservationFactory {

    public List<ReservationDay> buildReservationDays(List<LocalDate> dates, MonthlyReservation reservation, User user) {
        return dates.stream()
                .map(date -> buildReservationDay(date, reservation, user))
                .collect(Collectors.toList());
    }

    public ReservationDay buildReservationDay(LocalDate date, MonthlyReservation reservation, User user) {
        ReservationDay day = new ReservationDay();
        day.setMonthlyReservation(reservation);
        day.setUser(user);
        day.setTarih(date);
        return day;
    }

    public List<RefundRecord> buildRefundRecords(User user, List<LocalDate> dates, double dailyPrice) {
        return dates.stream()
                .map(date -> buildRefundRecord(user, date, dailyPrice))
                .collect(Collectors.toList());
    }

    public RefundRecord buildRefundRecord(User user, LocalDate date, double dailyPrice) {
        RefundRecord refund = new RefundRecord();
        refund.setUser(user);
        refund.setTatilTarihi(date);
        refund.setTatilAciklama("Kullanıcı rezervasyon iptali");
        refund.setIadeEdilen(dailyPrice);
        refund.setIsRefunded(false);
        return refund;
    }

    public void applyReservationValues(MonthlyReservation reservation, int year, int month, int selectedDayCount, double dailyPrice, PaymentStatus status) {
        reservation.setYil(year);
        reservation.setAy(month);
        reservation.setSecilenGunSayisi(selectedDayCount);
        reservation.setToplamTutar(selectedDayCount * dailyPrice);
        reservation.setOdemeDurumu(status);
    }
}
