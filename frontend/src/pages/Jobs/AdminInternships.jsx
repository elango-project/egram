import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import jobService from '../../services/jobService';

const AdminInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [location, setLocation] = useState('');
  const [remoteType, setRemoteType] = useState('ONSITE');
  const [duration, setDuration] = useState('');
  const [stipend, setStipend] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [applyUrl, setApplyUrl] = useState('');
  const [active, setActive] = useState(true);

  // Applicants Modal
  const [viewingApplicantsFor, setViewingApplicantsFor] = useState(null);
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const data = await jobService.getJobs({ type: 'INTERNSHIP', activeOnly: false });
      setInternships(data);
    } catch (error) {
      console.error('Failed to fetch internships', error);
    }
  };

  const resetForm = () => {
    setEditingInternship(null);
    setTitle('');
    setCompanyName('');
    setCompanyLogoUrl('');
    setLocation('');
    setRemoteType('ONSITE');
    setDuration('');
    setStipend('');
    setSkillsRequired('');
    setDeadline('');
    setDescription('');
    setApplyUrl('');
    setActive(true);
  };

  const handleEditClick = (internship) => {
    setEditingInternship(internship);
    setTitle(internship.title);
    setCompanyName(internship.companyName);
    setCompanyLogoUrl(internship.companyLogoUrl || '');
    setLocation(internship.location || '');
    setRemoteType(internship.remoteType || 'ONSITE');
    setDuration(internship.duration || '');
    setStipend(internship.stipend || '');
    setSkillsRequired(internship.skillsRequired || '');
    setDeadline(internship.deadline || '');
    setDescription(internship.description || '');
    setApplyUrl(internship.applyUrl || '');
    setActive(internship.active !== false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title, companyName, companyLogoUrl, location, type: 'INTERNSHIP', remoteType, 
        duration, stipend, skillsRequired, deadline: deadline || null, 
        description, applyUrl, active
      };
      if (editingInternship) {
        await jobService.updateJob(editingInternship.id, payload);
        toast.success('Internship updated successfully');
      } else {
        await jobService.createJob(payload);
        toast.success('Internship created successfully');
      }
      resetForm();
      fetchInternships();
    } catch (error) {
      console.error('Failed to save internship', error);
      toast.error('Failed to save internship');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this Internship? This will delete all applications too.')) {
      try {
        await jobService.deleteJob(id);
        fetchInternships();
        toast.success('Deleted');
      } catch (error) {
        console.error('Failed to delete internship', error);
        toast.error('Failed to delete internship');
      }
    }
  };

  const handleViewApplicants = async (internship) => {
    setViewingApplicantsFor(internship);
    try {
      const data = await jobService.getJobApplications(internship.id);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Internships</h2>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-emerald-900 border-b pb-2">
          {editingInternship ? 'Edit Internship Posting' : 'Post New Internship'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Internship Title" required value={title} onChange={e => setTitle(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <input type="text" placeholder="Company Name" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <input type="url" placeholder="Company Logo URL" value={companyLogoUrl} onChange={e => setCompanyLogoUrl(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            
            <input type="text" placeholder="Location (e.g. Pune)" value={location} onChange={e => setLocation(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <select value={remoteType} onChange={e => setRemoteType(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              <option value="ONSITE">Onsite</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </select>
            <input type="text" placeholder="Duration (e.g. 6 Months)" value={duration} onChange={e => setDuration(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />

            <input type="text" placeholder="Stipend (e.g. 20K/month)" value={stipend} onChange={e => setStipend(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <input type="text" placeholder="Skills (e.g. HTML, CSS)" value={skillsRequired} onChange={e => setSkillsRequired(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Deadline Date</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            
            <input type="url" placeholder="Apply URL (Optional External Link)" value={applyUrl} onChange={e => setApplyUrl(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <div className="flex items-center gap-2 px-2">
              <input type="checkbox" id="active" checked={active} onChange={e => setActive(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
              <label htmlFor="active" className="text-gray-700 font-medium">Is Active?</label>
            </div>
          </div>
          <textarea placeholder="Internship Description (Required)" required value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" rows="4" />
          
          <div className="flex gap-4 pt-2">
            <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : editingInternship ? 'Update Internship' : 'Publish Internship'}
            </button>
            {editingInternship && (
              <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role & Company</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status & Stats</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {internships.map(intern => (
              <tr key={intern.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{intern.title}</div>
                  <div className="text-sm text-gray-500">{intern.companyName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-800">{intern.duration || 'Flexible'} • {intern.remoteType}</div>
                  <div className="text-sm text-gray-500">{intern.location || 'Remote'} • {intern.stipend || 'Unpaid'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className={`text-xs font-bold px-2 py-1 inline-block rounded-full mb-1 ${intern.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {intern.active ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-gray-500">Apps: <span className="font-bold text-emerald-600">{intern.applicationCount || 0}</span></div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium space-y-2 flex flex-col items-end">
                  <button onClick={() => handleViewApplicants(intern)} className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded transition-colors w-24 text-center">View Apps</button>
                  <div className="flex gap-3 mt-1">
                    <button onClick={() => handleEditClick(intern)} className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete(intern.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {internships.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No Internships posted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Applicants Modal */}
      {viewingApplicantsFor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/80">
              <h2 className="text-xl font-bold text-gray-800">Applicants for {viewingApplicantsFor.title}</h2>
              <button onClick={() => setViewingApplicantsFor(null)} className="text-gray-400 hover:text-gray-800 text-2xl font-bold transition-colors">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {applicants.length === 0 ? (
                <div className="text-center text-gray-500 py-12">No applications yet.</div>
              ) : (
                <div className="space-y-4">
                  {applicants.map(app => (
                    <div key={app.studentId} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="min-w-[200px]">
                        <div className="font-bold text-lg text-gray-900">{app.studentName}</div>
                        <div className="text-sm text-gray-600">{app.studentEmail}</div>
                        <div className="text-xs text-gray-400 mt-2">Applied: {new Date(app.appliedAt).toLocaleString()}</div>
                      </div>
                      
                      <div className="flex-1 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <strong className="text-gray-700">Cover Letter</strong>
                        <p className="text-gray-600 whitespace-pre-wrap mt-2">{app.coverLetter || 'No cover letter provided.'}</p>
                      </div>

                      <div className="flex flex-col gap-3 min-w-[160px] justify-center">
                        {app.resumeUrl ? (
                          <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-center bg-emerald-50 text-emerald-700 font-semibold px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100">
                            View Resume
                          </a>
                        ) : (
                          <div className="text-center bg-gray-100 text-gray-500 font-medium px-4 py-2 rounded-lg">No Resume</div>
                        )}
                        <select 
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.studentId, e.target.value)}
                          className={`border-2 rounded-lg px-3 py-2 font-bold focus:outline-none transition-colors cursor-pointer ${
                            app.status === 'PENDING' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : 
                            app.status === 'SHORTLISTED' ? 'text-purple-700 bg-purple-50 border-purple-200' : 
                            app.status === 'SELECTED' ? 'text-green-700 bg-green-50 border-green-200' : 
                            app.status === 'REJECTED' ? 'text-red-700 bg-red-50 border-red-200' : 
                            'text-blue-700 bg-blue-50 border-blue-200'
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

export default AdminInternships;
