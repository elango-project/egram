import React, { useState, useEffect } from 'react';
import courseService from '../../services/courseService';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [progressInput, setProgressInput] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (id) => {
    try {
      const detailedCourse = await courseService.getCourseById(id);
      setSelectedCourse(detailedCourse);
      setProgressInput(detailedCourse.completedModulesCount?.toString() || '0');
    } catch (error) {
      console.error('Failed to fetch course details', error);
    }
  };

  const handleEnroll = async (id) => {
    try {
      await courseService.enrollCourse(id);
      handleSelectCourse(id); // refresh details
      fetchCourses(); // refresh list
    } catch (error) {
      console.error('Enrollment error', error);
      alert('Failed to enroll or already enrolled');
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    try {
      await courseService.updateProgress(selectedCourse.id, parseInt(progressInput));
      handleSelectCourse(selectedCourse.id);
      fetchCourses();
    } catch (error) {
      console.error('Failed to update progress', error);
      alert('Failed to update progress');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading Courses...</div>;
  }

  // Details View
  if (selectedCourse) {
    const isEnrolled = selectedCourse.enrolled;
    const progressPercent = selectedCourse.modules?.length > 0 
      ? Math.round((selectedCourse.completedModulesCount / selectedCourse.modules.length) * 100) 
      : 0;

    return (
      <div>
        <button 
          onClick={() => setSelectedCourse(null)}
          className="mb-4 text-blue-600 hover:underline font-medium"
        >
          &larr; Back to Courses
        </button>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gray-100 h-64 md:h-auto">
              <img src={selectedCourse.thumbnailUrl} alt={selectedCourse.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="p-8 md:w-2/3">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold text-gray-900">{selectedCourse.title}</h2>
                {isEnrolled && (
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    Enrolled
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 mb-6 text-lg">{selectedCourse.description}</p>
              
              {!isEnrolled ? (
                <button 
                  onClick={() => handleEnroll(selectedCourse.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-colors"
                >
                  Enroll Now
                </button>
              ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                  <h4 className="font-bold text-blue-900 mb-2">Your Progress</h4>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-blue-900">{progressPercent}%</span>
                  </div>
                  
                  <form onSubmit={handleUpdateProgress} className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Completed Modules:</label>
                    <input 
                      type="number" 
                      min="0" 
                      max={selectedCourse.modules?.length || 0}
                      value={progressInput}
                      onChange={(e) => setProgressInput(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 w-20 text-center"
                    />
                    <span className="text-sm text-gray-500">/ {selectedCourse.modules?.length || 0}</span>
                    <button type="submit" className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                      Update
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
          
          {/* Modules List */}
          <div className="border-t border-gray-100 p-8">
            <h3 className="text-xl font-bold mb-6">Course Modules</h3>
            <div className="space-y-4">
              {selectedCourse.modules?.map((mod, index) => (
                <div key={mod.id} className={`flex items-center p-4 rounded-lg border ${isEnrolled && index < selectedCourse.completedModulesCount ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{mod.title}</h4>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{mod.type}</span>
                  </div>
                  {isEnrolled && index < selectedCourse.completedModulesCount && (
                    <div className="text-green-600">✓ Completed</div>
                  )}
                </div>
              ))}
              {(!selectedCourse.modules || selectedCourse.modules.length === 0) && (
                <p className="text-gray-500 text-center py-4">No modules available yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Browse Courses</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
          <div 
            key={course.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
          >
            <div className="h-48 relative">
              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
              {course.enrolled && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                  ENROLLED
                </div>
              )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-xl text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2 flex-1">{course.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  📚 {course.modulesCount} Modules
                </span>
                {course.enrolled && (
                  <span className="text-sm font-bold text-blue-600">
                    {Math.round((course.completedModulesCount / (course.modulesCount || 1)) * 100)}% Complete
                  </span>
                )}
              </div>
              
              <button 
                onClick={() => handleSelectCourse(course.id)}
                className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-blue-600 font-semibold rounded border border-gray-200 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center text-gray-500 py-12">No Courses available yet.</div>
      )}
    </div>
  );
};

export default StudentCourses;
