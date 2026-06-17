import React, { useState, useEffect } from 'react';
import realService from '../../services/realService';

const StudentReals = () => {
  const [reals, setReals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReals();
  }, []);

  const fetchReals = async () => {
    try {
      const data = await realService.getReals();
      setReals(data);
    } catch (error) {
      console.error('Failed to fetch reals', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id, isLiked) => {
    try {
      if (isLiked) {
        await realService.unlikeReal(id);
      } else {
        await realService.likeReal(id);
      }
      fetchReals();
    } catch (error) {
      console.error('Like error', error);
    }
  };

  const handleSave = async (id, isSaved) => {
    try {
      if (isSaved) {
        await realService.unsaveReal(id);
      } else {
        await realService.saveReal(id);
      }
      fetchReals();
    } catch (error) {
      console.error('Save error', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading Reals...</div>;
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-center mb-6">Reals Feed</h2>
      
      {reals.map(real => (
        <div key={real.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {/* Video Placeholder */}
          <div className="aspect-[9/16] bg-black relative">
            <img src={real.thumbnailUrl} alt={real.title} className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">Video URL: {real.videoUrl}</span>
            </div>
            
            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-white font-bold text-lg">{real.title}</h3>
              <p className="text-gray-200 text-sm line-clamp-2">{real.description}</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center p-4">
            <div className="flex gap-4">
              <button 
                onClick={() => handleLike(real.id, real.liked)}
                className={`flex items-center gap-1 font-medium ${real.liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
              >
                <span>{real.liked ? '❤️' : '🤍'}</span>
                <span>{real.likesCount}</span>
              </button>
              
              <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500 font-medium">
                <span>💬</span>
                <span>{real.commentsCount}</span>
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
      ))}

      {reals.length === 0 && (
        <div className="text-center text-gray-500 py-12">No Reals available yet.</div>
      )}
    </div>
  );
};

export default StudentReals;
