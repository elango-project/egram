import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminAssessments from './AdminAssessments';
import StudentAssessments from './StudentAssessments';

const AssessmentsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return isAdmin ? <AdminAssessments /> : <StudentAssessments />;
};

export default AssessmentsPage;
