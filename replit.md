# Amina AI Telegram Assistant

## Overview

This is an AI-powered Telegram assistant that roleplays as "Amina" - a 22-year-old woman from Dagestan. The system uses OpenAI's GPT to generate natural, conversational responses in Russian, maintaining a specific personality and communication style. The project includes a web dashboard for monitoring bot activity, managing human handover situations, viewing live logs, and configuring the bot.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Build Tool**: Vite with custom Replit plugins for development
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **Telegram Integration**: Two approaches implemented:
  - `node-telegram-bot-api` for standard bot functionality (polling mode)
  - `telegram` (GramJS) for userbot functionality (acting as a real user account)
- **AI Integration**: OpenAI API (gpt-4o model) with custom system prompt defining Amina's personality
- **Session Management**: Telegram session strings stored in database for userbot persistence

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Tables**:
  - `users`: Telegram user profiles with human mode flag and activity tracking
  - `messages`: Conversation history with role (user/assistant) and content
  - `config`: Key-value store for runtime configuration (session strings, channel IDs, AI instructions)
- **Migrations**: Managed via `drizzle-kit push` command

### API Structure
- `GET /api/status` - Health check with uptime
- `GET /api/logs` - System event logs
- `GET /api/users` - List all users (for handover management)
- `GET /api/users/:id/messages` - Get conversation history for a user
- `POST /api/config/session` - Save userbot session string
- `POST /api/config/channel` - Set configuration channel ID

### Key Design Decisions

**Userbot vs Bot API**: The system supports both a traditional Telegram bot and a userbot (real account automation). The userbot allows more natural interactions since messages appear to come from a real person rather than a bot.

**Human Handover Mode**: Users can be flagged for human intervention via `isHumanMode` field. When enabled, the AI stops responding automatically, allowing a human operator to take over.

**Dynamic AI Instructions**: The system can update its personality/behavior instructions dynamically by reading from a designated Telegram channel, stored in the `config` table.

**Shared Schema**: Database schema and route definitions are in the `shared/` directory, accessible to both frontend and backend for type consistency.

## External Dependencies

### APIs & Services
- **OpenAI API**: Used for generating AI responses (via Replit AI Integrations or direct API key)
  - Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`, or `OPENAI_API_KEY`
- **Telegram Bot API**: For receiving and sending messages
  - Environment variable: `TELEGRAM_BOT_TOKEN`
- **Telegram MTProto (Userbot)**: For userbot functionality
  - Environment variables: `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`
  - Session string stored in database

### Database
- **PostgreSQL**: Primary data store
  - Environment variable: `DATABASE_URL`
  - Managed via Drizzle ORM with `drizzle-kit`

### Replit Integrations
The project includes pre-built modules in `server/replit_integrations/`:
- `batch/`: Utilities for rate-limited batch processing with retries
- `chat/`: Generic chat conversation storage and API routes
- `image/`: Image generation via OpenAI's gpt-image-1 model