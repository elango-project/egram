import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import jobService from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';

const StudentJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, SAVED, APPLIED
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyForm, setApplyForm] = useState({ resumeUrl: user?.resumeUrl || '', coverLetter: '' });

  // Filters
  const [filters, setFilters] = useState({
    type: '',
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
      setJobs(allRes);
      setSavedJobs(savedRes);
      setAppliedJobs(appliedRes);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = async (id) => {
    try {
      const detailedJob = await jobService.getJobById(id);
      setSelectedJob(detailedJob);
    } catch (error) {
      console.error('Failed to fetch job details', error);
    }
  };

  const handleSave = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await jobService.saveJob(id);
      fetchAllData();
      if (selectedJob && selectedJob.id === id) handleSelectJob(id);
      toast.success('Job saved');
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
      if (selectedJob && selectedJob.id === id) handleSelectJob(id);
      toast.success('Job unsaved');
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
      await jobService.applyJob(selectedJob.id, applyForm);
      toast.success('Applied successfully!');
      setIsApplying(false);
      fetchAllData();
      handleSelectJob(selectedJob.id);
    } catch (error) {
      console.error('Failed to apply', error);
      toast.error('Failed to apply. You might have already applied.');
    }
  };

  const isJobSaved = (id) => savedJobs.some(j => j.id === id);
  const getJobApplication = (id) => appliedJobs.find(app => app.job.id === id);
  const isJobApplied = (id) => !!getJobApplication(id);

  if (loading && jobs.length === 0) {
    return <div className="text-center py-12">Loading Jobs...</div>;
  }

  // Application Modal
  const renderApplyModal = () => {
    if (!isApplying) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Apply for {selectedJob.title}</h2>
          <form onSubmit={handleApply}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Resume URL (Required)</label>
              <input 
                type="url" 
                required 
                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Google Drive link, Portfolio, etc."
                value={applyForm.resumeUrl}
                onChange={e => setApplyForm({...applyForm, resumeUrl: e.target.value})}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-1">Cover Letter (Optional)</label>
              <textarea 
                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Why are you a great fit?"
                value={applyForm.coverLetter}
                onChange={e => setApplyForm({...applyForm, coverLetter: e.target.value})}
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsApplying(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Details View
  if (selectedJob) {
    const saved = isJobSaved(selectedJob.id);
    const application = getJobApplication(selectedJob.id);
    const applied = !!application;

    return (
      <div>
        {renderApplyModal()}
        <button onClick={() => setSelectedJob(null)} className="mb-4 text-blue-600 hover:underline font-medium">
          &larr; Back to Jobs
        </button>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-start">
            <div className="flex gap-4 items-center">
              {selectedJob.companyLogoUrl && (
                <img src={selectedJob.companyLogoUrl} alt={selectedJob.companyName} className="w-16 h-16 rounded-md object-contain border" />
              )}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedJob.title}</h2>
                <div className="text-xl text-gray-700 font-medium mb-4">{selectedJob.companyName}</div>
                
                <div className="flex flex-wrap gap-3 text-sm font-medium">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded">📍 {selectedJob.location || 'Remote'}</span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded">💼 {selectedJob.type}</span>
                  {selectedJob.remoteType && (
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded">🌐 {selectedJob.remoteType}</span>
                  )}
                  {selectedJob.compensation && (
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded">💰 {selectedJob.compensation}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 items-end">
              {applied ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="bg-gray-100 text-gray-800 px-6 py-2 rounded-lg font-bold">
                    ✓ Applied
                  </span>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${
                    application.status === 'PENDING' ? 'text-yellow-600 bg-yellow-50' : 
                    application.status === 'SHORTLISTED' ? 'text-purple-600 bg-purple-50' : 
                    application.status === 'SELECTED' ? 'text-green-600 bg-green-50' : 
                    application.status === 'REJECTED' ? 'text-red-600 bg-red-50' : 
                    'text-blue-600 bg-blue-50'
                  }`}>
                    Status: {application.status}
                  </span>
                </div>
              ) : (
                <button 
                  onClick={() => setIsApplying(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2 rounded-lg transition-colors"
                >
                  Apply Now
                </button>
              )}

              {saved ? (
                <button onClick={() => handleUnsave(selectedJob.id)} className="text-gray-500 hover:text-gray-800 font-medium text-sm">
                  Remove from Saved
                </button>
              ) : (
                <button onClick={() => handleSave(selectedJob.id)} className="text-blue-600 hover:underline font-medium text-sm">
                  ❤️ Save Job
                </button>
              )}
            </div>
          </div>

          <div className="p-8">
            {selectedJob.skillsRequired && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Skills Required</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedJob.skillsRequired}</p>
              </div>
            )}
            <h3 className="text-xl font-bold mb-4">Job Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {selectedJob.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
        <h2 className="text-2xl font-bold">Opportunities</h2>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('ALL')} 
            className={`px-4 py-2 rounded-md font-medium ${activeTab === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All Jobs
          </button>
          <button 
            onClick={() => setActiveTab('SAVED')} 
            className={`px-4 py-2 rounded-md font-medium ${activeTab === 'SAVED' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Saved
          </button>
          <button 
            onClick={() => setActiveTab('APPLIED')} 
            className={`px-4 py-2 rounded-md font-medium ${activeTab === 'APPLIED' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            My Applications
          </button>
        </div>
      </div>

      {activeTab === 'ALL' && (
        <div className="flex gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <select 
            value={filters.type} 
            onChange={e => setFilters({...filters, type: e.target.value})}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="JOB">Job</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
          <select 
            value={filters.remoteType} 
            onChange={e => setFilters({...filters, remoteType: e.target.value})}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Work Models</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">Onsite</option>
          </select>
          <input 
            type="text" 
            placeholder="Filter by location..." 
            value={filters.location}
            onChange={e => setFilters({...filters, location: e.target.value})}
            className="border rounded px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="space-y-4">
        {activeTab === 'APPLIED' ? (
          appliedJobs.length > 0 ? appliedJobs.map(app => (
            <div 
              key={app.job.id} 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center"
              onClick={() => handleSelectJob(app.job.id)}
            >
              <div className="flex items-center gap-4">
                {app.job.companyLogoUrl && (
                  <img src={app.job.companyLogoUrl} alt={app.job.companyName} className="w-12 h-12 rounded object-contain border" />
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{app.job.title}</h3>
                  <p className="text-gray-600 mb-2">{app.job.companyName}</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    app.status === 'PENDING' ? 'text-yellow-600 bg-yellow-50' : 
                    app.status === 'SHORTLISTED' ? 'text-purple-600 bg-purple-50' : 
                    app.status === 'SELECTED' ? 'text-green-600 bg-green-50' : 
                    app.status === 'REJECTED' ? 'text-red-600 bg-red-50' : 
                    'text-blue-600 bg-blue-50'
                  }`}>
                    {app.status}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button className="text-blue-600 font-medium hover:underline">
                View Job
              </button>
            </div>
          )) : (
            <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              You haven't applied to any jobs yet.
            </div>
          )
        ) : (
          (() => {
            const displayedJobs = activeTab === 'SAVED' ? savedJobs : jobs;
            if (displayedJobs.length === 0) {
              return (
                <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  {activeTab === 'ALL' && "No jobs found matching criteria."}
                  {activeTab === 'SAVED' && "You haven't saved any jobs."}
                </div>
              );
            }
            return displayedJobs.map(job => {
              const applied = isJobApplied(job.id);
              const saved = isJobSaved(job.id);
              
              return (
                <div 
                  key={job.id} 
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center"
                  onClick={() => handleSelectJob(job.id)}
                >
                  <div className="flex items-center gap-4">
                    {job.companyLogoUrl && (
                      <img src={job.companyLogoUrl} alt={job.companyName} className="w-12 h-12 rounded object-contain border" />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-gray-600 mb-2">{job.companyName} • {job.location || 'Remote'}</p>
                      <div className="flex gap-2">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{job.type}</span>
                        {job.remoteType && <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">{job.remoteType}</span>}
                        {applied && <span className="text-xs font-bold text-green-800 bg-green-100 px-2 py-1 rounded">Applied</span>}
                        {saved && !applied && <span className="text-xs font-bold text-red-800 bg-red-100 px-2 py-1 rounded">Saved</span>}
                      </div>
                    </div>
                  </div>
                  <button className="text-blue-600 font-medium hover:underline">
                    View Details
                  </button>
                </div>
              );
            });
          })()
        )}
      </div>
    </div>
  );
};

export default StudentJobs;
