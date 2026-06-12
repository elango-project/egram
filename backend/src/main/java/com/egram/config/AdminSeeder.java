package com.egram.config;

import com.egram.entity.Role;
import com.egram.entity.User;
import com.egram.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${egram.seed-admin:false}")
    private boolean seedAdmin;

    @Override
    public void run(String... args) {
        if (seedAdmin) {
            String adminEmail = "admin@egram.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = User.builder()
                        .fullName("Super Admin")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("Password@123"))
                        .role(Role.ADMIN)
                        .build();
                userRepository.save(admin);
                log.info("Admin user seeded successfully with email: {}", adminEmail);
            } else {
                log.info("Admin user already exists.");
            }
        }
    }
}
