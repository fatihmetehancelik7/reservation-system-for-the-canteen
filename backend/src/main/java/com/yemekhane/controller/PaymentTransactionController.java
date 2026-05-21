package com.yemekhane.controller;

import com.yemekhane.dto.PaymentTransactionDto;
import com.yemekhane.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin
public class PaymentTransactionController {

    private final PaymentTransactionRepository transactionRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentTransactionDto>> getUserTransactions(@PathVariable Long userId) {
        List<PaymentTransactionDto> dtos = transactionRepository.findByUserIdOrderByIslemTarihiDesc(userId)
                .stream()
                .map(PaymentTransactionDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
