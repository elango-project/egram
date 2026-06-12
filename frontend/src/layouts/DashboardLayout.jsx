import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <header className="bg-blue-600 text-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="text-xl font-bold">Egram Dashboard</div>
          <nav className="flex gap-4">
            <button 
              onClick={handleLogout}
              className="text-blue-100 hover:text-white bg-transparent border-none cursor-pointer font-medium"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      
      <div className="flex-1 max-w-7xl mx-auto px-4 w-full flex gap-6 py-8">
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="bg-white rounded-lg shadow p-4 h-full">
            <nav className="flex flex-col gap-2">
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md font-medium">Dashboard</div>
              {/* Future navigation items here */}
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
