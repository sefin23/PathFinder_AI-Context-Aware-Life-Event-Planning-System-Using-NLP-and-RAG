import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ChevronDown, ChevronUp, Check, ExternalLink, ShieldCheck, FileText } from 'lucide-react'

export default function VaultMatchBanner({ matched = [], missing = [] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (matched.length === 0) return null

  const totalTasks = matched.length + missing.length
  const progressPercent = (matched.length / totalTasks) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ 
        background: '#111d18',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        borderRadius: 16,
        marginBottom: 36,
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        position: 'relative'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap');
      `}</style>
      {/* Top Accent Line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #10b981, transparent)' }} />

      {/* Main Header / Minimized Content */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {/* Icon Container */}
            <div style={{ 
              width: 48, height: 48, borderRadius: 12, background: 'rgba(212, 124, 63, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d47c3f', border: '1px solid rgba(212, 124, 63, 0.2)', flexShrink: 0
            }}>
              <Zap size={20} fill="#d47c3f" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, color: 'white', margin: 0 }}>
                  Vault synced — {matched.length} task{matched.length !== 1 ? 's' : ''} auto-completed
                </h3>
                <span style={{ 
                  fontSize: 10, fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', 
                  padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(16, 185, 129, 0.2)', letterSpacing: '0.05em' 
                }}>
                  SMART MATCH
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(184, 207, 199, 0.6)', margin: 0 }}>
                Documents from your vault matched against requirements. These tasks are already done.
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ 
              width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(184, 207, 199, 0.6)', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Progress Bar Container */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2, marginRight: 16, overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ height: '100%', background: '#10b981', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}
              />
            </div>
            <span style={{ color: '#10b981', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {matched.length} / {totalTasks} done
            </span>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingTop: 24, paddingBottom: 8 }}>
                {/* Auto-Completed Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(184, 207, 199, 0.4)', letterSpacing: '0.1em' }}>AUTO-COMPLETED</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(184, 207, 199, 0.6)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>{matched.length}</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 32 }}>
                  {matched.map((m, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{ 
                        fontSize: 11, padding: '4px 10px', borderRadius: 6,
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.12)',
                        color: '#10b981', fontWeight: 500
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                      {m.task_title || m.vault_doc?.name}
                    </motion.div>
                  ))}
                </div>

                {/* Remaining Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(184, 207, 199, 0.4)', letterSpacing: '0.1em' }}>REMAINING</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(184, 207, 199, 0.6)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>{missing.length}</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {missing.map((r, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ 
                        width: 20, height: 20, borderRadius: 6, border: '1.5px solid rgba(255,255,255,0.1)', 
                        background: 'transparent'
                      }} />
                      <div style={{ flex: 1, fontSize: 13, color: 'rgba(184, 207, 199, 0.6)' }}>
                        {r.title || r}
                      </div>
                      <span style={{ 
                        fontSize: 9, fontWeight: 700, 
                        color: idx < 2 ? '#ef4444' : idx < 4 ? '#d47c3f' : '#6366f1', 
                        background: idx < 2 ? 'rgba(239, 68, 68, 0.08)' : idx < 4 ? 'rgba(212, 124, 63, 0.08)' : 'rgba(99, 102, 241, 0.08)', 
                        padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase'
                      }}>
                        {idx < 2 ? 'High' : idx < 4 ? 'Med' : 'Low'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{ 
        background: 'rgba(0,0,0,0.2)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(184, 207, 199, 0.4)', fontSize: 12 }}>
          <ShieldCheck size={14} /> Auto-matched with AI analysis
        </div>
        <a 
          href="#vault" 
          onClick={(e) => { e.preventDefault(); /* Navigate to vault */ }}
          style={{ fontSize: 13, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
        >
          Open Vault <ExternalLink size={12} />
        </a>
      </div>
    </motion.div>
  )
}
