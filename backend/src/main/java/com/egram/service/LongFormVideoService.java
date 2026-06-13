package com.egram.service;

import com.egram.dto.LongFormVideoRequest;
import com.egram.dto.LongFormVideoResponse;
import com.egram.dto.VideoCommentRequest;
import com.egram.dto.VideoCommentResponse;
import com.egram.entity.LongFormVideo;
import com.egram.entity.LongFormVideoComment;
import com.egram.entity.LongFormVideoLike;
import com.egram.entity.SavedLongFormVideo;
import com.egram.entity.User;
import com.egram.exception.EgramException;
import com.egram.repository.LongFormVideoCommentRepository;
import com.egram.repository.LongFormVideoLikeRepository;
import com.egram.repository.LongFormVideoRepository;
import com.egram.repository.SavedLongFormVideoRepository;
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
public class LongFormVideoService {

    private final LongFormVideoRepository videoRepository;
    private final LongFormVideoCommentRepository commentRepository;
    private final LongFormVideoLikeRepository likeRepository;
    private final SavedLongFormVideoRepository savedRepository;

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private LongFormVideo getVideoOrThrow(UUID id) {
        return videoRepository.findById(id)
                .orElseThrow(() -> new EgramException("Video not found", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public LongFormVideoResponse uploadVideo(LongFormVideoRequest request) {
        User admin = getCurrentUser();
        LongFormVideo video = LongFormVideo.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .videoUrl(request.getVideoUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .uploadedBy(admin)
                .build();
        
        video = videoRepository.save(video);
        return mapToResponse(video, admin);
    }

    @Transactional(readOnly = true)
    public List<LongFormVideoResponse> getFeed() {
        User currentUser = getCurrentUser();
        return videoRepository.findAll().stream()
                .map(video -> mapToResponse(video, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LongFormVideoResponse getVideo(UUID id) {
        LongFormVideo video = getVideoOrThrow(id);
        return mapToResponse(video, getCurrentUser());
    }

    @Transactional
    public void deleteVideo(UUID id) {
        if (!videoRepository.existsById(id)) {
            throw new EgramException("Video not found", HttpStatus.NOT_FOUND);
        }
        commentRepository.deleteByVideoId(id);
        likeRepository.deleteByVideoId(id);
        savedRepository.deleteByVideoId(id);
        videoRepository.deleteById(id);
    }

    @Transactional
    public void likeVideo(UUID id) {
        User student = getCurrentUser();
        LongFormVideo video = getVideoOrThrow(id);

        if (likeRepository.existsByVideoIdAndStudentId(id, student.getId())) {
            throw new EgramException("Already liked this Video", HttpStatus.BAD_REQUEST);
        }

        LongFormVideoLike like = LongFormVideoLike.builder()
                .video(video)
                .student(student)
                .build();
        likeRepository.save(like);
    }

    @Transactional
    public void unlikeVideo(UUID id) {
        User student = getCurrentUser();
        if (!videoRepository.existsById(id)) {
            throw new EgramException("Video not found", HttpStatus.NOT_FOUND);
        }
        
        if (!likeRepository.existsByVideoIdAndStudentId(id, student.getId())) {
            throw new EgramException("Video is not liked by this user", HttpStatus.BAD_REQUEST);
        }

        likeRepository.deleteByVideoIdAndStudentId(id, student.getId());
    }

    @Transactional
    public void saveVideo(UUID id) {
        User student = getCurrentUser();
        LongFormVideo video = getVideoOrThrow(id);

        if (savedRepository.existsByVideoIdAndStudentId(id, student.getId())) {
            throw new EgramException("Already saved this Video", HttpStatus.BAD_REQUEST);
        }

        SavedLongFormVideo savedVideo = SavedLongFormVideo.builder()
                .video(video)
                .student(student)
                .build();
        savedRepository.save(savedVideo);
    }

    @Transactional
    public void unsaveVideo(UUID id) {
        User student = getCurrentUser();
        if (!videoRepository.existsById(id)) {
            throw new EgramException("Video not found", HttpStatus.NOT_FOUND);
        }

        if (!savedRepository.existsByVideoIdAndStudentId(id, student.getId())) {
            throw new EgramException("Video is not saved by this user", HttpStatus.BAD_REQUEST);
        }

        savedRepository.deleteByVideoIdAndStudentId(id, student.getId());
    }

    @Transactional
    public VideoCommentResponse addComment(UUID id, VideoCommentRequest request) {
        User student = getCurrentUser();
        LongFormVideo video = getVideoOrThrow(id);

        LongFormVideoComment comment = LongFormVideoComment.builder()
                .video(video)
                .student(student)
                .comment(request.getComment())
                .build();
        
        comment = commentRepository.save(comment);

        return VideoCommentResponse.builder()
                .id(comment.getId())
                .videoId(video.getId())
                .studentId(student.getId())
                .studentName(student.getFullName())
                .comment(comment.getComment())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<VideoCommentResponse> getComments(UUID id) {
        if (!videoRepository.existsById(id)) {
            throw new EgramException("Video not found", HttpStatus.NOT_FOUND);
        }

        return commentRepository.findByVideoIdOrderByCreatedAtDesc(id).stream()
                .map(comment -> VideoCommentResponse.builder()
                        .id(comment.getId())
                        .videoId(comment.getVideo().getId())
                        .studentId(comment.getStudent().getId())
                        .studentName(comment.getStudent().getFullName())
                        .comment(comment.getComment())
                        .createdAt(comment.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private LongFormVideoResponse mapToResponse(LongFormVideo video, User currentUser) {
        boolean isLiked = likeRepository.existsByVideoIdAndStudentId(video.getId(), currentUser.getId());
        boolean isSaved = savedRepository.existsByVideoIdAndStudentId(video.getId(), currentUser.getId());
        long likeCount = likeRepository.countByVideoId(video.getId());
        long commentCount = commentRepository.findByVideoIdOrderByCreatedAtDesc(video.getId()).size();

        return LongFormVideoResponse.builder()
                .id(video.getId())
                .title(video.getTitle())
                .description(video.getDescription())
                .videoUrl(video.getVideoUrl())
                .thumbnailUrl(video.getThumbnailUrl())
                .uploaderName(video.getUploadedBy().getFullName())
                .uploaderId(video.getUploadedBy().getId())
                .createdAt(video.getCreatedAt())
                .isLikedByCurrentUser(isLiked)
                .isSavedByCurrentUser(isSaved)
                .likeCount(likeCount)
                .commentCount(commentCount)
                .build();
    }
}
