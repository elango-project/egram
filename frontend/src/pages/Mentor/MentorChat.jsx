import { useState, useRef, useEffect } from 'react'
import { aiApi } from '../../api'
import { Brain, Send, Loader2, Sparkles, User, Bot } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const QUICK_PROMPTS = [
  'How should I prepare for a software engineering interview?',
  'What skills should I learn for data science?',
  'Help me improve my resume',
  'Explain system design concepts',
  'What are good internship tips?',
]

export default function MentorChat() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hi! I'm **Sarathi**, your AI mentor. I'm here to help you with career guidance, interview preparation, resume feedback, and technical questions. What would you like to explore today?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    if (!text.trim()) return
    const userMsg = { role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const historyToPass = messages.map(m => ({ role: m.role, content: m.content }))
      console.log("Sending request to Sarathi AI:", { message: text, context: 'career guidance', history: historyToPass })
      const res = await aiApi.mentor({ message: text, context: 'career guidance', history: historyToPass })
      setMessages(m => [...m, { role: 'ai', content: res.data.data.reply }])
    } catch (err) {
      console.error("Mentor chat error:", err)
      const errMsg = err.response?.data?.message || err.message || "Failed to reach AI Mentor."
      setMessages(m => [...m, { role: 'ai', content: `Error: ${errMsg}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in flex flex-col h-[calc(100vh-130px)]">
      {/* Header */}
      <div className="flex-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Sarathi AI Mentor</h1>
            <p className="text-xs text-[var(--text-muted)]">Career Guidance · Interview Prep · Resume Review</p>
          </div>
        </div>
        <Link to="/mentor/mock-interview" className="btn btn-primary btn-sm">
          <Sparkles size={14} /> Mock Interview
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="card p-3 max-w-xs">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                       style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => send(p)}
              className="btn btn-ghost btn-sm text-xs">{p}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Ask Sarathi anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
          disabled={loading}
        />
        <button className="btn btn-primary" onClick={() => send(input)} disabled={loading || !input.trim()}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex-center flex-shrink-0 ${isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-blue-500'}`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>
      <div className={`card p-3 max-w-[75%] ${isUser ? 'bg-blue-600/10 border-blue-500/20' : ''}`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
          {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
        </p>
      </div>
    </div>
  )
}
