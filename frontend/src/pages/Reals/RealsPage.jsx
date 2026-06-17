import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminReals from './AdminReals';
import StudentReals from './StudentReals';

const RealsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return isAdmin ? <AdminReals /> : <StudentReals />;
};

export default RealsPage;
