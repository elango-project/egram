import React, { useState, useEffect } from 'react';
import jobService from '../../services/jobService';

const StudentJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, SAVED, APPLIED
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [allRes, savedRes, appliedRes] = await Promise.all([
        jobService.getJobs(),
        jobService.getSavedJobs(),
        jobService.getAppliedJobs()
      ]);
      setJobs(allRes);
      // Backend returns SavedJob / JobApplication objects which map to job/student logic
      // Assuming the backend returns the actual Job objects or wrappers containing them.
      // Based on JobService implementation, it returns JobResponse lists.
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
    } catch (error) {
      console.error('Failed to save', error);
      alert('Already saved or error occurred.');
    }
  };

  const handleUnsave = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await jobService.unsaveJob(id);
      fetchAllData();
      if (selectedJob && selectedJob.id === id) handleSelectJob(id);
    } catch (error) {
      console.error('Failed to unsave', error);
    }
  };

  const handleApply = async (id) => {
    try {
      await jobService.applyJob(id);
      fetchAllData();
      if (selectedJob && selectedJob.id === id) handleSelectJob(id);
    } catch (error) {
      console.error('Failed to apply', error);
      alert('Already applied or error occurred.');
    }
  };

  // Helper to check if job is saved/applied based on fetched lists
  const isJobSaved = (id) => savedJobs.some(j => j.id === id);
  const isJobApplied = (id) => appliedJobs.some(j => j.id === id);

  if (loading && jobs.length === 0) {
    return <div className="text-center py-12">Loading Jobs...</div>;
  }

  // Details View
  if (selectedJob) {
    const saved = isJobSaved(selectedJob.id);
    const applied = isJobApplied(selectedJob.id);

    return (
      <div>
        <button onClick={() => setSelectedJob(null)} className="mb-4 text-blue-600 hover:underline font-medium">
          &larr; Back to Jobs
        </button>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedJob.title}</h2>
              <div className="text-xl text-gray-700 font-medium mb-4">{selectedJob.companyName}</div>
              
              <div className="flex gap-3 text-sm font-medium">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded">📍 {selectedJob.location || 'Remote'}</span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded">💼 {selectedJob.type}</span>
                {selectedJob.experienceRequired && (
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded">⭐ {selectedJob.experienceRequired}</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 items-end">
              {applied ? (
                <span className="bg-green-100 text-green-800 px-6 py-2 rounded-lg font-bold">
                  ✓ Already Applied
                </span>
              ) : (
                <button 
                  onClick={() => handleApply(selectedJob.id)}
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
            <h3 className="text-xl font-bold mb-4">Job Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {selectedJob.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine list to show
  let displayedJobs = jobs;
  if (activeTab === 'SAVED') displayedJobs = savedJobs;
  if (activeTab === 'APPLIED') displayedJobs = appliedJobs;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-4">
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
            Applied
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {displayedJobs.map(job => {
          const applied = isJobApplied(job.id);
          const saved = isJobSaved(job.id);
          
          return (
            <div 
              key={job.id} 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center"
              onClick={() => handleSelectJob(job.id)}
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-gray-600 mb-2">{job.companyName} • {job.location || 'Remote'}</p>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{job.type}</span>
                  {applied && <span className="text-xs font-bold text-green-800 bg-green-100 px-2 py-1 rounded">Applied</span>}
                  {saved && !applied && <span className="text-xs font-bold text-red-800 bg-red-100 px-2 py-1 rounded">Saved</span>}
                </div>
              </div>
              <button className="text-blue-600 font-medium hover:underline">
                View Details
              </button>
            </div>
          );
        })}

        {displayedJobs.length === 0 && (
          <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            {activeTab === 'ALL' && "No jobs posted yet."}
            {activeTab === 'SAVED' && "You haven't saved any jobs."}
            {activeTab === 'APPLIED' && "You haven't applied to any jobs."}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentJobs;
