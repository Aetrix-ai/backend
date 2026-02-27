---
name: ui-styling
description: This skill helps style UI components using Tailwind CSS classes and Shadcn UI components. Use when user asks to style components or pages, or during component creation with react-coding skill
---

# ui-styling

## Overview

This skill provides a structured approach to styling UI components using Tailwind CSS utility classes and Shadcn UI components. It emphasizes consistency, responsiveness, and adherence to the project's design system.


## Workflow Instructions

### Step 1: Identify Styling Target
Determine:
- New component or existing component?
- Page-level or component-level styling?
- Theme/color scheme changes needed?

### Step 2: Understand Design System

**Read Design References:**
- `src/index.css` - Color variables, theme definitions
- `components/ui/` - Shadcn UI component patterns

**Real Example from play-ground-vite/src/index.css:**
```css
:root {
    --background: oklch(0.9824 0.0013 286.3757);
    --foreground: oklch(0.3211 0 0);
    --primary: oklch(0.6487 0.1538 150.3071);
    --primary-foreground: oklch(1.0000 0 0);
    --muted: oklch(0.8828 0.0285 98.1033);
    --muted-foreground: oklch(0.5382 0 0);
    --border: oklch(0.8699 0 0);
}

.dark {
    --background: oklch(0.2303 0.0125 264.2926);
    --foreground: oklch(0.9219 0 0);
    --primary: oklch(0.6487 0.1538 150.3071);
}
```

### Step 3: Apply Styling

#### Real-World Example from play-ground-vite
```typescript
// Gradient backgrounds and text
<div className="bg-gradient-to-br from-cyan-500 to-indigo-500">
  <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
    Gradient Text
  </span>
</div>

// Backdrop blur with transparency
<header className="bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">

// Grid overlay pattern
<div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

// Glow effect
<div className="absolute w-[600px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
```

#### Layout with Tailwind
```typescript
// Flexbox
<div className="flex items-center justify-between gap-4">

// Grid (responsive)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Centered content
<div className="flex items-center justify-center min-h-screen">
```

#### Typography
```typescript
<h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter">
<p className="text-zinc-500 text-base sm:text-lg font-light leading-relaxed">
<span className="font-mono text-xs tracking-widest uppercase">
```

#### Colors (Use CSS Variables)
```typescript
// Backgrounds
className="bg-background"        // Main background
className="bg-card"              // Card background
className="bg-primary"           // Primary brand color
className="bg-zinc-950"          // Direct color (when needed)

// Text
className="text-foreground"      // Primary text
className="text-muted-foreground" // Secondary text
className="text-zinc-400"        // Direct color

// Opacity modifiers
className="bg-cyan-400/5"        // 5% opacity
className="border-cyan-400/30"   // 30% opacity
```

#### Spacing & Sizing
```typescript
// Padding
className="p-4 px-6 py-8"

// Margin
className="m-4 mx-auto mt-8"

// Gap
className="gap-2.5 gap-x-6"

// Width/Height
className="w-7 h-7 max-w-5xl min-h-screen"
```

#### Responsive Design
```typescript
// Mobile-first approach
<div className="text-sm sm:text-base md:text-lg lg:text-xl">
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
<div className="px-4 sm:px-6 md:px-8">
```

#### Interactive States
```typescript
<button className="
  bg-gradient-to-r from-cyan-500 to-indigo-500
  hover:from-cyan-400 hover:to-indigo-400
  shadow-lg shadow-cyan-500/20
  transition-all duration-200
">

<div className="border-zinc-700 hover:border-zinc-500 hover:text-zinc-200">
```

---

## Styling Patterns from play-ground-vite

### Pattern 1: Sticky Header with Blur
```typescript
<header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
  <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
    {/* Content */}
  </div>
</header>
```

### Pattern 2: Gradient Logo/Icon
```typescript
<div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
  <span className="text-white font-black text-sm leading-none">A</span>
</div>
```

### Pattern 3: Badge with Status Indicator
```typescript
import { Badge } from "@/components/ui/badge"

<Badge variant="outline" className="text-xs font-mono text-cyan-400 border-cyan-400/30 bg-cyan-400/5">
  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 animate-pulse inline-block" />
  ● Ready
</Badge>
```

### Pattern 4: Hero with Gradient Text
```typescript
<h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none">
  <span className="bg-gradient-to-br from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
    Build the future.
  </span>
  <br />
  <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
    Ship without limits.
  </span>
</h1>
```

### Pattern 5: Gradient Buttons
```typescript
import { Button } from "@/components/ui/button"

<Button className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-semibold px-6 border-0 shadow-lg shadow-cyan-500/20">
  Get Started →
</Button>

<Button variant="outline" className="border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 bg-transparent font-semibold px-6">
  View Docs ↗
</Button>
```

### Pattern 6: Background Effects
```typescript
{/* Grid overlay */}
<div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

{/* Glow blob */}
<div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
```

---

## Rules and Best Practices

### ✅ DO:
- Use Tailwind CSS utility classes exclusively
- Reference CSS variables from `src/index.css` for colors
- Follow mobile-first responsive design
- Use Shadcn UI components from `components/ui/`
- Use opacity modifiers (e.g., `/5`, `/30`, `/80`)
- Apply backdrop-blur for glassmorphism effects
- Provide complete file content when writing

### ❌ DON'T:
- Don't use inline styles or hardcoded CSS
- Don't modify `src/index.css` without explicit user request
- Don't use partial file editing
- Don't ignore responsive design
- Don't skip accessibility considerations

### 🎯 Quality Standards:
- **Consistency:** Use same spacing scale throughout
- **Responsive:** Test mobile, tablet, desktop breakpoints
- **Accessibility:** Sufficient contrast, focus indicators
- **Performance:** Use Tailwind's optimized classes

---

## Integration with Other Skills

- **`react-coding`** - Apply styling during component creation
- **`navigate-codebase`** - Understand existing design patterns
- **`summarize`** - Document styling decisions

**Workflow:** navigate-codebase → react-coding → ui-styling
