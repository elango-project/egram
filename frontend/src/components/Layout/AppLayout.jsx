import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, BookOpen, Play, Brain, Briefcase,
  CalendarDays, Cpu, FolderGit2, User, LogOut,
  Menu, GraduationCap, ChevronLeft, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses',      icon: BookOpen,        label: 'Courses' },
  { to: '/reels',        icon: Play,            label: 'Reels' },
  { to: '/mentor',       icon: Brain,           label: 'AI Mentor' },
  { to: '/internships',  icon: Briefcase,       label: 'Internships' },
  { to: '/events',       icon: CalendarDays,    label: 'Events' },
  { to: '/ai-hub',       icon: Cpu,             label: 'AI Hub' },
  { to: '/projects',     icon: FolderGit2,      label: 'Projects' },
  { to: '/profile',      icon: User,            label: 'Profile' },
]

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-90 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex-center flex-shrink-0">
            <GraduationCap size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-sm gradient-text">Egram</div>
              <div className="text-xs text-[var(--text-muted)]">AI Learning Platform</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded hover:bg-[var(--bg-card)] text-[var(--text-muted)] hidden md:flex"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info & logout */}
        <div className="p-3 border-t border-[var(--border)]">
          {!collapsed && (
            <div className="flex items-center gap-2 p-2 mb-2 rounded-lg bg-[var(--bg-card)]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex-center text-white text-xs font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-[10px] text-[var(--text-muted)] truncate">{user?.email}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="nav-link text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full">
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <button
            className="md:hidden p-2 rounded text-[var(--text-secondary)]"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-sm text-[var(--text-secondary)]">
              Welcome back, <span className="text-[var(--text-primary)] font-semibold">{user?.firstName}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex-center text-white text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
