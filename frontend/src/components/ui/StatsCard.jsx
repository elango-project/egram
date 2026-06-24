import React from 'react';
import Card from './Card';

const StatsCard = ({ title, value, icon, colorClass = 'bg-indigo-500', trend }) => {
  return (
    <Card hover className="flex flex-col">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-inner ${colorClass}`}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{value}</div>
        </div>
      </div>
      {trend && (
        <div className="mt-4 text-sm font-medium">
          <span className={trend.isPositive ? 'text-emerald-600' : 'text-red-600'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </span>
          <span className="text-slate-400 ml-2">vs last month</span>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
