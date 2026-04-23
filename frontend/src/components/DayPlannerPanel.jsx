/**
 * DayPlannerPanel — replaces SimulationPanel.
 *
 * Shows a calendar of the plan's duration with:
 *  - Task due days (amber markers)
 *  - Personal events (teal markers)
 *  - Clashes highlighted (coral)
 *
 * Users can add personal/social events from here.
 * PathFinder proactively flags clashes — no slider, no hypothetical.
 */
import { useState, useMemo } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, Plus, X, AlertTriangle, CheckCircle2, Trash2, Calendar
} from 'lucide-react'
import CustomDarkCalendar from './CustomDarkCalendar'

const EVENT_TYPES = [
  { key: 'DATE_NIGHT',  label: 'Date / Social',      emoji: '📅', color: '#e879a5' },
  { key: 'FAMILY_DAY',  label: 'Family day out',      emoji: '👨‍👩‍👧', color: '#f59e0b' },
  { key: 'TRAVEL',      label: 'Travel / away',       emoji: '✈️', color: '#38bdf8' },
  { key: 'MEDICAL',     label: 'Medical appt.',       emoji: '🏥', color: '#bfdbfe' },
  { key: 'BLOCKED',     label: 'Blocked day',         emoji: '🚫', color: '#c65d4a' },
  { key: 'OTHER',       label: 'Other',               emoji: '📌', color: '#94a3b8' },
]

function eventTypeInfo(key) {
  return EVENT_TYPES.find(e => e.key === key) ?? EVENT_TYPES[EVENT_TYPES.length - 1]
}

// Build an array of date objects covering the plan range
function buildCalendarDays(tasks, personalEvents) {
  const dates = []

  tasks.forEach(t => {
    if (t.due_date) dates.push(new Date(t.due_date))
  })
  personalEvents.forEach(e => {
    const d = new Date(e.event_date + 'T00:00:00')
    dates.push(d)
  })

  if (dates.length === 0) {
    // Default: next 30 days from today
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      dates.push(d)
    }
    return dates
  }

  const min = new Date(Math.min(...dates))
  const max = new Date(Math.max(...dates))
  // Pad 3 days either side
  min.setDate(min.getDate() - 3)
  max.setDate(max.getDate() + 3)

  const result = []
  for (let d = new Date(min); d <= max; d.setDate(d.getDate() + 1)) {
    result.push(new Date(d))
  }
  return result
}

function toISO(d) {
  return d.toISOString().split('T')[0]
}

export default function DayPlannerPanel({
  tasks = [],
  personalEvents = [],
  onAddEvent,
  onRemoveEvent,
}) {
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [titleInput, setTitleInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [focusedDay, setFocusedDay] = useState(null) // ISO string
  const [showDatePicker, setShowDatePicker] = useState(false)

  const calDays = useMemo(
    () => buildCalendarDays(tasks, personalEvents),
    [tasks, personalEvents]
  )

  // Build lookup maps
  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach(t => {
      if (!t.due_date) return
      const key = new Date(t.due_date).toISOString().split('T')[0]
      if (!map[key]) map[key] = []
      map[key].push(t)
    })
    return map
  }, [tasks])

  const personalByDate = useMemo(() => {
    const map = {}
    personalEvents.forEach(e => {
      const key = e.event_date
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    return map
  }, [personalEvents])

  const clashDates = useMemo(() =>
    new Set(
      Object.keys(tasksByDate).filter(date => personalByDate[date]?.length > 0)
    ),
    [tasksByDate, personalByDate]
  )

  const focusedTasks = focusedDay ? (tasksByDate[focusedDay] ?? []) : []
  const focusedPersonal = focusedDay ? (personalByDate[focusedDay] ?? []) : []
  const focusedIsClash = focusedDay && clashDates.has(focusedDay)

  async function handleSave() {
    if (!selectedType || !selectedDate) return
    setSaving(true)
    const info = eventTypeInfo(selectedType)
    const title = titleInput.trim() || info.label
    try {
      await onAddEvent({ title, event_type: selectedType, event_date: selectedDate })
      setShowAddSheet(false)
      setSelectedType(null)
      setSelectedDate('')
      setTitleInput('')
    } finally {
      setSaving(false)
    }
  }

  const today = toISO(new Date())

  return (
    <div style={{ padding: '0' }}>
      {/* Header - Compact for Sidebar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Available Days</span>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddSheet(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(212,124,63,0.15)', color: 'var(--amber)', border: '1px solid rgba(212,124,63,0.3)',
            borderRadius: 8, padding: '4px 10px', fontWeight: 700,
            fontSize: 10, cursor: 'pointer', flexShrink: 0,
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}
        >
          <Plus size={12} /> Add
        </motion.button>
      </div>

      {/* Clash summary banner */}
      {clashDates.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(198,93,74,0.08)', border: '1px solid rgba(198,93,74,0.25)',
            borderRadius: 12, padding: '12px 18px', marginBottom: 24,
          }}
        >
          <AlertTriangle size={16} color="var(--coral)" />
          <div>
            <span style={{ fontWeight: 700, color: 'var(--coral)', fontSize: 13 }}>
              {clashDates.size} clash{clashDates.size > 1 ? 'es' : ''} detected
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 8 }}>
              — tasks due on days you've marked as busy. Tap a red day to see options.
            </span>
          </div>
        </motion.div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* TOP: Calendar */}
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {calDays.map(day => {
              const iso = toISO(day)
              const hasTask = !!tasksByDate[iso]
              const hasPersonal = !!personalByDate[iso]
              const isClash = clashDates.has(iso)
              const isToday = iso === today
              const isFocused = focusedDay === iso

              const dotColor = isClash ? 'var(--coral)'
                : hasTask ? 'var(--amber)'
                : hasPersonal ? '#5eead4'
                : null

              return (
                <motion.button
                  key={iso}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFocusedDay(isFocused ? null : iso)}
                  style={{
                    width: 40, height: 48, borderRadius: 10, border: '1px solid',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 3, cursor: 'pointer',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                    background: isFocused
                      ? 'rgba(255,255,255,0.08)'
                      : isClash
                        ? 'rgba(198,93,74,0.08)'
                        : hasTask || hasPersonal
                          ? 'rgba(255,255,255,0.03)'
                          : 'transparent',
                    borderColor: isFocused
                      ? 'rgba(255,255,255,0.3)'
                      : isClash
                        ? 'rgba(198,93,74,0.4)'
                        : isToday
                          ? 'rgba(212,124,63,0.5)'
                          : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <span style={{
                    fontSize: 7, fontWeight: 700, color: isToday ? 'var(--amber)' : 'var(--muted)',
                    fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                  }}>
                    {day.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: isClash ? 'var(--coral)' : 'white', lineHeight: 1 }}>
                    {day.getDate()}
                  </span>
                  {/* Dot indicator */}
                  {dotColor && (
                    <div style={{ 
                      width: 5, height: 5, borderRadius: '50%', background: dotColor,
                      boxShadow: `0 0 6px ${dotColor}80`
                    }} />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { color: 'var(--amber)', label: 'Task due' },
              { color: '#5eead4', label: 'Personal event' },
              { color: 'var(--coral)', label: 'Clash ⚠️' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Day detail or personal events list */}
        <div>
          <AnimatePresence mode="wait">
            {focusedDay ? (
              <motion.div
                key={focusedDay}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: 'var(--forest-card)', border: `1px solid ${focusedIsClash ? 'rgba(198,93,74,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 16, padding: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>
                    {new Date(focusedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                  <button onClick={() => setFocusedDay(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>

                {focusedIsClash && (
                  <div style={{ background: 'rgba(198,93,74,0.08)', border: '1px solid rgba(198,93,74,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <AlertTriangle size={13} color="var(--coral)" />
                      <span style={{ fontWeight: 800, fontSize: 12, color: 'var(--coral)' }}>CLASH ON THIS DAY</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--fog)', lineHeight: 1.6 }}>
                      You have both a task due and a personal commitment here. Consider moving the task to the day before, or splitting it.
                    </p>
                  </div>
                )}

                {focusedTasks.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tasks Due</span>
                    {focusedTasks.map(t => (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '8px 12px', background: 'rgba(212,124,63,0.06)', borderRadius: 8, border: '1px solid rgba(212,124,63,0.15)' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--fog)' }}>{t.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {focusedPersonal.length > 0 && (
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#5eead4', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your commitments</span>
                    {focusedPersonal.map(e => {
                      const info = eventTypeInfo(e.event_type)
                      return (
                        <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '8px 12px', background: 'rgba(94,234,212,0.05)', borderRadius: 8, border: '1px solid rgba(94,234,212,0.12)' }}>
                          <span style={{ fontSize: 14 }}>{info.emoji}</span>
                          <span style={{ fontSize: 12, color: 'var(--fog)', flex: 1 }}>{e.title}</span>
                          <button
                            onClick={() => onRemoveEvent(e.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', opacity: 0.5 }}
                            onMouseEnter={el => el.currentTarget.style.opacity = '1'}
                            onMouseLeave={el => el.currentTarget.style.opacity = '0.5'}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {focusedTasks.length === 0 && focusedPersonal.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', opacity: 0.3 }}>
                    <CalendarDays size={24} style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 12 }}>Nothing scheduled</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="events-list"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Your commitments ({personalEvents.length})
                </span>
                {personalEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12, opacity: 0.5 }}>
                    <CalendarDays size={20} style={{ margin: '0 auto 8px', color: 'var(--muted)' }} />
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>No personal events added yet</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Tap "+ Add to schedule" to get started</p>
                  </div>
                ) : (
                  personalEvents.map(e => {
                    const info = eventTypeInfo(e.event_type)
                    const isClash = clashDates.has(e.event_date)
                    return (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', borderRadius: 10, border: '1px solid',
                          background: isClash ? 'rgba(198,93,74,0.06)' : 'rgba(255,255,255,0.02)',
                          borderColor: isClash ? 'rgba(198,93,74,0.25)' : 'rgba(255,255,255,0.06)',
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{info.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                            {new Date(e.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {isClash && <span style={{ color: 'var(--coral)', marginLeft: 8 }}>⚠ task clash</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveEvent(e.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', opacity: 0.4, flexShrink: 0 }}
                          onMouseEnter={el => el.currentTarget.style.opacity = '1'}
                          onMouseLeave={el => el.currentTarget.style.opacity = '0.4'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    )
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Event Sheet - Optimized for Sidebar Overlay */}
      <AnimatePresence>
        {showAddSheet && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', 
              zIndex: 200, display: 'flex', flexDirection: 'column', 
              backdropFilter: 'blur(10px)', borderRadius: 20, 
              paddingTop: 40, alignItems: 'center'
            }}
            onClick={e => { if (e.target === e.currentTarget) setShowAddSheet(false) }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              style={{
                background: 'var(--forest-deep)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 24, padding: '24px 24px', width: '92%', maxWidth: 360,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 className="font-playfair" style={{ fontSize: 20, color: 'white' }}>Add to <em>your schedule</em></h3>
                <button onClick={() => setShowAddSheet(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={16} /></button>
              </div>

              {/* Type picker */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>What kind of commitment?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {EVENT_TYPES.map(type => (
                    <button
                      key={type.key}
                      onClick={() => { setSelectedType(type.key); setTitleInput(type.label) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', borderRadius: 10, border: '1px solid', cursor: 'pointer',
                        background: selectedType === type.key ? `${type.color}18` : 'rgba(255,255,255,0.02)',
                        borderColor: selectedType === type.key ? `${type.color}60` : 'rgba(255,255,255,0.08)',
                        color: selectedType === type.key ? 'white' : 'var(--fog)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{type.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom title */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Label (optional)</label>
                <input
                  value={titleInput}
                  onChange={e => setTitleInput(e.target.value)}
                  placeholder="e.g. Sister's birthday dinner"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '10px 14px', color: 'white',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: 'none',
                  }}
                />
              </div>

              {/* Date picker */}
              <div style={{ marginBottom: 28, position: 'relative' }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Which day?</label>
                <div 
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '10px 14px', color: 'white',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: 'none',
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <span style={{ color: selectedDate ? 'white' : 'var(--muted)' }}>
                    {selectedDate || 'Select a date'}
                  </span>
                  <Calendar size={14} color="var(--emerald)" />
                </div>

                <AnimatePresence>
                  {showDatePicker && (
                    <div style={{ position: 'absolute', bottom: '100%', left: 0, zIndex: 1000, marginBottom: 12 }}>
                      <div 
                        style={{ position: 'fixed', inset: 0, zIndex: -1 }} 
                        onClick={() => setShowDatePicker(false)} 
                      />
                      <CustomDarkCalendar 
                        selectedDate={selectedDate ? new Date(selectedDate) : new Date()}
                        onSelect={(date) => {
                          setSelectedDate(date.toISOString().split('T')[0])
                          setShowDatePicker(false)
                        }}
                        onClose={() => setShowDatePicker(false)}
                      />
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={!selectedType || !selectedDate || saving}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: selectedType && selectedDate ? 'var(--amber)' : 'rgba(255,255,255,0.06)',
                  color: selectedType && selectedDate ? 'white' : 'var(--muted)',
                  fontWeight: 700, fontSize: 14, cursor: selectedType && selectedDate ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                <CheckCircle2 size={16} />
                {saving ? 'Saving...' : 'Add to my schedule'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
