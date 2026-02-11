# AGENTS.md - SentryOS Desktop Emulator

## Project Overview

This is a **Next.js 16** application that emulates a Linux-style desktop environment in the browser, branded as "SentryOS". It features draggable/resizable windows, a taskbar, desktop icons, and an AI chat assistant powered by the Claude Agent SDK.

---

## Creating New Agents

When the user requests to create a new agent, follow these guidelines:

### Agent Location

- **All agents must be created in the `Agents` folder on the desktop**
- Agents function as desktop applications within the browser environment
- Each agent should appear as an item in the Agents folder that users can double-click to open

### Agent Architecture

Agents are built using the **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`). Each agent should:

1. Be a self-contained React component in `src/components/desktop/apps/`
2. Have a corresponding API route in `src/app/api/` for Claude SDK interactions
3. Be registered in the Agents folder in `Desktop.tsx`


## Project Structure

```
sentry-desktop-emulator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/route.ts      # Claude Agent SDK API endpoint
│   │   ├── globals.css            # Tailwind + custom desktop styles
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Main entry
│   ├── components/
│   │   ├── desktop/
│   │   │   ├── index.ts           # Barrel exports
│   │   │   ├── types.ts           # TypeScript interfaces
│   │   │   ├── Desktop.tsx        # Main desktop + icons
│   │   │   ├── Window.tsx         # Draggable/resizable windows
│   │   │   ├── WindowManager.tsx  # Window state context
│   │   │   ├── Taskbar.tsx        # Bottom taskbar
│   │   │   ├── DesktopIcon.tsx    # Desktop icon component
│   │   │   └── apps/              # Desktop applications
│   │   │       ├── Chat.tsx       # AI chat interface
│   │   │       ├── Notepad.tsx    # Markdown viewer
│   │   │       └── FolderView.tsx # File browser
│   │   └── ui/                    # shadcn/ui components
│   └── lib/
│       └── utils.ts               # Utilities (cn function)
```

---

## Key Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| @anthropic-ai/claude-agent-sdk | 0.2.x | AI agent integration |
| react-rnd | 10.x | Draggable/resizable windows |
| lucide-react | 0.5x | Icon library |
| shadcn/ui | - | UI components (new-york style) |

---

## Creating a New Agent - Step by Step

### Step 1: Create the Agent Component

Create a new file in `src/components/desktop/apps/`:

```typescript
'use client'

import { useState } from 'react'
// Import necessary dependencies

interface YourAgentProps {
  // Props if needed
}

export function YourAgent({ }: YourAgentProps) {
  // Agent implementation
  // Use Claude Agent SDK for AI functionality

  return (
    <div className="h-full flex flex-col bg-[#1e1a2a] text-white">
      {/* Agent UI */}
    </div>
  )
}
```

### Step 2: Create an API Route (if needed)

Create a route in `src/app/api/your-agent/route.ts`:

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { prompt } = await request.json()

  // Configure the Claude Agent SDK
  const response = await query(prompt, {
    preset: 'claude_code',
    permissionMode: 'bypassPermissions',
    allowDangerouslySkipPermissions: true,
    maxTurns: 10,
    // Add Sentry-specific MCP tools if available
  })

  // Return streaming response
  // See src/app/api/chat/route.ts for SSE pattern
}
```

### Step 3: Register the Agent in the Agents Folder

In `src/components/desktop/Desktop.tsx`, update the `openAgentsFolder` function:

```typescript
const openAgentsFolder = () => {
  const agentsFolderItems: FolderItem[] = [
    {
      id: 'your-agent',
      name: 'Your Agent Name',
      type: 'app',
      icon: 'chat',  // or 'document', 'folder'
      onOpen: () => openYourAgentWindow()
    },
    // ... other agents
  ]

  openWindow({
    id: 'agents-folder',
    title: 'Agents',
    icon: '📁',
    // ... window config
    content: <FolderView items={agentsFolderItems} folderName="Agents" />
  })
}

const openYourAgentWindow = () => {
  openWindow({
    id: 'your-agent',
    title: 'Your Agent Name',
    icon: '🤖',  // Use appropriate emoji
    x: 200,
    y: 80,
    width: 500,
    height: 550,
    minWidth: 350,
    minHeight: 400,
    isMinimized: false,
    isMaximized: false,
    content: <YourAgent />
  })
}
```

---

## Window State Interface

All windows must conform to this interface:

```typescript
interface WindowState {
  id: string
  title: string
  icon: string          // Emoji for window title
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  isMinimized: boolean
  isMaximized: boolean
  isFocused: boolean
  zIndex: number
  content: React.ReactNode
}
```

---

## FolderItem Interface

Items in folders use this interface:

```typescript
interface FolderItem {
  id: string
  name: string
  type: 'folder' | 'file' | 'app'
  icon?: 'folder' | 'document' | 'chat'
  onOpen?: () => void
}
```

---

## Styling Guidelines

### Color Palette (Sentry Brand)

```css
--primary: #7553ff;       /* Sentry Blurple */
--accent: #ff45a8;        /* Sentry Pink */
--background: #1a1625;    /* Dark purple */
--desktop-bg: #0f0c14;    /* Deep purple */
--window-bg: #1e1a2a;     /* Window background */
--window-header: #2a2438; /* Window title bar */
--taskbar-bg: #15121d;    /* Taskbar background */
--muted-foreground: #9086a3;
--secondary: #362552;
```

### Font

- Use **JetBrains Mono** for all text (terminal/code aesthetic)

### Component Styling

- All agent UIs should use dark mode only
- Use Tailwind CSS classes
- Leverage shadcn/ui components from `@/components/ui/`
- Use `cn()` from `@/lib/utils` for conditional classes

---

## Code Conventions

### File Structure

1. **All components use `'use client'`** directive
2. **Barrel exports** via `index.ts` files
3. **Type definitions** in separate `types.ts` files
4. **Apps are self-contained** in `apps/` subdirectory

### Naming

- Component files: PascalCase (e.g., `YourAgent.tsx`)
- API routes: kebab-case directories (e.g., `your-agent/route.ts`)
- Functions: camelCase (e.g., `openYourAgentWindow`)

### Imports

```typescript
// Path aliases
import { Component } from '@/components/desktop'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

---

## Claude Agent SDK Usage

### Streaming Pattern

The project uses Server-Sent Events (SSE) for streaming AI responses:

```typescript
// API route pattern
const encoder = new TextEncoder()
const stream = new ReadableStream({
  async start(controller) {
    for await (const event of response) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
      )
    }
    controller.close()
  }
})

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
})
```

### Tool Display Mapping

When displaying tool usage in the UI:

```typescript
const toolDisplayInfo = {
  'WebSearch': { name: 'Web Search', icon: 'search' },
  'WebFetch': { name: 'Fetching URL', icon: 'globe' },
  'Read': { name: 'Reading File', icon: 'file' },
  'Write': { name: 'Writing File', icon: 'file' },
  'Edit': { name: 'Editing File', icon: 'file' },
  'Glob': { name: 'Finding Files', icon: 'file' },
  'Grep': { name: 'Searching Content', icon: 'search' },
  'Bash': { name: 'Running Command', icon: 'terminal' },
  'Task': { name: 'Running Task', icon: 'wrench' },
}
```

---

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

---

