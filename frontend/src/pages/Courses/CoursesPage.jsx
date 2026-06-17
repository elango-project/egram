import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminCourses from './AdminCourses';
import StudentCourses from './StudentCourses';

const CoursesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return isAdmin ? <AdminCourses /> : <StudentCourses />;
};

export default CoursesPage;
