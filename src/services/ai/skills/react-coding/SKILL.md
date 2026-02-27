---
name: react-coding
description: Use this skill for creating new React components, editing existing components, or any code modifications. Use when user asks to create new components or edit files in the codebase
---

# react-coding

## Overview

This skill provides a structured approach to creating, editing, and integrating React components within an existing codebase. It emphasizes React best practices, component reusability, and seamless integration with Shadcn UI components.


## Workflow Instructions

### Step 1: Analyze User Request

**Decision Tree:**
1. Does request require a new component? → Go to Step 2
2. Can existing components be reused? → Check `components/` and `components/ui/`
3. Need modification? → Go to Step 3

**Action:** Use `codebase-list_directory` and `codebase-search_files` to explore existing components.

### Step 2: Creating Custom Components

#### Component Planning
Determine:
- Component name (PascalCase)
- Props interface (TypeScript)
- Required Shadcn UI components from `components/ui/`
- State management needs

#### Real Example from play-ground-vite
```typescript
// templates/play-ground-vite/src/App.tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Nav */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-black text-sm leading-none">A</span>
            </div>
            <span className="font-bold tracking-widest text-sm uppercase text-zinc-100">
              Aetrix<span className="text-cyan-400">.ai</span>
            </span>
          </div>
          <Badge variant="outline" className="text-xs font-mono text-cyan-400 border-cyan-400/30 bg-cyan-400/5">
            ● Ready
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-28">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter">
          <span className="bg-gradient-to-br from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Build the future.
          </span>
        </h1>
        
        <div className="flex items-center gap-3 pt-6">
          <Button className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400">
            Get Started →
          </Button>
          <Button variant="outline" className="border-zinc-700 hover:border-zinc-500">
            View Docs ↗
          </Button>
        </div>
        
        <Separator className="bg-zinc-800/60 w-48 mt-4" />
      </section>
    </div>
  )
}
```

#### Best Practices Checklist
- [ ] TypeScript interfaces defined
- [ ] Uses Shadcn UI components from `components/ui/`
- [ ] Tailwind classes for styling (no hardcoded styles)
- [ ] Responsive design (mobile-first)
- [ ] Proper exports (named exports)

#### File Organization
```
components/
├── UserProfile.tsx       ← Custom components here
├── Dashboard.tsx
└── ui/                   ← DO NOT MODIFY (Shadcn UI)
    ├── button.tsx
    ├── card.tsx
    ├── badge.tsx
    └── ...
```

**Action:** Use `codebase-write_file` to create component in `components/` directory.

### Step 3: Editing Existing Components

**Process:**
1. Use `codebase-read_file` to read target file
2. Understand current implementation
3. Make necessary changes
4. Use `codebase-write_file` with **COMPLETE** file content

**Important:** No partial editing - always provide entire file content.

---

## Common Patterns with Shadcn UI

### Pattern 1: Hero Section with Badge & Buttons
```typescript
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-6">
      <Badge variant="outline" className="font-mono text-xs mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 animate-pulse inline-block" />
        New Feature
      </Badge>
      
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
        <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          Your Headline
        </span>
      </h1>
      
      <div className="flex gap-3 mt-6">
        <Button className="bg-gradient-to-r from-cyan-500 to-indigo-500">
          Get Started
        </Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </section>
  )
}
```

### Pattern 2: Navigation Header
```typescript
import { Badge } from "@/components/ui/badge"

export function Header() {
  return (
    <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500 to-indigo-500">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <span className="font-bold tracking-widest text-sm uppercase">
            Brand
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          ● Status
        </Badge>
      </div>
    </header>
  )
}
```

### Pattern 3: Card Grid with Tabs
```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Dashboard() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">1,234</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
```

---

## Rules and Best Practices

### ✅ DO:
- Use functional components with hooks
- Define TypeScript interfaces for all props
- Use Shadcn UI components from `components/ui/`
- Apply Tailwind CSS classes for styling
- Build responsive components (mobile-first)
- Use semantic HTML elements
- Provide complete file content when writing

### ❌ DON'T:
- Don't use class components
- Don't hardcode inline styles
- Don't modify `components/ui/` directory
- Don't use partial file editing
- Don't ignore TypeScript errors
- Don't skip prop type definitions

### 🎯 Code Quality:
- **TypeScript:** Always define interfaces
- **Composition:** Build from Shadcn UI primitives
- **Responsive:** Use Tailwind breakpoints (sm:, md:, lg:)
- **Accessibility:** Use proper ARIA labels and semantic HTML

---

## Integration with Other Skills

- **`navigate-codebase`** - Understand project structure first
- **`ui-styling`** - For custom styling beyond Tailwind
- **`summarize`** - Document component functionality

**Workflow:** navigate-codebase → react-coding → ui-styling (if needed)
