import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import videoService from '../../services/videoService';
import YouTube from 'react-youtube';

const VideoPlayerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  
  const videoRef = useRef(null);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [showAutoPlay, setShowAutoPlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [viewRecorded, setViewRecorded] = useState(false);
  
  // Track last synced time to avoid redundant API calls
  const lastSyncTimeRef = useRef(0);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    fetchVideoData();
    return () => {
      syncProgress(); // Sync on unmount (beforeUnload equivalent for SPA routing)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [id]);

  // Handle page close / refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      syncProgress();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [id]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      setShowAutoPlay(false);
      setViewRecorded(false);
      setProgressLoaded(false);
      
      const [videoData, recData, commentsData] = await Promise.all([
        videoService.getVideoById(id),
        videoService.getRecommendations(id),
        videoService.getComments(id)
      ]);
      
      setVideo(videoData);
      setRecommendations(recData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching video', error);
    } finally {
      setLoading(false);
    }
  };

  const syncProgress = useCallback(async () => {
    if (!videoRef.current || !video) return;
    
    const currentPos = Math.floor(videoRef.current.currentTime);
    const duration = Math.floor(videoRef.current.duration) || 1;
    const percentage = (currentPos / duration) * 100;
    
    // Check view condition (10s or 20%)
    if (!viewRecorded && (currentPos >= 10 || percentage >= 20)) {
      setViewRecorded(true);
      videoService.recordView(id).catch(console.error);
    }

    // Only sync if position changed by at least 1 second
    if (Math.abs(currentPos - lastSyncTimeRef.current) >= 1) {
      lastSyncTimeRef.current = currentPos;
      try {
        await videoService.updateProgress(id, currentPos, percentage);
      } catch (err) {
        console.error('Error syncing progress', err);
      }
    }
  }, [id, video, viewRecorded]);

  // Sync every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        syncProgress();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [syncProgress]);

  const handleLoadedMetadata = () => {
    if (videoRef.current && video?.progress?.currentPositionSeconds && !progressLoaded) {
      const savedPos = video.progress.currentPositionSeconds;
      const duration = videoRef.current.duration;
      
      // If it wasn't completed and we have a valid saved position
      if (!video.progress.completed && savedPos > 0 && savedPos < duration - 2) {
        if (window.confirm(`Resume from ${formatTime(savedPos)}?`)) {
          videoRef.current.currentTime = savedPos;
        } else {
          videoRef.current.currentTime = 0;
        }
      }
      setProgressLoaded(true);
    }
  };

  const handlePause = () => {
    syncProgress();
  };

  const handleEnded = () => {
    syncProgress();
    
    // Auto Play Next Logic
    if (recommendations.length > 0) {
      setShowAutoPlay(true);
      setCountdown(5);
      
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            navigate(`/dashboard/videos/${recommendations[0].id}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const cancelAutoPlay = () => {
    setShowAutoPlay(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleLike = async () => {
    try {
      if (video.liked) {
        await videoService.unlikeVideo(id);
        setVideo(v => ({ ...v, liked: false, likeCount: v.likeCount - 1 }));
      } else {
        await videoService.likeVideo(id);
        setVideo(v => ({ ...v, liked: true, likeCount: v.likeCount + 1 }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    try {
      if (video.saved) {
        await videoService.unsaveVideo(id);
        setVideo(v => ({ ...v, saved: false }));
      } else {
        await videoService.saveVideo(id);
        setVideo(v => ({ ...v, saved: true }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await videoService.addComment(id, newComment);
      setComments([res, ...comments]);
      setVideo(v => ({ ...v, commentCount: v.commentCount + 1 }));
      setNewComment('');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="text-center py-12">Loading Video...</div>;
  if (!video) return <div className="text-center py-12 text-red-500">Video not found.</div>;

  return (
    <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6 pb-12">
      {/* Main Video Section */}
      <div className="flex-grow lg:w-2/3 xl:w-3/4">
        
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-lg mb-4">
          {video.youtubeVideoId ? (
            <YouTube
              videoId={video.youtubeVideoId}
              opts={{
                width: '100%',
                height: '100%',
                playerVars: {
                  autoplay: 0,
                  controls: 1,
                  rel: 0,
                  modestbranding: 1
                }
              }}
              className="w-full h-full"
              style={{ width: '100%', height: '100%', display: 'flex' }}
              onReady={handleLoadedMetadata}
              onPause={handlePause}
              onEnd={handleEnded}
            />
          ) : (
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              controls
              autoPlay
              onLoadedMetadata={handleLoadedMetadata}
              onPause={handlePause}
              onEnded={handleEnded}
              className="w-full h-full object-contain"
            />
          )}

          {/* Auto Play Overlay */}
          {showAutoPlay && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-10">
              <h3 className="text-xl font-bold mb-2">Next video starts in {countdown} seconds...</h3>
              <p className="text-gray-300 mb-6">{recommendations[0]?.title}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    clearInterval(countdownIntervalRef.current);
                    navigate(`/dashboard/videos/${recommendations[0].id}`);
                  }}
                  className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200"
                >
                  Play Now
                </button>
                <button 
                  onClick={cancelAutoPlay}
                  className="bg-gray-800 text-white border border-gray-600 px-6 py-2 rounded-full font-bold hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
              {video.uploaderName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-900">{video.uploaderName}</p>
              <p className="text-xs text-gray-500">{new Date(video.createdAt).toLocaleDateString()} • {video.viewCount} views</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${video.liked ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
            >
              <span>{video.liked ? '👍' : '👍'}</span>
              <span>{video.likeCount}</span>
            </button>
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${video.saved ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
            >
              {video.saved ? '📥 Saved' : '➕ Save'}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-sm text-gray-800 whitespace-pre-wrap">
          {video.description}
        </div>

        {/* Comments Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">{video.commentCount} Comments</h2>
          
          <form onSubmit={submitComment} className="flex gap-3 mb-8">
            <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-grow">
              <input 
                type="text" 
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border-b border-gray-300 focus:border-blue-500 bg-transparent py-2 outline-none"
              />
              {newComment.trim() && (
                <div className="flex justify-end mt-2 gap-2">
                  <button type="button" onClick={() => setNewComment('')} className="px-4 py-1.5 rounded-full hover:bg-gray-100 text-sm font-medium">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm font-medium">Comment</button>
                </div>
              )}
            </div>
          </form>

          <div className="space-y-6">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center shrink-0">
                  {c.studentName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-gray-900">{c.studentName}</span>
                    <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-800 text-sm">{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Recommendations */}
      <div className="w-full lg:w-1/3 xl:w-1/4">
        <h3 className="font-bold text-lg mb-4 text-gray-900">Recommended For You</h3>
        <div className="flex flex-col gap-3">
          {recommendations.map(rec => (
            <div 
              key={rec.id} 
              onClick={() => navigate(`/dashboard/videos/${rec.id}`)}
              className="flex gap-3 cursor-pointer group"
            >
              <div className="w-40 aspect-video rounded-lg overflow-hidden bg-gray-100 relative shrink-0">
                <img src={rec.thumbnailUrl} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {rec.progress?.percentageWatched > 0 && (
                   <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                     <div 
                       className="h-full bg-red-600" 
                       style={{ width: `${rec.progress.percentageWatched}%` }}
                     />
                   </div>
                )}
              </div>
              <div className="flex-grow py-1">
                <h4 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600">{rec.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{rec.uploaderName}</p>
                <p className="text-xs text-gray-500">{rec.viewCount} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerView;
