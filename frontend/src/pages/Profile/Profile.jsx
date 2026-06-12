import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { userApi, aiApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { Mail, Edit, Save, Loader2, Download, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user: authUser, setAuth } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', bio: '' })
  const [resumeLoading, setResumeLoading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.me(),
    onSuccess: (res) => {
      const u = res.data.data
      setForm({ firstName: u.firstName, lastName: u.lastName, bio: u.bio || '' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (d) => userApi.update(d),
    onSuccess: (res) => {
      toast.success('Profile updated!')
      setEditing(false)
      setAuth({ user: res.data.data, accessToken: localStorage.getItem('egram_token'), refreshToken: null })
    },
    onError: () => toast.error('Update failed'),
  })

  const user = data?.data?.data || authUser

  const handleResumeDownload = async () => {
    setResumeLoading(true)
    try {
      const res = await aiApi.resume({
        full_name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        skills: [],
        courses_completed: [],
        internships: [],
        projects: [],
        certifications: [],
        education: '',
      })
      const { pdf_base64 } = res.data.data
      const link = document.createElement('a')
      link.href = `data:application/pdf;base64,${pdf_base64}`
      link.download = `${user.firstName}_Resume.pdf`
      link.click()
      toast.success('Resume downloaded!')
    } catch (err) {
      console.error("Resume generation error:", err)
      toast.error('Failed to generate Resume')
    } finally {
      setResumeLoading(false)
    }
  }

  if (isLoading) return <div className="flex-center py-20"><Loader2 size={28} className="animate-spin text-purple-400" /></div>

  return (
    <div className="fade-in max-w-2xl mx-auto">
      <h1 className="section-title mb-6">My Profile</h1>

      {/* Profile card */}
      <div className="card mb-6" style={{ padding: '2rem' }}>
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex-center text-white text-2xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
            <p className="text-[var(--text-muted)] text-sm flex items-center gap-1 mt-1">
              <Mail size={13} /> {user?.email}
            </p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {user?.roles?.map(role => (
                <span key={role} className="badge badge-purple">{role}</span>
              ))}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(v => !v)}>
            <Edit size={14} /> {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={e => { e.preventDefault(); updateMutation.mutate(form) }}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label">First Name</label>
                <input className="input" value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Bio</label>
              <textarea className="input" rows={3} placeholder="Tell us about yourself..."
                value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </form>
        ) : (
          <div>
            {user?.bio && <p className="text-sm text-[var(--text-secondary)]">{user.bio}</p>}
            {!user?.bio && <p className="text-sm text-[var(--text-muted)] italic">No bio yet. Click Edit to add one.</p>}
          </div>
        )}
      </div>

      {/* AI Resume Builder */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-yellow-400" />
          <h2 className="font-bold">AI Resume Builder</h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Generate an ATS-friendly PDF resume automatically using your profile, skills, courses, internships, and projects.
        </p>
        <button className="btn btn-primary" onClick={handleResumeDownload} disabled={resumeLoading}>
          {resumeLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Download AI Resume (PDF)
        </button>
      </div>
    </div>
  )
}
