import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, ShieldAlert } from 'lucide-react'
import { getUser } from '../api/backend'

/**
 * SmartAlerts — Intelligent notification system that surfaces 
 * cross-document anomalies and AI-identified risks.
 */
export default function SmartAlerts() {
  const [profile, setProfile] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const user = await getUser(1)
        if (user.extracted_profile) {
          setProfile(JSON.parse(user.extracted_profile))
        }
      } catch (err) {
        console.error('Failed to fetch profile for alerts:', err)
      }
    }
    fetchProfile()
    
    // Listen for custom "vault_updated" event to refresh immediately after upload
    window.addEventListener('vault_updated', fetchProfile)
    
    // Poll every 30 seconds as fallback
    const interval = setInterval(fetchProfile, 30000)
    
    return () => {
      window.removeEventListener('vault_updated', fetchProfile)
      clearInterval(interval)
    }
  }, [])

  if (!profile || !profile.data_inconsistency || dismissed) return null

  return (
    <AnimatePresence>
        <motion.div
          initial={{ height: 0, opacity: 0, scale: 0.98 }}
          animate={{ height: 'auto', opacity: 1, scale: 1 }}
          exit={{ height: 0, opacity: 0, scale: 0.95 }}
          style={{ overflow: 'hidden' }}
        >
          <div style={{
            background: 'rgba(212, 124, 63, 0.05)',
            border: '1px solid rgba(212, 124, 63, 0.15)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            position: 'relative',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '12px',
              background: 'rgba(212, 124, 63, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--amber)', flexShrink: 0
            }}>
              <ShieldAlert size={20} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span className="font-mono" style={{ fontSize: 9, fontWeight: 900, color: 'var(--amber)', letterSpacing: '0.15em' }}>
                  PATHFINDER INSIGHT
                </span>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--amber)', opacity: 0.5 }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>LOGISTICS ALERT</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--on)', fontWeight: 500, lineHeight: 1.4 }}>
                Detected data mismatch: <span style={{ color: 'var(--mu)', fontWeight: 400 }}>{profile.mismatch_details}</span>
              </p>
              <p style={{ fontSize: 11, color: 'var(--mu)', marginTop: 4 }}>
                Your vault documents show conflicting information for your current event's location or details.
              </p>
            </div>

            <button 
              onClick={() => setDismissed(true)}
              style={{
                background: 'rgba(255,255,255,0.03)', border: 'none', color: 'var(--mu)',
                cursor: 'pointer', padding: 6, borderRadius: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
    </AnimatePresence>
  )
}
