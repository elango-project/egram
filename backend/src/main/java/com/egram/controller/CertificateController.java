package com.egram.controller;

import com.egram.dto.CertificateResponse;
import com.egram.entity.User;
import com.egram.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/{id}")
    public ResponseEntity<CertificateResponse> getCertificate(@PathVariable UUID id) {
        return ResponseEntity.ok(certificateService.getCertificate(id));
    }

    @GetMapping("/verify/{verificationCode}")
    public ResponseEntity<CertificateResponse> verifyCertificate(@PathVariable String verificationCode) {
        return ResponseEntity.ok(certificateService.verifyCertificate(verificationCode));
    }

    @GetMapping("/my-certificates")
    public ResponseEntity<List<CertificateResponse>> getMyCertificates() {
        User student = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(certificateService.getStudentCertificates(student.getId()));
    }
}
