# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

UIGen is an AI-powered React component generator that creates interactive components with live preview. It uses a virtual file system architecture where no files are written to disk - everything operates in-memory and is synchronized with the browser preview in real-time.

## Development Commands

### Setup
```bash
npm run setup              # Install dependencies, generate Prisma client, run migrations
```

### Development
```bash
npm run dev               # Start Next.js dev server with Turbopack
npm run dev:daemon        # Start dev server in background (logs to logs.txt)
```

### Testing
```bash
npm test                  # Run all tests with Vitest
npm test -- <file-path>   # Run specific test file
```

### Database
```bash
npx prisma generate       # Regenerate Prisma client after schema changes
npx prisma migrate dev    # Create and apply new migration
npm run db:reset          # Reset database (warning: deletes all data)
npx prisma studio         # Open Prisma Studio GUI
```

### Build
```bash
npm run build             # Build for production
npm start                 # Start production server
npm run lint              # Run ESLint
```

## Architecture

### Virtual File System

The core architecture revolves around `VirtualFileSystem` (src/lib/file-system.ts), which manages an in-memory file tree:

- **No disk I/O**: All file operations happen in memory
- **Serialization**: File system state is serialized to JSON and stored in the database
- **Real-time sync**: Changes propagate to the preview iframe immediately
- **Path normalization**: All paths are normalized (start with `/`, no trailing slashes)

Key operations:
- `createFile(path, content)` - Creates files with automatic parent directory creation
- `updateFile(path, content)` - Updates file content
- `serialize()` / `deserializeFromNodes()` - Converts to/from JSON for database storage

### AI Integration Flow

1. **User sends message** → ChatContext (src/lib/contexts/chat-context.tsx)
2. **POST to `/api/chat/route.ts`** with messages and current file system state
3. **AI SDK streamText** uses two tools to manipulate files:
   - `str_replace_editor` (src/lib/tools/str-replace.ts) - View, create, and edit files
   - `file_manager` (src/lib/tools/file-manager.ts) - Rename/move/delete files
4. **onFinish callback** saves updated messages and file system to database
5. **Client-side tool handlers** in FileSystemContext mirror tool actions locally
6. **Preview updates** automatically via PreviewFrame component

### Live Preview System

The preview (src/components/preview/PreviewFrame.tsx) uses a sophisticated iframe-based rendering:

1. **JSX Transformation** (src/lib/transform/jsx-transformer.ts):
   - Transpiles JSX/TSX to ES modules using @babel/standalone
   - Detects and processes CSS imports
   - Creates import maps with blob URLs for each transformed module
   - Third-party packages resolved via esm.sh CDN
   - Supports `@/` path alias for local imports

2. **Import Map Generation**:
   - Each transformed file gets a blob URL
   - Import map resolves all variations: `/App.jsx`, `@/App.jsx`, `@/App`, etc.
   - Missing imports get placeholder modules to prevent errors

3. **Preview HTML**:
   - Uses `<script type="importmap">` for module resolution
   - Includes Tailwind CSS via CDN
   - Error boundary for runtime errors
   - Syntax errors displayed with file location and line numbers

### Authentication & Persistence

- **Auth** (src/lib/auth.ts): JWT-based sessions using jose library
- **Anonymous users**: Can work without login; work tracked via localStorage (src/lib/anon-work-tracker.ts)
- **Registered users**: Projects saved to SQLite via Prisma
- **Middleware** (src/middleware.ts): Injects session into request headers

**Database schema**: Reference `prisma/schema.prisma` for all questions about where data is stored. This file contains the complete database structure including:
- `User`: email/password authentication
- `Project`: name, messages (JSON), data (serialized file system)

### Context Architecture

Three React contexts manage application state:

1. **FileSystemContext** (src/lib/contexts/file-system-context.tsx):
   - Wraps VirtualFileSystem instance
   - Manages selected file state
   - Handles tool calls from AI (mirrors server-side changes)
   - Triggers UI refreshes when files change

2. **ChatContext** (src/lib/contexts/chat-context.tsx):
   - Uses Vercel AI SDK's `useChat` hook
   - Sends file system state with each message
   - Processes streaming responses and tool calls
   - Saves to database for authenticated users

3. **useAuth** (src/hooks/use-auth.ts):
   - Client-side auth state management
   - Handles login/logout/signup

### AI Provider Configuration

The app supports both real and mock AI providers (src/lib/provider.ts):

- **With ANTHROPIC_API_KEY**: Uses Claude AI via @ai-sdk/anthropic
- **Without API key**: Returns mock static responses for testing
- **System prompt** (src/lib/prompts/generation.tsx): Instructs AI to:
  - Always create `/App.jsx` as entry point
  - Use Tailwind CSS for styling
  - Import local files with `@/` alias
  - Keep responses brief

## File Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/chat/          # Streaming AI chat endpoint
│   ├── [projectId]/       # Project-specific page
│   └── page.tsx           # Homepage
├── components/
│   ├── chat/              # Chat UI (messages, input, markdown)
│   ├── editor/            # Code editor and file tree
│   ├── preview/           # Live preview iframe
│   ├── auth/              # Login/signup forms
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── contexts/          # React context providers
│   ├── tools/             # AI tool implementations
│   ├── transform/         # JSX→ES module transformer
│   ├── prompts/           # AI system prompts
│   ├── file-system.ts     # Virtual file system core
│   ├── auth.ts            # JWT session management
│   └── prisma.ts          # Database client
├── actions/               # Server actions for projects
└── hooks/                 # React hooks
```

## Key Patterns

### Adding New AI Tools

To give the AI new capabilities:

1. Create tool definition in `src/lib/tools/` using Vercel AI SDK's `tool()` helper
2. Add to `tools` object in `src/app/api/chat/route.ts`
3. Add client-side handler in `FileSystemContext.handleToolCall()` if UI needs to react

### Modifying File System Behavior
#
The VirtualFileSystem class is server-side only. Client-side operations go through FileSystemContext which wraps it. When changing file operations:

1. Update `VirtualFileSystem` class (src/lib/file-system.ts)
2. Update corresponding tool if affected (str-replace or file-manager)
3. Update FileSystemContext handlers if needed
4. Add tests in `src/lib/__tests__/file-system.test.ts`

### Preview Transformations

The preview transformer handles JSX→JavaScript conversion:

- **Entry point detection**: Looks for `/App.jsx`, `/App.tsx`, `/index.jsx`, or first .jsx file
- **CSS handling**: Extracts CSS imports, injects as `<style>` tags
- **Error handling**: Syntax errors displayed in preview with file/line info
- **Path aliases**: `@/` resolves to root `/`

### Database Schema Reference

**Always check `prisma/schema.prisma`** when you have questions about:
- Where specific data is stored
- Database table structure and fields
- Relationships between models
- Field types and constraints

## Important Constraints

- The AI generates only React components (JSX/TSX), not HTML files
- `/App.jsx` must exist and export a default component
- All styling uses Tailwind CSS classes (loaded via CDN)
- Local imports must use `@/` alias (e.g., `import Calc from '@/components/Calculator'`)
- Virtual file system operates on root path `/` (not a real filesystem)
- Projects are saved only for authenticated users; anonymous work is ephemeral (tracked in localStorage)
