/**
 * ParallelTasksSuggestion — Smart component that identifies tasks
 * that can be worked on simultaneously while waiting for blockers.
 *
 * Shows as a helpful banner suggesting productivity optimization.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ArrowRight, X } from 'lucide-react'
import { useState } from 'react'

export default function ParallelTasksSuggestion({ tasks, onTaskClick }) {
  const [dismissed, setDismissed] = useState(false)

  if (!tasks || tasks.length === 0) return null

  // Find tasks that are NOT done and NOT blocked
  const availableTasks = tasks.filter(t =>
    !t.done &&
    (!t.parent_id || tasks.find(p => p.id === t.parent_id)?.done)
  )

  // Find tasks that ARE blocked (waiting on parent)
  const blockedTasks = tasks.filter(t =>
    !t.done &&
    t.parent_id &&
    !tasks.find(p => p.id === t.parent_id)?.done
  )

  // Only show if there are blocked tasks AND available tasks to suggest
  if (blockedTasks.length === 0 || availableTasks.length < 2 || dismissed) return null

  // Suggest top 3 high-priority available tasks
  const suggestions = availableTasks
    .sort((a, b) => (a.priority || 5) - (b.priority || 5))
    .slice(0, 3)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(92,140,117,0.08), rgba(13, 26, 21, 0.3))',
          border: '1px solid rgba(92,140,117,0.25)',
          borderRadius: 16,
          padding: '18px 20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Accent gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, var(--sage), var(--amber))'
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          {/* Icon */}
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(92,140,117,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 2
          }}>
            <Zap size={20} color="var(--sage)" />
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <h3 className="font-mono" style={{
                fontSize: 10,
                fontWeight: 900,
                color: 'var(--sage)',
                letterSpacing: '0.12em',
                margin: 0
              }}>
                PRODUCTIVITY TIP
              </h3>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--sage)', opacity: 0.5 }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                {blockedTasks.length} task{blockedTasks.length > 1 ? 's' : ''} waiting
              </span>
            </div>

            <p style={{
              fontSize: 14,
              color: 'white',
              fontWeight: 500,
              lineHeight: 1.5,
              marginBottom: 12,
              fontFamily: "'DM Sans', sans-serif"
            }}>
              While waiting for blocked tasks, you can work on these in parallel:
            </p>

            {/* Suggested tasks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {suggestions.map((task, idx) => (
                <motion.button
                  key={task.id}
                  whileHover={{ x: 4, background: 'rgba(92,140,117,0.12)' }}
                  onClick={() => onTaskClick?.(task.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(92,140,117,0.2)',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: 'rgba(92,140,117,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'var(--sage)',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    {idx + 1}
                  </div>
                  <span style={{
                    flex: 1,
                    fontSize: 13,
                    color: 'white',
                    fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif"
                  }}>
                    {task.title.length > 60 ? task.title.substring(0, 60) + '...' : task.title}
                  </span>
                  <div style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: task.priority <= 2 ? 'rgba(212,124,63,0.15)' : 'rgba(92,140,117,0.15)',
                    border: `1px solid ${task.priority <= 2 ? 'rgba(212,124,63,0.3)' : 'rgba(92,140,117,0.3)'}`,
                    fontSize: 8,
                    fontWeight: 800,
                    color: task.priority <= 2 ? 'var(--amber)' : 'var(--sage)',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.05em'
                  }}>
                    P{task.priority || 3}
                  </div>
                  <ArrowRight size={14} color="rgba(255,255,255,0.3)" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
