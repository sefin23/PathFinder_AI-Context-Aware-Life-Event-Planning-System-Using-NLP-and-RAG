/**
 * GuidePanel — Premium "Guide Me" Experience
 *
 * This panel is the navigator, not a to-do list. It walks users through
 * complex government tasks step-by-step with pre-filled data from their vault.
 *
 * Design spec: guide-me-brief.html
 * Backend logic: backend/routes/task_routes.py (4-layer intelligence)
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Clipboard, Check, X, Upload } from 'lucide-react'

// Inline styles matching guide-me-brief.html exactly
const S = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(5px)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: 0,
  },
  sheet: {
    background: '#0f1f18', // Slightly lighter than page background
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '24px 24px 0 0',
    width: '100%',
    maxWidth: 1200,
    maxHeight: '96vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.8)',
  },
  handle: {
    width: 36,
    height: 4,
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    margin: '12px auto 0',
    flexShrink: 0,
  },
  progressBar: {
    height: 3,
    background: 'rgba(255, 255, 255, 0.06)',
    width: '100%',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, #d47c3f, #5c8c75)',
    borderRadius: 0,
    transition: 'width 0.4s ease',
  },
  scroll: {
    overflowY: 'auto',
    flex: 1,
    padding: '0 0 60px 0',
  },
  header: {
    padding: '16px 20px 14px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    position: 'relative',
  },
  eyebrow: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: '#d47c3f',
    marginBottom: 4,
    fontWeight: 700,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: 18,
    color: '#f7f4ee',
    marginBottom: 5,
    lineHeight: 1.2,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  timeChip: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    padding: '2px 8px',
    borderRadius: 999,
    background: 'rgba(92, 140, 117, 0.12)',
    border: '1px solid rgba(92, 140, 117, 0.25)',
    color: '#5c8c75',
  },
  siteLink: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.38)',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.38)',
    fontSize: 14,
    cursor: 'pointer',
    padding: '4px 9px',
    borderRadius: 6,
    lineHeight: 1,
    transition: 'all 0.15s',
  },
  prefillBanner: {
    background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.09), rgba(13, 26, 21, 0.3))',
    border: '1px solid rgba(201, 168, 76, 0.2)',
    borderRadius: 10,
    padding: '12px 14px',
    margin: '12px 20px',
  },
  prefillHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  prefillStar: {
    fontSize: 15,
  },
  prefillTitle: {
    fontSize: 12,
    fontWeight: 500,
    color: '#f7f4ee',
  },
  prefillSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.38)',
    marginBottom: 8,
    paddingLeft: 23,
    lineHeight: 1.5,
  },
  prefillField: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '5px 8px',
    background: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 6,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: 3,
  },
  pfLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.38)',
    width: 90,
    flexShrink: 0,
    textTransform: 'uppercase',
  },
  pfValue: {
    fontSize: 11,
    color: '#f7f4ee',
    flex: 1,
    fontWeight: 500,
  },
  pfSource: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    padding: '3px 7px',
    borderRadius: 5,
  },
  steps: {
    padding: '4px 20px 8px',
  },
  step: {
    display: 'flex',
    gap: 12,
    padding: '13px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: '#fff',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: 500,
    color: '#f7f4ee',
    marginBottom: 3,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  stepDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.38)',
    lineHeight: 1.65,
    marginBottom: 7,
  },
  stepActions: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 12px',
    borderRadius: 999,
    fontSize: 10,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.18s',
    border: '1px solid',
    textDecoration: 'none',
  },
  resultBox: {
    background: 'rgba(92, 140, 117, 0.05)',
    border: '1px solid rgba(92, 140, 117, 0.14)',
    borderRadius: 9,
    padding: '12px 14px',
    margin: '6px 20px 0',
  },
  resultLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#5c8c75',
    marginBottom: 7,
  },
  resultItem: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.38)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    padding: '2px 0',
    lineHeight: 1.55,
  },
  ctaSection: {
    padding: '14px 20px',
  },
  ctaBtn: {
    width: '100%',
    padding: 13,
    background: '#d47c3f',
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
}

function normalizeText(content) {
  if (!content) return ''
  return String(content)
    .split('\n')
    .map((l) => l.replace(/\t/g, ' ').trimEnd())
    .filter((l) => l.trim().length > 0)
    .join('\n')
}

export default function GuidePanel({ task, onClose, onMarkDone, onNavigate }) {
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(null)
  const [stepStates, setStepStates] = useState([])

  // Display fallbacks
  const displayTitle = guide?.title || task?.title || 'Task Assistant'
  const displayUrl = guide?.url || task?.portal_url
  const displayUrlNote = guide?.url_note
  const displayIntro =
    guide?.intro ||
    task?.description ||
    'Strategic guidance to help you complete this task quickly and correctly.'

  // Pre-fill data: use backend data if available, else derive from task
  let prefills = []
  if (guide?.prefilled?.length > 0) {
    prefills = guide.prefilled.map((f) => ({
      label: f.label || 'Details',
      value: f.found ? f.value : 'REQUIRED',
      source: f.found
        ? f.source_label?.includes('vault')
          ? 'vault'
          : 'profile'
        : 'missing',
    }))
  } else if (guide?.required_docs?.length > 0) {
    prefills = guide.required_docs.map((d) => ({
      label: d.name,
      value: d.has ? 'AVAILABLE' : 'REQUIRED',
      source: d.has ? 'vault' : 'missing',
    }))
  } else if (task?.required_docs?.length > 0) {
    prefills = task.required_docs.map((d) => ({
      label: d.name,
      value: d.has ? 'AVAILABLE' : 'REQUIRED',
      source: d.has ? 'vault' : 'missing',
      raw: d.has ? d.vault_value : null // Add value if available
    }))
  }

  // Fetch guide data
  useEffect(() => {
    if (!task?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    fetch(`/api/tasks/${task.id}/guide`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        clearTimeout(timeout)
        if (data?.has_guide) {
          // Normalize step descriptions
          if (data.steps && Array.isArray(data.steps)) {
            data.steps = data.steps.map((s) => ({
              ...s,
              description: normalizeText(s.description),
            }))
          }
          if (data.intro) data.intro = normalizeText(data.intro)

          setGuide(data)
          if (data.steps?.length) {
            // First step is active, rest are todo
            setStepStates(data.steps.map((_, i) => (i === 0 ? 'active' : 'todo')))
          }
        } else {
          // Fallback to subtasks if no guide
          if (task.subtasks?.length > 0) {
            setGuide({
              title: task.title,
              intro: task.description,
              steps: task.subtasks.map((s) => ({
                title: s.title,
                description:
                  s.description || 'Essential sub-step to fulfill the requirements of the main task.',
              })),
              has_guide: true,
            })
            setStepStates(task.subtasks.map((_, i) => (i === 0 ? 'active' : 'todo')))
          } else {
            setGuide(null)
          }
        }
        setLoading(false)
      })
      .catch((err) => {
        clearTimeout(timeout)
        console.error('Guide fetch error:', err)
        // Local fallback
        if (task.subtasks?.length > 0) {
          setGuide({
            title: task.title,
            intro: task.description,
            steps: task.subtasks.map((s) => ({ title: s.title, description: '' })),
            has_guide: true,
          })
          setStepStates(task.subtasks.map((_, i) => (i === 0 ? 'active' : 'todo')))
        }
        setLoading(false)
      })
  }, [task?.id])

  const copyText = (key, text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggleStep = (idx) => {
    setStepStates((prev) => {
      const next = [...prev]
      const current = next[idx]

      if (current === 'done') {
        next[idx] = 'active' // Undo
      } else {
        next[idx] = 'done' // Mark done
        // Auto-activate next incomplete step
        const nextIncomplete = next.findIndex((s, i) => i > idx && s === 'todo')
        if (nextIncomplete !== -1) {
          next[nextIncomplete] = 'active'
        }
      }
      return next
    })
  }

  const doneCount = stepStates.filter((s) => s === 'done').length
  const progressPct = stepStates.length ? (doneCount / stepStates.length) * 100 : 0

  return createPortal(
    <AnimatePresence>
      {task && (
        <motion.div
          key="guide-overlay"
          style={S.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Click outside to close
        >
          <motion.div
            key="guide-sheet"
            style={S.sheet}
            initial={{ transform: 'translateY(60%)', opacity: 0.6 }}
            animate={{ transform: 'translateY(0)', opacity: 1 }}
            exit={{ transform: 'translateY(60%)', opacity: 0.6 }}
            onClick={(e) => e.stopPropagation()} // Prevent close on inside click
            transition={{ type: 'spring', damping: 25, stiffness: 200, duration: 0.32 }}
          >
            {/* Handle */}
            <div style={S.handle} />

            {/* Progress bar */}
            <div style={S.progressBar}>
              <motion.div
                style={{ ...S.progressFill, width: `${progressPct}%` }}
                initial={false}
                animate={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Header */}
            <div style={S.header}>
              <div style={S.eyebrow}>GUIDE ME THROUGH THIS</div>
              <h2 style={S.title}>{displayTitle}</h2>
              <div style={S.meta}>
                <span style={S.timeChip}>~{guide?.estimated_mins || '5'} min</span>
                {displayUrl && (
                  <>
                    <span style={S.siteLink}>·</span>
                    <span style={S.siteLink}>{displayUrl.replace(/^https?:\/\//, '')}</span>
                  </>
                )}
                {!displayUrl && displayUrlNote && (
                  <>
                    <span style={S.siteLink}>·</span>
                    <span style={{...S.siteLink, color: 'var(--amber)', fontSize: 10}}>📄 {displayUrlNote}</span>
                  </>
                )}
              </div>
              <button
                style={S.closeBtn}
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.38)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <X size={12} />
              </button>
            </div>

            {/* Scrollable content */}
            <div style={S.scroll}>
              {/* PathFinder Insights Pre-fill Banner */}
              {prefills.length > 0 && (
                <div style={S.prefillBanner}>
                  <div style={S.prefillHead}>
                    <span style={S.prefillStar}>✦</span>
                    <span style={S.prefillTitle}>PathFinder knows these — no need to look them up</span>
                  </div>
                  <div style={S.prefillSub}>Details from your vault and profile, pre-filled for this task.</div>
                  <div>
                    {prefills.map((row, i) => (
                      <div key={i} style={S.prefillField}>
                        <span style={S.pfLabel}>{row.label}</span>
                        <span
                          style={{
                            ...S.pfValue,
                            color: row.source === 'missing' ? 'rgba(255, 255, 255, 0.2)' : '#f7f4ee',
                          }}
                        >
                          {row.value}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {row.source === 'missing' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigate?.('vault');
                              }}
                              style={{
                                ...S.pfSource,
                                background: 'rgba(212, 124, 63, 0.12)',
                                border: '1px solid rgba(212, 124, 63, 0.3)',
                                color: '#d47c3f',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                textTransform: 'uppercase',
                                fontWeight: 800,
                                outline: 'none',
                                fontSize: 11,
                                padding: '4px 12px'
                              }}
                            >
                              <Upload size={12} /> Upload
                            </button>
                          ) : (
                            <div
                              style={{
                                ...S.pfSource,
                                ...(row.source === 'vault'
                                  ? {
                                      background: 'rgba(92, 140, 117, 0.12)',
                                      border: '1px solid rgba(92, 140, 117, 0.25)',
                                      color: '#5c8c75',
                                    }
                                  : {
                                      background: 'rgba(212, 124, 63, 0.1)',
                                      border: '1px solid rgba(212, 124, 63, 0.22)',
                                      color: '#f0a96b',
                                    }),
                                textTransform: 'uppercase',
                                fontWeight: 800
                              }}
                            >
                              from {row.source}
                            </div>
                          )}

                          {row.source !== 'missing' && row.value && row.value !== 'AVAILABLE' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyText('req-' + i, row.value);
                              }}
                              style={{
                                background: copied === 'req-' + i ? 'rgba(92, 140, 117, 0.2)' : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${copied === 'req-' + i ? 'rgba(92,140,117,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: 6,
                                padding: '4px 10px',
                                color: copied === 'req-' + i ? '#5c8c75' : 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase'
                              }}
                            >
                              {copied === 'req-' + i ? 'COPIED' : 'COPY'}
                              <Clipboard size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading state */}
              {loading && !guide && (
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      margin: '0 auto',
                      animation: 'spin 1s linear infinite',
                      opacity: 0.3,
                    }}
                  />
                </div>
              )}

              {/* No guide fallback */}
              {!loading && !guide?.steps?.length && (
                <div style={{ padding: '20px', color: 'rgba(184, 207, 199, 0.55)', lineHeight: 1.6 }}>
                  {displayIntro}
                </div>
              )}

              {/* Steps */}
              {guide?.steps && (
                <div style={S.steps}>
                  {guide.steps.map((step, idx) => {
                    const state = stepStates[idx] || 'todo'
                    const isLast = idx === guide.steps.length - 1

                    return (
                      <div key={idx} style={{ ...S.step, borderBottom: isLast ? 'none' : S.step.borderBottom }}>
                        {/* Step number circle */}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleStep(idx)}
                          style={{
                            ...S.stepNum,
                            ...(state === 'done'
                              ? { background: '#5c8c75' }
                              : state === 'active'
                                ? { background: '#d47c3f' }
                                : { background: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.38)' }),
                          }}
                        >
                          {state === 'done' ? <Check size={12} strokeWidth={4} /> : idx + 1}
                        </motion.div>

                        {/* Step content */}
                        <div onClick={() => toggleStep(idx)} style={{ flex: 1, cursor: 'pointer' }}>
                          <div
                            style={{
                              ...S.stepTitle,
                              color: state === 'todo' ? 'rgba(184, 207, 199, 0.4)' : '#f7f4ee',
                            }}
                          >
                            {step.title}
                          </div>
                          <div style={S.stepDesc}>{step.description}</div>

                          {/* Action buttons */}
                          <div style={S.stepActions}>
                            {/* Open URL button */}
                            {step.action && step.action.type === 'link' && (
                              <a
                                href={step.action.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  ...S.actionBtn,
                                  background: 'rgba(92, 140, 117, 0.1)',
                                  borderColor: 'rgba(92, 140, 117, 0.25)',
                                  color: '#5c8c75',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(92, 140, 117, 0.18)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(92, 140, 117, 0.1)')}
                              >
                                {step.action.label || 'Open Resource'} →
                              </a>
                            )}

                            {/* Copy button */}
                            {step.action && step.action.type === 'copy' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyText(idx, step.action.value)
                                }}
                                style={{
                                  ...S.actionBtn,
                                  background:
                                    copied === idx ? 'rgba(92, 140, 117, 0.15)' : 'rgba(212, 124, 63, 0.1)',
                                  borderColor: copied === idx ? '#5c8c75' : 'rgba(212, 124, 63, 0.25)',
                                  color: copied === idx ? '#5c8c75' : '#f0a96b',
                                }}
                              >
                                {copied === idx ? 'Copied!' : step.action.label || 'Copy ID'}
                                <Clipboard size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* What You'll Get When Done */}
              <div style={S.resultBox}>
                <div style={S.resultLabel}>WHAT YOU'LL GET WHEN DONE</div>
                {guide?.expected_result ? (
                  <div style={S.resultItem}>
                    <span style={{ flexShrink: 0, color: 'rgba(184, 207, 199, 0.3)' }}>→</span>
                    <span>{guide.expected_result}</span>
                  </div>
                ) : (
                  <div style={S.resultItem}>
                    <span style={{ flexShrink: 0, color: 'rgba(184, 207, 199, 0.3)' }}>→</span>
                    <span>The task will be marked as complete in your events timeline.</span>
                  </div>
                )}

                {guide?.what_to_save ? (
                  <div style={S.resultItem}>
                    <span style={{ flexShrink: 0, color: 'rgba(184, 207, 199, 0.3)' }}>→</span>
                    <span>
                      <b>You should save:</b> {guide.what_to_save}
                    </span>
                  </div>
                ) : (
                  <div style={S.resultItem}>
                    <span style={{ flexShrink: 0, color: 'rgba(184, 207, 199, 0.3)' }}>→</span>
                    <span>
                      Any acknowledgement slips, reference numbers, or digital certificates issued during this
                      process.
                    </span>
                  </div>
                )}
              </div>

              {/* Completion CTA */}
              <div style={S.ctaSection}>
                <motion.button
                  whileHover={{ transform: 'translateY(-2px)', boxShadow: '0 6px 22px rgba(212, 124, 63, 0.38)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (onMarkDone) onMarkDone(task.id)
                    onClose()
                  }}
                  style={S.ctaBtn}
                >
                  ✓ I completed this task
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
