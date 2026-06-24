import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import jobService from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';

const StudentInternships = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [savedInternships, setSavedInternships] = useState([]);
  const [appliedInternships, setAppliedInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, SAVED, APPLIED
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyForm, setApplyForm] = useState({ resumeUrl: user?.resumeUrl || '', coverLetter: '' });

  // Filters
  const [filters, setFilters] = useState({
    type: 'INTERNSHIP',
    location: '',
    remoteType: ''
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
      setInternships(allRes);
      // Filter saved/applied strictly for INTERNSHIP type
      setSavedInternships(savedRes.filter(j => j.type === 'INTERNSHIP'));
      setAppliedInternships(appliedRes.filter(a => a.job.type === 'INTERNSHIP'));
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInternship = async (id) => {
    try {
      const detailed = await jobService.getJobById(id);
      setSelectedInternship(detailed);
    } catch (error) {
      console.error('Failed to fetch internship details', error);
    }
  };

  const handleSave = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await jobService.saveJob(id);
      fetchAllData();
      if (selectedInternship && selectedInternship.id === id) handleSelectInternship(id);
      toast.success('Internship saved');
    } catch (error) {
      console.error('Failed to save', error);
      toast.error('Already saved or error occurred.');
    }
  };

  const handleUnsave = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await jobService.unsaveJob(id);
      fetchAllData();
      if (selectedInternship && selectedInternship.id === id) handleSelectInternship(id);
      toast.success('Internship unsaved');
    } catch (error) {
      console.error('Failed to unsave', error);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyForm.resumeUrl) {
      toast.error("Resume URL is required");
      return;
    }
    try {
      await jobService.applyJob(selectedInternship.id, applyForm);
      toast.success('Applied successfully!');
      setIsApplying(false);
      fetchAllData();
      handleSelectInternship(selectedInternship.id);
    } catch (error) {
      console.error('Failed to apply', error);
      toast.error('Failed to apply. You might have already applied.');
    }
  };

  const isSaved = (id) => savedInternships.some(j => j.id === id);
  const getApplication = (id) => appliedInternships.find(app => app.job.id === id);

  const displayedList = activeTab === 'ALL' ? internships : 
                        activeTab === 'SAVED' ? savedInternships : 
                        appliedInternships.map(app => app.job);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* Left Column: List & Filters */}
      <div className="w-full md:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header & Tabs */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Internships ({displayedList.length})</h2>
          <div className="flex gap-2">
            {['ALL', 'SAVED', 'APPLIED'].map(tab => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setSelectedInternship(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Filters (Only show on ALL) */}
        {activeTab === 'ALL' && (
          <div className="p-4 border-b bg-gray-50 flex gap-2 overflow-x-auto">
            <input 
              type="text" 
              placeholder="Search Location..." 
              value={filters.location}
              onChange={e => setFilters({...filters, location: e.target.value})}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 w-full"
            />
            <select 
              value={filters.remoteType}
              onChange={e => setFilters({...filters, remoteType: e.target.value})}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="">Any Mode</option>
              <option value="ONSITE">Onsite</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading internships...</div>
          ) : displayedList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No internships found in this category.</div>
          ) : (
            displayedList.map(intern => {
              const saved = isSaved(intern.id);
              const applied = getApplication(intern.id);
              const isSelected = selectedInternship?.id === intern.id;

              return (
                <div 
                  key={intern.id} 
                  onClick={() => handleSelectInternship(intern.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{intern.title}</h4>
                      <div className="text-gray-600 text-sm mt-1">{intern.companyName}</div>
                    </div>
                    {intern.companyLogoUrl && (
                      <img src={intern.companyLogoUrl} alt="logo" className="w-10 h-10 rounded object-contain bg-white border border-gray-100" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-3 flex flex-wrap gap-2">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{intern.location || 'Remote'}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{intern.remoteType}</span>
                    {intern.stipend && <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold">{intern.stipend}</span>}
                  </div>
                  <div className="mt-3 flex justify-between items-center text-xs">
                    <span className="text-gray-400">
                      {intern.deadline ? `Deadline: ${new Date(intern.deadline).toLocaleDateString()}` : 'Flexible Deadline'}
                    </span>
                    <div className="flex gap-2 font-bold">
                      {applied ? (
                        <span className={`px-2 py-1 rounded ${
                          applied.status === 'SELECTED' ? 'bg-green-100 text-green-800' :
                          applied.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>{applied.status}</span>
                      ) : saved ? (
                        <span className="text-blue-600">Saved</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Detail view */}
      <div className="w-full md:w-2/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        {selectedInternship ? (
          <div className="flex-1 overflow-y-auto">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 border-b border-gray-100">
              <div className="flex items-center gap-6">
                {selectedInternship.companyLogoUrl ? (
                  <img src={selectedInternship.companyLogoUrl} alt="Logo" className="w-20 h-20 rounded-xl bg-white shadow-sm border border-gray-200 object-contain p-2" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-400 text-3xl font-bold shadow-sm">
                    {selectedInternship.companyName?.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-extrabold text-gray-900">{selectedInternship.title}</h1>
                  <h3 className="text-xl text-gray-600 mt-1">{selectedInternship.companyName}</h3>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Actions & Meta */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex flex-wrap gap-3">
                  <div className="flex flex-col bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">Location</span>
                    <span className="font-bold text-gray-800">{selectedInternship.location || 'Remote'} ({selectedInternship.remoteType})</span>
                  </div>
                  <div className="flex flex-col bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">Duration</span>
                    <span className="font-bold text-gray-800">{selectedInternship.duration || 'Flexible'}</span>
                  </div>
                  {selectedInternship.stipend && (
                    <div className="flex flex-col bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                      <span className="text-xs text-green-600 font-medium">Stipend</span>
                      <span className="font-bold text-green-800">{selectedInternship.stipend}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  {getApplication(selectedInternship.id) ? (
                    <button disabled className="flex-1 md:flex-none bg-gray-100 text-gray-500 px-8 py-3 rounded-xl font-bold cursor-not-allowed">
                      Applied ({getApplication(selectedInternship.id).status})
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsApplying(true)}
                      className="flex-1 md:flex-none bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
                    >
                      Apply Now
                    </button>
                  )}

                  {!getApplication(selectedInternship.id) && (
                    isSaved(selectedInternship.id) ? (
                      <button onClick={(e) => handleUnsave(selectedInternship.id, e)} className="px-6 py-3 rounded-xl font-bold border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-colors">
                        Saved
                      </button>
                    ) : (
                      <button onClick={(e) => handleSave(selectedInternship.id, e)} className="px-6 py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                        Save
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">About the Internship</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedInternship.description}</p>
              </div>

              {/* Requirements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {selectedInternship.skillsRequired && (
                  <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                    <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-3">Skills Required</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedInternship.skillsRequired.split(',').map((skill, i) => (
                        <span key={i} className="bg-white text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-200 shadow-sm">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
            <svg className="w-24 h-24 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <p className="text-xl font-medium">Select an internship to view details</p>
          </div>
        )}

        {/* Apply Modal */}
        {isApplying && selectedInternship && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Apply: {selectedInternship.title}</h2>
              <button onClick={() => setIsApplying(false)} className="text-gray-400 hover:text-gray-800 text-3xl font-bold transition-colors">&times;</button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
              {selectedInternship.applyUrl ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="bg-teal-50 p-6 rounded-full mb-6">
                    <svg className="w-12 h-12 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Apply on Company Website</h3>
                  <p className="text-gray-600 mb-8 max-w-md">This role requires you to submit your application directly on the company's external portal.</p>
                  <a href={selectedInternship.applyUrl} target="_blank" rel="noreferrer" className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5">
                    Proceed to Application
                  </a>
                </div>
              ) : (
                <form onSubmit={handleApply} className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex gap-4 items-center">
                    <div className="bg-white p-3 rounded-full shadow-sm">
                      <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 text-lg">Applying as {user?.fullName}</h4>
                      <p className="text-emerald-700 text-sm">{user?.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Resume URL <span className="text-red-500">*</span></label>
                    <input 
                      type="url" 
                      required
                      value={applyForm.resumeUrl}
                      onChange={e => setApplyForm({...applyForm, resumeUrl: e.target.value})}
                      placeholder="https://drive.google.com/..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-2">Link to your Google Drive, Dropbox, or portfolio PDF. Make sure it is public.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Cover Letter / Note <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <textarea 
                      value={applyForm.coverLetter}
                      onChange={e => setApplyForm({...applyForm, coverLetter: e.target.value})}
                      placeholder="Why are you a good fit for this role?"
                      rows="6"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-gray-50"
                    ></textarea>
                  </div>

                  <div className="pt-4 border-t">
                    <button type="submit" className="w-full bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5">
                      Submit Application
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInternships;
