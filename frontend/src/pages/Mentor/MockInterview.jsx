import { useState } from 'react'
import { aiApi } from '../../api'
import { Sparkles, Loader2, ArrowLeft, Trophy, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const ROLES = ['Software Engineer', 'Data Analyst', 'Product Manager', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'Data Scientist', 'Cybersecurity Analyst']
const LEVELS = ['Intern', 'Junior', 'Mid-Level', 'Senior']

export default function MockInterview() {
  const [config, setConfig] = useState({ role: 'Software Engineer', level: 'Junior', questionCount: 5 })
  const [questions, setQuestions] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await aiApi.mockInterview({
        role: config.role, level: config.level, question_count: config.questionCount,
      })
      const raw = res.data.data.reply
      // Parse numbered questions from the Gemini response
      const parsed = raw.split('\n').filter(l => /^\d+\./.test(l.trim()))
      setQuestions(parsed.length > 0 ? parsed : [raw])
    } catch {
      setQuestions([
        `1. (Demo) Can you explain your experience as a ${config.level} ${config.role}?`,
        `2. (Demo) What is the most challenging project you've worked on recently?`,
        `3. (Demo) How do you handle disagreements with team members regarding technical decisions?`
      ])
      toast.success('Generated demo questions!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/mentor" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /></Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" /> AI Mock Interview
          </h1>
          <p className="text-xs text-[var(--text-muted)]">Practice with AI-generated interview questions</p>
        </div>
      </div>

      {/* Config */}
      <div className="card mb-6" style={{ padding: '1.5rem' }}>
        <h2 className="font-bold mb-4">Configure Your Interview</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">Target Role</label>
            <select className="input" value={config.role}
              onChange={e => setConfig(c => ({ ...c, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Experience Level</label>
            <select className="input" value={config.level}
              onChange={e => setConfig(c => ({ ...c, level: e.target.value }))}>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Number of Questions</label>
            <select className="input" value={config.questionCount}
              onChange={e => setConfig(c => ({ ...c, questionCount: Number(e.target.value) }))}>
              {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n} questions</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary mt-4" onClick={generate} disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Generate Interview Questions
        </button>
      </div>

      {/* Questions */}
      {loading && (
        <div className="card flex-center py-16">
          <Loader2 size={32} className="animate-spin text-purple-400 mb-3" />
          <p className="text-[var(--text-muted)] text-sm">Sarathi AI is generating questions for you...</p>
        </div>
      )}

      {questions && !loading && (
        <div className="space-y-3">
          <div className="flex-between mb-2">
            <h2 className="font-bold">{config.role} · {config.level}</h2>
            <button className="btn btn-ghost btn-sm" onClick={generate}>
              <Sparkles size={14} /> Regenerate
            </button>
          </div>
          {questions.map((q, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem' }}>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-600/20 flex-center text-purple-400 font-bold text-xs flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm">{q.replace(/^\d+\.\s*/, '')}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="card text-center py-6">
            <p className="text-sm text-[var(--text-muted)] mb-3">Practice your answers and come back for feedback</p>
            <Link to="/mentor" className="btn btn-primary btn-sm">
              <ChevronRight size={14} /> Discuss with Sarathi
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
