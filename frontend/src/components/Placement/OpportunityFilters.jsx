import React from 'react';
import { Search, MapPin, Briefcase, Clock, Code, Filter, X } from 'lucide-react';
import Button from '../ui/Button';

const OpportunityFilters = ({ filters, setFilters, type = 'JOB', isMobileOpen, setIsMobileOpen }) => {
  const isJob = type === 'JOB';
  const themeAccent = isJob ? 'indigo' : 'cyan';

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: type,
      location: '',
      remoteType: '',
      search: '',
      experience: '',
      employmentType: ''
    });
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Search size={14} /> Search
        </label>
        <div className="relative">
          <input 
            type="text" 
            placeholder={`Search ${isJob ? 'jobs' : 'internships'}...`}
            value={filters.search || ''}
            onChange={e => updateFilter('search', e.target.value)}
            className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <MapPin size={14} /> Location
        </label>
        <div className="relative">
          <input 
            type="text" 
            placeholder="e.g. Bangalore, Remote"
            value={filters.location || ''}
            onChange={e => updateFilter('location', e.target.value)}
            className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Work Mode */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Briefcase size={14} /> Work Mode
        </label>
        <div className="flex flex-col gap-2">
          {['REMOTE', 'HYBRID', 'ONSITE'].map(mode => (
            <label key={mode} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="workMode" 
                checked={filters.remoteType === mode}
                onChange={() => updateFilter('remoteType', mode)}
                className={`w-4 h-4 text-${themeAccent}-600 border-slate-300 focus:ring-${themeAccent}-500`}
              />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 capitalize">{mode.toLowerCase()}</span>
            </label>
          ))}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="radio" 
              name="workMode" 
              checked={!filters.remoteType}
              onChange={() => updateFilter('remoteType', '')}
              className={`w-4 h-4 text-${themeAccent}-600 border-slate-300 focus:ring-${themeAccent}-500`}
            />
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Any Mode</span>
          </label>
        </div>
      </div>

      {/* Experience / Duration */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Clock size={14} /> {isJob ? 'Experience' : 'Duration'}
        </label>
        <select 
          value={isJob ? filters.experience : filters.employmentType}
          onChange={e => updateFilter(isJob ? 'experience' : 'employmentType', e.target.value)}
          className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Any</option>
          {isJob ? (
            <>
              <option value="Fresher">Fresher (0 years)</option>
              <option value="1-3 Years">1-3 Years</option>
              <option value="3-5 Years">3-5 Years</option>
              <option value="5+ Years">5+ Years</option>
            </>
          ) : (
            <>
              <option value="2 Months">2 Months</option>
              <option value="3 Months">3 Months</option>
              <option value="6 Months">6 Months</option>
            </>
          )}
        </select>
      </div>

      {/* Clear Filters */}
      <Button 
        variant="ghost" 
        onClick={clearFilters}
        className="w-full text-slate-500 hover:text-slate-900 hover:bg-white"
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 shrink-0 h-full overflow-y-auto">
        <div className="bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 sticky top-0 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-slate-900">
            <Filter size={20} />
            <h2 className="font-bold text-lg">Filters</h2>
          </div>
          {filterContent}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
          <div className="relative w-4/5 max-w-sm h-full bg-slate-50 p-6 flex flex-col overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-slate-900">
                <Filter size={20} />
                <h2 className="font-bold text-lg">Filters</h2>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-white rounded-full text-slate-500 shadow-sm">
                <X size={20} />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
};

export default OpportunityFilters;
