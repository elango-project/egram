import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { courseApi, aiApi } from '../../api'
import { useState } from 'react'
import { Play, CheckCircle, Loader2, Sparkles, ChevronDown, ChevronRight, } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CourseDetail() {
  const { id } = useParams()
  const [aiSummary, setAiSummary] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseApi.get(id),
  })

  const enrollMutation = useMutation({
    mutationFn: () => courseApi.enroll(id),
    onSuccess: () => toast.success('Enrolled successfully!'),
    onError: (err) => toast.error(`Enrollment failed: ${err.message}`),
  })

  const course = data?.data?.data
  if (isLoading) return <div className="text-center py-20"><Loader2 className="animate-spin mx-auto" size={32} /></div>
  if (!course) return <div className="text-center py-20 text-[var(--text-muted)]">Course not found</div>

  const handleAiSummary = async (video) => {
    setAiLoading(true)
    try {
      const res = await aiApi.videoSummary({ video_title: video.title, video_description: video.description || '' })
      setAiSummary({ videoTitle: video.title, ...res.data.data })
      toast.success('AI Summary generated!')
    } catch (err) {
      console.error("AI Summary error:", err)
      toast.error('Failed to generate AI Summary')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl p-6 mb-6"
           style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.15))', border: '1px solid rgba(124,58,237,0.2)' }}>
        <span className="badge badge-purple mb-3">{course.category}</span>
        <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-4">{course.description}</p>
        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={() => enrollMutation.mutate()}
            disabled={enrollMutation.isPending}>
            {enrollMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Enroll Now
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Modules list */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-bold mb-3">Course Content</h2>
          {(course.modules || []).length === 0 ? (
            <div className="card text-center py-8 text-[var(--text-muted)] text-sm">No modules yet</div>
          ) : (
            <div className="space-y-3">
              {course.modules.map((mod, idx) => (
                <div key={mod.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--bg-card-hover)] transition-colors"
                    onClick={() => setExpanded(expanded === mod.id ? null : mod.id)}>
                    <div className="w-7 h-7 rounded-full bg-purple-600/20 flex-center text-purple-400 text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <span className="font-semibold text-sm flex-1">{mod.title}</span>
                    <span className="text-xs text-[var(--text-muted)]">{mod.topics?.length || 0} topics</span>
                    {expanded === mod.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {expanded === mod.id && (
                    <div className="border-t border-[var(--border)]">
                      {(mod.topics || []).map((topic, tIdx) => (
                        <div key={topic.id}
                             className="flex flex-col px-4 py-3 hover:bg-[var(--bg-card-hover)] transition-colors border-b border-[var(--border)] last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-500 w-4">{tIdx + 1}.</span>
                            <span className="text-sm font-semibold flex-1">{topic.title}</span>
                            <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-1 rounded">
                              {topic.estimatedDurationMinutes || 0} mins
                            </span>
                          </div>
                          {topic.description && (
                            <p className="text-xs text-[var(--text-secondary)] mt-1 ml-7">{topic.description}</p>
                          )}
                          
                          {/* Quick Learning Path (Reels) Display */}
                          {topic.reels?.length > 0 && (
                            <div className="mt-3 ml-7 bg-[var(--bg-card)] rounded p-3 border border-[var(--border)]">
                              <h5 className="text-xs font-bold text-purple-400 mb-2">Quick Learning Path</h5>
                              <ul className="space-y-2">
                                {topic.reels.map((reel) => (
                                  <li key={reel.id} className="flex flex-col md:flex-row md:items-center gap-3 bg-[var(--bg-secondary)] p-2 rounded">
                                    {reel.thumbnailUrl && (
                                      <img src={reel.thumbnailUrl} alt={reel.title} className="w-16 h-9 object-cover rounded shadow-sm" />
                                    )}
                                    <div className="flex-1">
                                      <span className="text-xs font-semibold">{reel.reelOrder}. {reel.title}</span>
                                    </div>
                                    <a 
                                      href={`/courses/topic/${topic.id}`} 
                                      className="btn btn-ghost btn-sm text-xs mt-2 md:mt-0 px-2 py-1"
                                    >
                                      <Play size={12} className="text-cyan-400 mr-1" />
                                      View Learning Path
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                      {(!mod.topics || mod.topics.length === 0) && (
                        <div className="px-4 py-3 text-xs text-[var(--text-muted)] italic text-center">
                          No topics added to this module yet.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Summary panel */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-400" /> AI Insights
          </h2>
          {aiLoading ? (
            <div className="card flex-center py-12">
              <Loader2 size={28} className="animate-spin text-purple-400" />
            </div>
          ) : aiSummary ? (
            <div className="card space-y-4" style={{ padding: '1.25rem' }}>
              <p className="text-xs font-semibold text-[var(--text-muted)]">{aiSummary.videoTitle}</p>
              <div>
                <div className="text-xs font-bold text-purple-400 mb-1">📝 Summary</div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{aiSummary.summary}</p>
              </div>
              <div>
                <div className="text-xs font-bold text-cyan-400 mb-2">✅ Key Takeaways</div>
                <ul className="space-y-1">
                  {(aiSummary.key_takeaways || []).map((t, i) => (
                    <li key={i} className="text-xs text-[var(--text-secondary)] flex gap-1.5">
                      <span className="text-green-400 mt-0.5">•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-bold text-blue-400 mb-2">💡 Concepts</div>
                <div className="flex flex-wrap gap-1">
                  {(aiSummary.important_concepts || []).map((c, i) => (
                    <span key={i} className="badge badge-blue">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-10 text-[var(--text-muted)] text-sm">
              <Sparkles size={28} className="mx-auto mb-2 opacity-30" />
              <p>Click <strong>"AI Summary"</strong> on any video to get AI-powered insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
