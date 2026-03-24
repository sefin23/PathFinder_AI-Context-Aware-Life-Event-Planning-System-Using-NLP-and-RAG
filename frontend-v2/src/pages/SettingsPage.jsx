/**
 * SettingsPage — Two-column navigator: left nav sidebar + right content sections.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getUser, updateUser } from '../api/backend'
import { Check, User, Cpu, Bell, Shield, AlertTriangle, ChevronRight, MapPin } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'profile',       label: 'Profile',         icon: User },
  { id: 'ai',            label: 'AI Preferences',  icon: Cpu },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
  { id: 'privacy',       label: 'Privacy & Data',  icon: Shield },
  { id: 'danger',        label: 'Danger Zone',     icon: AlertTriangle, destructive: true },
]

// ── Shared primitives ─────────────────────────────────────────────────────────

function Toggle({ label, sub, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0',
      borderBottom: '1px solid rgba(255,255,255,0.045)',
    }}>
      <div style={{ flex: 1, paddingRight: 24 }}>
        <p style={{
          fontSize: 14, fontWeight: 500, transition: 'color 0.2s',
          color: value ? 'white' : 'rgba(255,255,255,0.5)',
          marginBottom: sub ? 3 : 0,
        }}>
          {label}
        </p>
        {sub && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.27)', lineHeight: 1.4 }}>{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        aria-pressed={value}
        style={{
          width: 44, height: 25, borderRadius: 99, flexShrink: 0,
          background: value ? 'var(--amber)' : 'rgba(255,255,255,0.09)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.25s',
        }}
      >
        <motion.div
          animate={{ x: value ? 21 : 3 }}
          transition={{ type: 'spring', stiffness: 600, damping: 32 }}
          style={{
            position: 'absolute', top: 3.5,
            width: 18, height: 18, borderRadius: '50%',
            background: 'white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          }}
        />
      </button>
    </div>
  )
}

function SectionCard({ title, sub, children, borderColor }) {
  return (
    <div style={{
      background: 'rgba(14,34,29,0.7)',
      border: `1px solid ${borderColor || 'rgba(255,255,255,0.07)'}`,
      borderRadius: 16,
      padding: '28px 32px',
    }}>
      <h2 className="font-playfair" style={{
        fontSize: 22, fontWeight: 700,
        color: borderColor ? 'var(--coral)' : 'white',
        marginBottom: 6,
      }}>
        {title}
      </h2>
      {sub && (
        <p className="font-mono" style={{
          fontSize: 9, letterSpacing: '0.12em', marginBottom: 24,
          color: borderColor ? 'rgba(198,93,74,0.5)' : 'rgba(255,255,255,0.25)',
        }}>
          {sub}
        </p>
      )}
      {children}
    </div>
  )
}

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 10,
  padding: '11px 14px',
  fontSize: 14,
  color: 'white',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s',
  fontFamily: 'DM Sans, sans-serif',
}

// ── Section components ────────────────────────────────────────────────────────

function ProfileSection({ user, jobCity, setJobCity, stateCode, setStateCode, handleSave, saving, saved }) {
  return (
    <SectionCard title="Profile" sub="YOUR IDENTITY & LOCATION CONTEXT">
      {/* Identity block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16, flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(92,140,117,0.35) 0%, rgba(10,26,21,0.8) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, color: 'white',
          fontFamily: 'Playfair Display, serif',
        }}>
          {user?.name ? user.name[0].toUpperCase() : 'S'}
        </div>
        <div>
          <p className="font-playfair" style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8 }}>
            {user?.name || 'Sefin Jose'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(212,124,63,0.1)',
              border: '1px solid rgba(212,124,63,0.22)',
              borderRadius: 99, padding: '3px 10px',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)' }} />
              <span className="font-mono" style={{ fontSize: 9, color: 'var(--amber)', letterSpacing: '0.08em' }}>
                NAVIGATOR FREE
              </span>
            </div>
            {(jobCity || stateCode) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} color="rgba(255,255,255,0.25)" />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                  {jobCity && stateCode ? `${jobCity}, ${stateCode}` : jobCity || stateCode}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
            City / Job Location
          </label>
          <input
            value={jobCity}
            onChange={e => setJobCity(e.target.value)}
            placeholder="e.g. Bangalore"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'rgba(212,124,63,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
            State Code
          </label>
          <input
            value={stateCode}
            onChange={e => setStateCode(e.target.value)}
            placeholder="e.g. KA"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'rgba(212,124,63,0.45)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
          />
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5, marginBottom: 20 }}>
        Used by the AI to surface the right government portals and regional timelines for your plans.
      </p>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          background: saved ? 'rgba(92,140,117,0.15)' : 'rgba(212,124,63,0.15)',
          border: `1px solid ${saved ? 'rgba(92,140,117,0.3)' : 'rgba(212,124,63,0.3)'}`,
          color: saved ? 'var(--emerald)' : 'var(--amber)',
          borderRadius: 10, padding: '10px 22px',
          fontSize: 13, fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 7,
          opacity: saving ? 0.6 : 1,
          transition: 'all 0.2s',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        {saved && <Check size={13} />}
        {saving ? 'Saving…' : saved ? 'Saved' : 'Save Changes'}
      </button>
    </SectionCard>
  )
}

function AIPreferencesSection({ prefs, setPref }) {
  return (
    <SectionCard title="AI Preferences" sub="HOW PATHFINDER GENERATES & PRESENTS PLANS">
      <Toggle
        label="AI Clarification Questions"
        sub="Let the AI ask follow-up questions to sharpen your plan before generating"
        value={prefs.aiClarification}
        onChange={v => setPref('aiClarification', v)}
      />
      <Toggle
        label="Show AI Confidence Scores"
        sub="Display how confident the AI is about each task recommendation"
        value={prefs.aiConfidence}
        onChange={v => setPref('aiConfidence', v)}
      />
      <Toggle
        label="Show AI Suggestion Badges"
        sub="Display sparkle markers on AI-recommended tasks and plans"
        value={prefs.aiBadges}
        onChange={v => setPref('aiBadges', v)}
      />

    </SectionCard>
  )
}

function NotificationsSection({ notifPrefs, setNotifPref }) {
  return (
    <SectionCard title="Notifications" sub="ALERTS & REMINDERS">
      <p className="font-mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', marginBottom: 0 }}>
        JOURNEY ALERTS
      </p>
      <Toggle
        label="Smart Alerts"
        sub="Nudges when tasks are overdue or need attention"
        value={notifPrefs.smartAlerts}
        onChange={v => setNotifPref('smartAlerts', v)}
      />
      <Toggle
        label="Progress Reminders"
        sub="Periodic check-ins on your active life events"
        value={notifPrefs.progressReminders}
        onChange={v => setNotifPref('progressReminders', v)}
      />
      <Toggle
        label="Phase Completed"
        sub="Celebrate when you finish a major phase of your plan"
        value={notifPrefs.phaseComplete}
        onChange={v => setNotifPref('phaseComplete', v)}
      />

      <p className="font-mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', marginTop: 20, marginBottom: 0 }}>
        MILESTONES
      </p>
      <Toggle
        label="Journey Completed"
        sub="Notification when you complete an entire life event plan"
        value={notifPrefs.journeyComplete}
        onChange={v => setNotifPref('journeyComplete', v)}
      />
      <Toggle
        label="Weekly Summary"
        sub="A digest of your progress across all active plans"
        value={notifPrefs.weeklySummary}
        onChange={v => setNotifPref('weeklySummary', v)}
      />
    </SectionCard>
  )
}

function PrivacySection() {
  const btnStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: 'rgba(255,255,255,0.55)',
    borderRadius: 10, padding: '11px 18px',
    fontSize: 13, cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    width: '100%', textAlign: 'left',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'border-color 0.2s',
  }

  return (
    <SectionCard title="Privacy & Data" sub="CONTROL WHAT PATHFINDER KNOWS">
      <div style={{ padding: '14px 0 18px', borderBottom: '1px solid rgba(255,255,255,0.045)', marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>
          Pattern Learning
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', lineHeight: 1.6 }}>
          Let Pathfinder use your journey patterns to improve bottleneck detection.
          No data leaves your device — everything is stored locally.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          style={btnStyle}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}
        >
          <span>Download my data</span>
          <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
        </button>
        <button
          style={btnStyle}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}
        >
          <span>Clear journey history</span>
          <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
        </button>
      </div>
    </SectionCard>
  )
}

function DangerZoneSection() {
  const actionBtnStyle = {
    background: 'transparent',
    border: '1px solid rgba(198,93,74,0.35)',
    color: 'var(--coral)',
    borderRadius: 10, padding: '9px 18px',
    fontSize: 12, cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    display: 'inline-flex', alignItems: 'center', gap: 7,
    transition: 'background 0.2s',
  }

  return (
    <SectionCard title="Danger Zone" sub="IRREVERSIBLE ACTIONS" borderColor="rgba(198,93,74,0.3)">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ padding: '4px 0 20px', borderBottom: '1px solid rgba(255,255,255,0.045)' }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
            Delete all saved plans
          </p>
          <p className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em', lineHeight: 1.5, marginBottom: 14 }}>
            Permanently removes all life events, tasks, and progress data.
          </p>
          <button
            style={actionBtnStyle}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,93,74,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <AlertTriangle size={12} />
            Delete all plans
          </button>
        </div>

        <div style={{ paddingTop: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
            Delete account permanently
          </p>
          <p className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em', lineHeight: 1.5, marginBottom: 14 }}>
            Deletes your account and all associated data. This cannot be undone.
          </p>
          <button
            style={actionBtnStyle}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,93,74,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <AlertTriangle size={12} />
            Delete account
          </button>
        </div>
      </div>
    </SectionCard>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  const [jobCity, setJobCity]   = useState('')
  const [stateCode, setStateCode] = useState('')

  const [prefs, setPrefs] = useState({
    aiClarification: true,
    aiConfidence: false,
    aiBadges: true,
  })

  const [notifPrefs, setNotifPrefs] = useState({
    smartAlerts: true,
    progressReminders: false,
    phaseComplete: true,
    journeyComplete: true,
    weeklySummary: false,
  })

  useEffect(() => {
    getUser(1)
      .then(u => {
        setUser(u)
        setJobCity(u.job_city || '')
        setStateCode(u.state_code || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateUser(1, { job_city: jobCity, state_code: stateCode })
      setUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    finally { setSaving(false) }
  }

  const setPref     = (key, val) => setPrefs(p => ({ ...p, [key]: val }))
  const setNotifPref = (key, val) => setNotifPrefs(p => ({ ...p, [key]: val }))

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <ProfileSection
            user={user}
            jobCity={jobCity} setJobCity={setJobCity}
            stateCode={stateCode} setStateCode={setStateCode}
            handleSave={handleSave} saving={saving} saved={saved}
          />
        )
      case 'ai':
        return <AIPreferencesSection prefs={prefs} setPref={setPref} />
      case 'notifications':
        return <NotificationsSection notifPrefs={notifPrefs} setNotifPref={setNotifPref} />
      case 'privacy':
        return <PrivacySection />
      case 'danger':
        return <DangerZoneSection />
      default:
        return null
    }
  }

  return (
    <div style={{ padding: '40px 40px 80px', maxWidth: 980, margin: '0 auto', width: '100%' }}>

      {/* Page label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-mono"
        style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.14em', marginBottom: 32 }}
      >
        PATHFINDER / SETTINGS
      </motion.p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.08)',
            borderTopColor: 'var(--amber)',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 28, alignItems: 'start' }}
        >
          {/* ── Left nav ── */}
          <div style={{
            background: 'rgba(10,26,21,0.85)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: '10px 0',
            position: 'sticky',
            top: 24,
          }}>
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id
              const Icon = item.icon
              const accentColor = item.destructive ? 'var(--coral)' : 'var(--amber)'
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 18px',
                    background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                    cursor: 'pointer',
                    color: isActive ? accentColor : 'rgba(255,255,255,0.42)',
                    fontSize: 13, fontWeight: 500,
                    fontFamily: 'DM Sans, sans-serif',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.42)' }}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* ── Right content ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
