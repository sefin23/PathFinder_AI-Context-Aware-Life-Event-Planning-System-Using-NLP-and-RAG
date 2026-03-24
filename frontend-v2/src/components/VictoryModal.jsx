import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Trophy, ArrowRight, Share2, Sparkles, PartyPopper, Zap, BookOpen } from 'lucide-react'
import confetti from 'canvas-confetti'

const Particle = ({ color, delay }) => (
  <motion.div
    initial={{ y: 0, x: 0, opacity: 1, scale: 0 }}
    animate={{ 
      y: [0, -100 - Math.random() * 200], 
      x: [0, (Math.random() - 0.5) * 400],
      opacity: [1, 0, 0],
      scale: [0, 1, 0.5],
      rotate: [0, 180 + Math.random() * 360]
    }}
    transition={{ duration: 2 + Math.random() * 2, delay, ease: "easeOut" }}
    style={{
      position: 'absolute',
      width: 8 + Math.random() * 12,
      height: 8 + Math.random() * 12,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      background: color,
      filter: `blur(${Math.random() > 0.8 ? '4px' : '0px'})`,
      pointerEvents: 'none',
      zIndex: 10
    }}
  />
)

export default function VictoryModal({ isOpen, onClose, planTitle, stats, mode = 'complete' }) {
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    color: ['#d47c3f', '#f2c94c', '#5c8c75', '#7ba091', '#c65d4a'][i % 5],
    delay: Math.random() * 0.5
  }))

  const celebrate = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 }

    const randomInRange = (min, max) => Math.random() * (max - min) + min

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)

      const particleCount = 50 * (timeLeft / duration)
      confetti({ 
        ...defaults, particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#d47c3f', '#7ba091', '#f2c94c', '#5c8c75'] 
      })
      confetti({ 
        ...defaults, particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#38bdf8', '#c65d4a', '#f2c94c', '#ffffff'] 
      })
    }, 250)
  }

  const isSave = mode === 'save'

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(5, 12, 10, 0.95)', backdropFilter: 'blur(12px)' }}
          />

          {/* Particles Container - Only show for full completion */}
          {!isSave && (
            <div style={{ position: 'absolute', pointerEvents: 'none' }}>
              {particles.map(p => <Particle key={p.id} color={p.color} delay={p.delay} />)}
            </div>
          )}

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 540,
              background: 'var(--forest-card)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 32,
              padding: '48px 40px',
              textAlign: 'center',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.5), 0 0 100px rgba(212, 124, 63, 0.15)',
              paddingBottom: 40,
              overflow: 'hidden'
            }}
          >
            {/* Glossy top highlight */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)', pointerEvents: 'none' }} />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
              transition={{ delay: 0.3, type: 'spring', duration: 1 }}
              style={{ 
                width: 100, height: 100, borderRadius: 32, 
                background: isSave ? 'rgba(212, 124, 63, 0.1)' : 'rgba(212, 124, 63, 0.1)', 
                border: isSave ? '2px solid var(--amber)' : '2px solid #d47c3f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 32px', position: 'relative'
              }}
            >
              {isSave ? (
                <Sparkles size={48} color="var(--amber)" strokeWidth={1.5} />
              ) : (
                <Trophy size={48} color="#d47c3f" strokeWidth={1.5} />
              )}
              <motion.div 
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ position: 'absolute', inset: -4, borderRadius: 36, border: `2px solid ${isSave ? 'var(--amber)' : '#d47c3f'}`, opacity: 0.3 }} 
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="font-playfair" style={{ fontSize: 36, fontWeight: 900, color: 'white', margin: '0 0 16px', lineHeight: 1.1 }}>
                {isSave ? 'Roadmap Secured' : 'Journey Complete'}
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: '0 auto 40px', maxWidth: 400 }}>
                {isSave ? (
                   <>Your journey for <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{planTitle}</span> has been mapped. Your path is now secured.</>
                ) : (
                   <>You've successfully cleared every hurdle for <span style={{ color: '#d47c3f', fontWeight: 700 }}>{planTitle}</span>. Your new chapter is ready to begin.</>
                )}
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 48 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: '16px 8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                {isSave ? (
                   <Zap size={20} color="var(--amber)" style={{ margin: '0 auto 8px' }} />
                ) : (
                   <CheckCircle2 size={20} color="#d47c3f" style={{ margin: '0 auto 8px' }} />
                )}
                <p style={{ fontSize: 18, fontWeight: 900, color: 'white', margin: 0 }}>{stats.tasks}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isSave ? 'Steps' : 'Tasks'}
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: '16px 8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                {isSave ? (
                   <BookOpen size={20} color="var(--amber)" style={{ margin: '0 auto 8px' }} />
                ) : (
                   <Sparkles size={20} color="#f2c94c" style={{ margin: '0 auto 8px' }} />
                )}
                <p style={{ fontSize: 18, fontWeight: 900, color: 'white', margin: 0 }}>{stats.docs}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isSave ? 'Guides' : 'Docs'}
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: '16px 8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: 'white', display: 'block', height: 20, lineHeight: '20px', marginBottom: 8 }}>
                  {isSave ? 'Ready' : '100%'}
                </span>
                <p style={{ fontSize: 18, fontWeight: 900, color: 'white', margin: 0 }}>
                  {isSave ? 'Begin' : 'Done'}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</p>
              </motion.div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <motion.button
                whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                style={{
                  flex: 1,
                  background: 'var(--amber)',
                  color: 'var(--forest-deep)',
                  border: 'none',
                  borderRadius: 16,
                  height: 56,
                  fontWeight: 900,
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  boxShadow: `0 8px 16px rgba(212, 124, 63, 0.3)`
                }}
              >
                {isSave ? 'View Roadmap' : 'Return to Dashboard'} <ArrowRight size={18} />
              </motion.button>
              {!isSave && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05, background: 'rgba(212,124,63,0.15)', color: '#d47c3f' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={celebrate}
                    aria-label="Celebrate again"
                    title="Celebrate Again!"
                    style={{
                      width: 56,
                      height: 56,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.7)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <PartyPopper size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.08)' }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Share completion"
                    style={{
                      width: 56,
                      height: 56,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.7)'
                    }}
                  >
                    <Share2 size={20} />
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
