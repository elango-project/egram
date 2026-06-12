import { useQuery } from '@tanstack/react-query'
import { aiApi } from '../../api'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { Cpu, TrendingUp, Target, BarChart3, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

// const TABS = ['Skill Passport', 'Analytics', 'AI Resume']

export default function AIHub() {
  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="section-title flex items-center gap-2">
          <Cpu size={24} className="text-purple-400" /> AI Hub
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">Your personalized learning intelligence dashboard</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <SkillPassport />
        <AnalyticsSummary />
        <ResumeCard />
      </div>
    </div>
  )
}

function SkillPassport() {
  const { data, isLoading } = useQuery({
    queryKey: ['skill-passport'],
    queryFn: () => aiApi.skillPassport(),
  })
  const skills = data?.data?.data?.skillScores
  const radarData = skills
    ? Object.entries(skills).map(([name, value]) => ({ name, value: Number(value) || 0 }))
    : defaultRadar()

  return (
    <div className="card col-span-1" style={{ padding: '1.5rem' }}>
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-purple-400" />
        <h2 className="font-bold">Skill Passport</h2>
      </div>
      {isLoading ? (
        <div className="flex-center py-10"><Loader2 size={24} className="animate-spin text-purple-400" /></div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar name="Skills" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} />
              <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #1e293b', borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {radarData.slice(0, 4).map(({ name, value }) => (
              <div key={name}>
                <div className="flex-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)]">{name}</span>
                  <span className="font-semibold">{value}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function AnalyticsSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => aiApi.analytics(),
  })
  const analytics = data?.data?.data || {}

  const stats = [
    { label: 'Learning Hours', value: analytics.totalHours ?? '—', icon: '⏱️', color: 'var(--accent-cyan)' },
    { label: 'Skills Gained', value: analytics.skillsGained ?? '—', icon: '📈', color: 'var(--accent-purple)' },
    { label: 'Internship Progress', value: analytics.internshipProgress ? `${analytics.internshipProgress}%` : '—', icon: '💼', color: 'var(--accent-blue)' },
    { label: 'Mentor Sessions', value: analytics.mentorSessions ?? '—', icon: '🎓', color: 'var(--accent-pink)' },
  ]

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-cyan-400" />
        <h2 className="font-bold">Learning Analytics</h2>
      </div>
      {isLoading ? (
        <div className="flex-center py-10"><Loader2 size={24} className="animate-spin text-cyan-400" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, icon, color }) => (
            <div key={label} className="rounded-xl p-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-lg font-bold" style={{ color }}>{value}</div>
              <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
        <p className="text-xs text-[var(--text-secondary)]">
          🤖 <strong className="text-purple-400">AI Insight:</strong> Keep up the momentum! Consistent learners are 3× more likely to land their first internship.
        </p>
      </div>
    </div>
  )
}

function ResumeCard() {
  return (
    <div className="card flex flex-col" style={{ padding: '1.5rem' }}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-green-400" />
        <h2 className="font-bold">AI Resume Builder</h2>
      </div>
      <div className="flex-1 space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">
          Generate an ATS-friendly resume automatically from your courses, skills, internships, and projects.
        </p>
        <ul className="space-y-2">
          {['ATS-optimised format', 'AI-generated summary', 'Auto-filled from profile', 'PDF download'].map(f => (
            <li key={f} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="text-green-400">✓</span> {f}
            </li>
          ))}
        </ul>
      </div>
      <Link to="/profile" className="btn btn-primary btn-sm mt-4 w-full justify-center">
        Build My Resume
      </Link>
    </div>
  )
}

function defaultRadar() {
  return [
    { name: 'Programming', value: 65 },
    { name: 'Communication', value: 70 },
    { name: 'Problem Solving', value: 75 },
    { name: 'Design', value: 50 },
    { name: 'Data Analysis', value: 60 },
    { name: 'Leadership', value: 55 },
  ]
}
