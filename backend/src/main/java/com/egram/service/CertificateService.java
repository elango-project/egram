package com.egram.service;

import com.egram.dto.CertificateResponse;
import com.egram.entity.Certificate;
import com.egram.entity.Course;
import com.egram.entity.User;
import com.egram.exception.EgramException;
import com.egram.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;

    @Transactional
    public CertificateResponse autoGenerateCertificate(User student, Course course) {
        Optional<Certificate> existing = certificateRepository.findByStudentIdAndCourseId(student.getId(), course.getId());
        if (existing.isPresent()) {
            return mapToResponse(existing.get());
        }

        String certificateNumber = "EGR-" + course.getTitle().replaceAll("[^A-Za-z0-9]", "").toUpperCase() 
            + "-" + java.time.Year.now().getValue() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        
        String verificationCode = "EGR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Certificate certificate = Certificate.builder()
                .student(student)
                .course(course)
                .certificateNumber(certificateNumber)
                .verificationCode(verificationCode)
                .build();

        certificate = certificateRepository.save(certificate);
        return mapToResponse(certificate);
    }

    @Transactional(readOnly = true)
    public CertificateResponse getCertificate(UUID id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new EgramException("Certificate not found", HttpStatus.NOT_FOUND));
        return mapToResponse(certificate);
    }

    @Transactional(readOnly = true)
    public CertificateResponse verifyCertificate(String verificationCode) {
        Certificate certificate = certificateRepository.findByVerificationCode(verificationCode)
                .orElseThrow(() -> new EgramException("Invalid verification code", HttpStatus.NOT_FOUND));
        return mapToResponse(certificate);
    }

    @Transactional(readOnly = true)
    public List<CertificateResponse> getStudentCertificates(UUID studentId) {
        return certificateRepository.findByStudentId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CertificateResponse mapToResponse(Certificate certificate) {
        return CertificateResponse.builder()
                .id(certificate.getId())
                .courseId(certificate.getCourse().getId())
                .courseTitle(certificate.getCourse().getTitle())
                .studentName(certificate.getStudent().getFullName())
                .certificateNumber(certificate.getCertificateNumber())
                .verificationCode(certificate.getVerificationCode())
                .issuedAt(certificate.getIssuedAt())
                .build();
    }
}
