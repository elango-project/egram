import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import QuizBuilderModal from './QuizBuilderModal';

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
  const [moduleType, setModuleType] = useState('REAL'); // REAL or VIDEO
  const [moduleContentId, setModuleContentId] = useState('');

  // Quiz Builder state
  const [activeQuizTopic, setActiveQuizTopic] = useState(null);

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
        title: moduleTitle,
        type: moduleType,
        contentId: moduleContentId
      });
      setModuleTitle('');
      setModuleContentId('');
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
                  <div className="flex gap-4">
                    <select 
                      value={moduleType} 
                      onChange={e => setModuleType(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    >
                      <option value="REAL">Real</option>
                      <option value="VIDEO">Video</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Content ID (UUID of Real/Video)" 
                      required
                      value={moduleContentId} 
                      onChange={e => setModuleContentId(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
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
                                <h5 className="text-xs font-bold text-gray-700 mb-2">Quick Learning Path (Reels)</h5>
                                
                                {topic.reels?.length > 0 ? (
                                  <ul className="space-y-1 mb-3">
                                    {topic.reels.map(reel => (
                                      <li key={reel.id} className="flex justify-between items-center text-xs bg-white p-1 border rounded">
                                        <span className="truncate flex-1 mr-2">{reel.reelOrder}. {reel.title}</span>
                                        <button 
                                          onClick={async () => {
                                            try {
                                              await courseService.deleteTopicReel(topic.id, reel.reelId);
                                              handleSelectCourse(selectedCourse);
                                            } catch (e) { toast.error('Failed to remove reel'); }
                                          }}
                                          className="text-red-400 hover:text-red-600 font-bold px-1"
                                        >
                                          x
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs text-gray-500 italic mb-2">No reels attached yet.</p>
                                )}

                                <form onSubmit={async (e) => {
                                  e.preventDefault();
                                  const reelId = e.target.reelId.value;
                                  if (!reelId) return;
                                  setLoading(true);
                                  try {
                                    await courseService.addTopicReel(topic.id, {
                                      reelId,
                                      reelOrder: (topic.reels?.length || 0) + 1
                                    });
                                    e.target.reset();
                                    handleSelectCourse(selectedCourse);
                                  } catch (err) {
                                    toast.error('Failed to attach reel');
                                  } finally {
                                    setLoading(false);
                                  }
                                }} className="flex gap-2">
                                  <input type="text" name="reelId" placeholder="Reel UUID" required className="flex-1 border rounded px-2 py-1 text-xs" />
                                  <button type="submit" disabled={loading} className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 disabled:opacity-50">
                                    Attach Reel
                                  </button>
                                </form>
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
    </div>
  );
};

export default AdminCourses;
