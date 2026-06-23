import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, ArrowLeft, Loader2, Video, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import StudentQuizView from './StudentQuizView';

export default function TopicView() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [topicId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [topicData, progressData] = await Promise.all([
        courseService.getTopic(topicId),
        courseService.getTopicProgress(topicId)
      ]);
      setTopic(topicData);
      setProgress(progressData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load topic details');
    } finally {
      setLoading(false);
    }
  };

  const simulateWatchReel = async (reelId) => {
    try {
      toast.loading('Watching reel...', { id: 'watch' });
      const newProgress = await courseService.updateReelProgress(topicId, {
        reelId,
        watchPercentage: 100
      });
      setProgress(newProgress);
      toast.success('Reel marked as watched!', { id: 'watch' });
    } catch (err) {
      toast.error('Failed to update progress', { id: 'watch' });
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
    return <div className="text-center py-20 text-gray-500">Topic not found</div>;
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

      {/* Progress Card */}
      {progress && (
        <div className={`mb-8 p-4 rounded-xl border flex items-center justify-between ${progress.topicCompleted ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center gap-3">
            {progress.topicCompleted ? (
              <CheckCircle className="text-green-600 w-8 h-8" />
            ) : (
              <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
            )}
            <div>
              <h3 className={`font-bold ${progress.topicCompleted ? 'text-green-800' : 'text-blue-800'}`}>
                {progress.topicCompleted ? 'Topic Completed!' : 'In Progress'}
              </h3>
              <p className={`text-sm ${progress.topicCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                Learning Path: {progress.reelsCompleted || progress.videoCompleted ? 'Done ✓' : 'Pending'} • 
                Quiz: {progress.quizCompleted ? 'Passed ✓' : (progress.quizUnlocked ? 'Unlocked' : 'Locked')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Topic Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{topic.title}</h1>
        {topic.description && (
          <p className="text-gray-600 mb-4">{topic.description}</p>
        )}
      </div>

      <div className="space-y-12">
        {/* Quick Learning Path */}
        <div>
          <div className="flex justify-between items-end mb-4 border-b pb-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 w-2 h-6 rounded-full inline-block"></span>
              Quick Learning Path (Reels)
            </h2>
            {progress?.reelsCompleted && <span className="text-green-600 font-bold flex items-center gap-1 text-sm"><CheckCircle size={16}/> Path Completed</span>}
          </div>
          
          {topic.reels && topic.reels.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {topic.reels.map((reel) => (
                <div key={reel.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group">
                  <div className="relative aspect-[9/16] bg-gray-900 w-full cursor-pointer" onClick={() => simulateWatchReel(reel.reelId)}>
                    {reel.thumbnailUrl ? (
                      <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <Video size={48} className="text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                      <Play size={32} className="text-white mb-2" />
                      <span className="text-white text-xs font-semibold px-2 py-1 bg-black/50 rounded">Click to simulate watch</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{reel.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No reels attached.</p>
          )}
        </div>

        {/* Deep Learning Path */}
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

        {/* Quiz Section */}
        {topic.hasQuiz && (
          <div id="quiz-section">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
              <span className="bg-gradient-to-r from-green-400 to-emerald-600 w-2 h-6 rounded-full inline-block"></span>
              Topic Assessment
            </h2>
            
            {progress?.quizUnlocked ? (
              <StudentQuizView topicId={topic.id} onQuizComplete={fetchData} />
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
                <FileText size={32} className="mx-auto text-gray-400 mb-3" />
                <h3 className="text-gray-700 font-semibold mb-1">Quiz is Locked</h3>
                <p className="text-gray-500 text-sm">Complete a learning path above to unlock the topic quiz.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
