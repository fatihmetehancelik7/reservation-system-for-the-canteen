package com.yemekhane.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ad;
    private String soyad;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String sifre;
    
    @Enumerated(EnumType.STRING)
    private Role rol;
}
