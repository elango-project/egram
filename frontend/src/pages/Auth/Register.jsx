import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api'
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['STUDENT', 'MENTOR', 'FACULTY', 'PARENT']

export default function Register() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'STUDENT',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.register(form)
      const { accessToken, refreshToken, user } = res.data.data
      setAuth({ user, accessToken, refreshToken })
      toast.success(`Welcome to Egram, ${user.firstName}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md px-4 relative z-10 slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex-center">
              <GraduationCap size={26} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold gradient-text">Egram</div>
              <div className="text-xs text-[var(--text-muted)]">AI Learning Platform</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Join India's AI-powered learning ecosystem</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="label">First Name</label>
                <input className="input" type="text" placeholder="Arjun" required
                  value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" type="text" placeholder="Sharma" required
                  value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Email address</label>
              <input className="input" type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div className="relative">
                <input className="input" type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters" required minLength={8}
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ paddingRight: '2.75rem' }} />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="label">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(role => (
                  <button key={role} type="button"
                    onClick={() => setForm(f => ({ ...f, role }))}
                    className={`btn btn-sm ${form.role === role ? 'btn-primary' : 'btn-ghost'}`}>
                    {role.charAt(0) + role.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <button id="register-submit" type="submit"
              className="btn btn-primary w-full btn-lg mt-2" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <hr className="divider" />
          <p className="text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--accent-purple-light)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
