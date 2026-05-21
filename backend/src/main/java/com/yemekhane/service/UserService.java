package com.yemekhane.service;

import com.yemekhane.dto.UserDto;
import com.yemekhane.dto.AuthResponse;
import com.yemekhane.dto.LoginRequest;
import com.yemekhane.entity.Role;
import com.yemekhane.entity.User;
import com.yemekhane.exception.BusinessException;
import com.yemekhane.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Email veya şifre hatalı"));
        
        if (!user.getSifre().equals(request.getSifre())) {
            throw new BusinessException("Email veya şifre hatalı");
        }

        return new AuthResponse("dummy-jwt-token-" + user.getId(), user.getId(), user.getAd(), user.getSoyad(), user.getEmail(), user.getRol());
    }

    public UserDto createUser(UserDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BusinessException("Bu e-posta adresi zaten kayıtlı: " + request.getEmail());
        }
        User u = new User();
        u.setAd(request.getAd());
        u.setSoyad(request.getSoyad());
        u.setEmail(request.getEmail());
        u.setSifre(request.getSifre() != null ? request.getSifre() : "123456");
        u.setRol(request.getRol() != null ? request.getRol() : Role.KULLANICI);
        return UserDto.fromEntity(userRepository.save(u));
    }

    public List<UserDto> createUsers(List<UserDto> requests) {
        return requests.stream()
                .map(this::createUser)
                .collect(Collectors.toList());
    }
}
