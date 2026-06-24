import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleSelectCourse = (id) => {
    navigate(`/courses/${id}`);
  };

  if (loading) {
    return <div className="text-center py-12">Loading Courses...</div>;
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
              <img 
                src={course.thumbnailUrl} 
                alt={course.title} 
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=Course+Image'; }}
                className="w-full h-full object-cover" 
              />
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
                  📚 {course.totalModules} Modules
                </span>
                {course.enrolled && (
                  <span className="text-sm font-bold text-blue-600">
                    {course.progressPercentage}% Complete
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
