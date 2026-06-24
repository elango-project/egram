import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import jobService from '../services/jobService';
import courseService from '../services/courseService';
import api from '../api';
import { Link } from 'react-router-dom';

const PlacementDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    savedJobsCount: 0,
    appliedJobsCount: 0,
    savedInternshipsCount: 0,
    appliedInternshipsCount: 0,
    certificatesCount: 0,
    coursesCompletedCount: 0
  });

  const [recentApplications, setRecentApplications] = useState([]);

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

      const savedJobs = savedRes.filter(j => j.type === 'JOB').length;
      const savedInternships = savedRes.filter(j => j.type === 'INTERNSHIP').length;
      const appliedJobs = appliedRes.filter(a => a.job.type === 'JOB').length;
      const appliedInternships = appliedRes.filter(a => a.job.type === 'INTERNSHIP').length;
      
      const completedCourses = enrolledRes.filter(c => c.progressPercentage === 100).length;

      setStats({
        savedJobsCount: savedJobs,
        appliedJobsCount: appliedJobs,
        savedInternshipsCount: savedInternships,
        appliedInternshipsCount: appliedInternships,
        certificatesCount: certsRes.length,
        coursesCompletedCount: completedCourses
      });

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
    return <div className="p-8 text-center text-gray-500 animate-pulse font-medium">Loading Placement Dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Placement Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your applications, saved opportunities, and learning progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Courses Completed" 
          value={stats.coursesCompletedCount} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>}
          color="bg-blue-500"
        />
        <StatCard 
          title="Certificates Earned" 
          value={stats.certificatesCount} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>}
          color="bg-yellow-500"
        />
        <StatCard 
          title="Jobs Applied" 
          value={stats.appliedJobsCount} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
          color="bg-indigo-500"
        />
        <StatCard 
          title="Internships Applied" 
          value={stats.appliedInternshipsCount} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>}
          color="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-800">Recent Applications</h2>
            <Link to="/dashboard/jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">View All Opportunities &rarr;</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentApplications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">You haven't applied to any opportunities yet.</div>
            ) : (
              recentApplications.map(app => (
                <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {app.job.companyLogoUrl ? (
                      <img src={app.job.companyLogoUrl} alt="Logo" className="w-12 h-12 rounded object-contain border border-gray-100 bg-white" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-indigo-50 flex items-center justify-center text-indigo-400 font-bold text-xl">
                        {app.job.companyName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900">{app.job.title}</h4>
                      <div className="text-sm text-gray-500 mt-1">{app.job.companyName} • {app.job.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      app.status === 'SELECTED' ? 'bg-green-100 text-green-800' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      app.status === 'SHORTLISTED' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {app.status}
                    </span>
                    <div className="text-xs text-gray-400 mt-2">Applied {new Date(app.appliedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center text-center group hover:border-indigo-200 transition-colors cursor-pointer">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Saved Jobs</h3>
            <div className="text-4xl font-extrabold text-indigo-600 mb-4">{stats.savedJobsCount}</div>
            <Link to="/dashboard/jobs" className="text-sm font-medium text-indigo-600 group-hover:text-indigo-800 transition-colors">Go to Jobs &rarr;</Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center text-center group hover:border-emerald-200 transition-colors cursor-pointer">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Saved Internships</h3>
            <div className="text-4xl font-extrabold text-emerald-600 mb-4">{stats.savedInternshipsCount}</div>
            <Link to="/dashboard/internships" className="text-sm font-medium text-emerald-600 group-hover:text-emerald-800 transition-colors">Go to Internships &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-inner ${color}`}>
      {icon}
    </div>
    <div>
      <div className="text-3xl font-extrabold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-500 mt-1">{title}</div>
    </div>
  </div>
);

export default PlacementDashboard;
