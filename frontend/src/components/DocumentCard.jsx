import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Eye, FileText, Edit2, Calendar } from 'lucide-react'

// Preview texture backgrounds — CSS-only per doc type
const PREVIEW_STYLES = {
  identity: {
    background: 'linear-gradient(160deg,#dde8f0 0%,#c8dce8 40%,#b8cce0 100%)',
    overlay: `repeating-linear-gradient(0deg,rgba(100,140,180,.08) 0px,rgba(100,140,180,.08) 1px,transparent 1px,transparent 24px),
             repeating-linear-gradient(90deg,rgba(100,140,180,.08) 0px,rgba(100,140,180,.08) 1px,transparent 1px,transparent 24px)`
  },
  employment: {
    background: 'linear-gradient(160deg,#ede8f5 0%,#ddd4ec 50%,#ccc4e0 100%)',
    overlay: `repeating-linear-gradient(transparent 0,transparent 18px,rgba(140,100,180,.12) 18px,rgba(140,100,180,.12) 19px)`
  },
  education: {
    background: 'linear-gradient(160deg,#e8edf5 0%,#d4dce8 50%,#c8d4e8 100%)',
    overlay: null // Uses specialized frame in CSS
  },
  financial: {
    background: 'linear-gradient(160deg,#f0ede4 0%,#e4dcc8 50%,#d8d0b8 100%)',
    overlay: `repeating-linear-gradient(rgba(160,130,60,.1) 1px,transparent 1px) 0 0/100% 18px,
             repeating-linear-gradient(90deg,rgba(160,130,60,.08) 1px,transparent 1px) 0 0/60px 100%`
  }
}

const STATUS_BADGES = {
  valid: { label: 'Valid', bg: '#4a9e6a' },
  active: { label: 'Active', bg: '#4a9e6a' },
  expiring: { label: 'Expiring', bg: '#c9a84c' },
  needed: { label: 'Needed', bg: '#c65d4a' }
}

// Deterministic tilt from ID so it's stable
const getTilt = (id) => {
  const hash = String(id).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return ((hash % 7) - 3) * 0.7 // Range: -2.1 to +2.1
}

const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function DocumentCard({ doc, onRemove, onRename, onPreview }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(doc.name)

  const tilt = useMemo(() => getTilt(doc.id), [doc.id])
  const preview = PREVIEW_STYLES[doc.doc_type] || PREVIEW_STYLES.identity
  // Map plans_count to a status for display if not provided
  const status = doc.status ? STATUS_BADGES[doc.status] : (doc.plans_count > 0 ? STATUS_BADGES.active : STATUS_BADGES.valid)

  return (
    <>
      <style>{`
        .polaroid-frame {
          background: #f5f0e8;
          border-radius: 4px;
          padding: 8px 8px 22px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8);
          position: relative;
        }
        .doc-preview {
          width: 100%; aspect-ratio: 1.45;
          border-radius: 3px; overflow: hidden; position: relative;
          background: #e8e2d4;
        }
        .preview-icon-wrap {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 52px; height: 52px;
          background: rgba(255,255,255,0.7);
          border-radius: 8px; display: flex;
          align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          backdrop-filter: blur(4px);
          z-index: 2;
        }
        .preview-stamp {
          position: absolute; bottom: 6px; left: 6px; right: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 7px; color: rgba(0,0,0,0.4);
          background: rgba(255,255,255,0.6);
          padding: 3px 6px; border-radius: 3px;
          display: flex; justify-content: space-between;
          backdrop-filter: blur(2px);
          z-index: 3;
        }
        .doc-status-badge {
          position: absolute; top: 12px; right: 12px; z-index: 5;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; font-weight: 600;
          padding: 3px 8px; border-radius: 3px;
          text-transform: uppercase; letter-spacing: .08em;
          color: white;
        }
        .texture-overlay {
          position: absolute; inset: 0; pointer-events: none;
        }
        .education-texture::before {
          content: ''; position: absolute; inset: 8px;
          border: 2px solid rgba(80,100,160,0.2); border-radius: 2px;
        }
        .education-texture::after {
          content: ''; position: absolute; inset: 14px;
          border: 1px solid rgba(80,100,160,0.15); border-radius: 1px;
        }
      `}</style>

      <motion.div
        initial={{ rotate: tilt, opacity: 0, y: 16 }}
        animate={{ rotate: isHovered || isEditing ? 0 : tilt, opacity: 1, y: 0, scale: isHovered || isEditing ? 1.04 : 1 }}
        whileHover={{ y: -8, zIndex: 10 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => { if (!isEditing) onPreview?.(doc); }}
        style={{ position: 'relative', cursor: 'pointer', width: 240 }}
      >
        {/* Physical Pin */}
        <div style={{
          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
          fontSize: 20, zIndex: 10, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
          pointerEvents: 'none', transition: 'transform 0.3s ease'
        }}>
          📌
        </div>

        <div className="polaroid-frame">
          {/* Status Badge - Physical Stamp Look */}
          <div className="doc-status-badge" style={{ 
            background: status.bg,
            transform: `rotate(${tilt * -2}deg) translateY(-2px)`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            opacity: 0.9,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            {status.label === 'VALID' && <ShieldCheck size={10} />}
            {doc.doc_type === 'education' && doc.plans_count > 0 && <Briefcase size={10} style={{ opacity: 0.8 }} />}
            {status.label}
          </div>

          {/* Preview Area */}
          <div className="doc-preview">
            <div style={{
              width: '100%', height: '100%', position: 'relative',
              background: preview.background
            }}>
              {/* Texture Overlays */}
              <div 
                className={`texture-overlay 
                  ${doc.doc_type === 'education' ? 'education-texture' : ''} 
                  ${doc.doc_type === 'employment' ? 'employment-texture' : ''}
                  ${doc.doc_type === 'education_employment' ? 'education-texture employment-texture' : ''}
                `}
                style={{ backgroundImage: preview.overlay }} 
              />
              
              {/* Actual Image Preview */}
              {(doc.storage_url && (doc.name?.toLowerCase().match(/\.(jpg|jpeg|png|webp|avif)$/))) ? (
                <img 
                  src={doc.storage_url} 
                  alt={doc.name}
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'cover', opacity: 0.85, filter: 'sepia(0.1) brightness(1.05)'
                  }}
                />
              ) : null}

              {/* PDF Preview */}
              {(doc.storage_url && doc.name?.toLowerCase().endsWith('.pdf')) ? (
                 <iframe 
                    src={`${doc.storage_url}#toolbar=0&navpanes=0&scrollbar=0`}
                    style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      border: 'none', pointerEvents: 'none', transform: 'scale(1.2)', 
                      transformOrigin: 'top left', opacity: 0.75
                    }}
                    title={doc.name}
                  />
              ) : null}

              <div className="preview-icon-wrap">
                <span style={{ fontSize: 26, filter: 'grayscale(0.2) contrast(0.8)' }}>{doc.icon || '📑'}</span>
              </div>
            </div>

            <div className="preview-stamp">
              <span>VAULT-ID: {doc.id.toString().substring(0, 8)}</span>
              <span>{formatBytes(doc.size_bytes)}</span>
            </div>
          </div>

          {/* Label Area */}
          <div style={{ padding: '10px 4px 2px' }}>
            {isEditing ? (
              <input
                autoFocus
                value={editName}
                aria-label="Rename document"
                onChange={(e) => setEditName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={() => {
                  if (editName !== doc.name) onRename?.(editName);
                  setIsEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editName !== doc.name) onRename?.(editName);
                    setIsEditing(false);
                  }
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditName(doc.name);
                  }
                }}
                style={{
                  width: '100%', padding: '4px 6px', fontSize: 13, border: '1px solid #ddd',
                  borderRadius: 4, background: '#fff', color: '#1a1a1a', marginBottom: 6
                }}
              />
            ) : (
              <div
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                style={{
                  fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 15,
                  color: '#2a2218', marginBottom: 3, lineHeight: 1.2,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}
              >
                {doc.name}
              </div>
            )}
            
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 8,
              color: 'rgba(0,0,0,0.4)', display: 'flex', gap: 6, alignItems: 'center'
            }}>
              <span style={{ textTransform: 'uppercase' }}>
                {doc.doc_type?.replace('_', ' · ')}
              </span>
              <span>·</span>
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {doc.plans_count > 0 ? (
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 7,
                color: 'rgba(0,0,0,0.35)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4
              }}>
                <Calendar size={8} /> Used in {doc.plans_count} plan{doc.plans_count > 1 ? 's' : ''}
              </div>
            ) : (
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 7,
                color: 'rgba(0,0,0,0.35)', marginTop: 4
              }}>
                Not linked to any plan yet
              </div>
            )}

            {/* Intelligence badge — shows when Gemini has read the doc */}
            {doc.extracted_fields && (() => {
              try {
                const fields = JSON.parse(doc.extracted_fields)
                const fieldCount = Object.keys(fields).filter(k => fields[k]).length
                if (!fieldCount) return null
                return (
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 7,
                    color: '#4a9e6a', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4,
                    background: 'rgba(74,158,106,0.08)', border: '1px solid rgba(74,158,106,0.2)',
                    borderRadius: 4, padding: '2px 6px',
                  }}>
                    🧠 {fieldCount} field{fieldCount > 1 ? 's' : ''} read
                  </div>
                )
              } catch { return null }
            })()}
          </div>

          {/* DELETE ACTION - BOTTOM RIGHT */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered && !isEditing ? 1 : 0 }}
            onClick={(e) => { e.stopPropagation(); onRemove?.(doc.id); }}
            style={{
              position: 'absolute', bottom: 10, right: 8,
              width: 36, height: 36, background: 'rgba(198, 93, 74, 0.1)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--coral)', cursor: 'pointer', transition: 'all 0.2s',
              border: '1px solid rgba(198, 93, 74, 0.2)'
            }}
            whileHover={{ background: 'rgba(198, 93, 74, 0.9)', color: 'white', scale: 1.1 }}
          >
            <Trash2 size={16} />
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
