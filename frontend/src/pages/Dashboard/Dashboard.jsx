import { useAuthStore } from '../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { courseApi, eventApi } from '../../api'
import { Link } from 'react-router-dom'
import {
  BookOpen, Briefcase, CalendarDays, Brain, Play,
  Award, Clock, ArrowRight
} from 'lucide-react'

const statCards = (stats) => [
  { icon: BookOpen, label: 'Courses Enrolled', value: stats?.coursesEnrolled ?? 12, color: 'var(--accent-purple)' },
  { icon: Play, label: 'Reels Watched', value: stats?.reelsWatched ?? 156, color: 'var(--accent-cyan)' },
  { icon: Briefcase, label: 'Applications', value: stats?.applications ?? 5, color: 'var(--accent-blue)' },
  { icon: Award, label: 'Certificates', value: stats?.certificates ?? 8, color: 'var(--accent-pink)' },
]

const quickLinks = [
  { to: '/dashboard/courses', icon: BookOpen, label: 'Browse Courses', desc: 'Continue your learning journey', color: '#7c3aed' },
  { to: '/dashboard/reals', icon: Play, label: 'Watch Reels', desc: 'Micro-learning in 60 seconds', color: '#06b6d4' },
  { to: '/dashboard/jobs', icon: Briefcase, label: 'Explore Jobs', desc: 'Find your dream job', color: '#3b82f6' },
  { to: '/dashboard/internships', icon: Briefcase, label: 'Find Internships', desc: 'Start your career', color: '#10b981' },
  { to: '/dashboard/placement', icon: Award, label: 'Placement Hub', desc: 'Track your career progress', color: '#ec4899' },
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const { data: coursesData } = useQuery({ queryKey: ['courses'], queryFn: () => courseApi.list({ page: 0, size: 4 }) })
  const { data: statsData } = useQuery({ queryKey: ['stats'], queryFn: () => import('../../api').then(m => m.userApi.stats()), retry: false })

  const courses = coursesData?.data?.data?.content || []
  const stats = statsData?.data?.data || null

  return (
    <div className="fade-in">
      {/* Hero greeting */}
      <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(124,58,237,0.2)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-2xl" />
        <h1 className="text-2xl font-bold mb-1">
          Welcome Back 👋
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Track your learning progress, course completions, placements, internships, and certificates from one place.
        </p>
        <div className="flex gap-3 mt-4">
          <Link to="/dashboard/courses" className="btn btn-primary btn-sm">Browse Courses</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards(stats).map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card" style={{ padding: '1.25rem' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex-center" style={{ background: color + '20' }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">{label}</div>
                <div className="text-xl font-bold">{value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {quickLinks.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to} className="card hover:no-underline group" style={{ padding: '1.25rem' }}>
              <div className="w-10 h-10 rounded-xl flex-center mb-3"
                   style={{ background: color + '20' }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-purple-400 transition-colors">{label}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{desc}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div>
          <div className="flex-between mb-3">
            <h2 className="text-lg font-bold">Trending Courses</h2>
            <Link to="/dashboard/courses" className="text-xs text-[var(--accent-purple-light)] flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {courses.length === 0 ? (
            <div className="card text-center py-8 text-[var(--text-muted)] text-sm">No courses yet</div>
          ) : (
            <div className="space-y-3">
              {courses.map(course => (
                <Link key={course.id} to={`/courses/${course.id}`}
                      className="card flex gap-3 items-center hover:no-underline" style={{ padding: '0.875rem' }}>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex-center flex-shrink-0">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[var(--text-primary)] truncate">{course.title}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                      <Clock size={11} /> {course.category}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Removed Upcoming Events section */}
      </div>
    </div>
  )
}

// Removed getTimeOfDay

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
