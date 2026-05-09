# Setup

## Prerequisites

- Node 20+ recommended
- npm (or pnpm/yarn if you adapt commands)

## Install

```bash
npm install
```

## Environment

Copy the example file and fill in keys:

```bash
cp .env.example .env.local
```

See [API_KEYS.md](./API_KEYS.md) for every variable.

Minimum to run the agent:

- `GOOGLE_API_KEY` or `GEMINI_API_KEY` (see [API_KEYS.md](./API_KEYS.md))

Minimum for the interactive map:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## API route shape

CopilotKit’s client calls subpaths such as `GET /api/copilotkit/threads` and `POST /api/copilotkit/agent/default/run`. The handler lives in **`app/api/copilotkit/[[...slug]]/route.ts`** with **`createCopilotRuntimeHandler` `mode: "multi-route"`** so those paths resolve. A file-only `app/api/copilotkit/route.ts` would not receive `/threads` and would 404.

**Important:** the UI must use **REST-style** calls to those subpaths. The `<CopilotKit>` provider therefore sets **`useSingleEndpoint={false}`** in `app/layout.tsx`. The default (`true`) sends every run as `POST /api/copilotkit` with a JSON envelope, which **multi-route mode does not treat as `agent/run`** → `404` / “Agent error”.

### AI SDK “system messages” warning

You may see: *“System messages in the prompt or messages fields can be a security risk…”* — this comes from the Vercel **AI SDK** because CopilotKit’s `BuiltInAgent` injects the system prompt into the message list. It does not mean the request failed. To silence warnings in dev you can set `globalThis.AI_SDK_LOG_WARNINGS = false` early in the server bundle (e.g. `instrumentation.ts`), or ignore the log.

## Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Demo flow (happy path)

1. Optionally set lifestyle context (work location, hours, transport, budget, food).
2. Drop a pin on the map or use **Manual coordinates** → **Set pin from values**.
3. In the agent canvas, ask for what you care about (commute, late night, rent, groceries, comparison of two scenarios, etc.).
4. Confirm the agent calls `research_neighborhood` then **`render_a2ui`** — the main surface should be A2UI, not a wall of text.

For product intent and constraints, read `spec.md` in the repo root.

## Styling note (CopilotKit)

The app imports legacy `@copilotkit/react-ui/styles.css` in `app/layout.tsx`. The `@copilotkit/react-ui/v2/styles.css` bundle targets Tailwind v4 CSS features that do not parse under this project’s PostCSS + Tailwind v3 setup. If you upgrade the app to Tailwind v4 with `@tailwindcss/postcss`, you can switch to v2 styles for the newest CopilotKit chat chrome.
