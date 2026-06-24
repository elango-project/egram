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

const StudentInternships = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [savedInternships, setSavedInternships] = useState([]);
  const [appliedInternships, setAppliedInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, SAVED, APPLIED
  const [selectedInternshipId, setSelectedInternshipId] = useState(null);
  const [selectedInternshipDetail, setSelectedInternshipDetail] = useState(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    type: 'INTERNSHIP',
    location: '',
    remoteType: '',
    search: '',
    employmentType: '' // Duration
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
      
      let processedInternships = allRes.filter(j => j.type === 'INTERNSHIP');
      if (filters.search) {
        const lowerQ = filters.search.toLowerCase();
        processedInternships = processedInternships.filter(j => 
          j.title.toLowerCase().includes(lowerQ) || 
          j.companyName.toLowerCase().includes(lowerQ)
        );
      }
      if (filters.employmentType) {
        processedInternships = processedInternships.filter(j => j.duration === filters.employmentType);
      }

      setInternships(processedInternships);
      setSavedInternships(savedRes.filter(j => j.type === 'INTERNSHIP'));
      setAppliedInternships(appliedRes.filter(a => a.job.type === 'INTERNSHIP'));
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInternship = async (id) => {
    setSelectedInternshipId(id);
    try {
      const detailedInternship = await jobService.getJobById(id);
      setSelectedInternshipDetail(detailedInternship);
    } catch (error) {
      console.error('Failed to fetch details', error);
    }
  };

  const handleSaveToggle = async (id) => {
    try {
      if (isInternshipSaved(id)) {
        await jobService.unsaveJob(id);
        toast.success('Internship unsaved');
      } else {
        await jobService.saveJob(id);
        toast.success('Internship saved');
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
      if (selectedInternshipId === id) handleSelectInternship(id);
    } catch (error) {
      console.error('Failed to apply', error);
      toast.error(error.response?.data?.message || 'Failed to apply. You might have already applied.');
    }
  };

  const isInternshipSaved = (id) => savedInternships.some(j => j.id === id);
  const getInternshipApplication = (id) => appliedInternships.find(app => app.job.id === id);

  const displayedInternships = activeTab === 'ALL' ? internships : 
                               activeTab === 'SAVED' ? savedInternships : 
                               appliedInternships.map(app => app.job);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col pt-6 pb-6 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Opportunity Stats Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-3xl p-6 sm:p-8 mb-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Internship Opportunities</h1>
          <p className="text-cyan-100 text-lg">Kickstart your career with hands-on experience.</p>
        </div>

        <div className="flex items-center gap-8 md:pr-8 z-10">
          <div className="text-center">
            <div className="text-4xl font-black">{internships.length}</div>
            <div className="text-cyan-100 text-sm font-bold uppercase tracking-wider mt-1">Active</div>
          </div>
          <div className="w-px h-12 bg-cyan-400/50 hidden sm:block"></div>
          <div className="text-center">
            <div className="text-4xl font-black">{savedInternships.length}</div>
            <div className="text-cyan-100 text-sm font-bold uppercase tracking-wider mt-1">Saved</div>
          </div>
          <div className="w-px h-12 bg-cyan-400/50 hidden sm:block"></div>
          <div className="text-center">
            <div className="text-4xl font-black text-amber-300">{appliedInternships.length}</div>
            <div className="text-cyan-100 text-sm font-bold uppercase tracking-wider mt-1">Applied</div>
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
            type="INTERNSHIP" 
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
                  onClick={() => { setActiveTab(tab); setSelectedInternshipId(null); setSelectedInternshipDetail(null); }}
                  className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                    activeTab === tab ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
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
            ) : displayedInternships.length === 0 ? (
              <EmptyState 
                icon={<Search size={48} />}
                title="No matching opportunities"
                description="Try changing your filters or explore full-time jobs."
                action={activeTab !== 'ALL' ? { label: "Browse All Internships", onClick: () => setActiveTab('ALL') } : null}
              />
            ) : (
              <AnimatePresence>
                {displayedInternships.map(internship => (
                  <motion.div
                    key={internship.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <OpportunityCard 
                      item={internship}
                      type="INTERNSHIP"
                      isSelected={selectedInternshipId === internship.id}
                      isSaved={isInternshipSaved(internship.id)}
                      application={getInternshipApplication(internship.id)}
                      onClick={handleSelectInternship}
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
            item={selectedInternshipDetail}
            type="INTERNSHIP"
            application={selectedInternshipDetail ? getInternshipApplication(selectedInternshipDetail.id) : null}
            isSaved={selectedInternshipDetail ? isInternshipSaved(selectedInternshipDetail.id) : false}
            onSave={handleSaveToggle}
            onApply={handleApply}
          />
        </div>

        {/* Mobile Detail Modal */}
        {selectedInternshipDetail && (
          <div className="md:hidden fixed inset-0 z-[60] flex flex-col bg-slate-100">
            <div className="bg-white p-4 flex justify-between items-center border-b border-slate-200">
              <h2 className="font-bold text-lg truncate pr-4">{selectedInternshipDetail.title}</h2>
              <button onClick={() => { setSelectedInternshipId(null); setSelectedInternshipDetail(null); }} className="p-2 bg-slate-100 rounded-full text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <OpportunityDetail 
                item={selectedInternshipDetail}
                type="INTERNSHIP"
                application={getInternshipApplication(selectedInternshipDetail.id)}
                isSaved={isInternshipSaved(selectedInternshipDetail.id)}
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

export default StudentInternships;
