import { motion } from 'framer-motion'
import { addDays, format, isSameDay } from 'date-fns'

export default function CalendarStrip({ baseDate, shiftDays, affectedTasksCount }) {
  const startDate = new Date(baseDate)
  const adjustedDate = addDays(startDate, shiftDays)

  // Generate 14 days around the target date
  const days = Array.from({ length: 14 }).map((_, i) => addDays(startDate, i))

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Time Impact Horizon</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: shiftDays > 0 ? 'var(--coral)' : 'var(--sage)' }}>
          {shiftDays > 0 ? `+${shiftDays} DAYS TOTAL SHIFT` : 'NO IMPACT'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {days.map((d, i) => {
          const isShifted = shiftDays > 0 && d > startDate && d <= adjustedDate
          const isExactAdjusted = isSameDay(d, adjustedDate)
          const isStartDate = isSameDay(d, startDate)

          return (
            <div key={i} style={{ flex: 1, color: 'white', position: 'relative' }}>
              <div style={{
                height: 48, borderRadius: 6,
                background: isExactAdjusted ? 'var(--coral)' : isShifted ? 'rgba(198,93,74, 0.15)' : 'rgba(255,255,255,0.03)',
                border: isExactAdjusted ? '1.5px solid var(--coral)' : isShifted ? '1px solid rgba(198,93,74,0.3)' : '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: isExactAdjusted ? '0 0 15px rgba(198,93,74,0.4)' : 'none'
              }}>
                <span style={{ fontSize: 8, color: isExactAdjusted ? 'white' : 'var(--muted)', fontWeight: 700 }}>{format(d, 'EEE')}</span>
                <span style={{ fontSize: 14, fontWeight: 800 }}>{format(d, 'd')}</span>
              </div>
              
              {isStartDate && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: 'var(--sage)', whiteSpace: 'nowrap' }}>
                   ORIGIN
                </div>
              )}
              {isExactAdjusted && shiftDays > 0 && (
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: 'var(--coral)', fontWeight: 800, whiteSpace: 'nowrap' }}
                >
                   NEW JOINING
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
