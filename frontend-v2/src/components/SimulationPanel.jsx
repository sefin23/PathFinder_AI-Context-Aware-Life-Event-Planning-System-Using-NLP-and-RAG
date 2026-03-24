import { motion } from 'framer-motion'
import { Sliders, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import CalendarStrip from './CalendarStrip'

export default function SimulationPanel({ 
  tasks = [], 
  activeTaskId, 
  onSelectTask, 
  delayDays, 
  onDelayChange, 
  simulationResult,
  isLoading,
  onAccept,
  planStartDate
}) {
  const activeTask = tasks.find(t => t.id === activeTaskId)

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 32 }}>
        
        {/* Left: Task Graph / Selection */}
        <div>
          <header style={{ marginBottom: 24 }}>
            <h3 className="font-playfair" style={{ fontSize: 24, color: 'white', marginBottom: 8 }}>
              Simulation <em>Lab</em>
            </h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              Select a task to simulate how a potential delay impacts your downstream commitments and joining date.
            </p>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tasks.filter(t => !t.done).slice(0, 6).map(t => (
              <button
                key={t.id}
                onClick={() => onSelectTask(t.id)}
                style={{
                  width: '100%', padding: '16px 20px', borderRadius: 12, border: '1px solid',
                  textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeTaskId === t.id ? 'rgba(212,124,63,0.1)' : 'rgba(255,255,255,0.02)',
                  borderColor: activeTaskId === t.id ? 'var(--amber)' : 'rgba(255,255,255,0.06)',
                  color: activeTaskId === t.id ? 'white' : 'var(--fog)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{t.title}</span>
                  <span style={{ fontSize: 10, opacity: 0.4 }}>Day {t.suggested_due_offset_days}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: The Slider & Impact Panel */}
        <aside>
          <div style={{ 
            background: 'var(--forest-card)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: 24, boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
          }}>
            {!activeTask ? (
              <div style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, textAlign: 'center' }}>
                <Sliders size={32} style={{ marginBottom: 16 }} />
                <p style={{ fontSize: 12 }}>SELECT A TASK TO START</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)' }} />
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{activeTask.title}</span>
                </div>

                {/* Slider */}
                <div style={{ marginBottom: 32 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <label htmlFor="delay-range" style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', cursor: 'pointer' }}>HYPOTHETICAL DELAY</label>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--amber)' }}>{delayDays} DAYS</span>
                   </div>
                   <input 
                      id="delay-range"
                      type="range" min="0" max="14" step="1"
                      value={delayDays}
                      aria-label="Hypothetical delay days"
                      onChange={(e) => onDelayChange(parseInt(e.target.value))}
                      style={{ 
                        width: '100%', accentColor: 'var(--amber)', cursor: 'pointer',
                        height: 4, borderRadius: 2
                      }}
                   />
                </div>

                {/* Impact Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {isLoading ? (
                     <div style={{ padding: '20px 0', textAlign: 'center', opacity: 0.4 }}>
                        <span className="font-mono" style={{ fontSize: 10 }}>COMPUTING RIPPLE EFFECT...</span>
                     </div>
                   ) : simulationResult ? (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        
                        <div style={{ 
                          padding: 16, borderRadius: 12, background: 'rgba(198,93,74,0.08)', 
                          border: '1px solid rgba(198,93,74,0.2)', marginBottom: 20
                        }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <AlertTriangle size={14} color="var(--coral)" />
                              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--coral)' }}>HIGH SEVERITY</span>
                           </div>
                           <p style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--fog)' }}>
                             This delay impacts {simulationResult.affected_count} downstream tasks. Most notably: {simulationResult.ripple_chain.join(', ')}.
                           </p>
                        </div>

                        <CalendarStrip 
                           baseDate={planStartDate || new Date()} 
                           shiftDays={simulationResult.joining_date_shift_days} 
                        />

                        {/* Copilot Advice */}
                        <div style={{ marginTop: 24, padding: 16, background: 'rgba(56,189,248,0.04)', borderRadius: 12, border: '1px solid rgba(56,189,248,0.1)' }}>
                           <h4 style={{ fontSize: 11, fontWeight: 800, color: '#3182ce', marginBottom: 6, textTransform: 'uppercase' }}>Copilot Advice</h4>
                           <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                             If you must delay this, prioritize {activeTask.title} early tomorrow to preserve the minimum buffer.
                           </p>
                        </div>

                        <button 
                          onClick={onAccept}
                          style={{
                            width: '100%', marginTop: 24, padding: '14px', borderRadius: 12,
                            background: 'white', color: 'var(--forest-deep)', border: 'none',
                            fontWeight: 800, fontSize: 13, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                          }}
                        >
                          <CheckCircle2 size={16} /> Accept & Adjust Timeline
                        </button>

                     </motion.div>
                   ) : (
                     <div style={{ padding: '20px 0', textAlign: 'center', opacity: 0.3 }}>
                        <p style={{ fontSize: 10 }}>ADJUST SLIDER TO SEE IMPACT</p>
                     </div>
                   )}
                </div>

              </div>
            )}
          </div>
        </aside>

      </div>
    </div>
  )
}
