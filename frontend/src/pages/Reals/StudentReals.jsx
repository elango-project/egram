import React, { useState, useEffect, useRef, useCallback } from 'react';
import realService from '../../services/realService';
import RealCard from '../../components/Reals/RealCard';

const StudentReals = () => {
  const [reals, setReals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [activeRealId, setActiveRealId] = useState(null);
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

  // Active Reel tracking Observer
  const activeObserver = useRef(null);

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
        const combined = pageNumber === 0 ? data.content : [...prev, ...newReals];
        
        // Auto-play the first reel initially if we have no active reel
        if (pageNumber === 0 && combined.length > 0) {
          setActiveRealId(combined[0].id);
        }
        
        return combined;
      });
      setHasMore(!data.last);
    } catch (error) {
      console.error('Failed to fetch reals', error);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  // Setup Active Reel tracking Intersection Observer
  useEffect(() => {
    if (activeObserver.current) activeObserver.current.disconnect();
    
    activeObserver.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.dataset.id;
          setActiveRealId(id);
        }
      });
    }, { threshold: 0.7 });

    const reelElements = document.querySelectorAll('.reel-item');
    reelElements.forEach(el => activeObserver.current.observe(el));

    return () => {
      if (activeObserver.current) activeObserver.current.disconnect();
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
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl animate-pulse">Loading Reels...</div>
      </div>
    );
  }

  return (
    <div className="bg-black w-full min-h-screen relative flex justify-center">
      
      {/* Feed Container */}
      <div className="w-full sm:max-w-[500px] h-[100dvh] overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative bg-black">
        {reals.map((real, index) => {
          const isLastElement = reals.length === index + 1;
          return (
            <div 
              key={real.id} 
              ref={isLastElement ? lastRealElementRef : null}
            >
              <RealCard 
                real={real} 
                isActive={activeRealId === real.id}
                onLike={handleLike}
                onSave={handleSave}
                onCommentClick={openComments}
              />
            </div>
          );
        })}

        {fetchingMore && (
          <div className="h-20 flex items-center justify-center snap-start bg-black shrink-0">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!hasMore && reals.length > 0 && (
          <div className="h-40 flex flex-col items-center justify-center snap-start bg-black text-gray-400 shrink-0">
            <p className="text-sm">You've seen all the reels!</p>
            <p className="text-xs mt-1">Check back later for more.</p>
          </div>
        )}

        {reals.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-white mb-2">No Reels Yet</h3>
            <p className="text-sm">Be the first to upload content!</p>
          </div>
        )}
      </div>

      {/* Comments Drawer (Modal) */}
      {activeCommentsRealId && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveCommentsRealId(null)}></div>
          <div className="bg-gray-900 w-full sm:max-w-[500px] mx-auto rounded-t-2xl shadow-2xl z-10 flex flex-col border border-gray-800 border-b-0 transition-transform" style={{ height: '70vh' }}>
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="font-bold text-lg text-white">Comments</h3>
              <button onClick={() => setActiveCommentsRealId(null)} className="text-gray-400 hover:text-white p-2">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No comments yet. Be the first!</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="flex flex-col mb-4">
                    <span className="font-semibold text-sm text-gray-300">{c.studentName}</span>
                    <span className="text-white mt-1 text-sm">{c.comment}</span>
                    <span className="text-xs text-gray-500 mt-1">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment} className="p-4 border-t border-gray-800 flex gap-2 bg-gray-900">
              <input 
                type="text" 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..." 
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button type="submit" disabled={!newComment.trim()} className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors">Post</button>
            </form>
          </div>
        </div>
      )}
      
      {/* Hide scrollbar globally for the feed */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default StudentReals;
