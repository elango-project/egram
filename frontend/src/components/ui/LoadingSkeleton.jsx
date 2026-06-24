import React from 'react';

const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  return (
    <div className={`w-full ${type === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          {type === 'card' && (
            <>
              <div className="h-40 bg-slate-200 rounded-xl w-full mb-4"></div>
              <div className="h-6 bg-slate-200 rounded-md w-3/4 mb-3"></div>
              <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
            </>
          )}
          {type === 'list' && (
            <div className="flex gap-4">
              <div className="h-16 w-16 bg-slate-200 rounded-xl shrink-0"></div>
              <div className="flex-1">
                <div className="h-5 bg-slate-200 rounded-md w-1/3 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
              </div>
            </div>
          )}
          {type === 'stat' && (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded-md w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded-md w-1/3"></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
