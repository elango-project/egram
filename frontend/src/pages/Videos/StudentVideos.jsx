import React, { useState, useEffect } from 'react';
import videoService from '../../services/videoService';

const StudentVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const data = await videoService.getVideos();
      setVideos(data);
    } catch (error) {
      console.error('Failed to fetch videos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id, isLiked, e) => {
    if (e) e.stopPropagation();
    try {
      if (isLiked) {
        await videoService.unlikeVideo(id);
      } else {
        await videoService.likeVideo(id);
      }
      fetchVideos();
      if (selectedVideo && selectedVideo.id === id) {
        const updated = await videoService.getVideoById(id);
        setSelectedVideo(updated);
      }
    } catch (error) {
      console.error('Like error', error);
    }
  };

  const handleSave = async (id, isSaved, e) => {
    if (e) e.stopPropagation();
    try {
      if (isSaved) {
        await videoService.unsaveVideo(id);
      } else {
        await videoService.saveVideo(id);
      }
      fetchVideos();
      if (selectedVideo && selectedVideo.id === id) {
        const updated = await videoService.getVideoById(id);
        setSelectedVideo(updated);
      }
    } catch (error) {
      console.error('Save error', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading Videos...</div>;
  }

  // Details View
  if (selectedVideo) {
    return (
      <div>
        <button 
          onClick={() => setSelectedVideo(null)}
          className="mb-4 text-blue-600 hover:underline font-medium"
        >
          &larr; Back to Videos
        </button>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="aspect-video bg-black relative">
            <img src={selectedVideo.thumbnailUrl} alt={selectedVideo.title} className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full border border-gray-600">Video URL: {selectedVideo.videoUrl}</span>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h2>
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <span>{new Date(selectedVideo.createdAt).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>By {selectedVideo.uploadedBy.fullName}</span>
            </div>
            
            <p className="text-gray-700 mb-8 whitespace-pre-wrap">{selectedVideo.description}</p>
            
            <div className="flex gap-4 border-t pt-4 border-gray-100">
              <button 
                onClick={() => handleLike(selectedVideo.id, selectedVideo.liked)}
                className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 ${selectedVideo.liked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <span>{selectedVideo.liked ? '❤️ Liked' : '🤍 Like'}</span>
                <span>{selectedVideo.likesCount}</span>
              </button>
              
              <button 
                onClick={() => handleSave(selectedVideo.id, selectedVideo.saved)}
                className={`px-4 py-2 rounded-full font-medium ${selectedVideo.saved ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {selectedVideo.saved ? '📥 Saved' : '📩 Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Long-form Videos</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
          <div 
            key={video.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="aspect-video relative overflow-hidden bg-gray-100">
              <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{video.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{video.uploadedBy.fullName}</p>
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-3 text-sm font-medium">
                  <span className={`${video.liked ? 'text-red-500' : 'text-gray-500'}`}>❤️ {video.likesCount}</span>
                  <span className="text-gray-500">💬 {video.commentsCount}</span>
                </div>
                {video.saved && <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">Saved</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center text-gray-500 py-12">No Videos available yet.</div>
      )}
    </div>
  );
};

export default StudentVideos;
