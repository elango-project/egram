import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Settings, ChevronRight, ChevronDown, Video, PlaySquare, MoreVertical, Trash2, Award, AlignLeft, Target, Clock, BarChart2 } from 'lucide-react';
import ContentSelectorModal from '../../components/Courses/ContentSelectorModal';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import QuizBuilderModal from './QuizBuilderModal';
import AssessmentBuilderModal from './AssessmentBuilderModal';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for Course
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [durationMinutes, setDurationMinutes] = useState(0);
  
  // Expanded modules state
  const [expandedModules, setExpandedModules] = useState({});

  // Form state for Module
  const [moduleTitle, setModuleTitle] = useState('');

  // Quiz Builder state
  const [activeQuizTopic, setActiveQuizTopic] = useState(null);
  const [selectorType, setSelectorType] = useState(null);
  const [selectorTopicId, setSelectorTopicId] = useState(null);
  const [showAssessmentBuilder, setShowAssessmentBuilder] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getCourses();
      setCourses(data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({...prev, [moduleId]: !prev[moduleId]}));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await courseService.createCourse({ 
        title, description, thumbnailUrl, category, difficulty, durationMinutes 
      });
      setTitle(''); setDescription(''); setThumbnailUrl(''); setCategory('');
      setDifficulty('Beginner'); setDurationMinutes(0);
      setIsCreating(false);
      fetchCourses();
      toast.success('Course created successfully');
    } catch (error) {
      toast.error('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this Course?')) {
      try {
        await courseService.deleteCourse(id);
        fetchCourses();
        if (selectedCourse?.id === id) setSelectedCourse(null);
        toast.success('Course deleted');
      } catch (error) {
        toast.error('Failed to delete course');
      }
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index !== destination.index) {
      const topicId = source.droppableId.split('-')[1];
      const isReel = source.droppableId.startsWith('reels-');
      
      const module = selectedCourse.modules.find(m => m.topics?.some(t => t.id === topicId));
      if (!module) return;
      const topic = module.topics.find(t => t.id === topicId);
      
      const previousState = structuredClone(selectedCourse);
      
      if (isReel) {
        const newReels = Array.from(topic.reels || []);
        const [removed] = newReels.splice(source.index, 1);
        newReels.splice(destination.index, 0, removed);
        const reelIds = newReels.map(r => r.reelId);
        
        topic.reels = newReels;
        setSelectedCourse({...selectedCourse});

        try {
          await courseService.reorderTopicReels(topicId, reelIds);
          handleSelectCourse(selectedCourse);
        } catch(e) { toast.error('Failed to reorder reels'); setSelectedCourse(previousState); }
      } else {
        const newVideos = Array.from(topic.videos || []);
        const [removed] = newVideos.splice(source.index, 1);
        newVideos.splice(destination.index, 0, removed);
        const videoIds = newVideos.map(v => v.videoId);
        
        topic.videos = newVideos;
        setSelectedCourse({...selectedCourse});

        try {
          await courseService.reorderTopicVideos(topicId, videoIds);
          handleSelectCourse(selectedCourse);
        } catch(e) { toast.error('Failed to reorder videos'); setSelectedCourse(previousState); }
      }
    }
  };

  const handleAttachContent = async (contentId) => {
    if (!selectorTopicId || !selectorType) return;
    try {
      if (selectorType === 'REEL') {
        const topic = selectedCourse.modules.flatMap(m => m.topics).find(t => t.id === selectorTopicId);
        await courseService.addTopicReel(selectorTopicId, {
          reelId: contentId,
          reelOrder: (topic.reels?.length || 0) + 1
        });
        toast.success('Reel attached');
      } else {
        const topic = selectedCourse.modules.flatMap(m => m.topics).find(t => t.id === selectorTopicId);
        await courseService.addTopicVideo(selectorTopicId, {
          videoId: contentId,
          videoOrder: (topic.videos?.length || 0) + 1
        });
        toast.success('Video attached');
      }
      setSelectorType(null);
      setSelectorTopicId(null);
      handleSelectCourse(selectedCourse);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to attach content');
    }
  };

  const handleSelectCourse = async (course) => {
    try {
      const detailedCourse = await courseService.getCourseById(course.id);
      setSelectedCourse(detailedCourse);
      setIsCreating(false);
      // Auto expand first module
      if (detailedCourse.modules?.length > 0) {
        setExpandedModules(prev => ({...prev, [detailedCourse.modules[0].id]: true}));
      }
    } catch (error) {
      toast.error('Failed to load course details');
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    setLoading(true);
    try {
      await courseService.addModule(selectedCourse.id, {
        title: moduleTitle,
        moduleOrder: (selectedCourse.modules?.length || 0) + 1
      });
      setModuleTitle('');
      handleSelectCourse(selectedCourse);
      fetchCourses();
      toast.success('Module added');
    } catch (error) {
      toast.error('Failed to add module');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white -mt-6 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden font-sans border-t border-slate-200">
      
      {/* Left Sidebar: Course Explorer */}
      <div className="w-80 flex flex-col border-r border-slate-200 bg-slate-50/50 shrink-0 h-full">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <BookOpen size={18} className="text-slate-500" />
              Course Explorer
            </h2>
          </div>
          <Button 
            className="w-full justify-center bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
            onClick={() => { setIsCreating(true); setSelectedCourse(null); }}
            icon={<Plus size={16} />}
          >
            Create Course
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {courses.map(course => (
            <div 
              key={course.id}
              onClick={() => handleSelectCourse(course)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                selectedCourse?.id === course.id 
                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-900 shadow-sm' 
                  : 'hover:bg-slate-100/80 text-slate-700 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedCourse?.id === course.id ? 'bg-indigo-100 text-indigo-600' : 'bg-white border border-slate-200 text-slate-400'}`}>
                  <BookOpen size={14} />
                </div>
                <div className="truncate">
                  <div className="font-bold text-sm truncate">{course.title}</div>
                  <div className="text-xs text-slate-500">{course.totalModules} Modules</div>
                </div>
              </div>
              <button 
                onClick={(e) => handleDeleteCourse(course.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">No courses found.</div>
          )}
        </div>
      </div>

      {/* Center Workspace: Course Builder */}
      <div className="flex-1 overflow-y-auto bg-white relative h-full">
        {isCreating ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto p-8 lg:p-12">
            <div className="mb-8 border-b border-slate-100 pb-6">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Course</h1>
              <p className="text-slate-500 mt-2">Set up the foundational details for your new learning path.</p>
            </div>
            
            <form onSubmit={handleCreateCourse} className="space-y-6 bg-white">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="e.g. Advanced System Design" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Thumbnail URL</label>
                <input type="url" required value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="https://..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                  <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Engineering" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm bg-white">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Estimated Duration (mins)</label>
                <input type="number" min="0" value={durationMinutes} onChange={e => setDurationMinutes(parseInt(e.target.value) || 0)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm min-h-[120px]" placeholder="What will students learn?" />
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)} className="px-6 py-3">Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 shadow-lg">{loading ? 'Creating...' : 'Create Course'}</Button>
              </div>
            </form>
          </motion.div>
        ) : selectedCourse ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto p-6 lg:p-12 pb-32">
            
            {/* Course Header (Notion Style) */}
            <div className="mb-12 group">
              {selectedCourse.thumbnailUrl && (
                <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8 border border-slate-200 shadow-sm relative">
                  <img src={selectedCourse.thumbnailUrl} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 flex items-center gap-3">
                {selectedCourse.title}
                <Settings size={24} className="text-slate-300 hover:text-slate-600 cursor-pointer transition-colors" />
              </h1>
              
              {/* Premium Chips */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200">
                  <AlignLeft size={14} /> {selectedCourse.category || 'Uncategorized'}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-bold border border-indigo-100">
                  <Target size={14} /> {selectedCourse.difficulty}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100">
                  <Clock size={14} /> {Math.floor(selectedCourse.durationMinutes / 60)}h {selectedCourse.durationMinutes % 60}m
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-bold border border-amber-100">
                  <BarChart2 size={14} /> {selectedCourse.enrollmentCount} Enrolled
                </span>
              </div>

              <p className="text-lg text-slate-600 leading-relaxed max-w-3xl whitespace-pre-wrap">
                {selectedCourse.description}
              </p>
            </div>

            {/* Tree Structured Builder */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="text-indigo-600" size={20} /> Curriculum Builder
                </h3>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="space-y-4">
                  {selectedCourse.modules?.map((mod, index) => (
                    <div key={mod.id} className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden transition-all">
                      {/* Module Header (Accordion) */}
                      <div 
                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors ${expandedModules[mod.id] ? 'bg-slate-50 border-b border-slate-200' : ''}`}
                        onClick={() => toggleModule(mod.id)}
                      >
                        <div className="flex items-center gap-3">
                          <button className="text-slate-400 hover:text-slate-700">
                            {expandedModules[mod.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>
                          <div>
                            <span className="text-sm font-bold text-indigo-600 mr-2 uppercase tracking-wider">Module {index + 1}</span>
                            <span className="font-bold text-slate-900 text-lg">{mod.title}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">{mod.topics?.length || 0} Topics</span>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }} className="text-slate-400 hover:text-rose-600 p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Topics inside Module */}
                      <AnimatePresence>
                        {expandedModules[mod.id] && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            className="p-4 bg-slate-50/50"
                          >
                            <div className="pl-8 space-y-4 border-l-2 border-slate-200 ml-3">
                              {mod.topics?.map((topic, tIndex) => (
                                <div key={topic.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative group">
                                  
                                  {/* Topic Header */}
                                  <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
                                    <div>
                                      <h5 className="font-bold text-slate-900 flex items-center gap-2">
                                        <span className="text-slate-400 text-sm font-medium">{index + 1}.{tIndex + 1}</span>
                                        {topic.title}
                                      </h5>
                                      <div className="flex gap-2 mt-2">
                                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md"><Clock size={12} /> {topic.estimatedDurationMinutes}m</span>
                                        {topic.hasQuiz && <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100"><Award size={12} /> Quiz Attached</span>}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" className="h-8 text-xs py-0 px-3 bg-white" onClick={() => setActiveQuizTopic(topic)}>
                                        Manage Quiz
                                      </Button>
                                      <button onClick={() => { if(window.confirm('Delete topic?')) courseService.deleteTopic(topic.id).then(()=>handleSelectCourse(selectedCourse)); }} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50">
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Visual Learning Paths */}
                                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    
                                    {/* Quick Path */}
                                    <div className="bg-cyan-50/50 rounded-xl border border-cyan-100 p-3">
                                      <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
                                          <PlaySquare size={14} className="text-cyan-600" /> Quick Path (Reels)
                                        </span>
                                        <button onClick={() => { setSelectorType('REEL'); setSelectorTopicId(topic.id); }} className="text-cyan-700 hover:bg-cyan-100 px-2 py-1 rounded text-xs font-bold transition-colors">
                                          + Add
                                        </button>
                                      </div>
                                      <Droppable droppableId={`reels-${topic.id}`}>
                                        {(provided) => (
                                          <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 min-h-[40px]">
                                            {topic.reels?.map((reel, rIdx) => (
                                              <Draggable key={reel.id} draggableId={`reel-${reel.reelId}`} index={rIdx}>
                                                {(provided) => (
                                                  <li ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-cyan-100 shadow-sm group/item">
                                                    <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-500 cursor-grab"><MoreVertical size={14} /></div>
                                                    <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden shrink-0">{reel.thumbnailUrl && <img src={reel.thumbnailUrl} className="w-full h-full object-cover"/>}</div>
                                                    <span className="text-xs font-bold text-slate-700 truncate flex-1">{reel.title}</span>
                                                    <button onClick={() => courseService.deleteTopicReel(topic.id, reel.reelId).then(()=>handleSelectCourse(selectedCourse))} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 px-1"><Trash2 size={12} /></button>
                                                  </li>
                                                )}
                                              </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {(!topic.reels || topic.reels.length === 0) && <div className="text-xs text-cyan-600/50 italic py-2 text-center border border-dashed border-cyan-200 rounded-lg">Drag reels here</div>}
                                          </ul>
                                        )}
                                      </Droppable>
                                    </div>

                                    {/* Deep Path */}
                                    <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-3">
                                      <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                                          <Video size={14} className="text-indigo-600" /> Deep Path (Videos)
                                        </span>
                                        <button onClick={() => { setSelectorType('VIDEO'); setSelectorTopicId(topic.id); }} className="text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded text-xs font-bold transition-colors">
                                          + Add
                                        </button>
                                      </div>
                                      <Droppable droppableId={`videos-${topic.id}`}>
                                        {(provided) => (
                                          <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 min-h-[40px]">
                                            {topic.videos?.map((video, vIdx) => (
                                              <Draggable key={video.id} draggableId={`video-${video.videoId}`} index={vIdx}>
                                                {(provided) => (
                                                  <li ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-indigo-100 shadow-sm group/item">
                                                    <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-500 cursor-grab"><MoreVertical size={14} /></div>
                                                    <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden shrink-0">{video.thumbnailUrl && <img src={video.thumbnailUrl} className="w-full h-full object-cover"/>}</div>
                                                    <span className="text-xs font-bold text-slate-700 truncate flex-1">{video.title}</span>
                                                    <button onClick={() => courseService.deleteTopicVideo(topic.id, video.videoId).then(()=>handleSelectCourse(selectedCourse))} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 px-1"><Trash2 size={12} /></button>
                                                  </li>
                                                )}
                                              </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {(!topic.videos || topic.videos.length === 0) && <div className="text-xs text-indigo-600/50 italic py-2 text-center border border-dashed border-indigo-200 rounded-lg">Drag videos here</div>}
                                          </ul>
                                        )}
                                      </Droppable>
                                    </div>

                                  </div>
                                </div>
                              ))}

                              {/* Add Topic Quick Input */}
                              <form onSubmit={async (e) => {
                                e.preventDefault();
                                const title = e.target.topicTitle.value;
                                if (!title) return;
                                setLoading(true);
                                try {
                                  await courseService.addTopic(mod.id, { title, description: '', estimatedDurationMinutes: 10, topicOrder: (mod.topics?.length || 0) + 1 });
                                  e.target.reset(); handleSelectCourse(selectedCourse);
                                } finally { setLoading(false); }
                              }} className="flex items-center gap-2 mt-4">
                                <Plus size={16} className="text-slate-400 absolute ml-3" />
                                <input name="topicTitle" placeholder="Add new topic..." required className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                              </form>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                  
                  {/* Add Module Input */}
                  <form onSubmit={handleAddModule} className="pt-4 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add new module..." 
                      value={moduleTitle}
                      onChange={e => setModuleTitle(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                    <Button type="submit" disabled={loading || !moduleTitle} className="bg-slate-900 text-white hover:bg-slate-800">Add Module</Button>
                  </form>
                </div>
              </DragDropContext>

              {/* Assessment Block */}
              <div className="mt-12">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                  <div className="relative z-10">
                    <h4 className="text-2xl font-extrabold flex items-center gap-2 mb-2"><Award className="text-amber-400" /> Final Assessment</h4>
                    <p className="text-slate-300 font-medium max-w-md">Configure the final certification exam. Students must pass this to complete the course.</p>
                  </div>
                  <Button 
                    className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg px-6 py-3 whitespace-nowrap relative z-10"
                    onClick={() => setShowAssessmentBuilder(true)}
                  >
                    Manage Exam
                  </Button>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <EmptyState 
              icon={<BookOpen size={48} />}
              title="Course Workspace"
              description="Select a course from the sidebar to start building your curriculum, or create a new one."
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {activeQuizTopic && <QuizBuilderModal topic={activeQuizTopic} onClose={() => { setActiveQuizTopic(null); handleSelectCourse(selectedCourse); }} />}
      {selectorType && selectorTopicId && (
        <ContentSelectorModal
          type={selectorType}
          existingIds={selectorType === 'REEL' ? selectedCourse.modules.flatMap(m => m.topics).find(t => t.id === selectorTopicId)?.reels?.map(r => r.reelId) || [] : selectedCourse.modules.flatMap(m => m.topics).find(t => t.id === selectorTopicId)?.videos?.map(v => v.videoId) || []}
          onSelect={handleAttachContent}
          onClose={() => { setSelectorType(null); setSelectorTopicId(null); }}
        />
      )}
      {showAssessmentBuilder && <AssessmentBuilderModal course={selectedCourse} onClose={() => setShowAssessmentBuilder(false)} />}
    </div>
  );
};

export default AdminCourses;
