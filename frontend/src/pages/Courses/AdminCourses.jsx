import React, { useState, useEffect } from 'react';
import courseService from '../../services/courseService';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form state for Course
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  // Form state for Module
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleType, setModuleType] = useState('REAL'); // REAL or VIDEO
  const [moduleContentId, setModuleContentId] = useState('');

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
      await courseService.createCourse({ title, description, thumbnailUrl });
      setTitle('');
      setDescription('');
      setThumbnailUrl('');
      fetchCourses();
    } catch (error) {
      console.error('Failed to create course', error);
      alert('Failed to create course');
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
        alert('Failed to delete course');
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
      alert('Failed to add module');
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
        alert('Failed to delete module');
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
                  <div>
                    <h4 className="font-bold text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-500">{course.modulesCount} Modules</p>
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
              <h4 className="font-semibold mb-3">Existing Modules</h4>
              <ul className="space-y-2">
                {selectedCourse.modules?.map((mod, index) => (
                  <li key={mod.id} className="flex justify-between items-center p-3 bg-gray-50 border rounded-md">
                    <div>
                      <span className="font-bold text-gray-700 mr-2">{index + 1}.</span>
                      <span className="font-medium text-gray-900">{mod.title}</span>
                      <span className="ml-2 text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">{mod.type}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteModule(mod.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
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
    </div>
  );
};

export default AdminCourses;
