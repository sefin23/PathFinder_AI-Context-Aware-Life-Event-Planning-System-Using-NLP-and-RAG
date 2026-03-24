# Frontend Design Skill

**Auto-applies when:** Working on React components, UI layouts, dashboards, or user-facing features.

## Core Principles

### 1. Visual Hierarchy
- Use size, weight, and color to establish importance
- Important elements should be visually dominant
- Group related items together
- Use whitespace to separate distinct sections

### 2. Consistency
- Maintain consistent spacing throughout the app
- Use a defined color palette (from `index.css` variables)
- Typography should follow the Outfit/Inter hierarchy
- Button styles should be uniform across the app

### 3. Accessibility
- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
- All interactive elements must be keyboard accessible
- Form inputs need clear labels
- Error messages should be descriptive and helpful

### 4. Responsive Design
- Mobile-first approach
- Test layouts at 320px, 768px, 1024px, 1440px
- Touch targets minimum 44x44px
- Readable text without zooming

## Pathfinder AI Design System

### Color Palette
```css
/* From index.css */
--dark-forest-900: #0a1810;
--dark-forest-800: #0f2419;
--dark-forest-700: #1a3829;
--emerald-500: #10b981;
--amber-400: #fbbf24;
```

**Usage:**
- Backgrounds: dark-forest shades
- Primary actions: emerald-500
- Warnings/alerts: amber-400
- Text: zinc-100/zinc-300

### Typography Scale
```css
/* Headers */
font-family: 'Outfit', sans-serif;
- H1: text-4xl (36px) font-bold
- H2: text-2xl (24px) font-semibold
- H3: text-xl (20px) font-semibold

/* Body */
font-family: 'Inter', sans-serif;
- Body: text-base (16px)
- Small: text-sm (14px)
- Tiny: text-xs (12px)
```

### Spacing System
Use consistent increments from Tailwind:
- `gap-2` (8px) - tight spacing within components
- `gap-4` (16px) - standard spacing between elements
- `gap-6` (24px) - section spacing
- `gap-8` (32px) - major section breaks
- `p-4`, `p-6`, `p-8` for padding

### Component Patterns

#### Cards
```jsx
<div className="bg-dark-forest-800/50 backdrop-blur-sm border border-white/5 rounded-xl p-6">
  <h3 className="text-xl font-semibold text-zinc-100 mb-2">Card Title</h3>
  <p className="text-sm text-zinc-400">Card description</p>
</div>
```

#### Buttons
```jsx
{/* Primary */}
<button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
  Primary Action
</button>

{/* Secondary */}
<button className="bg-dark-forest-700 hover:bg-dark-forest-600 text-zinc-100 px-4 py-2 rounded-lg transition-colors">
  Secondary Action
</button>

{/* Danger */}
<button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
  Delete
</button>
```

#### Form Inputs
```jsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-zinc-300" htmlFor="input-id">
    Label Text
  </label>
  <input
    id="input-id"
    type="text"
    className="w-full bg-dark-forest-700 border border-white/10 rounded-lg px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
    placeholder="Placeholder text"
  />
  <p className="text-xs text-zinc-500">Helper text</p>
</div>
```

## Layout Best Practices

### Dashboard Layout
```jsx
<div className="min-h-screen bg-dark-forest-900">
  {/* Sidebar */}
  <aside className="fixed left-0 top-0 h-full w-16 bg-dark-forest-800 border-r border-white/5">
    {/* Navigation icons */}
  </aside>

  {/* Main Content */}
  <main className="ml-16 p-8">
    {/* Top Navbar */}
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-zinc-100">Page Title</h1>
      <p className="text-zinc-400 mt-2">Page description</p>
    </header>

    {/* Content Grid */}
    <div className="grid gap-6">
      {/* Content sections */}
    </div>
  </main>
</div>
```

### Task Cards
```jsx
<div className="bg-dark-forest-800/50 border border-white/5 rounded-xl p-6 hover:border-emerald-500/30 transition-colors">
  {/* Icon + Title */}
  <div className="flex items-start gap-4 mb-4">
    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
      <IconComponent className="w-6 h-6 text-emerald-500" />
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-zinc-100">Task Title</h3>
      <p className="text-sm text-zinc-400">Task description</p>
    </div>
  </div>

  {/* Progress Bar */}
  <div className="mb-4">
    <div className="h-2 bg-dark-forest-700 rounded-full overflow-hidden">
      <div className="h-full bg-emerald-500" style={{ width: '60%' }} />
    </div>
  </div>

  {/* Actions */}
  <div className="flex gap-2">
    <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
      Open Portal
    </button>
  </div>
</div>
```

## Micro-interactions

### Hover States
```jsx
{/* Scale up slightly */}
className="transition-transform hover:scale-105"

{/* Brighten background */}
className="transition-colors hover:bg-dark-forest-700"

{/* Border glow */}
className="transition-colors hover:border-emerald-500/50"
```

### Loading States
```jsx
{/* Skeleton loader */}
<div className="animate-pulse">
  <div className="h-4 bg-dark-forest-700 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-dark-forest-700 rounded w-1/2"></div>
</div>

{/* Spinner */}
<div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
```

### Transitions
```jsx
{/* Fade in */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

{/* Slide in from bottom */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  Content
</motion.div>
```

## Common UI Patterns for Pathfinder AI

### Event Card
- Large icon (56px circle)
- Title + description
- Date badge
- Progress bar with stats
- "Open journey" CTA button

### Document Collection Status
- Visual checklist with icons
- Progress indicator (X/Y collected)
- Upload button for missing docs
- "Go to Vault" link

### Task Timeline
- Initial submission date
- Follow-up date
- Final deadline
- Visual progress indicator
- Smart reminders

### Portal Button
- Prominent placement
- Portal name clearly visible
- External link icon
- Opens in new tab
- Disabled state if offline task

## Accessibility Checklist

- [ ] All images have alt text
- [ ] Form inputs have associated labels
- [ ] Interactive elements have focus states
- [ ] Color is not the only indicator (use icons + text)
- [ ] Headings follow logical hierarchy (h1 → h2 → h3)
- [ ] Error messages are descriptive
- [ ] Loading states are announced to screen readers

## Anti-Patterns (DON'T DO)

❌ Default purple/indigo colors (looks generic)
❌ Generic 3-column feature grids
❌ Lorem ipsum or placeholder text
❌ Excessive text without hierarchy
❌ Tiny touch targets (<44px)
❌ Low contrast text
❌ Missing focus indicators
❌ Unclear error messages

## Auto-Application Rules

This skill AUTOMATICALLY applies when:
- Creating new React components
- Modifying UI layouts
- Working on dashboards, task cards, forms
- Building user-facing features
- User mentions: "UI", "design", "layout", "component", "page"

**Mandatory behavior:** Follow the Pathfinder AI design system (dark forest theme, Outfit/Inter fonts, emerald accents).
