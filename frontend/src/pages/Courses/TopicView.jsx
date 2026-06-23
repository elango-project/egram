import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, ArrowLeft, Loader2, Video, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';

export default function TopicView() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      const data = await courseService.getTopic(topicId);
      setTopic(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-20 text-gray-500">
        Topic not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 fade-in">
      {/* Back navigation */}
      <button 
        onClick={() => window.history.back()}
        className="flex items-center text-gray-500 hover:text-purple-600 mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Course Syllabus
      </button>

      {/* Topic Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{topic.title}</h1>
        {topic.description && (
          <p className="text-gray-600 mb-4">{topic.description}</p>
        )}
        <div className="flex flex-wrap gap-3">
          {topic.estimatedDurationMinutes > 0 && (
            <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
              ⏱ {topic.estimatedDurationMinutes} mins estimated
            </span>
          )}
          {topic.reels?.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Video size={14} /> {topic.reels.length} Reels
            </span>
          )}
        </div>
      </div>

      {/* Learning Paths */}
      <div className="space-y-8">
        
        {/* Quick Learning Path */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 w-2 h-6 rounded-full inline-block"></span>
            Quick Learning Path
          </h2>
          
          {topic.reels && topic.reels.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topic.reels.map((reel) => (
                <div key={reel.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                  {/* Thumbnail area */}
                  <div className="relative aspect-[9/16] bg-gray-900 w-full">
                    {reel.thumbnailUrl ? (
                      <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <Video size={48} className="text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play size={24} className="text-white ml-1" />
                      </div>
                    </div>
                    {/* Order badge */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                      {reel.reelOrder}
                    </div>
                  </div>
                  {/* Info area */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{reel.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
              <Video size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No reels attached to this topic yet.</p>
            </div>
          )}
        </div>

        {/* Deep Learning Path (Placeholder for Phase 3) */}
        <div className="opacity-50 grayscale pointer-events-none">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
            <span className="bg-gray-400 w-2 h-6 rounded-full inline-block"></span>
            Deep Learning Path (Coming Soon)
          </h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-center gap-4">
             <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
               <FileText className="text-gray-400" />
             </div>
             <div>
               <h4 className="font-semibold text-gray-600">Full Video Lesson</h4>
               <p className="text-sm text-gray-400">Available in a future update</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
