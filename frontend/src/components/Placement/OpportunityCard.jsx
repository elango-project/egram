import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, IndianRupee, Clock, Bookmark, Building, CheckCircle2, Users } from 'lucide-react';
import Badge from '../ui/Badge';

const OpportunityCard = ({ 
  item, 
  type = 'JOB', 
  isSelected, 
  isSaved, 
  application, 
  onClick, 
  onSave 
}) => {
  const isJob = type === 'JOB';
  const themeColor = isJob ? 'indigo' : 'cyan';
  const themeBg = isJob ? 'bg-indigo-50' : 'bg-cyan-50';
  const themeBorderHover = isJob ? 'hover:border-indigo-300' : 'hover:border-cyan-300';
  const themeBorderSelected = isJob ? 'border-indigo-500 shadow-indigo-100' : 'border-cyan-500 shadow-cyan-100';

  // Extract fields based on type
  const salaryText = isJob ? item.salaryPackage : item.stipend;
  const employmentOrDuration = isJob ? item.employmentType?.replace('_', ' ') : item.duration;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={() => onClick(item.id)}
      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-white ${
        isSelected ? `${themeBorderSelected} ${themeBg} shadow-md` : `border-slate-100 ${themeBorderHover} hover:shadow-sm`
      }`}
    >
      {/* Top Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
            {item.companyLogoUrl ? (
              <img src={item.companyLogoUrl} alt={item.companyName} className="w-full h-full object-contain p-1" />
            ) : (
              <Building size={24} className="text-slate-400" />
            )}
          </div>
          
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{item.title}</h3>
            <p className="text-slate-600 text-sm font-medium">{item.companyName}</p>
          </div>
        </div>

        {/* Action / Badges Right */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onSave(item.id); }}
            className={`p-2 rounded-full transition-colors ${
              isSaved 
                ? isJob ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bookmark size={20} className={isSaved ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      {/* Tags / Info */}
      <div className="flex flex-wrap gap-2 mb-4">
        {item.location && (
          <Badge variant="neutral" className="bg-slate-50 border-slate-200 text-slate-600 flex items-center gap-1 px-2.5">
            <MapPin size={12} /> {item.location}
          </Badge>
        )}
        {item.remoteType && (
          <Badge variant="neutral" className="bg-slate-50 border-slate-200 text-slate-600 flex items-center gap-1 px-2.5">
            <Briefcase size={12} /> {item.remoteType}
          </Badge>
        )}
        {employmentOrDuration && (
          <Badge variant="neutral" className="bg-slate-50 border-slate-200 text-slate-600 flex items-center gap-1 px-2.5 capitalize">
            <Clock size={12} /> {employmentOrDuration.toLowerCase()}
          </Badge>
        )}
        {salaryText && (
          <Badge variant="success" className="flex items-center gap-1 px-2.5 bg-emerald-50 text-emerald-700 border-emerald-200">
            <IndianRupee size={12} /> {salaryText}
          </Badge>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={12} /> 92% Match
          </span>
          <span className="flex items-center gap-1 hidden sm:flex">
            <Users size={12} /> 25 Applicants
          </span>
          <span className="hidden lg:inline-block">Posted 2 days ago</span>
        </div>

        {/* Application Status Badge */}
        {application && (
          <Badge 
            variant={
              application.status === 'SELECTED' ? 'success' :
              application.status === 'REJECTED' ? 'error' :
              application.status === 'SHORTLISTED' ? 'info' : 'warning'
            }
            className="px-3"
          >
            {application.status}
          </Badge>
        )}
      </div>
    </motion.div>
  );
};

export default OpportunityCard;
