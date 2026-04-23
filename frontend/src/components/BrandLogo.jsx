/**
 * BrandLogo — The official Pathfinder SVG.
 * Inspired by modern Map Pin "P" logo.
 */
import React, { useId } from 'react'

export default function BrandLogo({ size = 32, ...props }) {
  const baseId = useId().replace(/:/g, '')

  return (
    <div style={{ width: size, height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }} {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 700" width="100%" height="100%">
        <defs>
          <linearGradient id={`gradLogo-${baseId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          <filter id={`glow-${baseId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="15" floodColor="#3B82F6" floodOpacity="0.4"/>
          </filter>

          <mask id={`pMask-${baseId}`}>
            {/* Base reveal */}
            <rect x="0" y="0" width="650" height="700" fill="white" />
            
            {/* Vertical stem split and outer loop split */}
            <path d="M 150 700 
                     L 150 140 
                     C 150 80, 200 70, 280 70 
                     L 320 70 
                     C 470 70, 540 140, 540 240 
                     C 540 340, 470 410, 320 410 
                     L 200 410" 
                  fill="none" stroke="black" strokeWidth="16" strokeLinecap="round" />

            {/* Inner Map Pin shape Void (cutout) */}
            <g transform="translate(210, 410) rotate(36.87)">
              <path d="M -96 -128 A 120 120 0 1 1 96 -128 L 0 0 Z" fill="black" stroke="black" strokeWidth="2" strokeLinejoin="round" />
              {/* Restored central map pin dot */}
              <circle cx="0" cy="-200" r="45" fill="white" />
            </g>
          </mask>
        </defs>

        <g filter={`url(#glow-${baseId})`}>
          <path d="M 90 700 
                   L 90 140 
                   C 90 40, 160 30, 280 30 
                   L 320 30 
                   C 510 30, 600 100, 600 240 
                   C 600 380, 510 450, 320 450 
                   L 210 450 
                   L 210 700 Z" 
                fill={`url(#gradLogo-${baseId})`} mask={`url(#pMask-${baseId})`} />
        </g>
      </svg>
    </div>
  )
}
