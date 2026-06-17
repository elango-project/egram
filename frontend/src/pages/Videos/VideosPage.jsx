import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminVideos from './AdminVideos';
import StudentVideos from './StudentVideos';

const VideosPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return isAdmin ? <AdminVideos /> : <StudentVideos />;
};

export default VideosPage;
