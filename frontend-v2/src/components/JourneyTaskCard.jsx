import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Calendar as CalendarIcon, Edit3, Trash2, FileText, Upload, Check } from 'lucide-react'
import DatePill from './DatePill'

const PRIORITY_COLORS = { 1: '#d86e6e', 2: '#d47c3f', 3: '#c9a84c', 4: '#5c8c75', 5: 'rgba(255,255,255,0.3)' }
const PRIORITY_LABELS = { 1: 'CRITICAL', 2: 'HIGH', 3: 'MEDIUM', 4: 'LOW', 5: 'OPTIONAL' }

export default function JourneyTaskCard({
  task,
  onToggleDone,
  onOpenGuide,
  onNavigate,
  onEditDays,
  onEditScheduledDate,
  startDate
}) {
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS[3]

  const hasDocuments = task.required_docs && task.required_docs.length > 0
  const hasSubtasks = task.subtasks && task.subtasks.length > 0
  const isExpandable = hasDocuments || hasSubtasks

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: task.done ? 'rgba(10, 20, 15, 0.3)' : 'rgba(255, 255, 255, 0.02)',
        borderRadius: 12,
        border: `1px solid ${task.done ? 'rgba(92,140,117,0.15)' : 'rgba(255, 255, 255, 0.06)'}`,
        marginBottom: 12,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Main Task Row */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Checkbox */}
          <button
            onClick={() => onToggleDone(task.id)}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: `2px solid ${task.done ? '#5c8c75' : 'rgba(255,255,255,0.25)'}`,
              background: task.done ? '#5c8c75' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.2s',
              flexShrink: 0,
              marginTop: 2
            }}
          >
            {task.done && <Check size={12} color="white" strokeWidth={3} />}
          </button>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title and Priority */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{
                flex: 1,
                color: task.done ? 'rgba(255,255,255,0.4)' : 'white',
                fontSize: 16,
                fontWeight: 800,
                fontFamily: "'DM Sans', sans-serif",
                textDecoration: task.done ? 'line-through' : 'none',
                lineHeight: 1.2
              }}>
                {task.title}
              </span>

              <span style={{
                fontSize: 9,
                fontWeight: 900,
                color: priorityColor,
                letterSpacing: '0.1em',
                fontFamily: "'JetBrains Mono', monospace",
                padding: '3px 8px',
                background: `${priorityColor}15`,
                borderRadius: 6,
                border: `1px solid ${priorityColor}30`,
                flexShrink: 0
              }}>
                {PRIORITY_LABELS[task.priority]}
              </span>

              {/* Day Offset */}
              {task.suggested_due_offset_days != null && (
                <div 
                  data-no-expand
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                    background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                    padding: '3px 8px', border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <span className="font-mono" style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Day</span>
                  <input
                    type="number" min="0"
                    value={task.suggested_due_offset_days}
                    onChange={e => onEditDays?.(task.id, parseInt(e.target.value) || 0)}
                    className="font-mono"
                    style={{
                      width: 32, background: 'transparent', border: 'none',
                      color: 'white', fontSize: 11, fontWeight: 700, textAlign: 'center', outline: 'none',
                    }}
                  />
                </div>
              )}

              {/* Scheduled Date */}
              {(task.scheduled_date || onEditScheduledDate) && (
                <DatePill
                  date={task.scheduled_date}
                  onDateChange={(newDate) => onEditScheduledDate?.(task.id, newDate)}
                  editable={!!onEditScheduledDate}
                  hasConflict={task.has_scheduling_conflict}
                  minDate={startDate}
                />
              )}

            </div>

            {/* Description if available (only if not done) */}
            {task.description && !task.done && (
              <p style={{
                margin: '8px 0 0 0',
                fontSize: 14,
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.5,
                fontWeight: 400
              }}>
                {task.description}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Documents & Subtasks Section (Always Visible) */}
      {isExpandable && (
        <div style={{
          padding: '0 20px 16px 56px',
          borderTop: 'none',
          marginTop: -4
        }}>
          {/* Required Documents */}
          {hasDocuments && (
            <div style={{ marginTop: 12 }}>
              <div style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.5)',
                fontWeight: 700,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Required documents:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {task.required_docs.map((doc, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <FileText size={14} color={doc.has ? '#5c8c75' : 'rgba(255,255,255,0.3)'} />
                    <span style={{
                      flex: 1,
                      fontSize: 13,
                      color: doc.has ? '#5c8c75' : 'rgba(255,255,255,0.7)',
                      fontWeight: 500
                    }}>
                      {doc.name}
                    </span>
                    {doc.has ? (
                      <span style={{
                        fontSize: 9,
                        color: '#5c8c75',
                        fontWeight: 700,
                        padding: '2px 8px',
                        background: 'rgba(92,140,117,0.15)',
                        borderRadius: 4
                      }}>
                        from vault
                      </span>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate?.('vault');
                        }}
                        style={{
                          fontSize: 12,
                          color: '#d47c3f',
                          fontWeight: 700,
                          padding: '6px 14px',
                          background: 'rgba(212,124,63,0.1)',
                          border: '1px solid rgba(212,124,63,0.25)',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                        <Upload size={12} /> Upload
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks */}
          {hasSubtasks && (
            <div style={{ marginTop: hasDocuments ? 16 : 12 }}>
              <div style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.5)',
                fontWeight: 700,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Subtasks:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '6px 0'
                  }}>
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: `2px solid ${subtask.done ? '#5c8c75' : 'rgba(255,255,255,0.2)'}`,
                      background: subtask.done ? '#5c8c75' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {subtask.done && <Check size={9} color="white" strokeWidth={3} />}
                    </div>
                    <span style={{
                      fontSize: 13,
                      color: subtask.done ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
                      textDecoration: subtask.done ? 'line-through' : 'none'
                    }}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      {!task.done && (
        <div style={{
          padding: '12px 20px 20px',
          background: 'transparent'
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => onOpenGuide(task)}
              style={{
                flex: 2,
                padding: '12px 18px',
                background: 'rgba(240, 169, 107, 0.05)',
                border: '1px solid rgba(240, 169, 107, 0.3)', // Brighter border
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(240, 169, 107, 0.12)' // Slightly more punchy hover
                e.currentTarget.style.borderColor = 'rgba(240, 169, 107, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(240, 169, 107, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(240, 169, 107, 0.3)'
              }}
            >
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#f0a96b', // Higher contrast amber-light
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                🧭 Guide me through this →
              </span>
            </button>

            <button
              onClick={() => onToggleDone(task.id)}
              style={{
                flex: 1,
                padding: '12px 18px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: 'rgba(255,255,255,0.7)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              ✓ Mark done
            </button>
          </div>
        </div>
      )}

      {/* Completed Action State */}
      {task.done && (
        <div style={{
          padding: '12px 20px 20px',
          background: 'transparent'
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              flex: 2,
              padding: '12px 18px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: 0.5
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                🧭 Guide me through this →
              </span>
            </div>
            <div style={{
              flex: 1,
              padding: '12px 18px',
              background: 'rgba(92,140,117,0.1)',
              border: '1px solid rgba(92,140,117,0.3)',
              borderRadius: 10,
              color: '#5c8c75',
              fontSize: 14,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              opacity: 0.8
            }}>
              ✓ Completed
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
