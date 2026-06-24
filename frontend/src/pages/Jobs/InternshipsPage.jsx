import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminInternships from './AdminInternships';
import StudentInternships from './StudentInternships';

const InternshipsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return isAdmin ? <AdminInternships /> : <StudentInternships />;
};

export default InternshipsPage;
