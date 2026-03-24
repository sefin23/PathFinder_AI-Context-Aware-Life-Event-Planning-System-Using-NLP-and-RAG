import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { forwardRef } from 'react'

const RecommendationsPanel = forwardRef(({ recommendations = [] }, ref) => {
  if (!recommendations || recommendations.length === 0) return null

  return (
    <div ref={ref} style={{ marginTop: 32, scrollMarginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--r-pill)', background: 'rgba(212,124,63,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={18} color="var(--amber)" />
        </div>
        <h3 className="font-playfair" style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--amber)', lineHeight: 1.1 }}>
          Navigational Guidance
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {recommendations.map((rec, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: idx * 0.1 }}
            style={{
              padding: '20px 24px',
              background: 'rgba(255,255,255,0.02)',
              border: '1.5px solid rgba(255,255,255,0.06)',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              gap: 20,
              alignItems: 'flex-start',
              transition: 'all var(--dur-fast) var(--ease-main)'
            }}
            whileHover={{ 
              background: 'rgba(255,255,255,0.04)', 
              borderColor: 'rgba(255,255,255,0.12)',
              x: 4
            }}
          >
            <div style={{ padding: '8px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', marginTop: 2 }}>
              <ArrowRight size={16} color="var(--emerald)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 15, color: 'white', fontWeight: 500, lineHeight: 1.6 }}>
                {rec.message}
              </p>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="font-mono" style={{ fontSize: 9, fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Rationale
                </span>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--muted)', opacity: 0.4 }} />
                <span className="font-mono" style={{ fontSize: 9, color: 'var(--fog)', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                  {rec.reason.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
})

export default RecommendationsPanel

