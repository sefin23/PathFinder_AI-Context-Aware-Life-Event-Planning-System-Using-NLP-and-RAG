import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'

export default function CustomDarkCalendar({ selectedDate, onSelect, onClose, style = {} }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate && !isNaN(selectedDate.getTime())) return selectedDate
    return new Date()
  })
  
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const isCurrentOrPastMonth = isSameMonth(currentMonth, new Date()) || currentMonth < new Date()

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => !isCurrentOrPastMonth && setCurrentMonth(subMonths(currentMonth, 1))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: 12,
        zIndex: 1000,
        background: 'rgba(10, 26, 21, 0.8)', 
        backdropFilter: 'blur(32px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 20,
        padding: '20px',
        width: 280,
        boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
        color: 'white',
        ...style
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
          {format(currentMonth, 'MMMM yyyy')}
        </h4>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={prevMonth}
            disabled={isCurrentOrPastMonth}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', borderRadius: 8, padding: 6, 
              cursor: isCurrentOrPastMonth ? 'default' : 'pointer', 
              color: 'white',
              opacity: isCurrentOrPastMonth ? 0.2 : 1
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={nextMonth}
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'white' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* WeekDays */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 12 }}>
        {days.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {calendarDays.map((date, i) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isCurrentMonth = isSameMonth(date, monthStart)
          const isCurrentDay = isToday(date)
          const today = new Date()
          today.setHours(0,0,0,0)
          const isDatePast = date < today && isCurrentMonth

          return (
            <motion.div
              key={i}
              whileHover={isDatePast ? {} : { scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              onClick={() => {
                if (isDatePast) return
                onSelect(date)
                onClose?.()
              }}
              style={{
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                cursor: isDatePast ? 'default' : 'pointer',
                fontSize: 12,
                fontWeight: isSelected ? 800 : 500,
                opacity: isDatePast ? 0.15 : 1, // Dim previous dates
                background: isSelected ? 'var(--emerald)' : isCurrentDay ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: isSelected ? 'white' : isCurrentMonth ? 'white' : 'rgba(255,255,255,0.2)',
                border: isCurrentDay && !isSelected ? '1px solid var(--emerald)' : 'none'
              }}
            >
              {format(date, 'd')}
            </motion.div>
          )
        })}
      </div>

      {/* Footer / Today Link */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <button 
          onClick={() => {
            onSelect(new Date())
            onClose?.()
          }}
          style={{ background: 'none', border: 'none', color: 'var(--emerald)', fontSize: 10, fontWeight: 800, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}
        >
          Jump to Today
        </button>
      </div>
    </motion.div>
  )
}
