import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Clock, Users, Plus, Edit2, Trash2, X, FileText, Globe, Building2, CheckCircle2, ChevronRight, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import jobService from '../../services/jobService';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

const AdminInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  // Applicants Drawer
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
      toast.error('Failed to fetch internships');
    }
  };

  const resetForm = () => {
    setEditingInternship(null);
    setTitle(''); setCompanyName(''); setCompanyLogoUrl(''); setLocation('');
    setRemoteType('ONSITE'); setDuration(''); setStipend('');
    setSkillsRequired(''); setDeadline('');
    setDescription(''); setApplyUrl(''); setActive(true);
    setIsFormOpen(false);
  };

  const handleEditClick = (internship) => {
    setEditingInternship(internship);
    setTitle(internship.title); setCompanyName(internship.companyName); setCompanyLogoUrl(internship.companyLogoUrl || '');
    setLocation(internship.location || ''); setRemoteType(internship.remoteType || 'ONSITE'); 
    setDuration(internship.duration || ''); setStipend(internship.stipend || ''); setSkillsRequired(internship.skillsRequired || '');
    setDeadline(internship.deadline || '');
    setDescription(internship.description || ''); setApplyUrl(internship.applyUrl || ''); setActive(internship.active !== false);
    setIsFormOpen(true);
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
      toast.error('Failed to fetch applicants');
    }
  };

  const handleStatusChange = async (studentId, status) => {
    try {
      await jobService.updateApplicationStatus(viewingApplicantsFor.id, studentId, status);
      setApplicants(prev => prev.map(a => a.studentId === studentId ? { ...a, status } : a));
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Derived Metrics
  const activeInternships = internships.filter(i => i.active).length;
  const totalApps = internships.reduce((sum, i) => sum + (i.applicationCount || 0), 0);
  const newApps = Math.floor(totalApps * 0.3); // mock metric for demo

  return (
    <div className="font-sans space-y-8 pb-12 bg-slate-50 min-h-[calc(100vh-4rem)] -mt-6 pt-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Internship Opportunities</h1>
          <p className="text-slate-500 font-medium mt-1">Manage internship postings and review candidate applications.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
          <Plus size={18} className="mr-2" /> Post New Internship
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard title="Active Internships" value={activeInternships} icon={<Briefcase />} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
        <MetricCard title="Total Applications" value={totalApps} icon={<Users />} color="text-indigo-600" bg="bg-indigo-50" border="border-indigo-100" />
        <MetricCard title="New Applications" value={`+${newApps}`} icon={<ActivityIcon />} color="text-amber-600" bg="bg-amber-50" border="border-amber-100" />
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/40">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">{editingInternship ? 'Edit Internship Posting' : 'Create New Internship'}</h2>
                <button onClick={resetForm} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={24} /></button>
              </div>
              
              <div className="overflow-y-auto p-6 flex-1">
                <form id="internshipForm" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Internship Title" required value={title} onChange={e => setTitle(e.target.value)} />
                    <InputField label="Company Name" required value={companyName} onChange={e => setCompanyName(e.target.value)} />
                    <InputField label="Company Logo URL" type="url" value={companyLogoUrl} onChange={e => setCompanyLogoUrl(e.target.value)} />
                    <InputField label="Location" value={location} onChange={e => setLocation(e.target.value)} />
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Remote Type</label>
                      <select value={remoteType} onChange={e => setRemoteType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                        <option value="ONSITE">Onsite</option><option value="HYBRID">Hybrid</option><option value="REMOTE">Remote</option>
                      </select>
                    </div>
                    <InputField label="Duration" placeholder="e.g. 6 Months" value={duration} onChange={e => setDuration(e.target.value)} />

                    <InputField label="Stipend" placeholder="e.g. 20K/month" value={stipend} onChange={e => setStipend(e.target.value)} />
                    <InputField label="Required Skills" placeholder="e.g. React, Node.js" value={skillsRequired} onChange={e => setSkillsRequired(e.target.value)} />
                    
                    <div className="flex flex-col">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Application Deadline</label>
                      <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    
                    <InputField label="External Apply URL" type="url" placeholder="Optional" value={applyUrl} onChange={e => setApplyUrl(e.target.value)} />
                    
                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 md:col-span-2">
                      <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"></label>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">Internship is Active</span>
                        <span className="text-xs text-slate-500">Inactive internships are hidden from students.</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Internship Description</label>
                    <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[150px]" />
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button form="internshipForm" type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {loading ? 'Saving...' : editingInternship ? 'Update Internship' : 'Publish Internship'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ATS Internship Cards Grid */}
      {internships.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {internships.map(intern => (
            <div key={intern.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                      {intern.companyLogoUrl ? <img src={intern.companyLogoUrl} alt="logo" className="w-full h-full object-cover" /> : <Building2 size={24} className="text-slate-400" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{intern.title}</h3>
                      <p className="text-slate-500 text-sm">{intern.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(intern)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(intern.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${intern.active ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {intern.active ? 'Active' : 'Closed'}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    {intern.remoteType}
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><MapPin size={16} className="text-slate-400" /> {intern.location || 'Not specified'}</div>
                  <div className="flex items-center gap-2"><Coins size={16} className="text-slate-400" /> {intern.stipend || 'Unpaid'}</div>
                  <div className="flex items-center gap-2"><Clock size={16} className="text-slate-400" /> {intern.duration || 'Flexible duration'}</div>
                </div>
              </div>
              
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Users size={16} className="text-emerald-500" /> 
                  {intern.applicationCount || 0} Applicants
                </div>
                <button 
                  onClick={() => handleViewApplicants(intern)}
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 group/btn"
                >
                  Review <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Briefcase size={48} />} title="No Internships Posted" description="You haven't posted any internships yet. Create a new posting to start attracting students." />
      )}

      {/* Applicant Drawer (Slide-Over) */}
      <AnimatePresence>
        {viewingApplicantsFor && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewingApplicantsFor(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-50 shadow-2xl z-50 flex flex-col border-l border-slate-200"
            >
              <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Applicants</h2>
                  <p className="text-sm text-slate-500 font-medium">{viewingApplicantsFor.title} • {viewingApplicantsFor.companyName}</p>
                </div>
                <button onClick={() => setViewingApplicantsFor(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {applicants.length === 0 ? (
                  <EmptyState icon={<Users size={48} />} title="No Applicants Yet" description="This internship hasn't received any applications yet." />
                ) : (
                  applicants.map(app => (
                    <div key={app.studentId} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 relative overflow-hidden group">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        app.status === 'SELECTED' ? 'bg-emerald-500' : 
                        app.status === 'REJECTED' ? 'bg-rose-500' : 
                        app.status === 'SHORTLISTED' ? 'bg-purple-500' : 
                        'bg-amber-400'
                      }`} />
                      
                      <div className="flex justify-between items-start pl-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                            {app.studentName}
                            {app.status === 'SELECTED' && <CheckCircle2 size={16} className="text-emerald-500" />}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium">{app.studentEmail}</p>
                          <p className="text-xs text-slate-400 mt-1">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                        </div>
                        <select 
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.studentId, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none transition-colors cursor-pointer appearance-none ${
                            app.status === 'PENDING' ? 'text-amber-700 bg-amber-50 border-amber-200' : 
                            app.status === 'SHORTLISTED' ? 'text-purple-700 bg-purple-50 border-purple-200' : 
                            app.status === 'SELECTED' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 
                            app.status === 'REJECTED' ? 'text-rose-700 bg-rose-50 border-rose-200' : 
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

                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 ml-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Cover Letter</span>
                        <p className="text-sm text-slate-700 italic line-clamp-3 group-hover:line-clamp-none transition-all">{app.coverLetter || 'No cover letter provided.'}</p>
                      </div>

                      <div className="flex gap-3 ml-2">
                        {app.resumeUrl && (
                          <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-semibold text-slate-600 transition-colors">
                            <FileText size={16} /> Resume
                          </a>
                        )}
                        {app.portfolioUrl && (
                          <a href={app.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-semibold text-slate-600 transition-colors">
                            <Globe size={16} /> Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

const MetricCard = ({ title, value, icon, color, bg, border }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color} ${border} border`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div>
      <div className="text-3xl font-extrabold text-slate-900">{value}</div>
      <div className="text-sm font-bold text-slate-500 mt-1">{title}</div>
    </div>
  </div>
);

const InputField = ({ label, className = "", ...props }) => (
  <div className={className}>
    <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
    <input className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all shadow-sm" {...props} />
  </div>
);

const ActivityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

export default AdminInternships;
