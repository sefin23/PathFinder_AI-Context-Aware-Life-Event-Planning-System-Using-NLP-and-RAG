/**
 * TaskProgressBar — compact progress indicator for a task.
 * Shows "completed / total subtasks complete" + filled bar.
 * Dark Forest styling.
 */
import { motion } from 'framer-motion'

export default function TaskProgressBar({ completed = 0, total = 0 }) {
  if (total === 0) return null
  const pct = Math.round((completed / total) * 100)

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {completed} / {total} steps ready
        </span>
        <span className="font-mono" style={{ fontSize: 9, fontWeight: 700, color: pct === 100 ? 'var(--sage)' : 'var(--muted)' }}>{pct}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: 'var(--r-sm)',
            background: pct === 100 ? 'var(--sage)' : 'var(--emerald)',
          }}
        />
      </div>
    </div>
  )
}

