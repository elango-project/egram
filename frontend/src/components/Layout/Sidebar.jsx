import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = ({ items }) => {
  const location = useLocation();

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 h-full sticky top-24">
        <nav className="flex flex-col gap-1.5">
          {items.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-4 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  {item.icon && <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>{item.icon}</span>}
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
