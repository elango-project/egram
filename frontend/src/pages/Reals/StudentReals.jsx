import React, { useState, useEffect, useRef, useCallback } from 'react';
import realService from '../../services/realService';
import YouTube from 'react-youtube';

const StudentReals = () => {
  const [reals, setReals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [activeCommentsRealId, setActiveCommentsRealId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const observer = useRef();
  
  const lastRealElementRef = useCallback(node => {
    if (loading || fetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, fetchingMore, hasMore]);

  // View Tracking Observer
  const viewObserver = useRef(null);

  useEffect(() => {
    fetchReals(0);
  }, []);

  useEffect(() => {
    if (page > 0) {
      fetchReals(page);
    }
  }, [page]);

  const fetchReals = async (pageNumber) => {
    if (pageNumber === 0) setLoading(true);
    else setFetchingMore(true);

    try {
      const data = await realService.getReals(pageNumber, 10);
      setReals(prev => {
        // deduplicate just in case
        const existingIds = new Set(prev.map(r => r.id));
        const newReals = data.content.filter(r => !existingIds.has(r.id));
        return pageNumber === 0 ? data.content : [...prev, ...newReals];
      });
      setHasMore(!data.last);
    } catch (error) {
      console.error('Failed to fetch reals', error);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  // Setup View Tracking Intersection Observer
  useEffect(() => {
    if (viewObserver.current) viewObserver.current.disconnect();
    
    const viewedReels = new Set(JSON.parse(sessionStorage.getItem('viewedReels') || '[]'));
    
    viewObserver.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.dataset.id;
          if (!viewedReels.has(id)) {
            // Wait for 1 second of visibility
            entry.target.viewTimeout = setTimeout(async () => {
              try {
                await realService.recordView(id);
                viewedReels.add(id);
                sessionStorage.setItem('viewedReels', JSON.stringify(Array.from(viewedReels)));
                
                // Optmistic update view count
                setReals(prev => prev.map(r => r.id === id ? { ...r, viewCount: r.viewCount + 1 } : r));
              } catch (err) {
                console.error("View tracking failed", err);
              }
            }, 1000);
          }
        } else {
          // Clear timeout if user scrolled past quickly
          if (entry.target.viewTimeout) {
            clearTimeout(entry.target.viewTimeout);
            entry.target.viewTimeout = null;
          }
        }
      });
    }, { threshold: 0.6 });

    const reelElements = document.querySelectorAll('.reel-item');
    reelElements.forEach(el => viewObserver.current.observe(el));

    return () => {
      if (viewObserver.current) viewObserver.current.disconnect();
    };
  }, [reals]);

  const handleLike = async (id, isLiked) => {
    // Optimistic Update
    setReals(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, liked: !isLiked, likeCount: isLiked ? r.likeCount - 1 : r.likeCount + 1 };
      }
      return r;
    }));

    try {
      if (isLiked) {
        await realService.unlikeReal(id);
      } else {
        await realService.likeReal(id);
      }
    } catch (error) {
      // Rollback
      console.error('Like error', error);
      setReals(prev => prev.map(r => {
        if (r.id === id) {
          return { ...r, liked: isLiked, likeCount: isLiked ? r.likeCount + 1 : r.likeCount - 1 };
        }
        return r;
      }));
    }
  };

  const handleSave = async (id, isSaved) => {
    // Optimistic Update
    setReals(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, saved: !isSaved };
      }
      return r;
    }));

    try {
      if (isSaved) {
        await realService.unsaveReal(id);
      } else {
        await realService.saveReal(id);
      }
    } catch (error) {
      // Rollback
      console.error('Save error', error);
      setReals(prev => prev.map(r => {
        if (r.id === id) {
          return { ...r, saved: isSaved };
        }
        return r;
      }));
    }
  };

  const handleShare = (real) => {
    const url = `${window.location.origin}/reals/${real.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const openComments = async (id) => {
    setActiveCommentsRealId(id);
    try {
      const data = await realService.getComments(id);
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments", error);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeCommentsRealId) return;

    try {
      const addedComment = await realService.addComment(activeCommentsRealId, newComment);
      setComments([addedComment, ...comments]);
      setNewComment('');
      // update count optimistically
      setReals(prev => prev.map(r => r.id === activeCommentsRealId ? { ...r, commentCount: r.commentCount + 1 } : r));
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  if (loading && page === 0) {
    return <div className="text-center py-12">Loading Reals...</div>;
  }

  return (
    <div className="max-w-md mx-auto space-y-8 pb-12">
      <h2 className="text-2xl font-bold text-center mb-6">Reals Feed</h2>
      
      {reals.map((real, index) => {
        const isLastElement = reals.length === index + 1;
        return (
          <div 
            key={real.id} 
            ref={isLastElement ? lastRealElementRef : null}
            data-id={real.id}
            className="reel-item bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-8"
          >
            {/* Video Player */}
            <div className="aspect-[9/16] bg-black relative flex items-center justify-center overflow-hidden">
              {real.youtubeVideoId ? (
                <YouTube
                  videoId={real.youtubeVideoId}
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
                  className="w-full h-full min-h-[500px]"
                  style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}
                />
              ) : (
                <>
                  <img src={real.thumbnailUrl} alt={real.title} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">Legacy Video: {real.videoUrl}</span>
                  </div>
                </>
              )}
              
              {/* Overlay Info (Only show if not playing YouTube, or we can overlay on top of youtube but it might block clicks. Let's place it below the video for now, or just keep overlay but pointer-events-none) */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                <h3 className="text-white font-bold text-lg">{real.title}</h3>
                <p className="text-gray-200 text-sm line-clamp-2">{real.description}</p>
                <div className="text-gray-300 text-xs mt-1 flex items-center gap-2">
                  <span>@{real.uploaderName}</span>
                  <span>•</span>
                  <span>{real.viewCount || 0} views</span>
                  {real.category && <span className="bg-blue-600/80 px-2 py-0.5 rounded text-white">{real.category}</span>}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center p-4">
              <div className="flex gap-4">
                <button 
                  onClick={() => handleLike(real.id, real.liked)}
                  className={`flex items-center gap-1 font-medium ${real.liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                >
                  <span className="text-xl">{real.liked ? '❤️' : '🤍'}</span>
                  <span>{real.likeCount || 0}</span>
                </button>
                
                <button 
                  onClick={() => openComments(real.id)}
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-500 font-medium"
                >
                  <span className="text-xl">💬</span>
                  <span>{real.commentCount || 0}</span>
                </button>
                
                <button 
                  onClick={() => handleShare(real)}
                  className="flex items-center gap-1 text-gray-600 hover:text-green-500 font-medium"
                >
                  <span className="text-xl">↗️</span>
                </button>
              </div>
              
              <button 
                onClick={() => handleSave(real.id, real.saved)}
                className={`font-medium ${real.saved ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                {real.saved ? 'Saved 📥' : 'Save 📩'}
              </button>
            </div>
          </div>
        );
      })}

      {fetchingMore && <div className="text-center py-4">Loading more...</div>}

      {!hasMore && reals.length > 0 && (
        <div className="text-center text-gray-500 py-4">You've seen all the reels!</div>
      )}

      {reals.length === 0 && (
        <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">🎬</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Reels Available Yet</h3>
          <p className="text-gray-500">Be the first to upload content and share it with the world.</p>
        </div>
      )}

      {/* Comments Drawer (Modal) */}
      {activeCommentsRealId && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setActiveCommentsRealId(null)}></div>
          <div className="bg-white w-full max-w-md mx-auto rounded-t-2xl shadow-2xl z-10 flex flex-col" style={{ height: '70vh' }}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg">Comments</h3>
              <button onClick={() => setActiveCommentsRealId(null)} className="text-gray-500 hover:text-black">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="flex flex-col">
                    <span className="font-semibold text-sm">{c.studentName}</span>
                    <span className="text-gray-800">{c.comment}</span>
                    <span className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment} className="p-4 border-t flex gap-2">
              <input 
                type="text" 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..." 
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" disabled={!newComment.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium disabled:opacity-50">Post</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReals;
