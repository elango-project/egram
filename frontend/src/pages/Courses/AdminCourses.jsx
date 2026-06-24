import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ContentSelectorModal from '../../components/Courses/ContentSelectorModal';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import QuizBuilderModal from './QuizBuilderModal';
import AssessmentBuilderModal from './AssessmentBuilderModal';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form state for Course
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [durationMinutes, setDurationMinutes] = useState(0);
  
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
      console.error('Failed to fetch courses', error);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await courseService.createCourse({ 
        title, description, thumbnailUrl, category, difficulty, durationMinutes 
      });
      setTitle('');
      setDescription('');
      setThumbnailUrl('');
      setCategory('');
      setDifficulty('Beginner');
      setDurationMinutes(0);
      fetchCourses();
    } catch (error) {
      console.error('Failed to create course', error);
      toast.error('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this Course?')) {
      try {
        await courseService.deleteCourse(id);
        fetchCourses();
        if (selectedCourse?.id === id) setSelectedCourse(null);
      } catch (error) {
        console.error('Failed to delete course', error);
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
        
        // Optimistic update
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
        
        // Optimistic update
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
    } catch (error) {
      console.error('Failed to fetch course details', error);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await courseService.addModule(selectedCourse.id, {
        title: moduleTitle
      });
      setModuleTitle('');
      // Refresh course details
      handleSelectCourse(selectedCourse);
      fetchCourses(); // refresh counts
    } catch (error) {
      console.error('Failed to add module', error);
      toast.error('Failed to add module');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await courseService.deleteModule(selectedCourse.id, moduleId);
        handleSelectCourse(selectedCourse);
        fetchCourses(); // refresh counts
      } catch (error) {
        console.error('Failed to delete module', error);
        toast.error('Failed to delete module');
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Courses</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {/* Create Course Form */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold mb-4">Create New Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <input 
                type="text" 
                placeholder="Course Title" 
                required
                value={title} 
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input 
                type="text" 
                placeholder="Thumbnail URL" 
                required
                value={thumbnailUrl} 
                onChange={e => setThumbnailUrl(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Category" 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Duration (mins):</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="Duration in mins" 
                    value={durationMinutes} 
                    onChange={e => setDurationMinutes(parseInt(e.target.value) || 0)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              <textarea 
                placeholder="Description" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows="3"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </form>
          </div>

          {/* List of Courses */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h3 className="text-lg font-semibold p-4 bg-gray-50 border-b">All Courses</h3>
            <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {courses.map(course => (
                <li key={course.id} className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center" onClick={() => handleSelectCourse(course)}>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-500">
                      {course.totalModules} Modules • 
                      👥 {course.enrollmentCount || 0} Enrolled • 
                      📈 {course.completionRate || 0}% Completion
                    </p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </li>
              ))}
              {courses.length === 0 && (
                <li className="p-4 text-center text-gray-500">No Courses created yet.</li>
              )}
            </ul>
          </div>
        </div>

        <div>
          {selectedCourse ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-2 text-blue-800">{selectedCourse.title} - Modules</h3>
              <p className="text-gray-600 text-sm mb-6">{selectedCourse.description}</p>
              
              {/* Add Module Form */}
              <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-3">Add Module</h4>
                <form onSubmit={handleAddModule} className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Module Title" 
                    required
                    value={moduleTitle} 
                    onChange={e => setModuleTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add Module
                  </button>
                </form>
              </div>

              {/* List Modules */}
              <h4 className="font-semibold mb-3 mt-8 border-t pt-4">Existing Modules & Topics</h4>
              <DragDropContext onDragEnd={handleDragEnd}>
              <ul className="space-y-4">
                {selectedCourse.modules?.map((mod, index) => (
                  <li key={mod.id} className="p-4 bg-gray-50 border rounded-md shadow-sm">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                      <div>
                        <span className="font-bold text-gray-700 mr-2">Module {index + 1}:</span>
                        <span className="font-medium text-gray-900 text-lg">{mod.title}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteModule(mod.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove Module
                      </button>
                    </div>

                    {/* Topics List */}
                    <div className="pl-6 space-y-2">
                      {mod.topics?.length > 0 ? (
                        <ul className="space-y-2 mb-4">
                          {mod.topics.map((topic, tIndex) => (
                            <li key={topic.id} className="flex justify-between items-center bg-white p-2 border rounded text-sm">
                              <div>
                                <span className="font-semibold text-gray-600 mr-2">{index + 1}.{tIndex + 1}</span>
                                <span className="text-gray-800">{topic.title}</span>
                                <span className="ml-2 text-xs text-gray-500">({topic.estimatedDurationMinutes || 0} mins)</span>
                                {topic.hasQuiz && <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold">Quiz Added</span>}
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setActiveQuizTopic(topic)}
                                  className="text-blue-500 hover:text-blue-700 text-xs font-semibold px-2 py-1 bg-blue-50 rounded"
                                >
                                  Manage Quiz
                                </button>
                                <button 
                                  onClick={async () => {
                                    if (window.confirm('Delete topic?')) {
                                      try {
                                        await courseService.deleteTopic(topic.id);
                                        handleSelectCourse(selectedCourse);
                                      } catch(e) { toast.error('Failed to delete topic'); }
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-600"
                                >
                                  ✕
                                </button>
                              </div>
                              
                                {/* Quick Learning Path (Reels) */}
                              <div className="w-full mt-3 bg-gray-50 p-3 rounded border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="text-xs font-bold text-gray-700 flex items-center gap-1">
                                    <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Quick Learning Path</span>
                                    Reels
                                  </h5>
                                  <button 
                                    onClick={() => { setSelectorType('REEL'); setSelectorTopicId(topic.id); }}
                                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded text-xs font-semibold"
                                  >
                                    + Attach Reel
                                  </button>
                                </div>
                                
                                <Droppable droppableId={`reels-${topic.id}`}>
                                  {(provided) => (
                                    <ul 
                                      {...provided.droppableProps} 
                                      ref={provided.innerRef}
                                      className="space-y-2 mb-3 min-h-[30px]"
                                    >
                                      {topic.reels?.length > 0 ? topic.reels.map((reel, index) => (
                                        <Draggable key={reel.id} draggableId={`reel-${reel.reelId}`} index={index}>
                                          {(provided) => (
                                            <li 
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className="flex justify-between items-center bg-white p-2 border rounded shadow-sm group"
                                            >
                                              <div className="flex items-center gap-3 overflow-hidden">
                                                <div 
                                                  {...provided.dragHandleProps} 
                                                  className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                                >
                                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                                                </div>
                                                <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative">
                                                  {reel.thumbnailUrl ? <img src={reel.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">No Img</div>}
                                                </div>
                                                <div className="truncate">
                                                  <div className="text-xs font-bold text-gray-800 truncate">{index + 1}. {reel.title}</div>
                                                </div>
                                              </div>
                                              <button 
                                                onClick={async () => {
                                                  try {
                                                    await courseService.deleteTopicReel(topic.id, reel.reelId);
                                                    handleSelectCourse(selectedCourse);
                                                  } catch (e) { toast.error('Failed to remove reel'); }
                                                }}
                                                className="text-red-400 hover:text-red-600 font-bold px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                              >
                                                ✕
                                              </button>
                                            </li>
                                          )}
                                        </Draggable>
                                      )) : <p className="text-xs text-gray-500 italic">No reels attached yet.</p>}
                                      {provided.placeholder}
                                    </ul>
                                  )}
                                </Droppable>

                                <div className="flex justify-between items-center mb-2 border-t pt-2">
                                  <h5 className="text-xs font-bold text-gray-700 flex items-center gap-1">
                                    <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Deep Learning Path</span>
                                    Videos
                                  </h5>
                                  <button 
                                    onClick={() => { setSelectorType('VIDEO'); setSelectorTopicId(topic.id); }}
                                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded text-xs font-semibold"
                                  >
                                    + Attach Video
                                  </button>
                                </div>

                                <Droppable droppableId={`videos-${topic.id}`}>
                                  {(provided) => (
                                    <ul 
                                      {...provided.droppableProps} 
                                      ref={provided.innerRef}
                                      className="space-y-2 mb-3 min-h-[30px]"
                                    >
                                      {topic.videos?.length > 0 ? topic.videos.map((video, index) => (
                                        <Draggable key={video.id} draggableId={`video-${video.videoId}`} index={index}>
                                          {(provided) => (
                                            <li 
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className="flex justify-between items-center bg-white p-2 border rounded shadow-sm group"
                                            >
                                              <div className="flex items-center gap-3 overflow-hidden">
                                                <div 
                                                  {...provided.dragHandleProps} 
                                                  className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                                >
                                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                                                </div>
                                                <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative">
                                                  {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">No Img</div>}
                                                </div>
                                                <div className="truncate">
                                                  <div className="text-xs font-bold text-gray-800 truncate">{index + 1}. {video.title}</div>
                                                </div>
                                              </div>
                                              <button 
                                                onClick={async () => {
                                                  try {
                                                    await courseService.deleteTopicVideo(topic.id, video.videoId);
                                                    handleSelectCourse(selectedCourse);
                                                  } catch (e) { toast.error('Failed to remove video'); }
                                                }}
                                                className="text-red-400 hover:text-red-600 font-bold px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                              >
                                                ✕
                                              </button>
                                            </li>
                                          )}
                                        </Draggable>
                                      )) : <p className="text-xs text-gray-500 italic">No videos attached yet.</p>}
                                      {provided.placeholder}
                                    </ul>
                                  )}
                                </Droppable>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-500 italic mb-4">No topics yet.</p>
                      )}

                      {/* Add Topic Quick Form */}
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const title = e.target.topicTitle.value;
                        const duration = e.target.topicDuration.value;
                        if (!title) return;
                        setLoading(true);
                        try {
                          await courseService.addTopic(mod.id, {
                            title,
                            description: '',
                            estimatedDurationMinutes: parseInt(duration) || 0,
                            topicOrder: (mod.topics?.length || 0) + 1
                          });
                          e.target.reset();
                          handleSelectCourse(selectedCourse);
                        } catch (err) {
                          toast.error('Failed to add topic');
                        } finally {
                          setLoading(false);
                        }
                      }} className="flex gap-2">
                        <input type="text" name="topicTitle" placeholder="New Topic Title" required className="flex-1 border rounded px-2 py-1 text-sm" />
                        <input type="number" name="topicDuration" placeholder="Mins" className="w-20 border rounded px-2 py-1 text-sm" />
                        <button type="submit" disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50">
                          + Topic
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
                {(!selectedCourse.modules || selectedCourse.modules.length === 0) && (
                  <li className="text-gray-500 text-sm italic">No modules added yet.</li>
                )}
              </ul>
              </DragDropContext>

              {/* Final Assessment Builder Block */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-indigo-900 mb-1">Final Course Assessment</h4>
                    <p className="text-sm text-indigo-700">Configure the final exam required for course certification.</p>
                  </div>
                  <button 
                    onClick={() => setShowAssessmentBuilder(true)}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition-colors"
                  >
                    Manage Assessment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg h-full flex items-center justify-center text-gray-500 min-h-[300px]">
              Select a course to manage modules
            </div>
          )}
        </div>
      </div>

      {activeQuizTopic && (
        <QuizBuilderModal 
          topic={activeQuizTopic} 
          onClose={() => {
            setActiveQuizTopic(null);
            handleSelectCourse(selectedCourse);
          }} 
        />
      )}

      
      {selectorType && selectorTopicId && (
        <ContentSelectorModal
          type={selectorType}
          existingIds={
            selectorType === 'REEL' 
              ? selectedCourse.modules.flatMap(m => m.topics).find(t => t.id === selectorTopicId)?.reels?.map(r => r.reelId) || []
              : selectedCourse.modules.flatMap(m => m.topics).find(t => t.id === selectorTopicId)?.videos?.map(v => v.videoId) || []
          }
          onSelect={handleAttachContent}
          onClose={() => {
            setSelectorType(null);
            setSelectorTopicId(null);
          }}
        />
      )}

      {showAssessmentBuilder && (
        <AssessmentBuilderModal
          course={selectedCourse}
          onClose={() => {
            setShowAssessmentBuilder(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminCourses;
