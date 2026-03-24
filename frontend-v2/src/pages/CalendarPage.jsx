import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, Check, MapPin, Sparkles, X, Menu, Map
} from 'lucide-react'
import { getLifeEvents } from '../api/backend'
import { getEventVisuals } from '../api/EventSymbols'

/**
 * CalendarPage - A premium calendar view showing scheduled tasks and events
 * Inspired by Todoist with Pathfinder AI's dark forest aesthetic
 */

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [lifeEvents, setLifeEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTimeline, setShowTimeline] = useState(false)

  // Fetch all life events with their tasks
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        const events = await getLifeEvents()
        setLifeEvents(events || [])
      } catch (err) {
        console.error('Failed to fetch events:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Get all tasks from all life events
  const allTasks = useMemo(() => {
    const tasks = []
    lifeEvents.forEach(event => {
      if (event.tasks && event.tasks.length > 0) {
        event.tasks.forEach(task => {
          if (task.scheduled_date) {
            tasks.push({
              ...task,
              lifeEventId: event.id,
              lifeEventTitle: event.display_title || event.title,
              eventColor: getEventVisuals(event.title, event.display_title).color
            })
          }
        })
      }
    })
    return tasks
  }, [lifeEvents])

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      })
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }

    // Next month's leading days
    const remainingDays = 42 - days.length // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      })
    }

    return days
  }, [currentDate])

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return allTasks.filter(task => {
      const taskDate = new Date(task.scheduled_date).toISOString().split('T')[0]
      return taskDate === dateStr
    })
  }

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    return getTasksForDate(selectedDate)
  }, [selectedDate, allTasks])

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString()
  }

  const isToday = (date) => {
    return isSameDay(date, new Date())
  }

  const isSelected = (date) => {
    return isSameDay(date, selectedDate)
  }

  // Sorted life events for timeline
  const sortedEvents = useMemo(() => {
    return [...lifeEvents].sort((a, b) =>
      new Date(b.start_date || b.created_at) - new Date(a.start_date || a.created_at)
    )
  }, [lifeEvents])

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'var(--forest-deep)',
      color: 'white',
      padding: '40px 24px 60px',
      position: 'relative'
    }}>
      <style>{`
        .calendar-day {
          transition: all 0.2s ease;
        }
        .calendar-day:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: scale(1.02);
        }
        .task-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--amber);
        }
        .river-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(to bottom, transparent, var(--amber), var(--sage), var(--gold), transparent);
          transform: translateX(-50%);
          opacity: 0.4;
          box-shadow: 0 0 20px rgba(212,124,63,0.3);
          z-index: 0;
        }
      `}</style>

      <div style={{ maxWidth: showTimeline ? 1600 : 1200, margin: '0 auto', display: 'flex', gap: 24 }}>

        {/* Main Calendar Section */}
        <div style={{ flex: showTimeline ? '0 0 65%' : 1 }}>

          {/* Header */}
          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 className="font-playfair" style={{ fontSize: 44, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                Calendar
              </h1>
              <p style={{ color: 'var(--sage)', marginTop: 8, fontSize: 15, opacity: 0.8 }}>
                Track your tasks and events across your life roadmaps
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 12,
                  border: '1px solid rgba(212, 124, 63, 0.3)',
                  background: showTimeline ? 'rgba(212, 124, 63, 0.15)' : 'rgba(255,255,255,0.03)',
                  color: showTimeline ? 'var(--amber)' : 'var(--muted)',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.3s'
                }}
              >
                <Map size={14} /> {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
              </button>

              <button
                onClick={goToToday}
                style={{
                  padding: '10px 20px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'var(--amber)',
                  color: 'black',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Today
              </button>
            </div>
          </div>

          {/* Month Navigation */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20,
            padding: '24px',
            marginBottom: 24
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <button
                onClick={goToPreviousMonth}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: 10,
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <h2 className="font-playfair" style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>

              <button
                onClick={goToNextMonth}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: 10,
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Days of Week Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
              {DAYS_OF_WEEK.map(day => (
                <div key={day} style={{
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'var(--muted)',
                  padding: '8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {calendarDays.map((day, idx) => {
                const tasksForDay = getTasksForDate(day.date)
                const hasEvents = tasksForDay.length > 0

                return (
                  <motion.button
                    key={idx}
                    onClick={() => setSelectedDate(day.date)}
                    className="calendar-day"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: isSelected(day.date)
                        ? 'var(--amber)'
                        : isToday(day.date)
                        ? 'rgba(212, 124, 63, 0.15)'
                        : 'rgba(255,255,255,0.02)',
                      border: isToday(day.date) && !isSelected(day.date)
                        ? '2px solid var(--amber)'
                        : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 12,
                      padding: '12px 8px',
                      cursor: 'pointer',
                      position: 'relative',
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      opacity: day.isCurrentMonth ? 1 : 0.3
                    }}
                  >
                    <span style={{
                      fontSize: 16,
                      fontWeight: isToday(day.date) || isSelected(day.date) ? 800 : 600,
                      color: isSelected(day.date) ? 'black' : 'white',
                      marginBottom: 8
                    }}>
                      {day.date.getDate()}
                    </span>

                    {hasEvents && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        alignItems: 'center',
                        width: '100%'
                      }}>
                        {tasksForDay.slice(0, 3).map((task, i) => (
                          <div
                            key={i}
                            style={{
                              width: '80%',
                              height: 3,
                              borderRadius: 2,
                              background: task.eventColor || 'var(--amber)',
                              opacity: isSelected(day.date) ? 0.8 : 1
                            }}
                          />
                        ))}
                        {tasksForDay.length > 3 && (
                          <span style={{
                            fontSize: 8,
                            color: isSelected(day.date) ? 'black' : 'var(--muted)',
                            marginTop: 2,
                            fontWeight: 700
                          }}>
                            +{tasksForDay.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Selected Date Events */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20,
            padding: '24px'
          }}>
            <h3 className="font-playfair" style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>
              {isToday(selectedDate) ? 'Today' : selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>

            {selectedDateTasks.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--muted)'
              }}>
                <CalendarIcon size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                <p style={{ fontSize: 14 }}>No tasks scheduled for this day</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedDateTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${task.eventColor || 'rgba(255,255,255,0.08)'}`,
                      borderLeft: `4px solid ${task.eventColor || 'var(--amber)'}`,
                      borderRadius: 12,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: task.status === 'completed'
                        ? `2px solid ${task.eventColor || 'var(--sage)'}`
                        : '2px solid rgba(255,255,255,0.2)',
                      background: task.status === 'completed'
                        ? task.eventColor || 'var(--sage)'
                        : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {task.status === 'completed' && <Check size={14} color="black" strokeWidth={3} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'white',
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        opacity: task.status === 'completed' ? 0.6 : 1
                      }}>
                        {task.title}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 6
                      }}>
                        <span style={{
                          fontSize: 11,
                          color: 'var(--muted)',
                          fontWeight: 600
                        }}>
                          {task.lifeEventTitle}
                        </span>
                        {task.task_type && (
                          <span style={{
                            fontSize: 9,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--muted)',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {task.task_type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: task.priority === 'high'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : task.priority === 'medium'
                        ? 'rgba(245, 158, 11, 0.1)'
                        : 'rgba(156, 163, 175, 0.1)',
                      fontSize: 10,
                      fontWeight: 800,
                      color: task.priority === 'high'
                        ? '#EF4444'
                        : task.priority === 'medium'
                        ? '#F59E0B'
                        : '#9CA3AF',
                      textTransform: 'uppercase'
                    }}>
                      {task.priority}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Events Timeline Side Panel */}
        <AnimatePresence>
          {showTimeline && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3 }}
              style={{
                flex: '0 0 35%',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20,
                padding: '24px',
                maxHeight: 'calc(100vh - 120px)',
                overflowY: 'auto',
                position: 'sticky',
                top: 60
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 className="font-playfair" style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
                  Events Timeline
                </h3>
                <button
                  onClick={() => setShowTimeline(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    padding: 8
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ position: 'relative', paddingBottom: 40, paddingLeft: 24 }}>
                {/* Vertical Timeline Line */}
                <div style={{
                  position: 'absolute',
                  left: 8,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: 'linear-gradient(to bottom, transparent, var(--amber) 10%, var(--sage) 50%, var(--amber) 90%, transparent)',
                  opacity: 0.3,
                  zIndex: 0
                }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 60, position: 'relative' }}>
                  {sortedEvents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                      No events found
                    </div>
                  ) : sortedEvents.map((event, idx) => {
                    const isLeft = idx % 2 === 0
                    const eventDate = new Date(event.start_date || event.created_at)
                    const isPast = eventDate < new Date()
                    const isEventToday = isToday(eventDate)
                    const { image, color } = getEventVisuals(event.title, event.display_title)

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        style={{
                          position: 'relative',
                          paddingLeft: 32
                        }}
                      >
                        {/* Timeline Node - Circle on the line */}
                        <div style={{
                          position: 'absolute',
                          left: -8,
                          top: 0,
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'var(--forest-deep)',
                          border: `3px solid ${isEventToday ? 'var(--amber)' : isPast ? 'var(--sage)' : 'rgba(255,255,255,0.2)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isEventToday ? '0 0 20px rgba(212,124,63,0.6)' : 'none',
                          zIndex: 10
                        }}>
                          <img
                            src={image}
                            alt="Event"
                            style={{ width: 16, height: 16, filter: 'brightness(1.2)' }}
                          />
                        </div>

                        {/* Event Content */}
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 900,
                              color: isEventToday ? 'var(--amber)' : 'var(--muted)',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase'
                            }}>
                              {eventDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          <h4 className="font-playfair" style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: 'white',
                            margin: '0 0 8px'
                          }}>
                            {event.display_title || event.title}
                          </h4>

                          <p style={{
                            fontSize: 12,
                            color: 'var(--fog)',
                            lineHeight: 1.5,
                            margin: 0,
                            opacity: 0.7
                          }}>
                            {event.description?.slice(0, 80) || 'No description'}
                            {event.description?.length > 80 && '...'}
                          </p>

                          {isEventToday && (
                            <motion.div
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              style={{
                                marginTop: 8,
                                padding: '4px 10px',
                                borderRadius: 8,
                                background: 'rgba(212,124,63,0.1)',
                                border: '1px solid var(--amber)',
                                fontSize: 9,
                                fontWeight: 900,
                                color: 'var(--amber)',
                                display: 'inline-block'
                              }}
                            >
                              ACTIVE TODAY
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
