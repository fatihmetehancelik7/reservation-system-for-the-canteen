package com.yemekhane.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import com.yemekhane.entity.Role;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String ad;
    private String soyad;
    private String email;
    private Role rol;
}
