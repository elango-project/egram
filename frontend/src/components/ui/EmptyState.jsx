import React from 'react';
import { FileQuestion } from 'lucide-react';
import Card from './Card';

const EmptyState = ({ 
  title = 'No Data Found', 
  message = 'Get started by creating a new entry.', 
  icon = <FileQuestion size={48} className="text-slate-300" />,
  action 
}) => {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-slate-50/50">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 mt-2 mb-6 max-w-sm">{message}</p>
      {action && <div>{action}</div>}
    </Card>
  );
};

export default EmptyState;
