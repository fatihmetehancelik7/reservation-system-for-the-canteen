package com.yemekhane.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import com.yemekhane.entity.Role;

@Data
public class LoginRequest {
    private String email;
    private String sifre;
}
