"use client"

// Dialog that shows one run: the job, any error, and the agent's output as markdown.

import React from "react"
import moment from "moment"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Bot, CalendarCheck, CircleAlert, ClipboardList } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export type AgentRunResult = {
    id: string
agentId: string
    email: string
    status: string
    output: any
    error: any
    scheduledFor?: string
    completedAt: string | null
    createdAt: string
    name: string | null
    agentImage: string | null
    task: string | null
}

type Props = {
    run: AgentRunResult | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

function AgentRunResultDialog({ run, open, onOpenChange }: Props) {
    const outputText = getPrimaryOutput(run?.output)
    const hasOutput = Boolean(outputText || run?.output)
    const completedTime = run?.completedAt ?? run?.createdAt

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[88vh] overflow-hidden p-0 sm:max-w-3xl">
                <DialogHeader className="border-b px-5 py-4 pr-12">
                    <div className="flex min-w-0 items-center gap-3">
                        {run?.agentImage ? (
                            <img src={run.agentImage} alt={run.name ?? "Agent"} className="size-10 rounded-md border bg-secondary p-1.5" />
                        ) : (
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-secondary">
                                <Bot className="size-4 text-muted-foreground" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <DialogTitle className="truncate font-heading text-lg">{run?.name ?? "Run output"}</DialogTitle>
                            <DialogDescription className="mt-1 flex flex-wrap items-center gap-2">
                                {run?.status && <StatusBadge status={run.status} />}
                                {completedTime && (
                                    <span className="inline-flex items-center gap-1 font-mono text-xs">
                                        <CalendarCheck className="size-3.5" />
                                        {moment(completedTime).format("MMM D, YYYY h:mm A")}
                                    </span>
                                )}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="max-h-[calc(88vh-96px)] overflow-y-auto px-5 py-5">
                    {run?.task && (
                        <section className="mb-5 rounded-lg border bg-panel p-4">
                            <div className="label-mono mb-2 flex items-center gap-2">
                                <ClipboardList className="size-3.5" />
                                The job
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">{run.task}</p>
                        </section>
                    )}

                    {run?.error && (
                        <section className="mb-5 rounded-lg border border-fail/30 bg-fail/5 p-4">
                            <div className="label-mono mb-2 flex items-center gap-2 text-fail">
                                <CircleAlert className="size-3.5" />
                                What went wrong
                            </div>
                            <p className="whitespace-pre-wrap font-mono text-[13px] leading-6 text-fail">{formatValue(run.error)}</p>
                        </section>
                    )}

                    <section>
                        <h3 className="label-mono mb-3">Handed back</h3>
                        {hasOutput ? (
                            <div className="space-y-4">
                                {outputText && (
                                    <div className="agent-markdown rounded-lg border bg-card p-5">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {outputText}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {run?.output && typeof run.output != "string" && (
                                    <details className="rounded-lg border bg-background" open={!outputText}>
                                        <summary className="label-mono cursor-pointer px-4 py-3">Raw payload</summary>
                                        <pre className="max-h-[420px] overflow-auto border-t p-4 font-mono text-xs leading-5 text-muted-foreground">
                                            {formatValue(run.output)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                                Nothing handed back yet. If the run is still going, check again in a minute.
                            </div>
                        )}
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function StatusBadge({ status }: { status: string }) {
    const tone = status == "completed" ? "border-ok/30 text-ok" :
        status == "failed" ? "border-fail/30 text-fail" :
            status == "scheduled" ? "border-border text-muted-foreground" :
                "border-run/30 text-run"
    return (
        <span className={`rounded border px-1.5 py-0.5 font-mono text-[11px] ${tone}`}>
            {status}
        </span>
    )
}

function getPrimaryOutput(output: any) {
    if (!output) return ""
    if (typeof output == "string") return output
    if (typeof output.finalOutput == "string") return output.finalOutput
    if (typeof output.summary == "string") return output.summary
    if (typeof output.message == "string") return output.message
    if (typeof output.result == "string") return output.result
    return ""
}

function formatValue(value: any) {
    if (typeof value == "string") return value

    try {
        return JSON.stringify(value, null, 2)
    } catch {
        return String(value)
    }
}

export default AgentRunResultDialog
