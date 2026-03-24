import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Target, Zap, Clock, Play, RotateCcw, Pause } from 'lucide-react'

export default function FocusModePanel({ tasks = [] }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes
  const [isActive, setIsActive] = useState(false)


  const nextTask = tasks
    .filter((t) => !t.done)
    .sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5))[0]

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!nextTask) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          textAlign: 'center',
          padding: '24px 0',
          color: 'var(--sage)',
          fontSize: 14,
          fontWeight: 600,
        }}
        className="font-playfair"
      >
        <Sparkles size={16} color="var(--sage)" style={{ display: 'inline', marginRight: '6px', marginBottom: '-2px' }} /> All tasks ready
      </motion.div>
    )
  }

  const timerRgb = isActive ? '56,189,248' : '216,110,110'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'var(--forest-card)',
        border: `6px solid var(--coral)`, 
        borderRadius: '4px',
        padding: '24px 24px 48px 24px',
        marginTop: 32,
        boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* Precision Pushpin */}
      <div style={{
        position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
        zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none'
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, #fff, var(--coral))`,
          boxShadow: '0 3px 6px rgba(0,0,0,0.4)',
          zIndex: 2,
          border: '1px solid rgba(0,0,0,0.1)'
        }} />
        <div style={{
          width: 2, height: 14, background: 'rgba(255,255,255,0.4)',
          marginTop: -3, zIndex: 1
        }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap size={15} color="var(--coral)" />
          <span style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Focus Mode
          </span>
        </div>
        
        {/* Productivity Timer Badge */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 8, 
          background: `rgba(${timerRgb}, 0.1)`, padding: '4px 10px', 
          borderRadius: 8, border: `1px solid rgba(${timerRgb}, 0.2)` 
        }}>
          <Clock size={12} color={`rgb(${timerRgb})`} />
          <span className="font-mono" style={{ fontSize: 12, fontWeight: 900, color: `rgb(${timerRgb})`, minWidth: 40 }}>
            {formatTime(timeLeft)}
          </span>
          <button 
            onClick={() => setIsActive(!isActive)}
            aria-label={isActive ? "Pause timer" : "Start timer"}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: `rgb(${timerRgb})` }}
          >
            {isActive ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          </button>
          <button 
            onClick={() => { setIsActive(false); setTimeLeft(25 * 60) }}
            aria-label="Reset timer"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'rgba(0,0,0,0.3)' }}
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      <div style={{
            fontSize: 24,
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            marginTop: 4
          }}>
            {nextTask.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fog)', marginTop: 6 }}>
            {nextTask.description || 'Focus on completing this task...'}
          </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.8 }}>
        <Target size={12} color="var(--sage)" />
        <span className="font-mono" style={{ fontSize: 10, color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          PRIORITY {nextTask.priority ?? '—'}
          {nextTask.suggested_due_offset_days != null && ` · DUE IN ${nextTask.suggested_due_offset_days} DAYS`}
        </span>
      </div>

      {(nextTask.subtasks ?? []).length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="font-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase' }}>
            {nextTask.subtasks.length} Step{nextTask.subtasks.length !== 1 ? 's' : ''}:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {nextTask.subtasks.slice(0, 3).map((st) => (
            <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)', paddingLeft: 4 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
               {st.title}
            </div>
          ))}
          </div>
          {nextTask.subtasks.length > 3 && (
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--muted)', paddingLeft: 16, marginTop: 8 }}>
              + {nextTask.subtasks.length - 3} MORE STEPS
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

