import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import jobService from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import OpportunityCard from '../../components/Placement/OpportunityCard';
import OpportunityDetail from '../../components/Placement/OpportunityDetail';
import OpportunityFilters from '../../components/Placement/OpportunityFilters';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const StudentJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, SAVED, APPLIED
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    type: 'JOB',
    location: '',
    remoteType: '',
    search: '',
    experience: ''
  });

  useEffect(() => {
    fetchAllData();
  }, [filters]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [allRes, savedRes, appliedRes] = await Promise.all([
        jobService.getJobs(filters),
        jobService.getSavedJobs(),
        jobService.getMyApplications()
      ]);
      
      // Post-process search/experience frontend filters if API doesn't support them fully
      let processedJobs = allRes.filter(j => j.type === 'JOB');
      if (filters.search) {
        const lowerQ = filters.search.toLowerCase();
        processedJobs = processedJobs.filter(j => 
          j.title.toLowerCase().includes(lowerQ) || 
          j.companyName.toLowerCase().includes(lowerQ)
        );
      }
      if (filters.experience) {
        processedJobs = processedJobs.filter(j => j.experienceRequired === filters.experience);
      }

      setJobs(processedJobs);
      setSavedJobs(savedRes.filter(j => j.type === 'JOB'));
      setAppliedJobs(appliedRes.filter(a => a.job.type === 'JOB'));
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = async (id) => {
    setSelectedJobId(id);
    try {
      const detailedJob = await jobService.getJobById(id);
      setSelectedJobDetail(detailedJob);
    } catch (error) {
      console.error('Failed to fetch job details', error);
    }
  };

  const handleSaveToggle = async (id) => {
    try {
      if (isJobSaved(id)) {
        await jobService.unsaveJob(id);
        toast.success('Job unsaved');
      } else {
        await jobService.saveJob(id);
        toast.success('Job saved');
      }
      fetchAllData();
    } catch (error) {
      console.error('Save toggle error', error);
      toast.error('Failed to update saved status');
    }
  };

  const handleApply = async (id, applyForm) => {
    try {
      await jobService.applyJob(id, applyForm);
      toast.success('Applied successfully!');
      fetchAllData();
      if (selectedJobId === id) handleSelectJob(id);
    } catch (error) {
      console.error('Failed to apply', error);
      toast.error(error.response?.data?.message || 'Failed to apply. You might have already applied.');
    }
  };

  const isJobSaved = (id) => savedJobs.some(j => j.id === id);
  const getJobApplication = (id) => appliedJobs.find(app => app.job.id === id);

  const displayedJobs = activeTab === 'ALL' ? jobs : 
                        activeTab === 'SAVED' ? savedJobs : 
                        appliedJobs.map(app => app.job);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col pt-6 pb-6 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Opportunity Stats Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-indigo-600 rounded-3xl p-6 sm:p-8 mb-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Software Engineering Roles</h1>
          <p className="text-indigo-200 text-lg">Discover your next career move at top tech companies.</p>
        </div>

        <div className="flex items-center gap-8 md:pr-8">
          <div className="text-center">
            <div className="text-4xl font-black">{jobs.length}</div>
            <div className="text-indigo-200 text-sm font-bold uppercase tracking-wider mt-1">Active</div>
          </div>
          <div className="w-px h-12 bg-indigo-400/50 hidden sm:block"></div>
          <div className="text-center">
            <div className="text-4xl font-black">{savedJobs.length}</div>
            <div className="text-indigo-200 text-sm font-bold uppercase tracking-wider mt-1">Saved</div>
          </div>
          <div className="w-px h-12 bg-indigo-400/50 hidden sm:block"></div>
          <div className="text-center">
            <div className="text-4xl font-black text-emerald-400">{appliedJobs.length}</div>
            <div className="text-indigo-200 text-sm font-bold uppercase tracking-wider mt-1">Applied</div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 h-[700px]">
        
        {/* Left: Shared Filters */}
        {activeTab === 'ALL' && (
          <OpportunityFilters 
            filters={filters} 
            setFilters={setFilters} 
            type="JOB" 
            isMobileOpen={isMobileFiltersOpen} 
            setIsMobileOpen={setIsMobileFiltersOpen} 
          />
        )}

        {/* Center: List */}
        <div className="flex-1 flex flex-col w-full max-w-xl h-full bg-slate-50/50">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-full sm:w-auto">
              {['ALL', 'SAVED', 'APPLIED'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => { setActiveTab(tab); setSelectedJobId(null); setSelectedJobDetail(null); }}
                  className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                    activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {activeTab === 'ALL' && (
              <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm"
              >
                <Filter size={20} />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-8">
            {loading ? (
              <div className="space-y-4">
                <LoadingSkeleton count={3} type="card" />
              </div>
            ) : displayedJobs.length === 0 ? (
              <EmptyState 
                icon={<Search size={48} />}
                title="No matching opportunities"
                description="Try changing your filters or explore internships."
                action={activeTab !== 'ALL' ? { label: "Browse All Jobs", onClick: () => setActiveTab('ALL') } : null}
              />
            ) : (
              <AnimatePresence>
                {displayedJobs.map(job => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <OpportunityCard 
                      item={job}
                      type="JOB"
                      isSelected={selectedJobId === job.id}
                      isSaved={isJobSaved(job.id)}
                      application={getJobApplication(job.id)}
                      onClick={handleSelectJob}
                      onSave={handleSaveToggle}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="hidden md:flex md:w-[500px] lg:w-[600px] h-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden shrink-0">
          <OpportunityDetail 
            item={selectedJobDetail}
            type="JOB"
            application={selectedJobDetail ? getJobApplication(selectedJobDetail.id) : null}
            isSaved={selectedJobDetail ? isJobSaved(selectedJobDetail.id) : false}
            onSave={handleSaveToggle}
            onApply={handleApply}
          />
        </div>

        {/* Mobile Detail Modal (If needed, although the slide over handles apply, the detail itself needs a view on mobile) */}
        {selectedJobDetail && (
          <div className="md:hidden fixed inset-0 z-[60] flex flex-col bg-slate-100">
            <div className="bg-white p-4 flex justify-between items-center border-b border-slate-200">
              <h2 className="font-bold text-lg truncate pr-4">{selectedJobDetail.title}</h2>
              <button onClick={() => { setSelectedJobId(null); setSelectedJobDetail(null); }} className="p-2 bg-slate-100 rounded-full text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <OpportunityDetail 
                item={selectedJobDetail}
                type="JOB"
                application={getJobApplication(selectedJobDetail.id)}
                isSaved={isJobSaved(selectedJobDetail.id)}
                onSave={handleSaveToggle}
                onApply={handleApply}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentJobs;
