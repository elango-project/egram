package com.egram.service;

import com.egram.dto.CommentRequest;
import com.egram.dto.CommentResponse;
import com.egram.dto.RealRequest;
import com.egram.dto.RealResponse;
import com.egram.entity.Real;
import com.egram.entity.RealComment;
import com.egram.entity.RealLike;
import com.egram.entity.SavedReal;
import com.egram.entity.User;
import com.egram.exception.EgramException;
import com.egram.repository.RealCommentRepository;
import com.egram.repository.RealLikeRepository;
import com.egram.repository.RealRepository;
import com.egram.repository.SavedRealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RealService {

    private final RealRepository realRepository;
    private final RealCommentRepository realCommentRepository;
    private final RealLikeRepository realLikeRepository;
    private final SavedRealRepository savedRealRepository;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Real getRealOrThrow(UUID id) {
        return realRepository.findById(id)
                .orElseThrow(() -> new EgramException("Real not found", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public RealResponse uploadReal(RealRequest request) {
        User admin = getCurrentUser();
        Real real = Real.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .videoUrl(request.getVideoUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .uploadedBy(admin)
                .build();
        
        real = realRepository.save(real);
        return mapToRealResponse(real, admin);
    }

    @Transactional(readOnly = true)
    public com.egram.dto.PageResponse<RealResponse> getAllReals(int page, int size) {
        User currentUser = getCurrentUser();
        org.springframework.data.domain.Page<Real> realPage = realRepository.findAll(
            org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
        );
        
        List<RealResponse> content = realPage.getContent().stream()
                .map(real -> mapToRealResponse(real, currentUser))
                .collect(Collectors.toList());

        return com.egram.dto.PageResponse.<RealResponse>builder()
                .content(content)
                .page(realPage.getNumber())
                .size(realPage.getSize())
                .totalPages(realPage.getTotalPages())
                .totalElements(realPage.getTotalElements())
                .last(realPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public RealResponse getRealById(UUID id) {
        Real real = getRealOrThrow(id);
        return mapToRealResponse(real, getCurrentUser());
    }

    @Transactional
    public void deleteReal(UUID id) {
        if (!realRepository.existsById(id)) {
            throw new EgramException("Real not found", HttpStatus.NOT_FOUND);
        }
        realCommentRepository.deleteByRealId(id);
        realLikeRepository.deleteByRealId(id);
        savedRealRepository.deleteByRealId(id);
        realRepository.deleteById(id);
    }

    @Transactional
    public void likeReal(UUID id) {
        User student = getCurrentUser();
        Real real = getRealOrThrow(id);

        if (realLikeRepository.existsByRealIdAndStudentId(id, student.getId())) {
            throw new EgramException("Already liked this Real", HttpStatus.BAD_REQUEST);
        }

        RealLike like = RealLike.builder()
                .real(real)
                .student(student)
                .build();
        realLikeRepository.save(like);
    }

    @Transactional
    public void unlikeReal(UUID id) {
        User student = getCurrentUser();
        if (!realRepository.existsById(id)) {
            throw new EgramException("Real not found", HttpStatus.NOT_FOUND);
        }
        
        if (!realLikeRepository.existsByRealIdAndStudentId(id, student.getId())) {
            throw new EgramException("Real is not liked by this user", HttpStatus.BAD_REQUEST);
        }

        realLikeRepository.deleteByRealIdAndStudentId(id, student.getId());
    }

    @Transactional
    public void saveReal(UUID id) {
        User student = getCurrentUser();
        Real real = getRealOrThrow(id);

        if (savedRealRepository.existsByRealIdAndStudentId(id, student.getId())) {
            throw new EgramException("Already saved this Real", HttpStatus.BAD_REQUEST);
        }

        SavedReal savedReal = SavedReal.builder()
                .real(real)
                .student(student)
                .build();
        savedRealRepository.save(savedReal);
    }

    @Transactional
    public void unsaveReal(UUID id) {
        User student = getCurrentUser();
        if (!realRepository.existsById(id)) {
            throw new EgramException("Real not found", HttpStatus.NOT_FOUND);
        }

        if (!savedRealRepository.existsByRealIdAndStudentId(id, student.getId())) {
            throw new EgramException("Real is not saved by this user", HttpStatus.BAD_REQUEST);
        }

        savedRealRepository.deleteByRealIdAndStudentId(id, student.getId());
    }

    @Transactional
    public CommentResponse addComment(UUID id, CommentRequest request) {
        User student = getCurrentUser();
        Real real = getRealOrThrow(id);

        RealComment comment = RealComment.builder()
                .real(real)
                .student(student)
                .comment(request.getComment())
                .build();
        
        comment = realCommentRepository.save(comment);

        return CommentResponse.builder()
                .id(comment.getId())
                .realId(real.getId())
                .studentId(student.getId())
                .studentName(student.getFullName())
                .comment(comment.getComment())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(UUID id) {
        if (!realRepository.existsById(id)) {
            throw new EgramException("Real not found", HttpStatus.NOT_FOUND);
        }

        return realCommentRepository.findByRealIdOrderByCreatedAtDesc(id).stream()
                .map(comment -> CommentResponse.builder()
                        .id(comment.getId())
                        .realId(comment.getReal().getId())
                        .studentId(comment.getStudent().getId())
                        .studentName(comment.getStudent().getFullName())
                        .comment(comment.getComment())
                        .createdAt(comment.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(UUID commentId) {
        if (!realCommentRepository.existsById(commentId)) {
            throw new EgramException("Comment not found", HttpStatus.NOT_FOUND);
        }
        realCommentRepository.deleteById(commentId);
    }

    @Transactional
    public void incrementViewCount(UUID id) {
        Real real = getRealOrThrow(id);
        real.setViewCount(real.getViewCount() + 1);
        realRepository.save(real);
    }

    private RealResponse mapToRealResponse(Real real, User currentUser) {
        boolean isLiked = currentUser != null && realLikeRepository.existsByRealIdAndStudentId(real.getId(), currentUser.getId());
        boolean isSaved = currentUser != null && savedRealRepository.existsByRealIdAndStudentId(real.getId(), currentUser.getId());
        long likeCount = realLikeRepository.countByRealId(real.getId());
        int commentCount = realCommentRepository.countByRealId(real.getId());

        return RealResponse.builder()
                .id(real.getId())
                .title(real.getTitle())
                .description(real.getDescription())
                .videoUrl(real.getVideoUrl())
                .thumbnailUrl(real.getThumbnailUrl())
                .uploaderName(real.getUploadedBy().getFullName())
                .uploaderId(real.getUploadedBy().getId())
                .createdAt(real.getCreatedAt())
                .liked(isLiked)
                .saved(isSaved)
                .likeCount(likeCount)
                .commentCount(commentCount)
                .viewCount(real.getViewCount())
                .build();
    }
}
