package com.yemekhane.dto;

import com.yemekhane.entity.User;
import com.yemekhane.entity.Role;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String ad;
    private String soyad;
    private String email;
    private Role rol;

    public static UserDto fromEntity(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setAd(user.getAd());
        dto.setSoyad(user.getSoyad());
        dto.setEmail(user.getEmail());
        dto.setRol(user.getRol());
        return dto;
    }
}
