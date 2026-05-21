package com.yemekhane.service;

import com.yemekhane.dto.UserDto;
import com.yemekhane.dto.AuthResponse;
import com.yemekhane.dto.LoginRequest;
import com.yemekhane.entity.Role;
import com.yemekhane.entity.User;
import com.yemekhane.exception.BusinessException;
import com.yemekhane.repository.UserRepository;
import com.yemekhane.repository.MonthlyReservationRepository;
import com.yemekhane.repository.ReservationDayRepository;
import com.yemekhane.repository.PaymentTransactionRepository;
import com.yemekhane.repository.RefundRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.yemekhane.security.JwtUtils;
import com.yemekhane.security.UserDetailsImpl;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final MonthlyReservationRepository monthlyReservationRepository;
    private final ReservationDayRepository reservationDayRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final RefundRecordRepository refundRecordRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSifre()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String jwt = jwtUtils.generateJwtToken(authentication);

        return new AuthResponse(jwt, userDetails.getId(), userDetails.getAd(), userDetails.getSoyad(), userDetails.getUsername(), userDetails.getRoleEnum());
    }

    public UserDto createUser(UserDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BusinessException("Bu e-posta adresi zaten kayıtlı: " + request.getEmail());
        }
        User u = new User();
        u.setAd(request.getAd());
        u.setSoyad(request.getSoyad());
        u.setEmail(request.getEmail());
        u.setSifre(passwordEncoder.encode(request.getSifre() != null ? request.getSifre() : "123456"));
        u.setRol(request.getRol() != null ? request.getRol() : Role.KULLANICI);
        return UserDto.fromEntity(userRepository.save(u));
    }

    public List<UserDto> createUsers(List<UserDto> requests) {
        return requests.stream()
                .map(this::createUser)
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public UserDto updateUser(Long id, UserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Kullanıcı bulunamadı"));

        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                throw new BusinessException("Bu e-posta adresi zaten kullanımda.");
            }
            user.setEmail(dto.getEmail());
        }

        if (dto.getAd() != null) user.setAd(dto.getAd());
        if (dto.getSoyad() != null) user.setSoyad(dto.getSoyad());
        if (dto.getSifre() != null && !dto.getSifre().isEmpty()) user.setSifre(passwordEncoder.encode(dto.getSifre()));
        if (dto.getRol() != null) user.setRol(dto.getRol());

        return UserDto.fromEntity(userRepository.save(user));
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new BusinessException("Kullanıcı bulunamadı");
        }
        
        // Önce ilişkili tüm verileri sil (foreign key hatalarını önlemek için)
        reservationDayRepository.deleteByUserId(id);
        monthlyReservationRepository.deleteByUserId(id);
        paymentTransactionRepository.deleteByUserId(id);
        refundRecordRepository.deleteByUserId(id);
        
        // En son kullanıcıyı sil
        userRepository.deleteById(id);
    }
}
