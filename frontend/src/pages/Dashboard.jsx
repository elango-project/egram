import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.email}</h1>
      <p className="text-gray-600 mb-8">
        This is your {isAdmin ? 'Admin' : 'Student'} dashboard. Select a module below to begin.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard 
          title="Reals" 
          desc={isAdmin ? "Manage short-form videos." : "Watch and engage with short-form videos."}
          link="/dashboard/reals"
          color="bg-purple-100 text-purple-700"
        />
        <DashboardCard 
          title="Videos" 
          desc={isAdmin ? "Manage long-form videos." : "Watch educational long-form content."}
          link="/dashboard/videos"
          color="bg-red-100 text-red-700"
        />
        <DashboardCard 
          title="Courses" 
          desc={isAdmin ? "Create and manage courses." : "Enroll and track your progress."}
          link="/dashboard/courses"
          color="bg-blue-100 text-blue-700"
        />
        <DashboardCard 
          title="Assessments" 
          desc={isAdmin ? "Create MCQ assessments." : "Take quizzes and check results."}
          link="/dashboard/assessments"
          color="bg-green-100 text-green-700"
        />
        <DashboardCard 
          title="Jobs & Internships" 
          desc={isAdmin ? "Post new opportunities." : "Browse, save, and apply to jobs."}
          link="/dashboard/jobs"
          color="bg-yellow-100 text-yellow-800"
        />
      </div>
    </div>
  );
};

const DashboardCard = ({ title, desc, link, color }) => (
  <Link to={link} className="block group">
    <div className={`p-6 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md ${color.replace(/text-\S+/, 'hover:bg-opacity-80')}`}>
      <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${color}`}>
        <span className="font-bold text-xl">{title.charAt(0)}</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-gray-600 mt-2 text-sm">{desc}</p>
    </div>
  </Link>
);

export default Dashboard;
