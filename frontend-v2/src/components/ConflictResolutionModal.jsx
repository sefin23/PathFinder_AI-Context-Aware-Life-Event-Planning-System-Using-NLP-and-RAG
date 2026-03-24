/**
 * ConflictResolutionModal — Beautiful modal for resolving scheduling conflicts.
 * Dark Forest styling with clear action options.
 */
import { motion } from 'framer-motion'
import { AlertTriangle, Calendar, ArrowRight, Check, X } from 'lucide-react'

export default function ConflictResolutionModal({
  task,
  conflictingTasks = [],
  proposedDate,
  onResolve,
  onCancel
}) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    try {
      const d = new Date(dateString)
      const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
      return d.toLocaleDateString('en-US', options)
    } catch {
      return dateString
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    try {
      const d = new Date(dateString)
      const options = { hour: 'numeric', minute: '2-digit' }
      return d.toLocaleTimeString('en-US', options)
    } catch {
      return ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 560,
          background: 'var(--forest-card)',
          borderRadius: 'var(--r-lg)',
          border: '1.5px solid rgba(216,110,110,0.3)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(216,110,110,0.15)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(135deg, rgba(216,110,110,0.08) 0%, transparent 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--r-md)',
              background: 'rgba(216,110,110,0.15)',
              border: '1.5px solid var(--coral)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={20} color="var(--coral)" />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: 20,
                fontWeight: 900,
                color: 'white',
                marginBottom: 6,
                fontFamily: 'var(--font-heading)'
              }}>
                Scheduling Conflict Detected
              </h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                The date you selected conflicts with {conflictingTasks.length} other task{conflictingTasks.length !== 1 ? 's' : ''}.
                Choose how to proceed.
              </p>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px' }}>
          {/* Current Task */}
          <div style={{
            padding: 16,
            borderRadius: 'var(--r-md)',
            background: 'rgba(92,140,117,0.08)',
            border: '1px solid rgba(92,140,117,0.15)',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Calendar size={14} color="var(--sage)" />
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase' }}>
                Your Task
              </span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 4 }}>
              {task?.title || 'Untitled Task'}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              Scheduled for: <strong style={{ color: 'var(--sage)' }}>{formatDate(proposedDate)}</strong>
            </p>
          </div>

          {/* Conflicting Tasks */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              marginBottom: 12,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em'
            }}>
              Conflicting Tasks ({conflictingTasks.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {conflictingTasks.slice(0, 3).map((conflict, idx) => (
                <div
                  key={conflict.id || idx}
                  style={{
                    padding: 12,
                    borderRadius: 'var(--r-sm)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: conflict.priority <= 2 ? 'var(--coral)' : 'var(--amber)',
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'white',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conflict.title}
                    </p>
                  </div>
                  <span className="font-mono" style={{
                    fontSize: 9,
                    color: conflict.priority <= 2 ? 'var(--coral)' : 'var(--amber)',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    P{conflict.priority}
                  </span>
                </div>
              ))}
              {conflictingTasks.length > 3 && (
                <p style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', textAlign: 'center' }}>
                  ...and {conflictingTasks.length - 3} more
                </p>
              )}
            </div>
          </div>

          {/* Resolution Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h4 style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              marginBottom: 4,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em'
            }}>
              How would you like to resolve this?
            </h4>

            {/* Option 1: Keep this date */}
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onResolve('accept_conflict')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 'var(--r-md)',
                background: 'rgba(92,140,117,0.12)',
                border: '1.5px solid rgba(92,140,117,0.3)',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <Check size={16} color="var(--sage)" />
              <span style={{ flex: 1 }}>Keep this date (I'll manage the overlap)</span>
              <ArrowRight size={14} color="var(--sage)" />
            </motion.button>

            {/* Option 2: Move other tasks */}
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onResolve('reschedule_others')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 'var(--r-md)',
                background: 'rgba(212,124,63,0.12)',
                border: '1.5px solid rgba(212,124,63,0.3)',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <Calendar size={16} color="var(--amber)" />
              <span style={{ flex: 1 }}>Move conflicting tasks to the next available day</span>
              <ArrowRight size={14} color="var(--amber)" />
            </motion.button>

            {/* Option 3: Move this task */}
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onResolve('reschedule_current')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 'var(--r-md)',
                background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <Calendar size={16} color="var(--fog)" />
              <span style={{ flex: 1 }}>Move this task to the next available day</span>
              <ArrowRight size={14} color="var(--fog)" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
