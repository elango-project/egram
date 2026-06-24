import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, Film, Video, BookOpen, FileText, Briefcase, UserPlus, Target } from 'lucide-react';

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  const navItems = isAdmin ? [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Reels', path: '/dashboard/reals', icon: Film },
    { name: 'Videos', path: '/dashboard/videos', icon: Video },
    { name: 'Courses', path: '/dashboard/courses', icon: BookOpen },
    { name: 'Assessments', path: '/dashboard/assessments', icon: FileText },
    { name: 'Jobs', path: '/dashboard/jobs', icon: Briefcase },
    { name: 'Internships', path: '/dashboard/internships', icon: UserPlus }
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Reels', path: '/dashboard/reals', icon: Film },
    { name: 'Videos', path: '/dashboard/videos', icon: Video },
    { name: 'Courses', path: '/dashboard/courses', icon: BookOpen },
    { name: 'Assessments', path: '/dashboard/assessments', icon: FileText },
    { name: 'Jobs', path: '/dashboard/jobs', icon: Briefcase },
    { name: 'Internships', path: '/dashboard/internships', icon: UserPlus },
    { name: 'Placement', path: '/dashboard/placement', icon: Target }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 shadow-sm py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="text-2xl font-black tracking-tight text-indigo-600">Egram<span className="text-slate-900">.</span></div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">
              {user?.email} <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-2">{isAdmin ? 'Admin' : 'Student'}</span>
            </span>
            <button 
              onClick={handleLogout}
              className="text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 max-w-7xl mx-auto px-4 w-full flex gap-8 py-8 relative">
        
        {/* Desktop Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-24">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar (Slide Over) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden"
              />
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 md:hidden flex flex-col"
              >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="text-2xl font-black tracking-tight text-indigo-600">Egram<span className="text-slate-900">.</span></div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4 px-3">
                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                            isActive 
                              ? 'bg-indigo-600 text-white shadow-md' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                          }`}
                        >
                          <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
                <div className="p-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-bold text-slate-900 truncate">{user?.email}</div>
                      <div className="text-xs text-slate-500">{isAdmin ? 'Admin' : 'Student'}</div>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-slate-50 text-rose-600 font-bold rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 w-full max-w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
