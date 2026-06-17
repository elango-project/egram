import React, { useState, useEffect } from 'react';
import jobService from '../../services/jobService';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('FULL_TIME');
  const [experienceRequired, setExperienceRequired] = useState('');
  const [description, setDescription] = useState('');
  const [applyUrl, setApplyUrl] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await jobService.getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    }
  };

  const resetForm = () => {
    setEditingJob(null);
    setTitle('');
    setCompanyName('');
    setLocation('');
    setType('FULL_TIME');
    setExperienceRequired('');
    setDescription('');
    setApplyUrl('');
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setTitle(job.title);
    setCompanyName(job.companyName);
    setLocation(job.location);
    setType(job.type || 'FULL_TIME');
    setExperienceRequired(job.experienceRequired || '');
    setDescription(job.description || '');
    setApplyUrl(job.applyUrl || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title, companyName, location, type, experienceRequired, description, applyUrl, active: true
      };
      if (editingJob) {
        await jobService.updateJob(editingJob.id, payload);
      } else {
        await jobService.createJob(payload);
      }
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Failed to save job', error);
      alert('Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this Job?')) {
      try {
        await jobService.deleteJob(id);
        fetchJobs();
      } catch (error) {
        console.error('Failed to delete job', error);
        alert('Failed to delete job');
      }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Job Title" required value={title} onChange={e => setTitle(e.target.value)} className="border border-gray-300 rounded px-3 py-2" />
            <input type="text" placeholder="Company Name" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="border border-gray-300 rounded px-3 py-2" />
            <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="border border-gray-300 rounded px-3 py-2" />
            <input type="text" placeholder="Experience Required (e.g. 2-3 years)" value={experienceRequired} onChange={e => setExperienceRequired(e.target.value)} className="border border-gray-300 rounded px-3 py-2" />
            <select value={type} onChange={e => setType(e.target.value)} className="border border-gray-300 rounded px-3 py-2 bg-white">
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="CONTRACT">Contract</option>
            </select>
            <input type="url" placeholder="Apply URL" value={applyUrl} onChange={e => setApplyUrl(e.target.value)} className="border border-gray-300 rounded px-3 py-2" />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Posted</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map(job => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{job.title}</div>
                  <div className="text-sm text-gray-500">{job.companyName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{job.type}</div>
                  <div className="text-sm text-gray-500">{job.location || 'Remote'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(job.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEditClick(job)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
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
    </div>
  );
};

export default AdminJobs;
