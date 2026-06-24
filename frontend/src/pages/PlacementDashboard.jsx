import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, Briefcase, Building, ChevronRight, Bookmark, Target, TrendingUp, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import jobService from '../services/jobService';
import courseService from '../services/courseService';
import api from '../api';

const PlacementDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    savedJobsCount: 0,
    appliedJobsCount: 0,
    savedInternshipsCount: 0,
    appliedInternshipsCount: 0,
    certificatesCount: 0,
    coursesCompletedCount: 0,
    appsThisMonth: 0,
    successRate: 0
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [savedJobsList, setSavedJobsList] = useState([]);
  const [savedInternshipsList, setSavedInternshipsList] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [savedRes, appliedRes, certsRes, enrolledRes] = await Promise.all([
        jobService.getSavedJobs(),
        jobService.getMyApplications(),
        api.get('/certificates/my-certificates').then(r => r.data),
        courseService.getMyEnrolledCourses()
      ]);

      const sJobs = savedRes.filter(j => j.type === 'JOB');
      const sInternships = savedRes.filter(j => j.type === 'INTERNSHIP');
      
      const appliedJobs = appliedRes.filter(a => a.job.type === 'JOB').length;
      const appliedInternships = appliedRes.filter(a => a.job.type === 'INTERNSHIP').length;
      const completedCourses = enrolledRes.filter(c => c.progressPercentage === 100).length;

      // Apps this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const appsThisMonth = appliedRes.filter(a => {
        const d = new Date(a.appliedAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;

      // Success Rate (Selected / (Selected + Rejected))
      const selectedCount = appliedRes.filter(a => a.status === 'SELECTED').length;
      const rejectedCount = appliedRes.filter(a => a.status === 'REJECTED').length;
      const totalDecided = selectedCount + rejectedCount;
      const successRate = totalDecided > 0 ? Math.round((selectedCount / totalDecided) * 100) : 0;

      setStats({
        savedJobsCount: sJobs.length,
        appliedJobsCount: appliedJobs,
        savedInternshipsCount: sInternships.length,
        appliedInternshipsCount: appliedInternships,
        certificatesCount: certsRes.length,
        coursesCompletedCount: completedCourses,
        appsThisMonth,
        successRate
      });

      setSavedJobsList(sJobs.slice(0, 3));
      setSavedInternshipsList(sInternships.slice(0, 3));

      // Sort applications by appliedAt descending
      const sortedApps = [...appliedRes].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
      setRecentApplications(sortedApps.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch placement dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch(status) {
      case 'SELECTED': return { color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200', icon: <CheckCircle2 size={16} /> };
      case 'REJECTED': return { color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200', icon: <XCircle size={16} /> };
      case 'SHORTLISTED': return { color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', icon: <Target size={16} /> };
      default: return { color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200', icon: <Clock size={16} /> };
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col pt-6 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto w-full space-y-8">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">Career Growth Dashboard</h1>
              <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-2xl">Track your learning journey, manage your applications, and prepare for your next big role.</p>
            </div>
            <div className="flex gap-4">
              <Link to="/dashboard/jobs">
                <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg">
                  Find Jobs
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatsCard title="Courses Completed" value={stats.coursesCompletedCount} icon={<BookOpen />} gradient="from-indigo-500 to-indigo-600" />
          <StatsCard title="Certificates Earned" value={stats.certificatesCount} icon={<Award />} gradient="from-amber-400 to-amber-500" />
          <StatsCard title="Jobs Applied" value={stats.appliedJobsCount} icon={<Briefcase />} gradient="from-violet-500 to-violet-600" />
          <StatsCard title="Internships Applied" value={stats.appliedInternshipsCount} icon={<Building />} gradient="from-emerald-500 to-emerald-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Timeline & Secondary Stats */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Secondary Metrics Glass Cards */}
            <div className="grid grid-cols-2 gap-4">
              <GlassMetric title="Applications this month" value={stats.appsThisMonth} icon={<TrendingUp size={20} className="text-blue-500" />} />
              <GlassMetric title="Interview Success Rate" value={`${stats.successRate}%`} icon={<Target size={20} className="text-emerald-500" />} />
            </div>

            {/* Recent Applications Timeline UI */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-900">Application Timeline</h2>
              </div>
              <div className="p-6 md:p-8">
                {recentApplications.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <AlertCircle size={40} className="mx-auto mb-3 text-slate-300" />
                    <p>No applications yet.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-100 ml-4 md:ml-6 space-y-8 pb-4">
                    {recentApplications.map((app, idx) => {
                      const cfg = getStatusConfig(app.status);
                      return (
                        <motion.div 
                          key={app.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="relative pl-8 md:pl-10 group"
                        >
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${cfg.border} flex items-center justify-center`}>
                            <div className={`w-2 h-2 rounded-full ${cfg.bg.replace('100', '500')}`} />
                          </div>

                          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 group-hover:border-indigo-100 group-hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                  {app.job.companyLogoUrl ? (
                                    <img src={app.job.companyLogoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                                  ) : (
                                    <Building className="text-slate-400" size={24} />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 text-lg leading-tight">{app.job.title}</h4>
                                  <p className="text-slate-500 font-medium">{app.job.companyName}</p>
                                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-medium">
                                    <CalendarIcon /> {new Date(app.appliedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                {cfg.icon} {app.status}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Saved Opportunities */}
          <div className="space-y-8">
            {/* Saved Jobs */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                <div className="flex items-center gap-2">
                  <Bookmark className="text-indigo-600 fill-indigo-100" size={20} />
                  <h2 className="font-bold text-slate-900">Saved Jobs ({stats.savedJobsCount})</h2>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {savedJobsList.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm">No saved jobs.</div>
                ) : (
                  savedJobsList.map(job => (
                    <div key={job.id} onClick={() => navigate('/dashboard/jobs')} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                        {job.companyLogoUrl ? <img src={job.companyLogoUrl} className="w-6 h-6 object-contain" /> : <Building size={16} className="text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{job.title}</div>
                        <div className="text-xs text-slate-500 truncate">{job.companyName}</div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  ))
                )}
                {stats.savedJobsCount > 3 && (
                  <button onClick={() => navigate('/dashboard/jobs')} className="w-full py-2 text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
                )}
              </div>
            </div>

            {/* Saved Internships */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-cyan-50/50">
                <div className="flex items-center gap-2">
                  <Bookmark className="text-cyan-600 fill-cyan-100" size={20} />
                  <h2 className="font-bold text-slate-900">Saved Internships ({stats.savedInternshipsCount})</h2>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {savedInternshipsList.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm">No saved internships.</div>
                ) : (
                  savedInternshipsList.map(internship => (
                    <div key={internship.id} onClick={() => navigate('/dashboard/internships')} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-cyan-200 hover:bg-cyan-50/50 cursor-pointer transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                        {internship.companyLogoUrl ? <img src={internship.companyLogoUrl} className="w-6 h-6 object-contain" /> : <Building size={16} className="text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{internship.title}</div>
                        <div className="text-xs text-slate-500 truncate">{internship.companyName}</div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  ))
                )}
                {stats.savedInternshipsCount > 3 && (
                  <button onClick={() => navigate('/dashboard/internships')} className="w-full py-2 text-sm font-bold text-cyan-600 hover:text-cyan-700">View All</button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponents
const StatsCard = ({ title, value, icon, gradient }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between"
  >
    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-inner`}>
      {icon}
    </div>
    <div>
      <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</div>
    </div>
  </motion.div>
);

const GlassMetric = ({ title, value, icon }) => (
  <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
      {icon}
    </div>
    <div>
      <div className="text-2xl font-extrabold text-slate-900 leading-tight">{value}</div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</div>
    </div>
  </div>
);

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export default PlacementDashboard;
