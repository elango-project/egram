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
    private final com.egram.repository.VideoHistoryRepository historyRepository;

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
    public com.egram.dto.PageResponse<LongFormVideoResponse> getFeed(int page, int size) {
        User currentUser = getCurrentUser();
        org.springframework.data.domain.Page<LongFormVideo> videoPage = videoRepository.findAll(
            org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
        );
        
        List<LongFormVideoResponse> content = videoPage.getContent().stream()
                .map(video -> mapToResponse(video, currentUser))
                .collect(Collectors.toList());

        return com.egram.dto.PageResponse.<LongFormVideoResponse>builder()
                .content(content)
                .page(videoPage.getNumber())
                .size(videoPage.getSize())
                .totalPages(videoPage.getTotalPages())
                .totalElements(videoPage.getTotalElements())
                .last(videoPage.isLast())
                .build();
    }

    @Transactional
    public com.egram.dto.VideoProgressResponse updateProgress(UUID id, com.egram.dto.VideoProgressRequest request) {
        User student = getCurrentUser();
        LongFormVideo video = getVideoOrThrow(id);
        
        com.egram.entity.VideoHistory history = historyRepository.findByStudentIdAndVideoId(student.getId(), video.getId())
            .orElse(com.egram.entity.VideoHistory.builder()
                .student(student)
                .video(video)
                .build());
        
        history.setCurrentPositionSeconds(request.getCurrentPositionSeconds());
        history.setPercentageWatched(request.getPercentageWatched());
        history.setCompleted(request.getPercentageWatched() >= 90.0);
        
        history = historyRepository.save(history);
        
        return com.egram.dto.VideoProgressResponse.builder()
            .currentPositionSeconds(history.getCurrentPositionSeconds())
            .percentageWatched(history.getPercentageWatched())
            .lastWatchedAt(history.getLastWatchedAt())
            .completed(history.getCompleted())
            .build();
    }

    @Transactional(readOnly = true)
    public com.egram.dto.VideoProgressResponse getProgress(UUID id) {
        User student = getCurrentUser();
        return historyRepository.findByStudentIdAndVideoId(student.getId(), id)
            .map(history -> com.egram.dto.VideoProgressResponse.builder()
                .currentPositionSeconds(history.getCurrentPositionSeconds())
                .percentageWatched(history.getPercentageWatched())
                .lastWatchedAt(history.getLastWatchedAt())
                .completed(history.getCompleted())
                .build())
            .orElse(com.egram.dto.VideoProgressResponse.builder()
                .currentPositionSeconds(0L)
                .percentageWatched(0.0)
                .completed(false)
                .build());
    }

    @Transactional(readOnly = true)
    public List<LongFormVideoResponse> getContinueWatching() {
        User student = getCurrentUser();
        org.springframework.data.domain.Page<com.egram.entity.VideoHistory> page = historyRepository.findContinueWatching(
            student.getId(), 
            org.springframework.data.domain.PageRequest.of(0, 5)
        );
        
        return page.getContent().stream()
            .map(history -> mapToResponse(history.getVideo(), student))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LongFormVideoResponse> getRecommendations(UUID videoId) {
        User student = getCurrentUser();
        // Priority MVP: Most Viewed (for now just returning top 5 viewed videos excluding the current one)
        // If we added courses/categories, we'd filter here.
        org.springframework.data.domain.Page<LongFormVideo> page = videoRepository.findAll(
            org.springframework.data.domain.PageRequest.of(0, 6, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "viewCount"))
        );
        
        return page.getContent().stream()
            .filter(v -> !v.getId().equals(videoId))
            .limit(5)
            .map(video -> mapToResponse(video, student))
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
        historyRepository.deleteByVideoId(id);
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

    @Transactional
    public void deleteComment(UUID commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new EgramException("Comment not found", HttpStatus.NOT_FOUND);
        }
        commentRepository.deleteById(commentId);
    }

    @Transactional
    public void incrementViewCount(UUID id) {
        LongFormVideo video = getVideoOrThrow(id);
        video.setViewCount(video.getViewCount() + 1);
        videoRepository.save(video);
    }

    @Transactional(readOnly = true)
    public com.egram.dto.VideoAnalyticsResponse getAnalytics(UUID id) {
        LongFormVideo video = getVideoOrThrow(id);
        Long views = video.getViewCount();
        Long likes = likeRepository.countByVideoId(id);
        Long comments = (long) commentRepository.findByVideoIdOrderByCreatedAtDesc(id).size();
        Double avgWatch = historyRepository.getAveragePercentageWatchedByVideoId(id);
        
        Long uniqueViewers = historyRepository.countTotalWatchersByVideoId(id);
        Long completedUsers = historyRepository.countCompletedByVideoId(id);
        Double completionRate = uniqueViewers > 0 ? (double) completedUsers / uniqueViewers * 100.0 : 0.0;
        
        Long continueWatchingCount = historyRepository.countContinueWatchingByVideoId(id);

        return com.egram.dto.VideoAnalyticsResponse.builder()
                .videoId(id)
                .views(views)
                .likes(likes)
                .comments(comments)
                .averageWatchPercentage(avgWatch != null ? avgWatch : 0.0)
                .completionRate(completionRate)
                .continueWatchingCount(continueWatchingCount)
                .build();
    }

    private LongFormVideoResponse mapToResponse(LongFormVideo video, User currentUser) {
        boolean isLiked = currentUser != null && likeRepository.existsByVideoIdAndStudentId(video.getId(), currentUser.getId());
        boolean isSaved = currentUser != null && savedRepository.existsByVideoIdAndStudentId(video.getId(), currentUser.getId());
        long likeCount = likeRepository.countByVideoId(video.getId());
        long commentCount = commentRepository.findByVideoIdOrderByCreatedAtDesc(video.getId()).size();

        com.egram.dto.VideoProgressResponse progress = null;
        if (currentUser != null && currentUser.getRole().equals(com.egram.entity.Role.STUDENT)) {
            progress = historyRepository.findByStudentIdAndVideoId(currentUser.getId(), video.getId())
                .map(h -> com.egram.dto.VideoProgressResponse.builder()
                    .currentPositionSeconds(h.getCurrentPositionSeconds())
                    .percentageWatched(h.getPercentageWatched())
                    .lastWatchedAt(h.getLastWatchedAt())
                    .completed(h.getCompleted())
                    .build())
                .orElse(null);
        }

        return LongFormVideoResponse.builder()
                .id(video.getId())
                .title(video.getTitle())
                .description(video.getDescription())
                .videoUrl(video.getVideoUrl())
                .thumbnailUrl(video.getThumbnailUrl())
                .uploaderName(video.getUploadedBy().getFullName())
                .uploaderId(video.getUploadedBy().getId())
                .createdAt(video.getCreatedAt())
                .liked(isLiked)
                .saved(isSaved)
                .likeCount(likeCount)
                .commentCount(commentCount)
                .viewCount(video.getViewCount())
                .progress(progress)
                .build();
    }
}
