package com.yemekhane.controller;

import com.yemekhane.dto.PaymentTransactionDto;
import com.yemekhane.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.context.SecurityContextHolder;
import com.yemekhane.security.UserDetailsImpl;
import com.yemekhane.entity.Role;
import com.yemekhane.exception.BusinessException;
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
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null || "anonymousUser".equals(principal)) {
            throw new BusinessException("Oturum bulunamadı.");
        }
        UserDetailsImpl authenticatedUser = (UserDetailsImpl) principal;
        if (authenticatedUser.getRoleEnum() != Role.ADMIN && !authenticatedUser.getId().equals(userId)) {
            throw new BusinessException("Başka bir kullanıcının işlemlerine erişemezsiniz.");
        }

        List<PaymentTransactionDto> dtos = transactionRepository.findByUserIdOrderByIslemTarihiDesc(userId)
                .stream()
                .map(PaymentTransactionDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
