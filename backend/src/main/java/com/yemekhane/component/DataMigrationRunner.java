package com.yemekhane.component;

import com.yemekhane.entity.MonthlyReservation;
import com.yemekhane.entity.PaymentTransaction;
import com.yemekhane.repository.MonthlyReservationRepository;
import com.yemekhane.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataMigrationRunner implements CommandLineRunner {

    private final MonthlyReservationRepository reservationRepository;
    private final PaymentTransactionRepository transactionRepository;

    @Override
    public void run(String... args) {
        List<MonthlyReservation> reservations = reservationRepository.findAll();
        for (MonthlyReservation res : reservations) {
            // Get all transactions for this user, year, month
            List<PaymentTransaction> transactions = transactionRepository.findByUserIdOrderByIslemTarihiDesc(res.getUser().getId())
                    .stream()
                    .filter(t -> t.getYil().equals(res.getYil()) && t.getAy().equals(res.getAy()))
                    .toList();

            int transactionDaysSum = transactions.stream()
                    .mapToInt(PaymentTransaction::getIslemGunSayisi)
                    .sum();
            
            int reservationDays = res.getSecilenGunSayisi() != null ? res.getSecilenGunSayisi() : 0;

            if (transactionDaysSum < reservationDays) {
                int missingDays = reservationDays - transactionDaysSum;
                double missingAmount = missingDays * 100.0; // DAILY_PRICE = 100.0

                PaymentTransaction pt = new PaymentTransaction();
                pt.setUser(res.getUser());
                pt.setYil(res.getYil());
                pt.setAy(res.getAy());
                pt.setIslemTarihi(res.getIslemTarihi());
                pt.setIslemGunSayisi(missingDays);
                pt.setIslemTutari(missingAmount);
                pt.setIslemTipi("ESKİ KAYIT (YENİ REZERVASYON)");
                
                transactionRepository.save(pt);
            }
        }
    }
}
