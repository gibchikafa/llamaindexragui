# LlamaIndex RAG UI

A ChatGPT-style chat interface built with [Next.js](https://nextjs.org) and [`@llamaindex/chat-ui`](https://github.com/run-llama/chat-ui) for a Hopsworks-deployed RAG (Retrieval-Augmented Generation) agent.

## Features

- **ChatGPT-style layout** — collapsible sidebar with conversation history, centred empty state, and a pinned bottom input bar
- **Markdown rendering** — assistant responses rendered with full markdown support (bold, lists, code blocks, LaTeX)
- **Source cards** — each response displays the retrieved papers as clickable cards linking to their arXiv page, with relevance scores
- **Session continuity** — the backend `session_id` is captured after the first message and sent with every follow-up in the same conversation, so the agent maintains context across turns
- **Persistent history** — conversations are saved to `localStorage` so they survive page refreshes (per-browser, no login required)
- **Collapsible sidebar** — hide/show the conversation list to maximise reading space

## Architecture

```
Browser
  └── Next.js App (App Router)
        ├── /app/page.tsx                  — root page
        ├── /app/layout.tsx                — global layout + fonts
        ├── /app/globals.css               — Tailwind v4 theme tokens
        ├── /app/components/
        │     ├── chat.tsx                 — full layout: sidebar + chat area
        │     └── sidebar.tsx              — conversation list + new-chat button
        ├── /app/hooks/
        │     └── useRagChat.ts            — ChatHandler implementation + localStorage persistence
        └── /app/api/chat/route.ts         — server-side proxy to the RAG backend
```

The Next.js API route (`/api/chat`) acts as a secure proxy — the backend URL and API key never leave the server.

## Configuration

The app is configured via environment variables. Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `LLAMA_INDEX_AGENT_DEPLOYMENT_URL` | Full URL of the RAG agent query endpoint |
| `LLAMA_INDEX_AGENT_DEPLOYMENT_API_KEY` | Hopsworks API key (`Authorization: ApiKey <key>`) |

`.env.local` is gitignored and never committed. In production (Docker, Kubernetes, etc.) set these as regular environment variables — `.env.local` is not required.

Example `.env.local`:

```
LLAMA_INDEX_AGENT_DEPLOYMENT_URL=http://<host>/v1/<project>/<agent-name>/query
LLAMA_INDEX_AGENT_DEPLOYMENT_API_KEY=your-api-key-here
```

The server will throw a clear error at startup if either variable is missing.

## RAG Backend

The agent is a Hopsworks KServe deployment exposing a FastAPI service:

| Field | Value |
|---|---|
| Endpoint | `POST $LLAMA_INDEX_AGENT_DEPLOYMENT_URL` |
| Auth | `Authorization: ApiKey $LLAMA_INDEX_AGENT_DEPLOYMENT_API_KEY` |
| Request | `{ "prompt": "...", "session_id": "..." }` (`session_id` omitted on first turn) |
| Response | `{ "answer": "...", "sources": [...], "session_id": "..." }` |

Sources are arXiv papers returned as `{ title, doc_id, score }` and linked to `https://arxiv.org/abs/<doc_id>`.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install and run

```bash
cp .env.example .env.local   # configure your endpoint and API key
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

To expose on the network:

```bash
npm start -- -H 0.0.0.0 -p 3000
```

## Tech Stack

| Package | Purpose |
|---|---|
| `next` 16 | App framework (App Router, Turbopack) |
| `@llamaindex/chat-ui` | Chat UI primitives (`ChatSection`, `ChatInput`, `MarkdownPartUI`, …) |
| `tailwindcss` v4 | Styling |
| `framer-motion` | Animations (used internally by chat-ui) |
| `lucide-react` | Icons |

## Project Structure

```
app/
  api/chat/route.ts       proxy to backend; injects API key server-side
  components/
    chat.tsx              top-level layout, message list, source cards
    sidebar.tsx           collapsible sidebar with conversation history
  hooks/
    useRagChat.ts         manages messages, conversations, session IDs,
                          and localStorage persistence
  globals.css             Tailwind v4 + shadcn/ui CSS variable tokens
.env.example              template — copy to .env.local to configure
global.d.ts               JSX namespace shim for react-markdown / React 19 compat
```
