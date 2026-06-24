import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import PageLoader from '../components/ui/PageLoader';

// Lazy loading all pages for code splitting
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const NotFound = lazy(() => import('../pages/NotFound'));
const RealsPage = lazy(() => import('../pages/Reals/RealsPage'));
const VideosPage = lazy(() => import('../pages/Videos/VideosPage'));
const VideoPlayerView = lazy(() => import('../pages/Videos/VideoPlayerView'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const CoursesPage = lazy(() => import('../pages/Courses/CoursesPage'));
const CourseDetail = lazy(() => import('../pages/Courses/CourseDetail'));
const AssessmentPage = lazy(() => import('../pages/Courses/AssessmentPage'));
const TopicView = lazy(() => import('../pages/Courses/TopicView'));
const CertificatePage = lazy(() => import('../pages/Courses/CertificatePage'));
const PlacementDashboard = lazy(() => import('../pages/PlacementDashboard'));
const JobsPage = lazy(() => import('../pages/Jobs/JobsPage'));
const InternshipsPage = lazy(() => import('../pages/Jobs/InternshipsPage'));

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
            <Route path="/dashboard/jobs" element={<JobsPage />} />
            <Route path="/dashboard/internships" element={<InternshipsPage />} />

            {/* Student Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/courses/topic/:topicId" element={<TopicView />} />
              <Route path="/courses/:courseId/assessment" element={<AssessmentPage />} />
              <Route path="/courses/:courseId/certificate" element={<CertificatePage />} />
              <Route path="/dashboard/placement" element={<PlacementDashboard />} />
            </Route>
          </Route>
        </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
