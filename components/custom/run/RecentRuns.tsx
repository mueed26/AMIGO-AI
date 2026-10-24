"use client"

// Table of agent runs with status, timing and a link to each result.

import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import AgentRunResultDialog, { AgentRunResult } from './AgentRunResultDialog'
import moment from 'moment'

type Props = {
    agentRunList: AgentRunResult[],
    loading?: boolean
}

function RecentRuns({ agentRunList, loading }: Props) {
    const [selectedRun, setSelectedRun] = useState<AgentRunResult | null>(null)

    const renderStatus = (status: string) => {
        const tone = status == 'completed' ? 'border-ok/30 text-ok' :
            status == 'failed' ? 'border-fail/30 text-fail' :
                status == 'scheduled' ? 'border-border text-muted-foreground' :
                    'border-run/30 text-run'
        return (
            <span className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[11px] ${tone}`}>
                <span className='size-1.5 rounded-full bg-current' />
                {status}
            </span>)
    }

    return (
        <div className='mt-10'>
            <h2 className='font-heading text-lg font-semibold'>All runs</h2>
            <div className='mt-3 overflow-hidden rounded-lg border bg-card'>
                <Table>
                    <TableHeader>
                        <TableRow className='hover:bg-transparent'>
                            <TableHead className="label-mono h-10 px-4">Agent</TableHead>
                            <TableHead className="label-mono">Job</TableHead>
                            <TableHead className="label-mono">Status</TableHead>
                            <TableHead className="label-mono">When</TableHead>
                            <TableHead className="label-mono text-right pr-4">Output</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell className="px-4 py-4"><Skeleton className='h-4 w-24' /></TableCell>
                                <TableCell><Skeleton className='h-4 w-44' /></TableCell>
                                <TableCell><Skeleton className='h-5 w-20' /></TableCell>
                                <TableCell><Skeleton className='h-4 w-20' /></TableCell>
                                <TableCell><Skeleton className='ml-auto h-4 w-10' /></TableCell>
                            </TableRow>
                        )) : agentRunList.length == 0 ? (
                            <TableRow className='hover:bg-transparent'>
                                <TableCell colSpan={5} className='p-8 text-center text-sm text-muted-foreground'>
                                    No runs yet. Start one from the Agents page and it shows up here.
                                </TableCell>
                            </TableRow>
                        ) : agentRunList.map((run, index) => (
                            <TableRow key={index}>
                                <TableCell className="px-4 py-4 font-medium">{run?.name}</TableCell>
                                <TableCell className='max-w-[260px] truncate text-muted-foreground'>{run.task}</TableCell>
                                <TableCell>{renderStatus(run.status)}</TableCell>
                                <TableCell className='font-mono text-xs text-muted-foreground'>{run.completedAt ? moment(run.completedAt).fromNow() : moment(run.createdAt).fromNow()}</TableCell>
                                <TableCell className='pr-4 text-right'>
                                    <Button variant="link" className="h-auto px-0 text-signal" onClick={() => setSelectedRun(run)}>
                                        Open
                                    </Button>
                                </TableCell>

                            </TableRow>
                        ))}

                    </TableBody>
                </Table>
            </div>
            <AgentRunResultDialog
                run={selectedRun ? agentRunList.find((run) => run.id == selectedRun.id) ?? selectedRun : null}
                open={Boolean(selectedRun)}
                onOpenChange={(open) => !open && setSelectedRun(null)}
            />
        </div>
    )
}

export default RecentRuns
