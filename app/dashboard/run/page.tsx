"use client"

import { AgentRunResult } from '@/components/custom/run/AgentRunResultDialog'
import RecentRuns from '@/components/custom/run/RecentRuns'
import Stats from '@/components/custom/run/Stats'
// Run history page with totals and a table of every agent run.

import axios from 'axios'
import React, { useEffect, useState } from 'react'

export type AgentRunType = AgentRunResult



type statsType = {
    completed: number,
    failed: number,
    scheduled: number
}

function RunPage() {

    const [agentRunList, setAgentRunList] = useState<AgentRunType[]>([])
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<statsType>();
    useEffect(() => {
        GetAllUserAgentRun();
    }, [])

    // Re-check every 5 seconds while a run is still queued or running, so its status updates without a refresh.
    const hasActiveRun = agentRunList.some((run) => run.status == 'queued' || run.status == 'running')
    useEffect(() => {
        if (!hasActiveRun) return
        const timer = setInterval(() => GetAllUserAgentRun(true), 5000)
        return () => clearInterval(timer)
    }, [hasActiveRun])

    // silent skips the loading skeleton, so background re-checks don't make the table flash.
    const GetAllUserAgentRun = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const result = await axios.get('/api/agentlog');
            setAgentRunList(result.data);

            const completedRun = result?.data.filter((item: AgentRunType) => item.status == 'completed')
            const failedRun = result?.data.filter((item: AgentRunType) => item.status == 'failed')
            const scheduledRun = result?.data.filter((item: AgentRunType) => item.status == 'scheduled')

            setStats({
                completed: completedRun.length,
                failed: failedRun.length,
                scheduled: scheduledRun.length,

            })
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='mx-auto w-full max-w-6xl px-5 py-10 md:px-10'>
            <p className='label-mono'>run log</p>
            <h2 className='mt-2 font-heading text-4xl font-semibold tracking-tight'>Every shift, on the record</h2>
            <p className='mt-2 text-sm text-muted-foreground'>What each agent did, when it did it, and what it handed back.</p>
            <Stats
                completed={stats?.completed}
                failed={stats?.failed}
                scheduled={stats?.scheduled}
                loading={loading}

            />

            <RecentRuns agentRunList={agentRunList} loading={loading} />

        </div>
    )
}

export default RunPage
