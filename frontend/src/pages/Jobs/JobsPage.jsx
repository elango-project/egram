import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminJobs from './AdminJobs';
import StudentJobs from './StudentJobs';

const JobsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return isAdmin ? <AdminJobs /> : <StudentJobs />;
};

export default JobsPage;
