import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { reelApi } from '../../api'
import { Heart, MessageCircle, Share2, Play, Sparkles, X, Loader2, ChevronDown } from 'lucide-react'

export default function Reels() {
  const [activeReel, setActiveReel] = useState(0)
  const [quiz, setQuiz] = useState(null)
  const [quizLoading, setQuizLoading] = useState(false)

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['reels'],
    queryFn: ({ pageParam = 0 }) => reelApi.feed({ page: pageParam, size: 5 }),
    getNextPageParam: (lastPage, pages) => {
      const content = lastPage?.data?.data?.content || []
      return content.length === 5 ? pages.length : undefined
    },
  })

  const reels = data?.pages.flatMap(p => p?.data?.data?.content || []) || []

  const handleScroll = (e) => {
    const el = e.currentTarget
    const idx = Math.round(el.scrollTop / el.clientHeight)
    if (idx !== activeReel) {
      setActiveReel(idx)
      setQuiz(null)
    }
    if (idx >= reels.length - 2 && hasNextPage) fetchNextPage()
  }

  const loadQuiz = async (reel) => {
    setQuizLoading(true)
    try {
      const res = await reelApi.quiz(reel.id)
      setQuiz(res.data.data)
    } catch {
      setQuiz({ question: 'What was the main topic of this reel?', options: ['Option A', 'Option B', 'Option C', 'Option D'] })
    } finally {
      setQuizLoading(false)
    }
  }

  if (isLoading) return (
    <div className="flex-center h-screen">
      <Loader2 size={32} className="animate-spin text-purple-400" />
    </div>
  )

  return (
    <div className="relative">
      <div className="reel-container" onScroll={handleScroll}>
        {reels.length === 0 ? (
          <div className="reel-item flex-center flex-col text-[var(--text-muted)]">
            <Play size={48} className="opacity-30 mb-3" />
            <p>No reels yet. Check back soon!</p>
          </div>
        ) : (
          reels.map((reel, idx) => (
            <div key={reel.id} className="reel-item flex">
              {/* Video area */}
              <div className="flex-1 relative bg-black flex-center">
                <video
                  src={reel.videoUrl}
                  className="max-h-full max-w-full object-contain"
                  autoPlay={idx === activeReel}
                  loop muted playsInline
                />
                {/* Overlay info */}
                <div className="absolute bottom-0 left-0 right-0 p-4"
                     style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                  <h3 className="font-bold text-white">{reel.title}</h3>
                  <p className="text-white/70 text-sm mt-1">{reel.description}</p>
                </div>
                {/* Scroll hint */}
                {idx === activeReel && (
                  <div className="absolute bottom-4 right-4 flex flex-col items-center gap-1 text-white/40 text-xs animate-bounce">
                    <ChevronDown size={16} />
                    <span>Swipe</span>
                  </div>
                )}
              </div>

              {/* Side actions */}
              <div className="flex flex-col items-center justify-end gap-5 p-4 w-16 bg-[var(--bg-primary)]">
                <ActionBtn icon={Heart} label="Like" />
                <ActionBtn icon={MessageCircle} label="Comment" />
                <ActionBtn icon={Share2} label="Share" />
                <button
                  className="flex flex-col items-center gap-1 text-yellow-400"
                  onClick={() => loadQuiz(reel)}
                  disabled={quizLoading}>
                  {quizLoading ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
                  <span className="text-[10px]">Quiz</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quiz overlay */}
      {quiz && (
        <div className="fixed inset-0 bg-black/70 z-50 flex-center" onClick={() => setQuiz(null)}>
          <div className="card w-full max-w-sm mx-4" onClick={e => e.stopPropagation()} style={{ padding: '1.5rem' }}>
            <div className="flex-between mb-4">
              <div className="flex items-center gap-2 text-yellow-400 font-bold">
                <Sparkles size={18} /> AI Challenge
              </div>
              <button onClick={() => setQuiz(null)}><X size={18} /></button>
            </div>
            <p className="font-semibold mb-4 text-sm">{quiz.question}</p>
            <div className="space-y-2">
              {(quiz.options || []).map((opt, i) => (
                <button key={i}
                  className="w-full text-left btn btn-ghost btn-sm justify-start"
                  style={{ padding: '0.6rem 1rem' }}>
                  <span className="text-purple-400 font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ icon: Icon, label }) {
  const [liked, setLiked] = useState(false)
  return (
    <button className="flex flex-col items-center gap-1 text-[var(--text-secondary)] hover:text-white transition-colors"
            onClick={() => setLiked(v => !v)}>
      <Icon size={22} fill={liked ? 'currentColor' : 'none'} />
      <span className="text-[10px]">{label}</span>
    </button>
  )
}
