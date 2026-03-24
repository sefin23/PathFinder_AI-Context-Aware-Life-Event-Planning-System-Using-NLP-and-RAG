/**
 * SubtaskList — animated expand/collapse list of subtask rows.
 * Supports inline completion toggle, edit, and add-new.
 * Dark Forest styling.
 *
 * Props:
 *   subtasks: [{id, title, priority, suggested_due_offset_days, done?}]
 *   onToggleDone: (subtaskId) => void
 *   onEdit: (subtaskId, newTitle) => void
 *   onAdd: (title) => void
 *   onDelete: (subtaskId) => void
 *   hideCompleted: boolean
 */
import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Plus, Trash2, Check } from 'lucide-react'

function SubtaskRow({ subtask, onToggleDone, onEdit, onEditPriority, onEditDays, onDelete, hideCompleted }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(subtask.title)
  const [hovered, setHovered] = useState(false)

  if (hideCompleted && subtask.done) return null

  const commitEdit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== subtask.title) onEdit?.(subtask.id, trimmed)
    setEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0 10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        opacity: subtask.done ? 0.6 : 1,
        position: 'relative',
      }}
    >
      {/* Subtask Journey Marker */}
      <div 
        style={{
          position: 'absolute',
          left: -1,
          top: 10,
          bottom: 10,
          width: 3,
          background: subtask.done ? 'rgba(255,255,255,0.1)' : (subtask.priority <= 2 ? 'var(--amber)' : 'var(--sage)'),
          borderRadius: 4,
          transition: 'all 0.3s ease'
        }}
      />
      {/* Checkbox */}
      <button
        onClick={() => onToggleDone?.(subtask.id)}
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: `1.5px solid ${subtask.done ? 'var(--sage)' : 'var(--muted)'}`,
          background: subtask.done ? 'var(--sage)' : 'transparent',
          flexShrink: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { if(!subtask.done) e.currentTarget.style.borderColor = 'var(--sage)' }}
        onMouseLeave={e => { if(!subtask.done) e.currentTarget.style.borderColor = 'var(--muted)' }}
      >
        {subtask.done && <Check size={12} color="var(--forest-deep)" strokeWidth={3} />}
      </button>

      {/* Title */}
      {editing ? (
        <input
          aria-label="Subtask title draft"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 'var(--r-sm)',
            padding: '4px 8px',
            color: 'white',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            outline: 'none',
          }}
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          title="Click to edit"
          style={{
            flex: 1,
            fontSize: 13,
            color: subtask.done ? 'var(--muted)' : 'rgba(255,255,255,0.8)',
            textDecoration: subtask.done ? 'line-through' : 'none',
            cursor: 'text',
          }}
        >
          {subtask.title}
        </span>
      )}

      {/* Priority tag */}
      <div 
        title="Click to cycle priority (1-5)"
        onClick={() => {
          const nextP = subtask.priority >= 5 ? 1 : subtask.priority + 1
          onEditPriority?.(subtask.id, nextP)
        }}
        className="font-mono"
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 26, height: 22, borderRadius: 'var(--r-sm)',
          background: subtask.priority <= 2 ? 'rgba(212,124,63,0.1)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${subtask.priority <= 2 ? 'rgba(212,124,63,0.3)' : 'rgba(0,0,0,0.06)'}`,
          color: subtask.priority <= 2 ? 'var(--amber)' : '#999',
          fontSize: 10, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
        }}
      >
        P{subtask.priority}
      </div>

      {/* Days offset */}
      {subtask.suggested_due_offset_days != null && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 'var(--r-sm)',
          padding: '2px 6px'
        }}>
          <span className="font-mono" style={{ fontSize: 9, color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>Day</span>
          <input 
            aria-label="Subtask due offset days"
            type="number" min="0"
            value={subtask.suggested_due_offset_days}
            onChange={e => onEditDays?.(subtask.id, parseInt(e.target.value) || 0)}
            className="font-mono"
            style={{
              width: 38, background: 'transparent', border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 11,
              fontWeight: 600, textAlign: 'center', outline: 'none', padding: '0 2px',
              WebkitAppearance: 'none', MozAppearance: 'textfield'
            }}
             onFocus={e => e.target.style.borderBottomColor = 'var(--sage)'}
             onBlur={e => e.target.style.borderBottomColor = '#ddd'}
          />
        </div>
      )}

      {/* Delete */}
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onDelete?.(subtask.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--coral)', display: 'flex' }}
          >
            <Trash2 size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function SubtaskList({
  subtasks = [],
  onToggleDone,
  onEdit,
  onEditPriority,
  onEditDays,
  onAdd,
  onDelete,
  onReorder,
  hideCompleted = false,
}) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const submitNew = () => {
    const t = newTitle.trim()
    if (t) onAdd?.(t)
    setNewTitle('')
    setAdding(false)
  }

  return (
    <div style={{ paddingLeft: 18, paddingTop: 6 }}>
      <Reorder.Group
        axis="y"
        values={subtasks}
        onReorder={order => onReorder?.(order)}
      >
        <AnimatePresence>
          {subtasks.map((st) => (
            <Reorder.Item key={st.id} value={st} style={{ listStyle: 'none' }}>
              <SubtaskRow
                subtask={st}
                onToggleDone={onToggleDone}
                onEdit={onEdit}
                onEditPriority={onEditPriority}
                onEditDays={onEditDays}
                onDelete={onDelete}
                hideCompleted={hideCompleted}
              />
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add new subtask */}
      {adding ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            aria-label="New subtask title"
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitNew(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="New step..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 'var(--r-sm)',
              padding: '6px 12px',
              color: 'white',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              outline: 'none',
            }}
             onFocus={e => e.target.style.borderColor = 'var(--sage)'}
             onBlur={e => { if(!newTitle) setAdding(false); e.target.style.borderColor = 'rgba(255,255,255,0.15)'}}
          />
          <button
            onClick={submitNew}
            className="btn-cust"
            style={{ background: 'var(--sage)', color: 'var(--forest-deep)', fontWeight: 700, border: 'none', borderRadius: 'var(--r-sm)', padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}
          >
            ADD
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '4px 8px',
            borderRadius: 'var(--r-sm)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--fog)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent'}}
        >
          <Plus size={14} /> ADD STEP
        </button>
      )}
    </div>
  )
}

