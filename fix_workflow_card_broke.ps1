$filePath = 'c:\Users\sefin\OneDrive\Desktop\Pathfinder_AI\frontend-v2\src\components\WorkflowCard.jsx'
$content = Get-Content $filePath
$newSection = @"
                    <div style={{ display: 'flex', gap: 7, flexShrink: 0, alignItems: 'center' }}>
                       <div style={{ position: 'relative' }}>
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!approved) setShowStartPicker(!showStartPicker);
                            }}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: 8, 
                              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
                              padding: '4px 12px', borderRadius: 8, height: 32, 
                              cursor: approved ? 'default' : 'pointer', minWidth: 140 
                            }}
                          >
                            <Calendar size={12} color="var(--emerald)" />
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Start:</span>
                            <span style={{ color: 'white', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                              {startDate ? new Date(startDate).toLocaleDateString('en-GB').replace(/\//g, '-') : 'dd-mm-yyyy'}
                            </span>
                          </div>
                          
                          <AnimatePresence>
                            {showStartPicker && (
                               <div style={{ position: 'absolute', bottom: '100%', right: 0, zIndex: 1000, marginBottom: 10 }}>
                                  <div 
                                    style={{ position: 'fixed', inset: 0, zIndex: -1 }} 
                                    onClick={() => setShowStartPicker(false)} 
                                  />
                                  <CustomDarkCalendar 
                                    selectedDate={startDate ? new Date(startDate) : new Date()}
                                    onSelect={(date) => {
                                      const isoStr = date.toISOString().split('T')[0]
                                      setStartDate(isoStr)
                                      setShowStartPicker(false)
                                    }}
                                    onClose={() => setShowStartPicker(false)}
                                    // Custom style via prop to ensure it pops UP
                                    style={{ bottom: '0', top: 'auto', marginBottom: 12 }}
                                  />
                               </div>
                            )}
                          </AnimatePresence>
                       </div>
                       <button
                         onClick={() => setIsRefining(true)}
                         title="Refine Request"
                         className="btn-cust"
                         style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                         <RefreshCw size={12}/> Refine
                      </button>
"@

# Replace lines 804 to 851 (zero-indexed: 803 to 850)
$newContent = @()
for ($i = 0; $i -lt $content.Count; $i++) {
    if ($i -ge 803 -and $i -le 851) {
        if ($i -eq 803) {
            $newContent += $newSection
        }
        continue
    }
    $newContent += $content[$i]
}

$newContent | Set-Content $filePath -Encoding UTF8
