# AMIGO AI

**Tell it what you need done. It builds an AI agent, connects it to your real tools, and runs it — once, or on a schedule, forever.**

AMIGO AI turns a single plain-English prompt like *"check my inbox every morning and summarize what needs my attention"* into a fully configured, scheduled AI agent — complete with the right tools (Gmail, web research, notion, gooledocs, and dozens more via Composio), a tuned system prompt, and autonomous execution powered by the OpenAI Agents SDK. No workflow builder, no drag-and-drop canvas — just describe the job, answer a couple of clarifying questions if the AI needs them, and the agent is live.

---

## Highlights

- 🧠 **Prompt-to-agent generation** — Google Gemini reads your request, decides which tools/skills it needs, asks clarifying questions when something's ambiguous, and generates a complete agent configuration (instructions, objective, schedule, output format).
- 🔌 **Real tool integrations, not mock actions** — powered by [Composio](https://composio.dev/), agents can authenticate and act on real services (Gmail, Slack, calendars, and more) via OAuth, scoped per user.
- 🌐 **Live web research** — a built-in Browserbase-powered browsing tool lets agents fetch current prices, news, and facts from the open web, with sources cited.
- ⏰ **Autonomous scheduling** — one-off or recurring (daily) runs are queued and executed reliably in the background using [Inngest](https://www.inngest.com/), with credit deduction, retries, and next-run chaining handled automatically.
- 📊 **Dashboard & run history** — track every run's status (scheduled, queued, running, completed, failed), review past outputs, and manage connected integrations from one place.
- 🔐 **Authenticated multi-user app** — built on [Clerk](https://clerk.com/) with a Postgres-backed data layer (per-user agents, tools, credits, and run logs).

## How it works

1. **Describe the agent** — e.g. *"Find AI job postings that match my skills every Monday morning."*
2. **Gemini plans it** — the AI selects relevant tools from the tool catalog, drafts instructions/objective/schedule, and asks follow-up questions if it needs more detail.
3. **Composio wires up the tools** — the agent gets a scoped session with only the toolkits it needs, using the user's connected accounts.
4. **The OpenAI Agents SDK runs it** — the agent executes with its instructions, connected tools, and the read-only web-research tool available.
5. **Inngest handles the clock** — a cron job checks for due runs every 15 minutes, queues them, sleeps until the exact scheduled time, executes, records the result, and (for recurring agents) schedules the next occurrence.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript |
| Auth | [Clerk](https://clerk.com/) |
| Database | [Neon](https://neon.tech/) (serverless Postgres) + [Drizzle ORM](https://orm.drizzle.team/) |
| AI planning | [Google Gemini](https://ai.google.dev/) (`@google/genai`) |
| Agent runtime | [OpenAI Agents SDK](https://github.com/openai/openai-agents-js) |
| Tool integrations | [Composio](https://composio.dev/) (OAuth-connected tools/toolkits) |
| Web research | [Browserbase](https://www.browserbase.com/) |
| Background jobs / scheduling | [Inngest](https://www.inngest.com/) |
| UI | Tailwind CSS 4, shadcn/ui, Recharts |

## Project structure

```
app/
  api/            → route handlers: agent CRUD, run execution, tool connections, inngest, users
  dashboard/      → authenticated app: agents, run history, integrations, profile, settings
components/custom/
  agents/         → agent creation, chat, edit, delete UI
  dashboard/      → dashboard widgets
  run/            → run result views
db/               → Drizzle schema (users, tools, agentConfig, agentRun) + client
inngest/          → background functions: scheduler + executor
lib/              → agent builder, executor, Composio session, Browserbase tool
data/             → Gemini system prompt + structured response schema
```

## Getting started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech/) Postgres database (or any Postgres instance)
- Accounts/API keys for: [Clerk](https://dashboard.clerk.com/), [Composio](https://app.composio.dev/), [Google AI Studio](https://aistudio.google.com/) (Gemini), [Browserbase](https://www.browserbase.com/), and [Inngest](https://app.inngest.com/) (for local dev, the Inngest Dev Server works without an account)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | Postgres connection string (Neon pooled connection recommended) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Clerk sign-in route, e.g. `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Clerk sign-up route, e.g. `/sign-up` |
| `GOOGLE_CLOUD_GEMINI_API_KEY` | Gemini API key used to plan/generate agent configurations |
| `COMPOSIO_API_KEY` | Composio API key for connecting and calling third-party tools |
| `OPENAI_MODEL` | OpenAI model used to run agents (e.g. `gpt-4o-mini`) |
| `BROWSERBASE_API_KEY` | Browserbase API key for the live web-research tool |
| `BROWSERBASE_AGENT_ID` | Browserbase agent ID used for browsing sessions |
| `INJJest` | Injjest event key and signing key for production |


### 3. Set up the database

```bash
npm run db:push       # push the Drizzle schema to your Postgres database
npm run db:studio     # optional: browse your data in Drizzle Studio
```

### 4. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### 5. Run background jobs locally (optional but recommended)

Scheduled agent runs are processed by Inngest. To exercise scheduling locally, run the Inngest Dev Server alongside `npm run dev`:

```bash
npx inngest-cli@latest dev
```

It will discover functions at `http://localhost:3000/api/inngest`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations from schema changes |
| `npm run db:push` | Push the current schema to the database |
| `npm run db:studio` | Open Drizzle Studio |
