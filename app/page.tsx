"use client"

// Public landing page shown before users sign in to the dashboard.

import { useUser } from "@clerk/nextjs"
import { ArrowUpRight, Check, Globe, MoonStar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Fake run log for the hero console, so visitors see what a run looks like.
const logLines = [
  { time: "06:58", tag: "queue", text: "inbox-digest picked up by scheduler" },
  { time: "07:00", tag: "gmail", text: "read 11 new messages since yesterday" },
  { time: "07:01", tag: "web", text: "checked 3 job posts for salary + location" },
  { time: "07:02", tag: "docs", text: "wrote 'Morning brief, Oct 24' to Google Docs" },
  { time: "07:02", tag: "done", text: "finished in 2m 14s, next run tomorrow 07:00" },
]

const steps = [
  {
    no: "01",
    title: "Say what you want done",
    text: "Type the job the way you'd explain it to a teammate. If something's vague, AMIGO asks a quick follow-up instead of guessing.",
  },
  {
    no: "02",
    title: "Hand it the right keys",
    text: "Sign in to Gmail, Slack, Notion and friends once. Each agent only gets the apps its job actually needs.",
  },
  {
    no: "03",
    title: "Let it clock in on time",
    text: "Run it now or put it on a daily shift. Every run is logged with its output, so you can check the work over coffee.",
  },
]

const apps = ["Gmail", "Slack", "Notion", "Google Docs", "Google Sheets", "Calendar", "GitHub", "Discord", "LinkedIn", "Outlook", "Reddit", "WhatsApp"]

export default function Home() {
  const { isLoaded, isSignedIn } = useUser()
  const showSignedIn = isLoaded && isSignedIn

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative border-b">
        <div className="bg-dots absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <Image src="/hero-glow.svg" alt="" fill priority className="pointer-events-none object-cover" />

        <div className="relative mx-auto w-full max-w-6xl px-5 md:px-8">
          <header className="flex h-20 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.svg" alt="AMIGO AI logo" width={32} height={32} priority />
              <span className="font-heading text-xl font-semibold tracking-tight">amigo</span>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              <a href="#how" className="label-mono transition-colors hover:text-foreground">How it works</a>
              <a href="#apps" className="label-mono transition-colors hover:text-foreground">Apps</a>
            </nav>

            {!showSignedIn ? (
              <div className="flex items-center gap-1">
                <Link href="/sign-in" className="hidden h-9 items-center px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
                  Log in
                </Link>
                <Link href="/sign-up" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  Get started <ArrowUpRight className="size-4" />
                </Link>
              </div>
            ) : (
              <Link href="/dashboard" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Open console <ArrowUpRight className="size-4" />
              </Link>
            )}
          </header>

          <div className="grid items-center gap-12 pt-14 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20 lg:pb-28">
            <div>
              <p className="label-mono inline-flex items-center gap-2 rounded-full border bg-panel/80 px-3 py-1.5">
                <MoonStar className="size-3.5 text-signal" />
                AI agents that work while you sleep
              </p>
              <h1 className="mt-6 font-heading text-5xl font-semibold leading-[0.98] tracking-tight md:text-7xl">
                Hand off the busywork.
                <span className="block text-signal">Agents take the night shift.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                Describe a job in one sentence. AMIGO builds the agent, plugs it into your apps, and runs it on your schedule, with a log of everything it did.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                {!showSignedIn ? (
                  <>
                    <Link href="/sign-up" className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                      Build an agent free <ArrowUpRight className="size-4" />
                    </Link>
                    <a href="#how" className="inline-flex h-11 items-center rounded-md border bg-panel/80 px-5 text-sm font-medium transition-colors hover:bg-accent">
                      See how it works
                    </a>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard/agents" className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                      Go to my agents <ArrowUpRight className="size-4" />
                    </Link>
                    <Link href="/dashboard/run" className="inline-flex h-11 items-center rounded-md border bg-panel/80 px-5 text-sm font-medium transition-colors hover:bg-accent">
                      Check run log
                    </Link>
                  </>
                )}
              </div>

              <dl className="mt-12 grid max-w-md grid-cols-3 divide-x border-y">
                <Figure value="1" label="sentence to set up" />
                <Figure value="12+" label="apps to plug in" />
                <Figure value="24/7" label="scheduled runs" />
              </dl>
            </div>

            <RunConsole />
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8">
        <p className="label-mono">How it works</p>
        <h2 className="mt-3 max-w-2xl font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          From "I wish someone would do this" to a job that runs itself.
        </h2>
        <div className="mt-12 grid border-t md:grid-cols-3 md:divide-x">
          {steps.map((step) => (
            <div key={step.no} className="border-b py-8 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0">
              <span className="font-mono text-sm text-signal">{step.no}</span>
              <h3 className="mt-4 font-heading text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="apps" className="border-y bg-panel">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="label-mono">Plugs into</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">The apps you already live in.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Connections go through secure OAuth, scoped to your account. Every agent can also browse the live web to check prices, news and facts, and cites where it looked.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {apps.map((app) => (
              <span key={app} className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                <Check className="size-3.5 text-ok" />
                {app}
              </span>
            ))}
            <span className="inline-flex items-center gap-2 rounded-md border border-signal/40 bg-signal/10 px-3 py-2 text-sm text-signal">
              <Globe className="size-3.5" />
              Live web research
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-xl font-heading text-4xl font-semibold leading-tight tracking-tight">
            Your first agent is one sentence away.
          </h2>
          <Link href={showSignedIn ? "/dashboard/agents" : "/sign-up"} className="inline-flex h-11 w-fit items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            {showSignedIn ? "Create an agent" : "Start for free"} <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 md:px-8">
          <span className="label-mono">amigo ai</span>
          <span className="label-mono">built with gemini · openai agents · composio · inngest</span>
        </div>
      </footer>
    </main>
  )
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-4 py-4 first:pl-0">
      <dt className="font-heading text-2xl font-semibold">{value}</dt>
      <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
    </div>
  )
}

function RunConsole() {
  return (
    <div className="overflow-hidden rounded-lg border bg-panel shadow-2xl shadow-black/60">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-white/10" />
          <span className="size-2.5 rounded-full bg-white/10" />
          <span className="size-2.5 rounded-full bg-white/10" />
        </div>
        <span className="label-mono">run log · inbox-digest</span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-ok">
          <span className="size-1.5 animate-pulse rounded-full bg-ok" />
          live
        </span>
      </div>

      <div className="bg-scan space-y-3 p-5 font-mono text-[13px] leading-5">
        {logLines.map((line, index) => (
          <div key={index} className="flex gap-3">
            <span className="shrink-0 text-muted-foreground">{line.time}</span>
            <span className={`w-12 shrink-0 ${line.tag == "done" ? "text-ok" : "text-signal"}`}>{line.tag}</span>
            <span className="text-foreground/90">{line.text}</span>
          </div>
        ))}
        <div className="flex gap-3 text-muted-foreground">
          <span>07:02</span>
          <span className="w-12">idle</span>
          <span className="inline-block h-4 w-2 animate-pulse bg-signal" />
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x border-t">
        <ConsoleStat label="done" value="18" className="text-ok" />
        <ConsoleStat label="on shift" value="2" className="text-run" />
        <ConsoleStat label="queued" value="9" className="text-signal" />
      </div>
    </div>
  )
}

function ConsoleStat({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className="px-5 py-4">
      <p className={`font-heading text-2xl font-semibold ${className}`}>{value}</p>
      <p className="label-mono mt-1">{label}</p>
    </div>
  )
}
