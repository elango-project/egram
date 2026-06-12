package com.egram.service;

import com.egram.dto.AuthenticationResponse;
import com.egram.dto.LoginRequest;
import com.egram.dto.RegisterRequest;
import com.egram.entity.Role;
import com.egram.entity.User;
import com.egram.exception.EgramException;
import com.egram.repository.UserRepository;
import com.egram.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EgramException("Email already exists", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.STUDENT)
                .build();

        userRepository.save(user);
    }

    public AuthenticationResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (BadCredentialsException e) {
            throw new EgramException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new EgramException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        String token = jwtService.generateToken(user);
        return new AuthenticationResponse(token, "Bearer");
    }
}
