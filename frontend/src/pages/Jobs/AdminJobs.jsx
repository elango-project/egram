import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import jobService from '../../services/jobService';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('JOB');
  const [remoteType, setRemoteType] = useState('ONSITE');
  const [compensation, setCompensation] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');
  const [applyUrl, setApplyUrl] = useState('');
  const [active, setActive] = useState(true);

  // Applicants Modal
  const [viewingApplicantsFor, setViewingApplicantsFor] = useState(null);
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await jobService.getJobs({ activeOnly: false });
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    }
  };

  const resetForm = () => {
    setEditingJob(null);
    setTitle('');
    setCompanyName('');
    setCompanyLogoUrl('');
    setLocation('');
    setType('JOB');
    setRemoteType('ONSITE');
    setCompensation('');
    setSkillsRequired('');
    setExpiryDate('');
    setDescription('');
    setApplyUrl('');
    setActive(true);
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setTitle(job.title);
    setCompanyName(job.companyName);
    setCompanyLogoUrl(job.companyLogoUrl || '');
    setLocation(job.location || '');
    setType(job.type || 'JOB');
    setRemoteType(job.remoteType || 'ONSITE');
    setCompensation(job.compensation || '');
    setSkillsRequired(job.skillsRequired || '');
    setExpiryDate(job.expiryDate || '');
    setDescription(job.description || '');
    setApplyUrl(job.applyUrl || '');
    setActive(job.active !== false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title, companyName, companyLogoUrl, location, type, remoteType, 
        compensation, skillsRequired, expiryDate: expiryDate || null, 
        description, applyUrl, active
      };
      if (editingJob) {
        await jobService.updateJob(editingJob.id, payload);
        toast.success('Job updated successfully');
      } else {
        await jobService.createJob(payload);
        toast.success('Job created successfully');
      }
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Failed to save job', error);
      toast.error('Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this Job? This will delete all applications too.')) {
      try {
        await jobService.deleteJob(id);
        fetchJobs();
        toast.success('Deleted');
      } catch (error) {
        console.error('Failed to delete job', error);
        toast.error('Failed to delete job');
      }
    }
  };

  const handleViewApplicants = async (job) => {
    setViewingApplicantsFor(job);
    try {
      const data = await jobService.getJobApplications(job.id);
      setApplicants(data);
    } catch (error) {
      console.error('Failed to fetch applicants', error);
      toast.error('Failed to fetch applicants');
    }
  };

  const handleStatusChange = async (studentId, status) => {
    try {
      await jobService.updateApplicationStatus(viewingApplicantsFor.id, studentId, status);
      setApplicants(prev => prev.map(a => a.studentId === studentId ? { ...a, status } : a));
      toast.success('Status updated');
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Jobs & Internships</h2>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">
          {editingJob ? 'Edit Job' : 'Post New Job'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Job Title" required value={title} onChange={e => setTitle(e.target.value)} className="border border-gray-300 rounded px-3 py-2" />
            <input type="text" placeholder="Company Name" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="border border-gray-300 rounded px-3 py-2" />
            <input type="url" placeholder="Company Logo URL" value={companyLogoUrl} onChange={e => setCompanyLogoUrl(e.target.value)} className="border border-gray-300 rounded px-3 py-2" />
            
            <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="border border-gray-300 rounded px-3 py-2" />
            <select value={type} onChange={e => setType(e.target.value)} className="border border-gray-300 rounded px-3 py-2 bg-white">
              <option value="JOB">Job</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
            <select value={remoteType} onChange={e => setRemoteType(e.target.value)} className="border border-gray-300 rounded px-3 py-2 bg-white">
              <option value="ONSITE">Onsite</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </select>

            <input type="text" placeholder="Compensation (e.g. ₹8-12 LPA)" value={compensation} onChange={e => setCompensation(e.target.value)} className="border border-gray-300 rounded px-3 py-2" />
            <input type="text" placeholder="Skills (e.g. React, Node.js)" value={skillsRequired} onChange={e => setSkillsRequired(e.target.value)} className="border border-gray-300 rounded px-3 py-2" />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Expiry Date</label>
              <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="border border-gray-300 rounded px-3 py-2 flex-1" />
            </div>
            
            <input type="url" placeholder="Apply URL (Optional External Link)" value={applyUrl} onChange={e => setApplyUrl(e.target.value)} className="border border-gray-300 rounded px-3 py-2" />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={active} onChange={e => setActive(e.target.checked)} />
              <label htmlFor="active">Is Active?</label>
            </div>
          </div>
          <textarea placeholder="Job Description" required value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" rows="4" />
          
          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
            </button>
            {editingJob && (
              <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-800 px-6 py-2 rounded font-medium hover:bg-gray-300">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Setup</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Stats</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map(job => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{job.title}</div>
                  <div className="text-sm text-gray-500">{job.companyName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{job.type} • {job.remoteType}</div>
                  <div className="text-sm text-gray-500">{job.location || 'Remote'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className={`text-xs font-bold px-2 py-1 inline-block rounded mb-1 ${job.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {job.active ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-gray-500">Apps: <strong>{job.applicationCount || 0}</strong></div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium space-y-1 flex flex-col items-end">
                  <button onClick={() => handleViewApplicants(job)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded">View Apps</button>
                  <button onClick={() => handleEditClick(job)} className="text-blue-600 hover:text-blue-900">Edit</button>
                  <button onClick={() => handleDelete(job.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No Jobs posted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Applicants Modal */}
      {viewingApplicantsFor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold">Applicants: {viewingApplicantsFor.title}</h2>
              <button onClick={() => setViewingApplicantsFor(null)} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {applicants.length === 0 ? (
                <div className="text-center text-gray-500 py-12">No applications yet.</div>
              ) : (
                <div className="space-y-4">
                  {applicants.map(app => (
                    <div key={app.studentId} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <div className="font-bold text-lg">{app.studentName}</div>
                        <div className="text-sm text-gray-600">{app.studentEmail}</div>
                        <div className="text-xs text-gray-500 mt-1">Applied: {new Date(app.appliedAt).toLocaleString()}</div>
                      </div>
                      
                      <div className="flex-1 text-sm bg-gray-50 p-3 rounded">
                        <strong>Cover Letter:</strong>
                        <p className="text-gray-700 whitespace-pre-wrap mt-1">{app.coverLetter || 'No cover letter provided.'}</p>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[150px]">
                        {app.resumeUrl && (
                          <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-center bg-blue-50 text-blue-600 font-medium px-3 py-2 rounded hover:bg-blue-100">
                            View Resume
                          </a>
                        )}
                        <select 
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.studentId, e.target.value)}
                          className={`border rounded px-3 py-2 font-bold focus:outline-none ${
                            app.status === 'PENDING' ? 'text-yellow-700 bg-yellow-50' : 
                            app.status === 'SHORTLISTED' ? 'text-purple-700 bg-purple-50' : 
                            app.status === 'SELECTED' ? 'text-green-700 bg-green-50' : 
                            app.status === 'REJECTED' ? 'text-red-700 bg-red-50' : 
                            'text-blue-700 bg-blue-50'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="REVIEWING">REVIEWING</option>
                          <option value="SHORTLISTED">SHORTLISTED</option>
                          <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
                          <option value="SELECTED">SELECTED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
