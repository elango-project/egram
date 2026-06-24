import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, IndianRupee, Clock, Bookmark, Building, Star, ExternalLink, FileText, Link as LinkIcon, Send } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

const OpportunityDetail = ({
  item,
  type = 'JOB',
  application,
  isSaved,
  onSave,
  onApply
}) => {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    resumeUrl: user?.resumeUrl || '',
    portfolioUrl: '',
    coverLetter: ''
  });

  const isJob = type === 'JOB';
  const themeColor = isJob ? 'indigo' : 'cyan';
  const themeBg = isJob ? 'bg-indigo-50' : 'bg-cyan-50';
  const themeText = isJob ? 'text-indigo-600' : 'text-cyan-600';
  const themeButton = isJob ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-cyan-600 hover:bg-cyan-700';

  if (!item) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 h-full bg-slate-50/50">
        <Building size={64} className="mb-4 text-slate-300" strokeWidth={1} />
        <p className="text-xl font-medium text-slate-500">Select an opportunity to view details</p>
      </div>
    );
  }

  const salaryText = isJob ? item.salaryPackage : item.stipend;
  const employmentOrDuration = isJob ? item.employmentType?.replace('_', ' ') : item.duration;

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    await onApply(item.id, applyForm);
    setDrawerOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Banner */}
        <div className={`h-32 w-full bg-gradient-to-r ${isJob ? 'from-indigo-600 to-violet-600' : 'from-cyan-600 to-emerald-600'}`}></div>
        
        {/* Company Branding Section */}
        <div className="px-8 -mt-12 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0">
              {item.companyLogoUrl ? (
                <img src={item.companyLogoUrl} alt={item.companyName} className="w-full h-full object-contain p-2" />
              ) : (
                <Building size={40} className="text-slate-300" />
              )}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{item.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-600 font-medium">
                <span className="text-lg text-slate-800">{item.companyName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1"><MapPin size={16} className="text-slate-400" /> {item.location || 'Remote'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star size={14} className="fill-current" /> 4.8
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-8 py-4 border-y border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex flex-wrap gap-2">
            {salaryText && (
              <Badge variant="success" className="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm">
                <IndianRupee size={16} className="mr-1.5" /> {salaryText}
              </Badge>
            )}
            {employmentOrDuration && (
              <Badge variant="neutral" className="px-3 py-1.5 text-sm bg-white border-slate-200 shadow-sm capitalize">
                <Clock size={16} className="mr-1.5" /> {employmentOrDuration.toLowerCase()}
              </Badge>
            )}
            {item.remoteType && (
              <Badge variant="neutral" className="px-3 py-1.5 text-sm bg-white border-slate-200 shadow-sm">
                <Briefcase size={16} className="mr-1.5" /> {item.remoteType}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {application ? (
              <Button 
                variant="outline" 
                disabled 
                className="flex-1 md:flex-none border-emerald-500 text-emerald-700 bg-emerald-50 opacity-100"
                icon={<CheckCircle2 size={18} />}
              >
                Applied ({application.status})
              </Button>
            ) : item.applyUrl ? (
              <a href={item.applyUrl} target="_blank" rel="noreferrer" className="flex-1 md:flex-none">
                <Button variant={isJob ? 'primary' : 'gradient'} className={`w-full ${themeButton}`} icon={<ExternalLink size={18} />}>
                  Apply Externally
                </Button>
              </a>
            ) : (
              <Button 
                variant={isJob ? 'primary' : 'gradient'}
                className={`flex-1 md:flex-none ${themeButton} shadow-lg hover:-translate-y-0.5 transition-transform`}
                onClick={() => setDrawerOpen(true)}
              >
                Apply Now
              </Button>
            )}
            
            {!application && (
              <Button 
                variant={isSaved ? 'outline' : 'ghost'}
                className={isSaved ? `border-${themeColor}-600 ${themeText} bg-${themeColor}-50` : 'border-2 border-slate-200'}
                onClick={() => onSave(item.id)}
                icon={<Bookmark size={18} className={isSaved ? 'fill-current' : ''} />}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8">
          <div className="prose prose-slate max-w-none">
            <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">About the Role</h3>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">{item.description}</div>
          </div>

          {/* Requirements Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {item.skillsRequired && (
              <div className={`p-6 rounded-2xl border ${isJob ? 'bg-indigo-50/50 border-indigo-100' : 'bg-cyan-50/50 border-cyan-100'}`}>
                <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${themeText}`}>Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {item.skillsRequired.split(',').map((skill, idx) => (
                    <span key={idx} className={`bg-white px-3 py-1.5 rounded-lg text-sm font-semibold border shadow-sm ${isJob ? 'text-indigo-700 border-indigo-200' : 'text-cyan-700 border-cyan-200'}`}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {item.experienceRequired && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Experience</h4>
                <div className="text-slate-900 font-bold text-xl">{item.experienceRequired}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide Over Drawer for Application */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">Submit Application</h2>
                <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Profile Snapshot */}
                <div className={`p-4 rounded-xl border mb-8 flex items-center gap-4 ${isJob ? 'bg-indigo-50 border-indigo-100' : 'bg-cyan-50 border-cyan-100'}`}>
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl font-bold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{user?.fullName}</div>
                    <div className="text-sm text-slate-500">{user?.email}</div>
                  </div>
                </div>

                <form id="apply-form" onSubmit={handleApplySubmit} className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      <FileText size={16} /> Resume URL <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="url" 
                      required
                      value={applyForm.resumeUrl}
                      onChange={e => setApplyForm({...applyForm, resumeUrl: e.target.value})}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                    <p className="text-xs text-slate-500 mt-2 ml-1">Link to your Google Drive or portfolio PDF. Must be public.</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      <LinkIcon size={16} /> Portfolio / GitHub URL
                    </label>
                    <input 
                      type="url" 
                      value={applyForm.portfolioUrl}
                      onChange={e => setApplyForm({...applyForm, portfolioUrl: e.target.value})}
                      placeholder="https://github.com/..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Cover Letter <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <textarea 
                      value={applyForm.coverLetter}
                      onChange={e => setApplyForm({...applyForm, coverLetter: e.target.value})}
                      placeholder="Why are you a great fit for this role?"
                      rows="5"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm resize-none"
                    ></textarea>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white">
                <Button 
                  type="submit" 
                  form="apply-form"
                  variant={isJob ? 'primary' : 'gradient'} 
                  className={`w-full py-4 text-lg shadow-xl ${themeButton}`}
                  icon={<Send size={20} />}
                >
                  Send Application
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OpportunityDetail;
