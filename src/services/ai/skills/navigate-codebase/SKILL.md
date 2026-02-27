---
name: navigate-codebase
description: Use this skill for navigating and understanding codebases, especially for generating comprehensive summaries that can be used to make informed changes to the codebase
---

# navigate-codebase

## Overview

This skill provides a structured approach to navigate and understand codebases systematically. It enables you to analyze project structure, identify key components, understand data flow, and generate accurate summaries. For response template, refer to [`template.md`](./references/template.md).


## Workflow Instructions

### Step 1: Identify Documentation
- Search for `README.md`, `CONTRIBUTING.md` files
- Read documentation to understand project purpose
- If no documentation exists, proceed to Step 2

### Step 2: Locate Entry Points
Common locations:
- `app/` - Main application logic, components, routes
- `src/main.tsx` or `src/index.tsx` - React entry points
- `src/app.tsx` - Main application component
- `server.ts` or `index.ts` - Backend entry points

### Step 3: Analyze Entry Point Structure
Read main entry file to understand:
- **Import Structure** - Dependencies and internal imports
- **Component Hierarchy** - How components are nested
- **Data Flow** - State management, props, API integration
- **Configuration** - Environment variables, feature flags

**Focus:** Component wiring and data flow patterns

### Step 4: Map Component Directory
- List `components/` directory
- Identify custom vs. UI library components
- Note naming conventions and organization

### Step 5: Identify UI Component Library
- List `components/ui/` directory
- Document available Shadcn UI or other UI components

### Step 6: Research Unfamiliar Concepts
- Search for usage patterns within codebase
- Read related configuration files
- Document findings for context

### Step 7: Create Visual Structure Diagram
Example:
```
src/app.tsx
├── Layout
│   ├── Header
│   └── Footer
├── Router
│   ├── HomePage
│   └── DashboardPage
└── Providers
    └── ThemeProvider
```

### Step 8: Generate Comprehensive Summary
Include:
1. **Project Overview** - Tech stack, entry points, project type
2. **Architecture Patterns** - Component structure, state management, routing
3. **Key Components** - With file paths
4. **Data Flow** - How data moves through the application
5. **Critical Code Snippets** - Only essential patterns
6. **Development Considerations** - Build tools, environment setup

Use template from [`references/template.md`](./references/template.md)

---

## Rules and Best Practices

### ✅ DO:
- Start by identifying entry points
- Read only necessary files
- Use `codebase-read_multiple_files` for batch reading
- Document architectural patterns
- Provide file paths for all references

### ❌ DON'T:
- Never read `node_modules/` or lock files
- Don't use `codebase-directory_tree` in root
- Don't read unrelated files
- Don't include excessive code snippets
- Don't assume file locations without verification

### 🎯 Efficiency:
- Batch operations when possible
- Use specific search patterns
- Start broad, drill down as needed

---

## Example Workflow

```
1. Search for README.md → Found and read
2. List src/ → Identified src/app.tsx as entry
3. Read src/app.tsx → Understood routing structure
4. List components/ → Found 15 custom components
5. List components/ui/ → Found 20 Shadcn UI components
6. Read key components → Understood data flow
7. Create component tree diagram
8. Generate summary using template
```

---

## Integration with Other Skills

- **`react-coding`** - Use insights to create/edit components
- **`ui-styling`** - Reference discovered UI components
- **`summarize`** - Generate concise summaries

After navigation, switch to these skills for implementation.
