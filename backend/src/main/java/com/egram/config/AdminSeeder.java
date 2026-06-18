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
                        .fullName("Demo Admin")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("Password@123"))
                        .role(Role.ADMIN)
                        .build();
                userRepository.save(admin);
                log.info("Demo admin user seeded successfully: {}", adminEmail);
            }
            
            String studentEmail = "student@egram.com";
            if (!userRepository.existsByEmail(studentEmail)) {
                User student = User.builder()
                        .fullName("Demo Student")
                        .email(studentEmail)
                        .password(passwordEncoder.encode("Password@123"))
                        .role(Role.STUDENT)
                        .build();
                userRepository.save(student);
                log.info("Demo student user seeded successfully: {}", studentEmail);
            }
        }
    }
}
