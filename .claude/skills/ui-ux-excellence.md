# UI/UX Excellence Skill

**Auto-applies when:** Designing forms, dashboards, user flows, or any interactive UI elements.

## Core UX Principles

### 1. User-Centered Design
- Design for your actual users (people navigating life events)
- Reduce cognitive load - don't make users think
- Progressive disclosure - show complexity gradually
- Clear feedback for every action

### 2. Error Prevention > Error Messages
- Validate inline as user types
- Disable invalid actions (don't just show errors after)
- Provide sensible defaults
- Use constraints to prevent mistakes

### 3. Consistency & Standards
- Follow platform conventions
- Maintain internal consistency
- Use familiar patterns (don't reinvent)
- Keep navigation predictable

## Pathfinder AI UX Patterns

### Form Design

**Good Form UX:**
```jsx
<form className="space-y-6">
  {/* Clear section headers */}
  <div>
    <h3 className="text-lg font-semibold text-zinc-100 mb-4">Life Event Details</h3>

    {/* Labeled inputs with helper text */}
    <div className="space-y-4">
      <div>
        <label htmlFor="event-title" className="block text-sm font-medium text-zinc-300 mb-2">
          What's happening in your life?
        </label>
        <input
          id="event-title"
          type="text"
          className="w-full bg-dark-forest-700 border border-white/10 rounded-lg px-3 py-2 text-zinc-100"
          placeholder="e.g., Moving to Bangalore for a new job"
        />
        <p className="text-xs text-zinc-500 mt-1">
          Be specific - this helps us create a better plan for you
        </p>
      </div>

      {/* Inline validation */}
      <div>
        <label htmlFor="start-date" className="block text-sm font-medium text-zinc-300 mb-2">
          When does this start?
        </label>
        <input
          id="start-date"
          type="date"
          min={new Date().toISOString().split('T')[0]}
          className="w-full bg-dark-forest-700 border border-white/10 rounded-lg px-3 py-2 text-zinc-100"
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        {success && <p className="text-xs text-emerald-400 mt-1">✓ Date selected</p>}
      </div>
    </div>
  </div>

  {/* Clear actions */}
  <div className="flex gap-3">
    <button
      type="submit"
      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
    >
      Create Roadmap
    </button>
    <button
      type="button"
      className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
    >
      Cancel
    </button>
  </div>
</form>
```

**Form UX Checklist:**
- [ ] Every input has a visible label
- [ ] Placeholders show examples, not instructions
- [ ] Helper text explains what's needed
- [ ] Validation happens inline (not just on submit)
- [ ] Error messages are specific and helpful
- [ ] Required fields are clearly marked
- [ ] Tab order is logical
- [ ] Submit button clearly describes the action

### Loading States

**Don't:** Just show a spinner
**Do:** Show context about what's loading

```jsx
{/* Generic loading - BAD */}
{loading && <div className="spinner" />}

{/* Contextual loading - GOOD */}
{loading && (
  <div className="flex items-center gap-3 p-4 bg-dark-forest-800/50 rounded-lg">
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent" />
    <div>
      <p className="text-sm font-medium text-zinc-100">Analyzing your life event...</p>
      <p className="text-xs text-zinc-400">This usually takes 5-10 seconds</p>
    </div>
  </div>
)}
```

### Empty States

**Don't:** Just say "No data"
**Do:** Guide the user to add data

```jsx
{/* Bad empty state */}
{events.length === 0 && <p>No events found.</p>}

{/* Good empty state */}
{events.length === 0 && (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
      <PlusIcon className="w-8 h-8 text-emerald-500" />
    </div>
    <h3 className="text-xl font-semibold text-zinc-100 mb-2">No events yet</h3>
    <p className="text-zinc-400 mb-6 max-w-md mx-auto">
      Create your first life event roadmap and we'll help you navigate every step
    </p>
    <button
      onClick={handleCreateEvent}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors"
    >
      Create Your First Event
    </button>
  </div>
)}
```

### Error States

**Error Message Principles:**
1. Explain what happened
2. Why it happened (if helpful)
3. How to fix it

```jsx
{/* Bad error */}
{error && <div className="text-red-500">Error occurred</div>}

{/* Good error */}
{error && (
  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
    <div className="flex gap-3">
      <AlertIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-medium text-red-400 mb-1">Couldn't create workflow</h4>
        <p className="text-sm text-zinc-300">
          We couldn't process your request because the AI service is temporarily unavailable.
        </p>
        <button
          onClick={retry}
          className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
        >
          Try again
        </button>
      </div>
    </div>
  </div>
)}
```

### Success Feedback

**Principle:** Confirm actions without being annoying

```jsx
{/* Subtle success toast */}
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  className="fixed top-4 right-4 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3"
>
  <CheckIcon className="w-5 h-5" />
  <div>
    <p className="font-medium">Task completed!</p>
    <p className="text-sm opacity-90">Your progress has been saved</p>
  </div>
</motion.div>
```

## User Flow Best Practices

### Task Completion Flow

**Steps:**
1. User sees task card with clear next action
2. Clicks "Open Portal" → new tab opens
3. Returns to Pathfinder, clicks "Upload Receipt"
4. Drag-and-drop or file picker
5. Immediate feedback: "Extracting reference ID..."
6. Success: Shows extracted URN, asks for confirmation
7. Confirmed: Task marked as pending, timeline updated
8. Visual celebration (subtle animation, checkmark)

**UX Principles Applied:**
- Clear next steps
- No context switching (portal opens in new tab)
- Immediate feedback on upload
- Human-in-the-loop (confirms extracted URN)
- Visual progress indication

### Life Event Creation Flow

**Progressive Disclosure:**

**Step 1: Simple Input**
```
"What's happening in your life?"
[Text input: Moving to Bangalore for new job]
[Analyze button]
```

**Step 2: Clarification (only if needed)**
```
"We found a few things to clarify:"
☑ Moving date: March 2026
☐ Do you need a domicile certificate?
☐ What about rent agreement?
[Continue button - enabled only when required items checked]
```

**Step 3: Review Proposed Plan**
```
"Here's your roadmap:"
[Preview of tasks with timelines]
[Edit button] [Approve button]
```

**Step 4: Confirmation**
```
"Your roadmap is ready!"
[Go to dashboard] [Start first task]
```

## Accessibility Requirements

### Keyboard Navigation
```jsx
// All interactive elements must be keyboard accessible
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction()
    }
  }}
>
  Action
</button>

// Skip links for screen readers
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Focus Indicators
```css
/* Always show focus states */
.button:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}
```

### ARIA Labels
```jsx
{/* Descriptive labels for screen readers */}
<button aria-label="Delete task: Domicile Certificate">
  <TrashIcon className="w-5 h-5" />
</button>

<div role="status" aria-live="polite">
  {loading && "Loading tasks..."}
</div>
```

## Mobile UX Considerations

### Touch Targets
- Minimum 44x44px for all interactive elements
- Adequate spacing between buttons (at least 8px)
- No hover-only interactions

### Responsive Patterns
```jsx
{/* Stack on mobile, row on desktop */}
<div className="flex flex-col md:flex-row gap-4">
  <button className="w-full md:w-auto">Action 1</button>
  <button className="w-full md:w-auto">Action 2</button>
</div>

{/* Hide on mobile, show on desktop */}
<div className="hidden md:block">Desktop-only content</div>

{/* Mobile menu */}
<div className="md:hidden">
  <button onClick={toggleMobileMenu}>☰ Menu</button>
</div>
```

## Performance UX

### Perceived Performance
```jsx
{/* Optimistic UI - show result immediately */}
const handleComplete = async (taskId) => {
  // Update UI immediately
  setTasks(tasks.map(t => t.id === taskId ? {...t, completed: true} : t))

  try {
    // Then sync with backend
    await completeTask(taskId)
  } catch (error) {
    // Rollback on error
    setTasks(tasks.map(t => t.id === taskId ? {...t, completed: false} : t))
    showError('Failed to complete task')
  }
}
```

### Skeleton Loaders
```jsx
{loading ? (
  <div className="space-y-4">
    {[1,2,3].map(i => (
      <div key={i} className="animate-pulse">
        <div className="h-20 bg-dark-forest-700 rounded-lg" />
      </div>
    ))}
  </div>
) : (
  <TaskList tasks={tasks} />
)}
```

## Auto-Application Rules

This skill AUTOMATICALLY applies when:
- Designing forms, modals, or input flows
- Creating dashboards or data displays
- Building user-facing features
- User mentions: "form", "input", "dashboard", "UI", "UX", "user flow"

**Mandatory behaviors:**
1. Always provide clear labels and helper text
2. Validate inline, not just on submit
3. Show contextual loading/error states
4. Ensure keyboard accessibility
5. Test on mobile (responsive design)
6. Provide clear next steps to users
