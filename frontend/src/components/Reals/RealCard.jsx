import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Eye, Play, Pause, GraduationCap } from 'lucide-react';
import realService from '../../services/realService';

const RealCard = ({ real, isActive, onLike, onSave, onCommentClick }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const [viewRecorded, setViewRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);

  // Play/Pause based on isActive prop
  useEffect(() => {
    if (isActive) {
      if (videoRef.current) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log('Autoplay blocked:', e));
      }
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  // View tracking: 3 seconds visible
  useEffect(() => {
    let timeoutId;
    if (isActive && !viewRecorded) {
      const viewedReels = new Set(JSON.parse(sessionStorage.getItem('viewedReels') || '[]'));
      if (!viewedReels.has(real.id)) {
        timeoutId = setTimeout(() => {
          realService.recordView(real.id).catch(console.error);
          viewedReels.add(real.id);
          sessionStorage.setItem('viewedReels', JSON.stringify(Array.from(viewedReels)));
          setViewRecorded(true);
        }, 3000);
      } else {
        setViewRecorded(true);
      }
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isActive, viewRecorded, real.id]);

  // Progress tracking for HTML5 Video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  // Progress tracking for YouTube
  useEffect(() => {
    if (isActive && real.youtubeVideoId) {
      progressInterval.current = setInterval(() => {
        if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime && ytPlayerRef.current.getDuration) {
          const currentTime = ytPlayerRef.current.getCurrentTime();
          const duration = ytPlayerRef.current.getDuration();
          if (duration > 0) {
            setProgress((currentTime / duration) * 100);
          }
        }
      }, 500);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isActive, real.youtubeVideoId]);

  const onYtReady = (e) => {
    ytPlayerRef.current = e.target;
    if (isActive) {
      ytPlayerRef.current.playVideo();
      setIsPlaying(true);
    } else {
      ytPlayerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!isActive) return;
    
    if (real.youtubeVideoId) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
      } else {
        ytPlayerRef.current.playVideo();
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div 
      data-id={real.id}
      className="reel-item relative w-full h-[100dvh] bg-black snap-start flex items-center justify-center overflow-hidden shrink-0"
    >
      {/* Video Layer */}
      <div 
        className="absolute inset-0 flex items-center justify-center w-full h-full cursor-pointer"
        onClick={togglePlay}
      >
        {real.youtubeVideoId ? (
          <div className="w-[300%] md:w-[150%] h-[150%] pointer-events-none">
            {/* Scale up YouTube to hide borders/branding and act like vertical video */}
            <YouTube
              videoId={real.youtubeVideoId}
              opts={{
                width: '100%',
                height: '100%',
                playerVars: {
                  autoplay: isActive ? 1 : 0,
                  controls: 0,
                  rel: 0,
                  modestbranding: 1,
                  loop: 1,
                  playlist: real.youtubeVideoId,
                  playsinline: 1,
                  disablekb: 1,
                  fs: 0
                }
              }}
              onReady={onYtReady}
              className="w-full h-full transform scale-[1.3] opacity-90"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={real.videoUrl}
            className="w-full h-full object-cover pointer-events-auto"
            loop
            muted={false}
            playsInline
            onClick={togglePlay}
          />
        )}
      </div>

      {/* Play/Pause overlay indicator */}
      {!isPlaying && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/20">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Play size={40} className="text-white ml-2" />
          </motion.div>
        </div>
      )}

      {/* Gradient Overlays for Text Legibility */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

      {/* Overlay - Text Info (Bottom Left) */}
      <div className="absolute bottom-6 left-4 right-20 z-20 text-white">
        <h3 className="font-bold text-lg mb-2 shadow-sm">{real.title}</h3>
        {real.description && (
          <p className="text-sm line-clamp-2 mb-3 text-gray-200">{real.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md">
            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
              {real.uploaderName?.charAt(0).toUpperCase() || 'U'}
            </div>
            {real.uploaderName}
          </div>
          {real.category && (
            <span className="bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm font-medium border border-white/10">
              {real.category}
            </span>
          )}
        </div>
        
        {/* Course CTA */}
        {real.topicId && (
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/courses/topic/${real.topicId}`); }}
            className="mt-4 flex items-center gap-2 bg-indigo-600/90 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl backdrop-blur-md transition-all active:scale-95"
          >
            <GraduationCap size={16} />
            <span className="font-bold text-sm">View Full Topic</span>
          </button>
        )}
      </div>

      {/* Sidebar - Actions (Bottom Right) */}
      <div className="absolute bottom-6 right-2 z-20 flex flex-col items-center gap-5 text-white">
        <motion.button 
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); onLike(real.id, real.liked); }} 
          className="flex flex-col items-center group"
        >
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <Heart size={24} className={real.liked ? "fill-rose-500 text-rose-500" : "text-white"} />
          </div>
          <span className="text-xs font-bold mt-1.5 drop-shadow-md">{real.likeCount || 0}</span>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); onCommentClick(real.id); }} 
          className="flex flex-col items-center group"
        >
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <MessageCircle size={24} className="text-white" />
          </div>
          <span className="text-xs font-bold mt-1.5 drop-shadow-md">{real.commentCount || 0}</span>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); onSave(real.id, real.saved); }} 
          className="flex flex-col items-center group"
        >
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <Bookmark size={24} className={real.saved ? "fill-white text-white" : "text-white"} />
          </div>
          <span className="text-xs font-bold mt-1.5 drop-shadow-md">Save</span>
        </motion.button>

        <div className="flex flex-col items-center mt-2 opacity-80">
          <Eye size={20} className="text-white" />
          <span className="text-[10px] font-bold mt-1 drop-shadow-md">{real.viewCount || 0}</span>
        </div>
      </div>

      {/* Progress Bar (Bottom Edge) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div 
          className="h-full bg-white transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default RealCard;
