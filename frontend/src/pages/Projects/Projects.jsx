import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '../../api'
import { FolderGit2, Plus, GitBranch, Globe, Trash2, Edit, X, Loader2, } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = { title: '', description: '', githubUrl: '', liveDemoUrl: '', techStack: '', achievements: '' }

export default function Projects() {
  const [showForm, setShowForm] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['projects'], queryFn: () => projectApi.list({}) })
  const projects = data?.data?.data?.content || []

  const createMutation = useMutation({
    mutationFn: (d) => projectApi.create({ ...d, techStack: d.techStack.split(',').map(s => s.trim()) }),
    onSuccess: () => { toast.success('Project added!'); queryClient.invalidateQueries(['projects']); setShowForm(false); setForm(EMPTY_FORM) },
    onError: () => toast.error('Failed to add project'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectApi.update(id, { ...data, techStack: data.techStack.split(',').map(s => s.trim()) }),
    onSuccess: () => { toast.success('Project updated!'); queryClient.invalidateQueries(['projects']); setEditProject(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => projectApi.remove(id),
    onSuccess: () => { toast.success('Project deleted'); queryClient.invalidateQueries(['projects']) },
  })

  const openEdit = (proj) => {
    setEditProject(proj.id)
    setForm({ ...proj, techStack: Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack || '' })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editProject) updateMutation.mutate({ id: editProject, data: form })
    else createMutation.mutate(form)
  }

  return (
    <div className="fade-in">
      <div className="flex-between mb-6">
        <div>
          <h1 className="section-title">Project Showcase</h1>
          <p className="text-[var(--text-secondary)] text-sm">Showcase your work to recruiters and mentors</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditProject(null); setForm(EMPTY_FORM) }}>
          <Plus size={16} /> Add Project
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex-center" onClick={() => setShowForm(false)}>
          <div className="card w-full max-w-lg mx-4" style={{ padding: '1.75rem' }} onClick={e => e.stopPropagation()}>
            <div className="flex-between mb-4">
              <h2 className="font-bold">{editProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Project Title *</label>
                <input className="input" placeholder="My Awesome Project" required
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Description *</label>
                <textarea className="input" rows={3} placeholder="Describe what you built..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="label">GitHub URL</label>
                  <input className="input" placeholder="https://github.com/..." type="url"
                    value={form.githubUrl} onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">Live Demo URL</label>
                  <input className="input" placeholder="https://..." type="url"
                    value={form.liveDemoUrl} onChange={e => setForm(f => ({ ...f, liveDemoUrl: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Tech Stack (comma-separated)</label>
                <input className="input" placeholder="React, Spring Boot, PostgreSQL"
                  value={form.techStack} onChange={e => setForm(f => ({ ...f, techStack: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Achievements (optional)</label>
                <input className="input" placeholder="Won 1st place, 500+ users, etc."
                  value={form.achievements} onChange={e => setForm(f => ({ ...f, achievements: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary w-full"
                disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 size={16} className="animate-spin" /> : editProject ? 'Update Project' : 'Add Project'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-5 w-2/3 mb-3" />
              <div className="skeleton h-3 w-full mb-2" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <FolderGit2 size={48} className="mx-auto mb-3 opacity-30" />
          <p className="mb-3">No projects yet</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Add your first project</button>
        </div>
      ) : (
        <div className="grid-auto">
          {projects.map(proj => (
            <div key={proj.id} className="card flex flex-col" style={{ padding: '1.25rem' }}>
              <div className="flex-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex-center">
                  <FolderGit2 size={18} className="text-purple-400" />
                </div>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-sm p-2" onClick={() => openEdit(proj)}><Edit size={14} /></button>
                  <button className="btn btn-ghost btn-sm p-2 text-red-400 hover:text-red-300" onClick={() => deleteMutation.mutate(proj.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-bold text-sm mb-2">{proj.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] flex-1 line-clamp-2 mb-3">{proj.description}</p>
              {proj.achievements && (
                <p className="text-xs text-yellow-400 mb-2">🏆 {proj.achievements}</p>
              )}
              <div className="flex flex-wrap gap-1 mb-3">
                {(Array.isArray(proj.techStack) ? proj.techStack : []).slice(0, 4).map(tech => (
                  <span key={tech} className="badge badge-purple text-[10px]">{tech}</span>
                ))}
              </div>
              <div className="flex gap-2">
                {proj.githubUrl && (
                  <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm flex-1">
                    <GitBranch size={13} /> GitHub
                  </a>
                )}
                {proj.liveDemoUrl && (
                  <a href={proj.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm flex-1">
                    <Globe size={13} /> Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
