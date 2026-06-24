import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  const navItems = isAdmin ? [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Reals', path: '/dashboard/reals' },
    { name: 'Videos', path: '/dashboard/videos' },
    { name: 'Courses', path: '/dashboard/courses' },
    { name: 'Assessments', path: '/dashboard/assessments' },
    { name: 'Jobs', path: '/dashboard/jobs' },
    { name: 'Internships', path: '/dashboard/internships' }
  ] : [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Reals', path: '/dashboard/reals' },
    { name: 'Videos', path: '/dashboard/videos' },
    { name: 'Courses', path: '/dashboard/courses' },
    { name: 'Assessments', path: '/dashboard/assessments' },
    { name: 'Jobs', path: '/dashboard/jobs' },
    { name: 'Internships', path: '/dashboard/internships' },
    { name: 'Placement', path: '/dashboard/placement' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <header className="bg-blue-600 text-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="text-xl font-bold">Egram MVP</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-100 hidden sm:block">
              {user?.email} ({isAdmin ? 'Admin' : 'Student'})
            </span>
            <button 
              onClick={handleLogout}
              className="text-blue-100 hover:text-white bg-transparent border-none cursor-pointer font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 max-w-7xl mx-auto px-4 w-full flex gap-6 py-8">
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="bg-white rounded-lg shadow p-4 h-full">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          <div className="bg-white rounded-lg shadow p-6 min-h-[500px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
