import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { eventApi } from '../../api'
import { CalendarDays, Search, MapPin, Clock, ArrowUpRight, } from 'lucide-react'
import toast from 'react-hot-toast'

const EVENT_TYPES = ['ALL', 'HACKATHON', 'SYMPOSIUM', 'WORKSHOP', 'CONFERENCE', 'COMPETITION', 'PLACEMENT_DRIVE']
const TYPE_COLORS = {
  HACKATHON: 'badge-purple', SYMPOSIUM: 'badge-blue',
  WORKSHOP: 'badge-green', CONFERENCE: 'badge-cyan',
  COMPETITION: 'badge-red', PLACEMENT_DRIVE: 'badge-blue',
}
const TYPE_ICONS = {
  HACKATHON: '🏆', SYMPOSIUM: '🎓', WORKSHOP: '🔧',
  CONFERENCE: '🌐', COMPETITION: '⚡', PLACEMENT_DRIVE: '💼',
}

export default function Events() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [page, setPage] = useState(0)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['events', search, filter, page],
    queryFn: () => eventApi.list({ query: search, type: filter === 'ALL' ? '' : filter, page, size: 9 }),
  })

  const events = data?.data?.data?.content || []
  const totalPages = data?.data?.data?.totalPages || 0

  const registerMutation = useMutation({
    mutationFn: (id) => eventApi.register(id),
    onSuccess: () => { toast.success('Registered for event!'); refetch() },
    onError: () => toast.error('Registration failed. Try again.'),
  })

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="section-title">Events Hub</h1>
        <p className="text-[var(--text-secondary)] text-sm">Hackathons, symposiums, conferences, and placement drives</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input className="input" style={{ paddingLeft: '2.25rem' }}
          placeholder="Search events..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {EVENT_TYPES.map(t => (
          <button key={t} onClick={() => { setFilter(t); setPage(0) }}
            className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-ghost'}`}>
            {TYPE_ICONS[t] || ''} {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-4 w-2/3 mb-3" />
              <div className="skeleton h-3 w-1/2 mb-2" />
              <div className="skeleton h-8 w-full mt-4" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <CalendarDays size={48} className="mx-auto mb-3 opacity-30" />
          <p>No events found</p>
        </div>
      ) : (
        <div className="grid-auto">
          {events.map(event => (
            <EventCard key={event.id} event={event} onRegister={() => registerMutation.mutate(event.id)} />
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

function EventCard({ event, onRegister }) {
  const badgeClass = TYPE_COLORS[event.type] || 'badge-blue'
  return (
    <div className="card flex flex-col" style={{ padding: '1.25rem' }}>
      <div className="flex-between mb-3">
        <span className={`badge ${badgeClass}`}>
          {TYPE_ICONS[event.type]} {event.type?.replace('_', ' ')}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{formatDate(event.startDt)}</span>
      </div>
      <h3 className="font-bold text-sm mb-2">{event.title}</h3>
      <p className="text-xs text-[var(--text-secondary)] flex-1 line-clamp-2 mb-3">{event.description}</p>
      <div className="space-y-1 mb-3">
        {event.location && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <MapPin size={11} /> {event.location}
          </div>
        )}
        {event.endDt && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Clock size={11} /> Ends {formatDate(event.endDt)}
          </div>
        )}
      </div>
      {event.tags?.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {event.tags.slice(0, 3).map(tag => (
            <span key={tag} className="badge badge-cyan text-[10px]">{tag}</span>
          ))}
        </div>
      )}
      <button className="btn btn-primary btn-sm w-full" onClick={onRegister}>
        Register <ArrowUpRight size={13} />
      </button>
    </div>
  )
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
