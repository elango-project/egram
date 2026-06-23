import React, { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import realService from '../../services/realService';

const RealCard = ({ real, isActive, onLike, onSave, onCommentClick }) => {
  const videoRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const [viewRecorded, setViewRecorded] = useState(false);

  // Play/Pause based on isActive prop
  useEffect(() => {
    if (isActive) {
      if (videoRef.current) {
        videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
      }
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        ytPlayerRef.current.playVideo();
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        ytPlayerRef.current.pauseVideo();
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

  const onYtReady = (e) => {
    ytPlayerRef.current = e.target;
    if (isActive) {
      ytPlayerRef.current.playVideo();
    } else {
      ytPlayerRef.current.pauseVideo();
    }
  };

  return (
    <div 
      data-id={real.id}
      className="reel-item relative w-full h-[100dvh] bg-black snap-start flex items-center justify-center overflow-hidden shrink-0"
    >
      {/* Video Layer */}
      <div className="absolute inset-0 flex items-center justify-center w-full h-full pointer-events-none">
        {real.youtubeVideoId ? (
          <div className="w-full h-full pointer-events-auto">
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
                  playlist: real.youtubeVideoId // Required for loop in YT IFrame API
                }
              }}
              onReady={onYtReady}
              className="w-full h-full"
              style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}
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
          />
        )}
      </div>

      {/* Overlay - Text Info (Bottom Left) */}
      <div className="absolute bottom-4 left-4 right-20 z-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <h3 className="font-bold text-lg mb-1">{real.title}</h3>
        <p className="text-sm line-clamp-2 mb-2">{real.description}</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-gray-200">@{real.uploaderName}</span>
          {real.category && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {real.category}
            </span>
          )}
        </div>
      </div>

      {/* Sidebar - Actions (Bottom Right) */}
      <div className="absolute bottom-6 right-4 z-10 flex flex-col items-center gap-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <button onClick={() => onLike(real.id, real.liked)} className="flex flex-col items-center hover:scale-110 transition-transform">
          <span className="text-3xl">{real.liked ? '❤️' : '🤍'}</span>
          <span className="text-xs font-semibold mt-1">{real.likeCount || 0}</span>
        </button>

        <button onClick={() => onCommentClick(real.id)} className="flex flex-col items-center hover:scale-110 transition-transform">
          <span className="text-3xl">💬</span>
          <span className="text-xs font-semibold mt-1">{real.commentCount || 0}</span>
        </button>

        <button onClick={() => onSave(real.id, real.saved)} className="flex flex-col items-center hover:scale-110 transition-transform">
          <span className="text-3xl">
            {real.saved ? '📥' : '📩'}
          </span>
          <span className="text-xs font-semibold mt-1 text-center">Save</span>
        </button>

        <div className="flex flex-col items-center mt-2">
          <span className="text-xl">👁️</span>
          <span className="text-xs font-semibold mt-1">{real.viewCount || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default RealCard;
