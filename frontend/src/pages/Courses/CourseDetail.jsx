import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { courseApi, aiApi } from '../../api';
import courseService from '../../services/courseService';
import { Play, CheckCircle, Loader2, ChevronDown, ChevronRight, BookOpen, Clock, Lock, Award, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseApi.get(id),
  });

  const enrollMutation = useMutation({
    mutationFn: () => courseApi.enroll(id),
    onSuccess: () => {
      toast.success('Enrolled successfully!');
      // Force a refetch or window reload to update state
      window.location.reload();
    },
    onError: (err) => toast.error(`Enrollment failed: ${err.message}`),
  });

  const { data: certData } = useQuery({
    queryKey: ['certificateEligibility', id],
    queryFn: () => courseService.getCertificateEligibility(id),
    enabled: !!data?.data?.data
  });

  const { data: assessmentData, isError: assessmentError } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => courseService.getAssessment(id),
    enabled: !!data?.data?.data,
    retry: false
  });

  const course = data?.data?.data;
  
  if (isLoading) {
    return (
      <div className="pb-12">
        <LoadingSkeleton count={1} type="card" />
        <div className="mt-8">
          <LoadingSkeleton count={3} type="list" />
        </div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-20 text-slate-500 font-medium">Course not found</div>;
  }

  const isEnrolled = course.enrolled;
  const totalTopics = course.modules?.reduce((acc, m) => acc + (m.topics?.length || 0), 0) || 0;

  return (
    <div className="pb-12 max-w-7xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="w-full md:w-2/5 h-64 md:h-auto relative">
          <img 
            src={course.thumbnailUrl || 'https://placehold.co/800x600?text=Course+Image'} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900 hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent md:hidden" />
        </div>

        <div className="w-full md:w-3/5 p-8 md:p-12 relative z-10 flex flex-col justify-center">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="primary">{course.category}</Badge>
            <Badge variant="neutral" className="bg-slate-800 text-slate-300 border-slate-700">Intermediate</Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">{course.title}</h1>
          <p className="text-slate-300 text-lg mb-8 line-clamp-2 leading-relaxed">{course.description}</p>
          
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <Clock className="text-indigo-400" size={20} /> ~12 Hours
            </div>
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <BookOpen className="text-violet-400" size={20} /> {course.modules?.length || 0} Modules
            </div>
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <FileText className="text-cyan-400" size={20} /> {totalTopics} Topics
            </div>
          </div>

          <div>
            {!isEnrolled ? (
              <Button 
                variant="gradient" 
                size="lg" 
                onClick={() => enrollMutation.mutate()}
                isLoading={enrollMutation.isPending}
                className="w-full sm:w-auto"
              >
                Enroll Now
              </Button>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-300">Course Progress</span>
                  <span className="text-sm font-bold text-emerald-400">{course.progressPercentage || 0}% Complete</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${course.progressPercentage || 0}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Modules Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Course Curriculum</h2>
          
          {(!course.modules || course.modules.length === 0) ? (
            <Card className="text-center py-12">
              <p className="text-slate-500 font-medium">No modules available yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {course.modules.map((mod, idx) => (
                <Card key={mod.id} padding="p-0" className="overflow-hidden border border-slate-200">
                  <button
                    className="w-full flex items-center gap-4 p-5 text-left bg-white hover:bg-slate-50 transition-colors"
                    onClick={() => setExpanded(expanded === mod.id ? null : mod.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                      <span className="font-bold text-indigo-600">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900">{mod.title}</h3>
                      <p className="text-sm text-slate-500 font-medium">{mod.topics?.length || 0} Topics included</p>
                    </div>
                    <div className="text-slate-400">
                      {expanded === mod.id ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                    </div>
                  </button>

                  {expanded === mod.id && (
                    <div className="border-t border-slate-100 bg-slate-50/50">
                      {(mod.topics || []).map((topic, tIdx) => (
                        <div key={topic.id} className="group flex flex-col p-5 hover:bg-white transition-colors border-b border-slate-100 last:border-b-0 relative">
                          {/* Vertical line connector for timeline */}
                          {tIdx !== mod.topics.length - 1 && (
                            <div className="absolute left-[31px] top-12 bottom-0 w-px bg-slate-200" />
                          )}
                          
                          <div className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shrink-0 mt-1 z-10 group-hover:border-indigo-400 transition-colors">
                              {/* If completed, show checkmark. If locked, show lock. Else blank. Assuming mock completion for now */}
                              {isEnrolled ? <Play size={10} className="text-indigo-600" ml="1" /> : <Lock size={10} className="text-slate-400" />}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <Link 
                                  to={isEnrolled ? `/dashboard/courses/topic/${topic.id}` : '#'} 
                                  className={`font-bold text-base ${isEnrolled ? 'text-slate-900 hover:text-indigo-600' : 'text-slate-500 cursor-not-allowed'}`}
                                >
                                  {topic.title}
                                </Link>
                                <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md">
                                  {topic.estimatedDurationMinutes || 10}m
                                </span>
                              </div>
                              {topic.description && (
                                <p className="text-sm text-slate-600 mb-3">{topic.description}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                {topic.reels?.length > 0 && (
                                  <Badge variant="info" className="flex items-center gap-1 bg-cyan-50 text-cyan-700 border-cyan-100">
                                    <Play size={12} /> {topic.reels.length} Reels
                                  </Badge>
                                )}
                                {topic.videos?.length > 0 && (
                                  <Badge variant="primary" className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border-indigo-100">
                                    <Play size={12} /> {topic.videos.length} Videos
                                  </Badge>
                                )}
                                {topic.hasQuiz && (
                                  <Badge variant="warning" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-100">
                                    <CheckCircle size={12} /> Quiz
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!mod.topics || mod.topics.length === 0) && (
                        <div className="p-6 text-center text-slate-500 font-medium text-sm">
                          No content added to this module yet.
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Learning Progress Panel */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-lg text-slate-900 mb-4">Course Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <CheckCircle className={course.progressPercentage === 100 ? 'text-emerald-500' : 'text-slate-400'} size={20} />
                  <span className="font-medium text-slate-700">Topics Completed</span>
                </div>
                <span className="font-bold text-slate-900">{course.progressPercentage || 0}%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <FileText className={certData?.eligible ? 'text-emerald-500' : 'text-slate-400'} size={20} />
                  <span className="font-medium text-slate-700">Assessment</span>
                </div>
                {certData?.eligible ? (
                  <Badge variant="success">Unlocked</Badge>
                ) : (
                  <Badge variant="neutral">Locked</Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Award className={false ? 'text-amber-500' : 'text-slate-400'} size={20} />
                  <span className="font-medium text-slate-700">Certificate</span>
                </div>
                <Badge variant="neutral">Pending</Badge>
              </div>
            </div>
          </Card>

          {/* Assessment Panel */}
          {!assessmentError && assessmentData && (
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2 relative z-10">
                Final Assessment
              </h3>
              <p className="text-indigo-100 text-sm mb-6 relative z-10">
                Pass the final exam with a score of {assessmentData.passingPercentage}% or higher to earn your certificate.
              </p>
              <Button 
                variant="ghost" 
                className="w-full bg-white text-indigo-600 hover:bg-slate-50 relative z-10"
                onClick={() => {
                  if (!certData?.eligible) {
                    toast.error('Complete all topics first!');
                  } else {
                    navigate(`/dashboard/courses/${id}/assessment`);
                  }
                }}
              >
                {certData?.eligible ? 'Start Assessment' : 'Locked'}
              </Button>
            </div>
          )}

          {certData?.eligible && (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg text-center">
              <Award size={48} className="mx-auto text-emerald-100 mb-4" />
              <h3 className="font-bold text-xl mb-2">Congratulations!</h3>
              <p className="text-emerald-50 text-sm mb-6">
                You've completed the course and earned your certificate.
              </p>
              <Button 
                variant="ghost" 
                className="w-full bg-white text-emerald-700 hover:bg-emerald-50"
                onClick={() => navigate(`/dashboard/courses/${id}/certificate`)}
              >
                View Certificate
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
