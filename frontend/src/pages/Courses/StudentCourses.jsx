import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Clock, Filter, ArrowRight } from 'lucide-react';
import courseService from '../../services/courseService';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
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
    navigate(`/dashboard/courses/${id}`);
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                            c.description.toLowerCase().includes(search.toLowerCase());
      // Assuming we have category in API, else mock it or ignore.
      const matchesCategory = filterCategory === 'ALL' || true; 
      return matchesSearch && matchesCategory;
    });
  }, [courses, search, filterCategory]);

  if (loading) {
    return (
      <div className="pb-12">
        <PageHeader title="Course Catalog" subtitle="Expand your skill set with our premium courses." />
        <LoadingSkeleton count={6} type="card" />
      </div>
    );
  }

  return (
    <div className="pb-12">
      <PageHeader 
        title="Course Catalog" 
        subtitle="Expand your skill set with our premium courses." 
      />
      
      {/* Filters */}
      <Card className="mb-8 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <Input 
              icon={<Search size={18} />}
              placeholder="Search courses by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: 'PROGRAMMING', label: 'Programming' },
                { value: 'DESIGN', label: 'Design' },
                { value: 'BUSINESS', label: 'Business' }
              ]}
            />
          </div>
          <Button variant="outline" className="w-full md:w-auto hidden md:flex" icon={<Filter size={18} />}>
            Filters
          </Button>
        </div>
      </Card>
      
      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map(course => (
          <Card 
            key={course.id} 
            hover 
            padding="p-0" 
            className="flex flex-col overflow-hidden group"
            onClick={() => handleSelectCourse(course.id)}
          >
            <div className="h-48 relative overflow-hidden bg-slate-100">
              <img 
                src={course.thumbnailUrl} 
                alt={course.title} 
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=Course+Thumbnail'; }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                {course.enrolled && (
                  <Badge variant="success" className="shadow-sm backdrop-blur-md bg-emerald-500/90 text-white border-none">
                    Enrolled
                  </Badge>
                )}
                {/* Mock Difficulty */}
                <Badge variant="neutral" className="shadow-sm backdrop-blur-md bg-white/90 text-slate-800 border-none">
                  Intermediate
                </Badge>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              {/* Mock Category */}
              <div className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wider">Programming</div>
              
              <h3 className="font-extrabold text-xl text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {course.title}
              </h3>
              
              <p className="text-slate-600 mb-6 line-clamp-2 text-sm flex-1">
                {course.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mb-6">
                <span className="flex items-center gap-1.5"><BookOpen size={16} className="text-slate-400" /> {course.totalModules} Modules</span>
                <span className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400" /> 12h 30m</span>
              </div>
              
              {course.enrolled ? (
                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-600">Progress</span>
                    <span className="text-indigo-600">{course.progressPercentage || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${course.progressPercentage || 0}%` }}></div>
                  </div>
                </div>
              ) : (
                <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Free</span>
                  <span className="text-indigo-600 font-medium text-sm flex items-center group-hover:underline">
                    View Details <ArrowRight size={16} className="ml-1" />
                  </span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && !loading && (
        <EmptyState 
          title="No courses found" 
          message="Try adjusting your search or filters to find what you're looking for." 
          icon={<BookOpen size={48} className="text-slate-300" />}
        />
      )}
    </div>
  );
};

export default StudentCourses;
