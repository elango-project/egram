import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { courseApi } from '../../api'
import { Link } from 'react-router-dom'
import { BookOpen, Search, Clock, Users } from 'lucide-react'

const CATEGORIES = ['All', 'Programming', 'Data Science', 'Design', 'Business', 'AI/ML', 'Cybersecurity']

export default function Courses() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['courses', search, category, page],
    queryFn: () => courseApi.list({ query: search, category: category === 'All' ? '' : category, page, size: 12 }),
  })

  const courses = data?.data?.data?.content || []
  const totalPages = data?.data?.data?.totalPages || 0

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="section-title">Courses</h1>
        <p className="text-[var(--text-secondary)] text-sm">Learn from verified industry professionals</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input className="input" style={{ paddingLeft: '2.25rem' }}
            placeholder="Search courses..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setCategory(cat); setPage(0) }}
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-ghost'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-40 rounded-lg mb-3" />
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p>No courses found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid-auto">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Pagination */}
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

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`}
      className="card hover:no-underline group flex flex-col" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="h-40 bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex-center relative">
        <BookOpen size={40} className="text-purple-400 opacity-60" />
        {course.category && (
          <span className="badge badge-purple absolute top-3 left-3">{course.category}</span>
        )}
      </div>
      <div style={{ padding: '1rem' }} className="flex-1 flex flex-col">
        <h3 className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-purple-400 transition-colors leading-snug mb-2">
          {course.title}
        </h3>
        <p className="text-xs text-[var(--text-muted)] flex-1 line-clamp-2">{course.description}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1"><Users size={11} /> {course.enrollmentCount || 0} enrolled</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {course.modulesCount || 0} modules</span>
        </div>
      </div>
    </Link>
  )
}
