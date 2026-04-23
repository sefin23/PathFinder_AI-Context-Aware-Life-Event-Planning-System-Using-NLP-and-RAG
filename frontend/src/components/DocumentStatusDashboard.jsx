/**
 * DocumentStatusDashboard — Visual tracker for document collection progress.
 * Collapsed: shows 4-category mini-stats grid.
 * Expanded: acts as header/top bar for RequirementsCard.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CheckCircle2, AlertCircle, ExternalLink, ChevronDown } from 'lucide-react'

const CATEGORY_META = [
  { key: 'arrange_first', label: 'Primary Essentials',   color: '#4ade80' },
  { key: 'third_party',   label: 'From Third Parties',   color: '#38bdf8' },
  { key: 'submission_needs', label: 'Action & Submission', color: '#fbbf24' },
  { key: 'mistakes',      label: 'Common Mistakes',      color: '#f87171' },
]

export default function DocumentStatusDashboard({
  requirements,
  collectedDocs,
  onNavigateToVault,
  isExpanded,
  onToggleExpand,
  isLoading,
  isDemo,
  // Optional: pass grouped doc data so collapsed stats are accurate
  groupedDocs,
}) {
  if (isLoading) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1.5px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: isExpanded ? 0 : 24,
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '40%', height: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: '20%', height: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>
      </div>
    )
  }

  // Build per-category collected counts from collectedDocs + groupedDocs
  const categoryStats = CATEGORY_META.map(cat => {
    const items = groupedDocs?.[cat.key] ?? []
    const total = items.length
    const collected = items.filter(it => collectedDocs?.has(it.id || it.title)).length
    return { ...cat, total, collected }
  })

  const totalDocs = categoryStats.reduce((s, c) => s + c.total, 0)
  const totalCollected = categoryStats.reduce((s, c) => s + c.collected, 0)
  const overallPct = totalDocs > 0 ? Math.round((totalCollected / totalDocs) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: isExpanded
          ? 'rgba(92,140,117,0.08)'
          : 'linear-gradient(135deg, rgba(92,140,117,0.05), rgba(13,26,21,0.3))',
        border: `1.5px solid ${isExpanded ? 'rgba(92,140,117,0.3)' : 'rgba(92,140,117,0.2)'}`,
        borderRadius: isExpanded ? '16px 16px 0 0' : 16,
        padding: '20px 24px',
        marginBottom: isExpanded ? 0 : 24,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      whileHover={{ background: 'rgba(92,140,117,0.1)' }}
      onClick={onToggleExpand}
    >
      {/* ── Header row ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(92,140,117,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={20} color="var(--sage)" />
          </div>
          <div>
            <h3 style={{
              fontSize: 16, fontWeight: 800, color: 'white', margin: 0,
              fontFamily: "'DM Sans', sans-serif"
            }}>
              Document Collection
            </h3>
            <p className="font-mono" style={{
              fontSize: 9, color: 'var(--sage)', margin: 0, marginTop: 2,
              letterSpacing: '0.1em', fontWeight: 700
            }}>
              {totalCollected}/{totalDocs} COLLECTED · {overallPct}% COMPLETE
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isExpanded ? 'white' : 'rgba(255,255,255,0.4)',
            flexShrink: 0
          }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </div>

      {/* ── Overall Progress Bar ───────────────────────────────────── */}
      <div style={{
        height: 5, background: 'rgba(255,255,255,0.06)',
        borderRadius: 3, overflow: 'hidden', marginTop: 16, marginBottom: 16
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${overallPct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--sage), var(--amber))',
            borderRadius: 3,
            boxShadow: '0 0 10px rgba(92,140,117,0.4)'
          }}
        />
      </div>

      {/* ── 2×2 category mini-grid (Always visible as per user request) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        marginBottom: isExpanded ? 24 : 16,
        paddingTop: 8
      }}>
              {categoryStats.map((cat) => {
                const pct = cat.total > 0 ? Math.round((cat.collected / cat.total) * 100) : 0
                const isDone = cat.total > 0 && cat.collected === cat.total
                return (
                  <div key={cat.key} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isDone ? cat.color + '40' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 10,
                    padding: '10px 14px',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', marginBottom: 8
                    }}>
                      <span className="font-mono" style={{
                        fontSize: 9, fontWeight: 800, color: isDone ? cat.color : 'rgba(255,255,255,0.5)',
                        textTransform: 'uppercase', letterSpacing: '0.08em'
                      }}>
                        {cat.label}
                      </span>
                      <span className="font-mono" style={{
                        fontSize: 10, fontWeight: 900,
                        color: isDone ? cat.color : 'rgba(255,255,255,0.6)'
                      }}>
                        {cat.collected}/{cat.total}{isDone ? ' ✓' : ''}
                      </span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                        style={{ height: '100%', background: cat.color, borderRadius: 2 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Vault bridge footer (collapsed) */}
            {totalCollected < totalDocs && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(212,124,63,0.08)',
                border: '1px solid rgba(212,124,63,0.15)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <AlertCircle size={14} color="var(--amber)" />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', flex: 1 }}>
                  Upload missing documents to auto-fill forms and speed up tasks
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigateToVault?.() }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--amber)',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4, padding: 0,
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                >
                  Go to Vault <ExternalLink size={12} />
                </button>
              </div>
            )}
    </motion.div>
  )
}
