import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { internshipApi, jobApi } from '../../api'
import { Briefcase, Search, MapPin, Clock, Building2, ArrowUpRight, } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = ['Internships', 'Jobs']
const TYPES = ['All', 'Remote', 'On-site', 'Hybrid']

export default function Internships() {
  const [tab, setTab] = useState('Internships')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')
  const [page, setPage] = useState(0)

  const queryFn = tab === 'Internships'
    ? () => internshipApi.list({ query: search, page, size: 9 })
    : () => jobApi.list({ query: search, page, size: 9 })

  const { data, isLoading } = useQuery({
    queryKey: [tab.toLowerCase(), search, page],
    queryFn,
  })

  const items = data?.data?.data?.content || []
  const totalPages = data?.data?.data?.totalPages || 0

  const apply = async (id) => {
    try {
      if (tab === 'Internships') await internshipApi.apply(id, {})
      else await jobApi.apply(id)
      toast.success('Application submitted!')
    } catch {
      toast.error('Could not apply. Please try again.')
    }
  }

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="section-title">Internships & Jobs</h1>
        <p className="text-[var(--text-secondary)] text-sm">AI-matched opportunities based on your skills</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(0) }}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input className="input" style={{ paddingLeft: '2.25rem' }}
            placeholder={`Search ${tab.toLowerCase()}...`}
            value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
        </div>
        <div className="flex gap-2">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`btn btn-sm ${type === t ? 'btn-primary' : 'btn-ghost'}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-5 w-2/3 mb-3" />
              <div className="skeleton h-3 w-1/2 mb-2" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <Briefcase size={48} className="mx-auto mb-3 opacity-30" />
          <p>No {tab.toLowerCase()} found</p>
        </div>
      ) : (
        <div className="grid-auto">
          {items.map(item => (
            <div key={item.id} className="card flex flex-col" style={{ padding: '1.25rem' }}>
              <div className="flex-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex-center">
                  <Building2 size={18} className="text-blue-400" />
                </div>
                <span className="badge badge-blue text-xs">{item.location || 'Remote'}</span>
              </div>
              <h3 className="font-bold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-[var(--text-muted)] mb-1">{item.company}</p>
              <p className="text-xs text-[var(--text-secondary)] flex-1 line-clamp-2 mb-3">{item.description}</p>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-3">
                {item.startDate && <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(item.startDate)}</span>}
                {item.location && <span className="flex items-center gap-1"><MapPin size={11} /> {item.location}</span>}
              </div>
              <button className="btn btn-primary btn-sm w-full" onClick={() => apply(item.id)}>
                Apply Now <ArrowUpRight size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span className="btn btn-ghost btn-sm pointer-events-none">{page + 1} / {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
