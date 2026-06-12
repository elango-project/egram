import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Courses from './pages/Courses/Courses'
import CourseDetail from './pages/Courses/CourseDetail'
import Reels from './pages/Reels/Reels'
import MentorChat from './pages/Mentor/MentorChat'
import MockInterview from './pages/Mentor/MockInterview'
import Internships from './pages/Internship/Internships'
import Events from './pages/Events/Events'
import AIHub from './pages/AIHub/AIHub'
import Projects from './pages/Projects/Projects'
import Profile from './pages/Profile/Profile'

export default function App() {
  return (
    <Routes>
      {/* PRESENTATION MODE: Login/Register always redirect to dashboard */}
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<Navigate to="/dashboard" replace />} />

      {/* All routes open – no PrivateRoute wrapper */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="reels" element={<Reels />} />
        <Route path="mentor" element={<MentorChat />} />
        <Route path="mentor/mock-interview" element={<MockInterview />} />
        <Route path="internships" element={<Internships />} />
        <Route path="events" element={<Events />} />
        <Route path="ai-hub" element={<AIHub />} />
        <Route path="projects" element={<Projects />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
