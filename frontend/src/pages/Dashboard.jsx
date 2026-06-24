import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Award, Briefcase, PlayCircle, Clock, Users, Plus, Search, Activity } from 'lucide-react';
import StatsCard from '../components/ui/StatsCard';
import Card from '../components/ui/Card';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  if (isAdmin) {
    return <AdminDashboard user={user} />;
  }

  return <StudentDashboard user={user} />;
};

const StudentDashboard = ({ user }) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Section */}
      <div className="bg-brand-gradient rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Keep Learning. Keep Growing.
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 font-medium">
            Welcome back, {user?.email?.split('@')[0] || 'Student'}! Ready to continue your journey?
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Courses Enrolled" 
          value="4" 
          icon={<BookOpen size={24} />} 
          colorClass="bg-indigo-500" 
        />
        <StatsCard 
          title="Topics Completed" 
          value="12" 
          icon={<CheckCircle size={24} />} 
          colorClass="bg-violet-500" 
        />
        <StatsCard 
          title="Certificates" 
          value="2" 
          icon={<Award size={24} />} 
          colorClass="bg-amber-500" 
        />
        <StatsCard 
          title="Apps Submitted" 
          value="3" 
          icon={<Briefcase size={24} />} 
          colorClass="bg-emerald-500" 
        />
      </div>

      {/* Continue Learning */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Continue Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card hover padding="p-0" className="overflow-hidden flex flex-col">
            <div className="h-40 bg-slate-100 relative">
              <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800" alt="Java Spring Boot" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                <Clock size={12} /> 12h left
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">Mastering Java Spring Boot</h3>
              <div className="mt-auto pt-4">
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className="text-slate-600">Progress</span>
                  <span className="text-indigo-600">65%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <Link to="/dashboard/courses" className="mt-6 w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-medium transition-colors">
                  <PlayCircle size={18} /> Resume Course
                </Link>
              </div>
            </div>
          </Card>
          
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
             <Card className="h-full border-dashed border-2 bg-slate-50 flex items-center justify-center p-8 text-center text-slate-500">
               <div>
                  <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="font-medium text-slate-900">Explore more courses</p>
                  <p className="text-sm mt-1">Enroll in new courses to expand your knowledge.</p>
               </div>
             </Card>
          </div>
        </div>
      </div>

      {/* Recommended Section (AI Placeholder) */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
          <span className="text-sm font-medium px-3 py-1 bg-violet-100 text-violet-700 rounded-full">AI Powered ✨</span>
        </div>
        <LoadingSkeleton count={3} type="card" />
      </div>

    </div>
  );
};

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Jan', enrollments: 4000, completions: 2400 },
  { name: 'Feb', enrollments: 3000, completions: 1398 },
  { name: 'Mar', enrollments: 2000, completions: 9800 },
  { name: 'Apr', enrollments: 2780, completions: 3908 },
  { name: 'May', enrollments: 1890, completions: 4800 },
  { name: 'Jun', enrollments: 2390, completions: 3800 },
];

const AdminDashboard = ({ user }) => {
  return (
    <div className="space-y-8 pb-12 font-sans bg-slate-50 min-h-screen -mt-6 pt-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {/* Global Search & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Control Center</h1>
          <p className="text-slate-500 font-medium mt-1">Manage learning content, assessments, careers, and platform growth.</p>
        </div>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-all"
            placeholder="Search Courses, Jobs, Students..."
          />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <AdminStatCard title="Total Students" value="1,248" icon={<Users />} color="text-indigo-600" bg="bg-indigo-50" border="border-indigo-100" />
        <AdminStatCard title="Total Courses" value="24" icon={<BookOpen />} color="text-violet-600" bg="bg-violet-50" border="border-violet-100" />
        <AdminStatCard title="Certificates" value="892" icon={<Award />} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
        <AdminStatCard title="Total Jobs" value="156" icon={<Briefcase />} color="text-amber-600" bg="bg-amber-50" border="border-amber-100" />
        <AdminStatCard title="Internships" value="48" icon={<Briefcase />} color="text-cyan-600" bg="bg-cyan-50" border="border-cyan-100" />
        <AdminStatCard title="Active Enrollments" value="3,102" icon={<Activity />} color="text-rose-600" bg="bg-rose-50" border="border-rose-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Analytics Header (Chart) */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            Platform Growth <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">+14% this month</span>
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="enrollments" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Enrollments" />
                <Bar dataKey="completions" fill="#10B981" radius={[4, 4, 0, 0]} name="Completions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
            <QuickActionCard title="Create Course" link="/dashboard/courses" icon={<BookOpen size={20} />} theme="indigo" />
            <QuickActionCard title="Create Assessment" link="/dashboard/assessments" icon={<Award size={20} />} theme="emerald" />
            <QuickActionCard title="Post Job" link="/dashboard/jobs" icon={<Briefcase size={20} />} theme="amber" />
            <QuickActionCard title="Post Internship" link="/dashboard/internships" icon={<Briefcase size={20} />} theme="cyan" />
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
            <ActivityItem title="Course Created: Advanced React Patterns" time="2 hours ago" type="course" />
            <ActivityItem title="Assessment Published: Java Basics" time="5 hours ago" type="assessment" />
            <ActivityItem title="Job Posted: Senior Frontend Engineer at Google" time="1 day ago" type="job" />
            <ActivityItem title="Internship Posted: Summer Analyst at Goldman Sachs" time="2 days ago" type="internship" />
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminStatCard = ({ title, value, icon, color, bg, border }) => (
  <div className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col items-start gap-4 hover:shadow-md transition-shadow`}>
    <div className={`p-3 rounded-xl ${bg} ${color} ${border} border`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <div className="text-2xl font-extrabold text-slate-900">{value}</div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{title}</div>
    </div>
  </div>
);

const QuickActionCard = ({ title, link, icon, theme }) => {
  const getThemeColors = () => {
    switch(theme) {
      case 'indigo': return 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100/50';
      case 'emerald': return 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100/50';
      case 'amber': return 'text-amber-600 bg-amber-50 border-amber-100 hover:border-amber-300 hover:bg-amber-100/50';
      case 'cyan': return 'text-cyan-600 bg-cyan-50 border-cyan-100 hover:border-cyan-300 hover:bg-cyan-100/50';
      default: return 'text-slate-600 bg-slate-50 border-slate-100 hover:border-slate-300';
    }
  };

  return (
    <Link to={link} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${getThemeColors()}`}>
      <div className="bg-white p-2 rounded-lg shadow-sm">
        {icon}
      </div>
      <span className="font-bold">{title}</span>
      <Plus size={16} className="ml-auto opacity-50" />
    </Link>
  );
};

const ActivityItem = ({ title, time, type }) => {
  const getConfig = () => {
    switch(type) {
      case 'course': return { icon: <BookOpen size={14} />, bg: 'bg-indigo-500', border: 'border-indigo-200' };
      case 'assessment': return { icon: <Award size={14} />, bg: 'bg-emerald-500', border: 'border-emerald-200' };
      case 'job': return { icon: <Briefcase size={14} />, bg: 'bg-amber-500', border: 'border-amber-200' };
      case 'internship': return { icon: <Briefcase size={14} />, bg: 'bg-cyan-500', border: 'border-cyan-200' };
      default: return { icon: <Activity size={14} />, bg: 'bg-slate-500', border: 'border-slate-200' };
    }
  };
  const cfg = getConfig();

  return (
    <div className="relative pl-8">
      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${cfg.border} flex items-center justify-center`}>
        <div className={`w-2 h-2 rounded-full ${cfg.bg}`} />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <span className="text-xs font-medium text-slate-400">{time}</span>
      </div>
    </div>
  );
};

export default Dashboard;
