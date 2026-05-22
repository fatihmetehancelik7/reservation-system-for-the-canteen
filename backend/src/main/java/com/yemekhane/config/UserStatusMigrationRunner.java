package com.yemekhane.config;

import com.yemekhane.entity.User;
import com.yemekhane.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(2)
@RequiredArgsConstructor
public class UserStatusMigrationRunner implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) {
        for (User user : userRepository.findAll()) {
            if (user.getActive() == null) {
                user.setActive(true);
            }
        }
    }
}
