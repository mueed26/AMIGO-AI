"use client"

// Dashboard overview with run counts, the shift summary, and recent activity.

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import AgentRunResultDialog, { AgentRunResult } from "@/components/custom/run/AgentRunResultDialog"
import { UserDetailContext } from "@/context/UserDetailContext"
import axios from "axios"
import { ArrowRight, Bot, CalendarClock, CheckCircle2, Clock3, Loader2, RefreshCw, Sparkles, TriangleAlert, Zap } from "lucide-react"
import moment from "moment"
import { useRouter } from "next/navigation"
import React, { useContext, useEffect, useMemo, useState } from "react"

type AgentRunType = AgentRunResult & {
    scheduledFor: string
}

function DashboardPage() {
    const router = useRouter()
    const { userDetail } = useContext(UserDetailContext)
    const [agentRunList, setAgentRunList] = useState<AgentRunType[]>([])
    const [selectedRun, setSelectedRun] = useState<AgentRunType | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getDashboardRuns()
    }, [])

    // Re-check every 5 seconds while a run is still queued or running, so the overview stays live.
    const hasActiveRun = agentRunList.some((run) => run.status == "queued" || run.status == "running")
    useEffect(() => {
        if (!hasActiveRun) return
        const timer = setInterval(() => getDashboardRuns(true), 5000)
        return () => clearInterval(timer)
    }, [hasActiveRun])

    const getDashboardRuns = async (silent = false) => {
        if (!silent) setLoading(true)
        try {
            const result = await axios.get("/api/agentlog")
            setAgentRunList(result.data)
        } finally {
            setLoading(false)
        }
    }

    const dashboardData = useMemo(() => {
        const completed = agentRunList.filter((run) => run.status == "completed")
        const running = agentRunList.filter((run) => run.status == "running" || run.status == "queued")
        const scheduled = agentRunList.filter((run) => run.status == "scheduled")
        const attention = agentRunList.filter((run) => run.status == "failed")

        return {
            completed,
            running,
            scheduled,
            attention,
            latestResults: completed.slice(0, 3),
            runningNow: running[0],
            upNext: scheduled.slice(0, 2),
            needsAttention: attention[0],
        }
    }, [agentRunList])

    const currentUser = Array.isArray(userDetail) ? userDetail[0] : userDetail
    const firstName = currentUser?.name?.split(" ")?.[0] ?? "there"
    const greeting = getGreeting()
    const statCards = [
        { label: "Done", value: dashboardData.completed.length, detail: "runs finished", icon: CheckCircle2, className: "text-ok" },
        { label: "On shift", value: dashboardData.running.length, detail: "working right now", icon: Zap, className: "text-run" },
        { label: "Queued", value: dashboardData.scheduled.length, detail: "waiting for their slot", icon: CalendarClock, className: "text-signal" },
        { label: "Flagged", value: dashboardData.attention.length, detail: "need a second look", icon: TriangleAlert, className: "text-fail" },
    ]

    return (
        <div className="mx-auto w-full max-w-6xl overflow-x-hidden px-5 py-10 md:px-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="label-mono flex items-center gap-2">
                        <Clock3 className="size-3.5 text-signal" />
                        {moment().format("ddd · MMM D · h:mm A")}
                    </p>
                    <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">{greeting}, {firstName}.</h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Here's what your agents got through, what they're on now, and anything that tripped them up.</p>
                </div>
                <Button variant="outline" className="w-fit" onClick={() => getDashboardRuns()} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                    Refresh
                </Button>
            </div>

            <div className="mt-8 grid overflow-hidden rounded-lg border bg-card sm:grid-cols-2 lg:grid-cols-4 lg:divide-x">
                {statCards.map((stat) => (
                    <MetricCard key={stat.label} {...stat} />
                ))}
            </div>

            <section className="bg-scan mt-6 rounded-lg border bg-panel p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="label-mono flex items-center gap-2">
                        <Sparkles className="size-3.5 text-signal" />
                        Shift summary
                    </p>
                    <Button variant="link" className="h-auto px-0 text-signal" onClick={() => router.push("/dashboard/run")}>
                        Open run log <ArrowRight />
                    </Button>
                </div>
                <p className="mt-3 max-w-3xl font-mono text-[13px] leading-6 text-foreground/90">
                    <span className="text-signal">&gt; </span>
                    {buildBriefing(dashboardData.completed.length, dashboardData.running.length, dashboardData.attention.length, dashboardData.scheduled.length, dashboardData.runningNow?.name)}
                </p>
            </section>

            <div className="mt-10 grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
                <main className="min-w-0 space-y-10">
                    <section>
                        <SectionHeading title="Flagged" count={dashboardData.attention.length} />
                        {dashboardData.needsAttention ? (
                            <div className="flex flex-col gap-4 rounded-lg border border-fail/30 bg-fail/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <AgentIdentity run={dashboardData.needsAttention} title={dashboardData.needsAttention.name ?? "Agent run"} subtitle={dashboardData.needsAttention.error ?? "This run stopped and needs a look before it can go again."} />
                                <Button variant="outline" onClick={() => router.push("/dashboard/run")}>Inspect</Button>
                            </div>
                        ) : (
                            <EmptyState icon={<CheckCircle2 className="size-4 text-ok" />} text="Nothing flagged. Every run so far went through cleanly." />
                        )}
                    </section>

                    <section>
                        <SectionHeading title="Fresh results" count={dashboardData.latestResults.length} />
                        <div className="divide-y overflow-hidden rounded-lg border bg-card">
                            {dashboardData.latestResults.length > 0 ? dashboardData.latestResults.map((run) => (
                                <ResultRow key={run.id} run={run} onOpen={() => setSelectedRun(run)} />
                            )) : (
                                <EmptyState icon={<Bot className="size-4" />} text="Finished runs land here with their output." className="rounded-none border-0" />
                            )}
                        </div>
                    </section>
                </main>

                <aside className="min-w-0 space-y-10">
                    <section>
                        <SectionHeading title="On shift now" />
                        {dashboardData.runningNow ? (
                            <div className="rounded-lg border border-run/30 bg-run/5 p-4">
                                <div className="flex items-start gap-3">
                                    <AgentAvatar run={dashboardData.runningNow} />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-medium">{dashboardData.runningNow.name ?? "Agent run"}</h3>
                                        <p className="mt-0.5 truncate text-sm text-muted-foreground">{dashboardData.runningNow.task ?? "Working through its task"}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-3">
                                    <Progress value={dashboardData.runningNow.status == "running" ? 68 : 24} className="flex-1" />
                                    <span className="font-mono text-xs text-run">{dashboardData.runningNow.status}</span>
                                </div>
                            </div>
                        ) : (
                            <EmptyState icon={<Zap className="size-4" />} text="No agent is on shift right now." />
                        )}
                    </section>

                    <section>
                        <SectionHeading title="Coming up" />
                        <div className="divide-y overflow-hidden rounded-lg border bg-card">
                            {dashboardData.upNext.length > 0 ? dashboardData.upNext.map((run) => (
                                <div key={run.id} className="flex items-center gap-3 p-4">
                                    <CalendarClock className="size-4 shrink-0 text-signal" />
                                    <div className="min-w-0">
                                        <h3 className="truncate text-sm font-medium">{run.name ?? "Scheduled agent"}</h3>
                                        <p className="font-mono text-xs text-muted-foreground">{moment(run.scheduledFor).calendar()}</p>
                                    </div>
                                </div>
                            )) : (
                                <EmptyState icon={<CalendarClock className="size-4" />} text="Give an agent a daily slot and it shows up here." className="rounded-none border-0" />
                            )}
                        </div>
                    </section>
                </aside>
            </div>

            <AgentRunResultDialog
                run={selectedRun}
                open={Boolean(selectedRun)}
                onOpenChange={(open) => !open && setSelectedRun(null)}
            />

        </div>
    )
}

function MetricCard({
    label,
    value,
    detail,
    icon: Icon,
    className,
}: {
    label: string,
    value: number,
    detail: string,
    icon: React.ElementType,
    className: string,
}) {
    return (
        <div className="border-b p-5 last:border-b-0 lg:border-b-0">
            <p className={`label-mono flex items-center gap-2 ${className}`}>
                <Icon className="size-3.5" />
                {label}
            </p>
            <p className="mt-4 font-heading text-4xl font-semibold leading-none">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        </div>
    )
}

function SectionHeading({ title, count }: { title: string, count?: number }) {
    return (
        <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold">{title}</h2>
            {count !== undefined && <span className="font-mono text-xs text-muted-foreground">{String(count).padStart(2, "0")}</span>}
        </div>
    )
}

function ResultRow({ run, onOpen }: { run: AgentRunType, onOpen: () => void }) {
    return (
        <div className="flex flex-col gap-3 p-4 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between">
            <AgentIdentity run={run} title={run.name ?? "Agent run"} subtitle={getOutputSummary(run)} />
            <div className="flex items-center gap-4 sm:shrink-0">
                <span className="font-mono text-xs text-muted-foreground">{moment(run.completedAt ?? run.createdAt).fromNow()}</span>
                <Button variant="link" className="h-auto px-0 text-signal" onClick={onOpen}>Read</Button>
            </div>
        </div>
    )
}

function AgentIdentity({ run, title, subtitle }: { run: AgentRunType, title: string, subtitle: string }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <AgentAvatar run={run} />
            <div className="min-w-0">
                <h3 className="truncate font-medium">{title}</h3>
                <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
            </div>
        </div>
    )
}

function AgentAvatar({ run }: { run: AgentRunType }) {
    return (
        <div className="relative shrink-0">
            {run.agentImage ? (
                <img src={run.agentImage} alt={run.name ?? "Agent"} className="size-10 rounded-md border bg-secondary p-1.5" />
            ) : (
                <div className="flex size-10 items-center justify-center rounded-md border bg-secondary">
                    <Bot className="size-4 text-muted-foreground" />
                </div>
            )}
            <span className={`absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-background ${run.status == "failed" ? "bg-fail" : run.status == "completed" ? "bg-ok" : "bg-run"}`} />
        </div>
    )
}

function EmptyState({ icon, text, className = "" }: { icon: React.ReactNode, text: string, className?: string }) {
    return (
        <div className={`flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground ${className}`}>
            {icon}
            {text}
        </div>
    )
}

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
}

function buildBriefing(completed: number, running: number, attention: number, scheduled: number, runningAgent?: string | null) {
    if (completed + running + attention + scheduled == 0) {
        return "Quiet so far. Build an agent or hit run on one, and this summary fills up with what it did."
    }

    const runningText = running > 0 ? `${runningAgent ?? "One agent"} is still working.` : "Nobody is on shift right now."
    return `${completed} ${completed == 1 ? "run" : "runs"} wrapped up recently. ${runningText} ${attention > 0 ? `${attention} ${attention == 1 ? "run was" : "runs were"} flagged for review.` : "Nothing flagged."} ${scheduled > 0 ? `${scheduled} more ${scheduled == 1 ? "is" : "are"} lined up next.` : ""}`
}

function getOutputSummary(run: AgentRunType) {
    if (!run.output) return run.task ?? "Output is ready to read."
    if (typeof run.output == "string") return run.output
    if (run.output.summary) return run.output.summary
    if (run.output.message) return run.output.message
    if (run.output.result) return typeof run.output.result == "string" ? run.output.result : "Output is ready to read."
    return run.task ?? "Output is ready to read."
}

export default DashboardPage
