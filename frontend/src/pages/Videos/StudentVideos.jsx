import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import videoService from '../../services/videoService';

const StudentVideos = () => {
  const [continueWatching, setContinueWatching] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [continueData, feedData] = await Promise.all([
        videoService.getContinueWatching(),
        videoService.getFeedPage(0, 20) // MVP: just load first 20 for feed
      ]);
      setContinueWatching(continueData);
      setFeed(feedData.content);
    } catch (error) {
      console.error('Failed to fetch videos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (id) => {
    navigate(`/dashboard/videos/${id}`);
  };

  if (loading) {
    return <div className="text-center py-12">Loading Videos...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      
      {continueWatching.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Continue Watching</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {continueWatching.map(video => (
              <div 
                key={video.id} 
                onClick={() => handleVideoClick(video.id)}
                className="min-w-[280px] w-[280px] sm:min-w-[320px] sm:w-[320px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all group snap-start shrink-0"
              >
                <div className="aspect-video relative overflow-hidden bg-gray-900">
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" />
                  
                  {/* Progress Bar Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700/50">
                    <div 
                      className="h-full bg-red-600" 
                      style={{ width: `${video.progress?.percentageWatched || 0}%` }}
                    />
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <button className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-bold text-sm">Resume ➡️</button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{video.title}</h3>
                  <p className="text-xs text-gray-500">Watched {Math.round(video.progress?.percentageWatched || 0)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Recommended Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {feed.map(video => (
            <div 
              key={video.id} 
              className="bg-transparent group cursor-pointer"
              onClick={() => handleVideoClick(video.id)}
            >
              <div className="aspect-video relative overflow-hidden rounded-xl bg-gray-100 mb-3 shadow-sm border border-gray-200/50">
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {video.progress?.percentageWatched > 0 && (
                   <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                     <div 
                       className="h-full bg-red-600" 
                       style={{ width: `${video.progress.percentageWatched}%` }}
                     />
                   </div>
                )}
              </div>
              <div className="pr-4">
                <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{video.title}</h3>
                <p className="text-sm text-gray-500 mb-1">{video.uploaderName}</p>
                <div className="flex items-center text-xs text-gray-500 gap-2">
                  <span>{video.viewCount} views</span>
                  <span>•</span>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {feed.length === 0 && (
          <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">No Videos available yet.</div>
        )}
      </div>
    </div>
  );
};

export default StudentVideos;
