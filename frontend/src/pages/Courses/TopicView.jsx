import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, ArrowLeft, Loader2, Video, FileText, CheckCircle, Circle, Lock, Award, BookOpen, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import courseService from '../../services/courseService';
import StudentQuizView from './StudentQuizView';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export default function TopicView() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content'); // mobile only

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

  const simulateWatchVideo = async (videoId) => {
    try {
      toast.loading('Watching video...', { id: 'watchVideo' });
      const newProgress = await courseService.updateVideoProgress(topicId, {
        videoId,
        watchPercentage: 100
      });
      setProgress(newProgress);
      toast.success('Video marked as watched!', { id: 'watchVideo' });
    } catch (err) {
      toast.error('Failed to update progress', { id: 'watchVideo' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-8">
        <LoadingSkeleton count={3} type="card" />
      </div>
    );
  }

  if (!topic) {
    return <div className="text-center py-20 text-slate-500 font-medium">Topic not found</div>;
  }

  const completionPercentage = () => {
    let score = 0;
    if (progress.reelsCompleted || progress.videoCompleted) score += 50;
    if (progress.quizCompleted) score += 50;
    return score;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-0.5">Topic Workspace</div>
            <h1 className="text-lg font-bold text-slate-900 truncate max-w-[200px] md:max-w-md">{topic.title}</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
           <div className="text-sm font-medium text-slate-600">
             {completionPercentage()}% Completed
           </div>
           <div className="w-32 bg-slate-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${completionPercentage()}%` }}></div>
           </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1600px] mx-auto w-full">
        
        {/* Mobile Tabs */}
        <div className="flex lg:hidden bg-white border-b border-slate-200 p-2 gap-2">
          <Button 
            variant={activeTab === 'content' ? 'primary' : 'ghost'} 
            size="sm" 
            className="flex-1"
            onClick={() => setActiveTab('content')}
          >
            Learning Content
          </Button>
          <Button 
            variant={activeTab === 'progress' ? 'primary' : 'ghost'} 
            size="sm" 
            className="flex-1"
            onClick={() => setActiveTab('progress')}
          >
            Progress & Quiz
          </Button>
        </div>

        {/* Left Pane: Content Area */}
        <div className={`flex-1 lg:flex flex-col h-full overflow-y-auto bg-slate-50 p-4 md:p-8 ${activeTab === 'content' ? 'flex' : 'hidden'}`}>
          <div className="max-w-4xl mx-auto w-full space-y-8 pb-12">
            
            {/* Description Card */}
            {topic.description && (
              <Card>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Topic Overview</h2>
                    <p className="text-slate-600 leading-relaxed">{topic.description}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Learning Path (Reels) */}
            <section>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <Badge variant="info" className="mb-2 bg-cyan-100 text-cyan-800 border-none">Quick Learning Path</Badge>
                  <h2 className="text-2xl font-extrabold text-slate-900">Concept Reels</h2>
                </div>
                {progress?.reelsCompleted && (
                  <Badge variant="success" className="flex items-center gap-1 border-none bg-emerald-100 text-emerald-800">
                    <CheckCircle size={14} /> Completed
                  </Badge>
                )}
              </div>
              
              {topic.reels && topic.reels.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {topic.reels.map((reel) => (
                    <motion.div 
                      whileHover={{ y: -5 }}
                      key={reel.id} 
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group cursor-pointer"
                      onClick={() => simulateWatchReel(reel.reelId)}
                    >
                      <div className="relative aspect-[9/16] bg-slate-900 w-full overflow-hidden">
                        {reel.thumbnailUrl ? (
                          <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 group-hover:scale-105 transition-transform duration-500">
                            <Video size={48} className="text-slate-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/40 transition-opacity backdrop-blur-sm">
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md mb-2">
                            <Play size={24} className="text-white ml-1" />
                          </div>
                          <span className="text-white text-xs font-bold px-3 py-1 bg-slate-900/50 rounded-full">Watch Reel</span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-bold text-white text-sm line-clamp-2 shadow-sm">{reel.title}</h3>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
                  <Video size={32} className="mx-auto mb-3 text-slate-300" />
                  <p>No concept reels available for this topic.</p>
                </div>
              )}
            </section>

            {/* Deep Learning Path (Videos) */}
            <section>
              <div className="flex justify-between items-end mb-6 mt-12">
                <div>
                  <Badge variant="primary" className="mb-2 bg-indigo-100 text-indigo-800 border-none">Deep Learning Path</Badge>
                  <h2 className="text-2xl font-extrabold text-slate-900">Comprehensive Lectures</h2>
                </div>
                {progress?.videoCompleted && (
                  <Badge variant="success" className="flex items-center gap-1 border-none bg-emerald-100 text-emerald-800">
                    <CheckCircle size={14} /> Completed
                  </Badge>
                )}
              </div>
              
              {topic.videos && topic.videos.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {topic.videos.map((video) => (
                    <motion.div 
                      whileHover={{ y: -5 }}
                      key={video.id} 
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group cursor-pointer flex flex-col"
                      onClick={() => simulateWatchVideo(video.videoId)}
                    >
                      <div className="relative aspect-video bg-slate-900 w-full overflow-hidden">
                        {video.thumbnailUrl ? (
                          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 group-hover:scale-105 transition-transform duration-500">
                            <Video size={48} className="text-slate-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/40 transition-opacity backdrop-blur-sm">
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md mb-2">
                            <Play size={24} className="text-white ml-1" />
                          </div>
                          <span className="text-white text-xs font-bold px-3 py-1 bg-slate-900/50 rounded-full">Watch Video</span>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <h3 className="font-bold text-slate-900 text-base line-clamp-2 mb-3">{video.title}</h3>
                        <div className="flex items-center text-xs font-bold text-slate-500 gap-4">
                          <span className="flex items-center gap-1"><Clock size={14}/> 45 mins</span>
                          <span className="flex items-center gap-1"><FileText size={14}/> Lecture Notes</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
                  <Video size={32} className="mx-auto mb-3 text-slate-300" />
                  <p>No video lectures available for this topic.</p>
                </div>
              )}
            </section>

          </div>
        </div>

        {/* Right Pane: Progress & Quiz Panel */}
        <div className={`w-full lg:w-[400px] shrink-0 border-l border-slate-200 bg-white h-full overflow-y-auto lg:flex flex-col ${activeTab === 'progress' ? 'flex' : 'hidden'}`}>
          <div className="p-6 space-y-8">
            
            {/* Checklist */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-indigo-600" /> Your Progress
              </h3>
              <div className="space-y-4 relative">
                <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-100 -z-10" />
                
                <div className="flex gap-4">
                  <div className="shrink-0 mt-0.5 bg-white">
                    {progress?.reelsCompleted || progress?.videoCompleted ? (
                      <CheckCircle size={24} className="text-emerald-500" />
                    ) : (
                      <Circle size={24} className="text-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${progress?.reelsCompleted || progress?.videoCompleted ? 'text-slate-900' : 'text-slate-500'}`}>1. Complete a Learning Path</div>
                    <p className="text-xs text-slate-500 mt-1">Watch either all concept reels or all deep learning videos.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 mt-0.5 bg-white">
                    {progress?.quizUnlocked ? (
                      progress?.quizCompleted ? <CheckCircle size={24} className="text-emerald-500" /> : <Circle size={24} className="text-indigo-500" />
                    ) : (
                      <Lock size={24} className="text-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${progress?.quizUnlocked ? 'text-slate-900' : 'text-slate-400'}`}>2. Pass Topic Assessment</div>
                    <p className="text-xs text-slate-500 mt-1">Test your knowledge to mark this topic as complete.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="shrink-0 mt-0.5 bg-white">
                    {progress?.topicCompleted ? (
                      <Award size={24} className="text-amber-500" />
                    ) : (
                      <Circle size={24} className="text-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${progress?.topicCompleted ? 'text-amber-600' : 'text-slate-400'}`}>3. Topic Completed</div>
                    <p className="text-xs text-slate-500 mt-1">Unlock the next module in the course.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-slate-100" />

            {/* Quiz Section */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-cyan-600" /> Topic Assessment
              </h3>
              
              {topic.hasQuiz ? (
                <div id="quiz-section" className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                  {progress?.quizUnlocked ? (
                    progress?.quizCompleted ? (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle size={32} className="text-emerald-600" />
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1">Assessment Passed</h4>
                        <p className="text-sm text-slate-600 mb-4">You have successfully mastered this topic.</p>
                        <StudentQuizView topicId={topic.id} onQuizComplete={fetchData} />
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-bold text-slate-700">Status</span>
                          <Badge variant="info">Unlocked</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">You're ready to take the assessment for this topic. Good luck!</p>
                        <StudentQuizView topicId={topic.id} onQuizComplete={fetchData} />
                      </div>
                    )
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock size={32} className="text-slate-400" />
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1">Assessment Locked</h4>
                      <p className="text-sm text-slate-500">Complete a learning path to unlock.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center border-dashed border-2 border-slate-200 rounded-2xl bg-white text-slate-500">
                  <p className="text-sm font-medium">No assessment required for this topic.</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
