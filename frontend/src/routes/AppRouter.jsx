import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import RealsPage from '../pages/Reals/RealsPage';

import VideosPage from '../pages/Videos/VideosPage';
import VideoPlayerView from '../pages/Videos/VideoPlayerView';

import CoursesPage from '../pages/Courses/CoursesPage';
import CourseDetail from '../pages/Courses/CourseDetail';
import TopicView from '../pages/Courses/TopicView';
import AssessmentPage from '../pages/Courses/AssessmentPage';
import CertificatePage from '../pages/Courses/CertificatePage';
import AssessmentsPage from '../pages/Assessments/AssessmentsPage';
import JobsPage from '../pages/Jobs/JobsPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/reals" element={<RealsPage />} />
            <Route path="/dashboard/videos" element={<VideosPage />} />
            <Route path="/dashboard/videos/:id" element={<VideoPlayerView />} />
            <Route path="/dashboard/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/courses/topic/:topicId" element={<TopicView />} />
            <Route path="/courses/:courseId/assessment" element={<AssessmentPage />} />
            <Route path="/courses/:courseId/certificate" element={<CertificatePage />} />
            <Route path="/dashboard/assessments" element={<AssessmentsPage />} />
            <Route path="/dashboard/jobs" element={<JobsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
