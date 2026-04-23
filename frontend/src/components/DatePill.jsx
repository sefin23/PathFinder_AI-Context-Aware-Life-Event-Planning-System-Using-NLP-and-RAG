/**
 * DatePill — Pill-shaped date display with inline editing capability.
 * Dark Forest styling with smooth interactions.
 */
import { useState, useRef, useEffect } from 'react'
import { Calendar, Edit2, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CustomDarkCalendar from './CustomDarkCalendar'

export default function DatePill({
  date,
  onDateChange,
  editable = true,
  hasConflict = false,
  onConflictClick,
  minDate = null,
  className = '',
  ...props
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempDate, setTempDate] = useState(date || '')
  
  // Use emerald for green shade as requested
  const accentGreen = 'var(--emerald)'

  useEffect(() => {
    setTempDate(date || '')
  }, [date])

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set'
    try {
      const d = new Date(dateString)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Reset time for comparison
      today.setHours(0, 0, 0, 0)
      tomorrow.setHours(0, 0, 0, 0)
      d.setHours(0, 0, 0, 0)

      if (d.getTime() === today.getTime()) return 'Today'
      if (d.getTime() === tomorrow.getTime()) return 'Tomorrow'

      // Format as "Mon, Jan 15"
      const options = { weekday: 'short', month: 'short', day: 'numeric' }
      return d.toLocaleDateString('en-US', options)
    } catch {
      return dateString
    }
  }

  const getDaysFromNow = (dateString) => {
    if (!dateString) return null
    try {
      const target = new Date(dateString)
      const today = new Date()
      target.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      const diffTime = target.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  }

  const daysFromNow = getDaysFromNow(date)
  const isPast = daysFromNow !== null && daysFromNow < 0
  const isToday = daysFromNow === 0
  const isSoon = daysFromNow !== null && daysFromNow > 0 && daysFromNow <= 3

  const pillColor = hasConflict
    ? 'var(--coral)'
    : isPast
    ? 'var(--muted)'
    : isToday || isSoon
    ? accentGreen
    : 'var(--sage)'

  return (
    <div
      data-no-expand
      className={`date-pill-container ${className}`}
      style={{ position: 'relative', display: 'inline-flex' }}
      {...props}
    >
      <motion.button
        whileHover={editable ? { scale: 1.05, background: 'rgba(255,255,255,0.06)' } : {}}
        whileTap={editable ? { scale: 0.98 } : {}}
        onClick={(e) => {
          e.stopPropagation()
          if (editable) setIsEditing(!isEditing)
        }}
        disabled={!editable}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 'var(--r-pill)',
          background: `rgba(${
            hasConflict ? '216,110,110' :
            isPast ? '148,163,184' :
            isToday || isSoon ? '92,140,117' :
            '92,140,117'
          }, 0.12)`,
          border: `1.5px solid ${pillColor}${isEditing ? '' : '40'}`,
          color: pillColor,
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          cursor: editable ? 'pointer' : 'default',
          transition: 'all 0.2s',
          outline: 'none',
          boxShadow: isEditing ? `0 0 15px ${pillColor}40` : 'none'
        }}
      >
        {hasConflict ? (
          <AlertTriangle size={12} fill={pillColor} stroke="none" />
        ) : (
          <Calendar size={12} />
        )}
        <span>{formatDate(date)}</span>
        {editable && <Edit2 size={10} style={{ opacity: 0.6 }} />}
      </motion.button>

      <AnimatePresence>
        {isEditing && (
          <>
            <div 
              style={{ position: 'fixed', inset: 0, zIndex: 999 }} 
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(false)
              }} 
            />
            <CustomDarkCalendar 
              selectedDate={date ? new Date(date) : new Date()}
              onSelect={(d) => {
                const iso = d.toISOString().split('T')[0]
                if (iso !== date) onDateChange?.(iso)
                setIsEditing(false)
              }}
              onClose={() => setIsEditing(false)}
              style={{ top: '100%', left: 0, marginTop: 10 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Conflict indicator tooltip */}
      <AnimatePresence>
        {hasConflict && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            onClick={onConflictClick}
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'var(--coral)',
              border: '2px solid var(--forest-deep)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: onConflictClick ? 'pointer' : 'default',
              boxShadow: '0 2px 8px rgba(216,110,110,0.4)',
              zIndex: 10
            }}
            title="Scheduling conflict detected"
          >
            <span style={{ color: 'white', fontSize: 10, fontWeight: 900 }}>!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
