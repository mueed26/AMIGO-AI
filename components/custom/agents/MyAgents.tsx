"use client"

// Agent list: fetches saved agents and lets you run, chat with, edit, pause or delete them.
import axios from 'axios'
import React, { useEffect, useState } from 'react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { CalendarClockIcon, Ellipsis, Loader2, MessageCircle, Pause, Pencil, Play, PlaySquareIcon, Trash } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { CreatedAgentType } from '@/components/custom/agents/CreateAgent';
import AgentChatDrawer from '@/components/custom/agents/AgentChatDrawer';
import AgentEditSheet from './AgentEditSheet';
import DeleteAgent from './DeleteAgent';




function MyAgents() {

    // Agent whose Run button is waiting on the API, so only that button shows a spinner.
    const [startingAgentId, setStartingAgentId] = useState<string | null>(null);
    const [myAgents, setMyAgents] = useState<CreatedAgentType[] | null>();
    const [openEditAgentSheet, setOpendEditAgentSheet] = useState(false);
    const [selectedEditAgent, setSelectedEditAgent] = useState<CreatedAgentType | null>(null);
    const [openChatDrawer, setOpenChatDrawer] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState<string>()
    useEffect(() => {
        AllUsersAgent();
    }, [])

    //fetch ALl User Agents
    const AllUsersAgent = async () => {
        const result = await axios.get('/api/agent/configure');
        console.log(result);
        setMyAgents(result.data);
    }

    const updateAgentStatus = async (agentConfig: CreatedAgentType) => {

        const result = await axios.put('/api/agent/configure', {
            ...agentConfig,
            status: agentConfig?.status == 'active' ? 'pause' : 'active'
        })

        AllUsersAgent();

    }


    const runAgent = async (agent: CreatedAgentType) => {
        setStartingAgentId(agent.agentId);
        try {
            await axios.post("/api/agent/run", {
                agentId: agent?.agentId,
                input: null // Important to run Agent Immediatly
            });

            toast.add({
                title: 'Agent clocked in',
                description: 'Follow it in the run log.',
                type: 'success'
            })
        } catch (error: any) {
            const message = error?.response?.data?.error;
            toast.add({
                type: 'error',
                title: typeof message === 'string' ? message : 'Could not start this agent'
            });
        } finally {
            setStartingAgentId(null);
        }

    }


    return (
        <div className='mt-6'>
            <p className='label-mono'>roster</p>
            <h2 className='mt-2 font-heading text-3xl font-semibold tracking-tight'>Your agents</h2>
            <p className='mt-2 text-sm text-muted-foreground'>Start a run, talk to an agent, or change its hours.</p>

            <div className='mt-6 divide-y overflow-hidden rounded-lg border bg-card'>
                {myAgents === undefined && <AgentCardSkeletonList />}

                {myAgents?.length === 0 && (
                    <div className='p-8 text-center text-sm text-muted-foreground'>
                        No agents yet. Head to <span className='text-foreground'>New agent</span> and describe your first job.
                    </div>
                )}

                {myAgents?.map((agent, index) => (
                    <div className='flex flex-col gap-4 p-4 sm:flex-row sm:items-center' key={agent.agentId ?? index}>
                        <div className='flex min-w-0 flex-1 items-start gap-3'>
                            <img src={agent?.agentImage} alt={agent.name}
                                width={44} height={44}
                                className='size-11 shrink-0 rounded-md border bg-secondary p-1.5' />
                            <div className='min-w-0'>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <h3 className='font-medium'>{agent.name}</h3>
                                    <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider
                                        ${agent?.status == 'pause' ? 'border-signal/30 text-signal' : 'border-ok/30 text-ok'}`}>
                                        {agent?.status == 'pause' ? 'paused' : 'active'}
                                    </span>
                                </div>
                                <p className='mt-0.5 line-clamp-1 text-sm text-muted-foreground'>{agent?.description}</p>
                                <p className='mt-1.5 flex items-center gap-1.5 font-mono text-xs text-muted-foreground'>
                                    <CalendarClockIcon className='size-3.5 text-signal' />
                                    {agent?.schedule?.frequency}
                                    {agent.schedule.type == 'recurring' && <span>at {agent?.schedule?.time}</span>}
                                </p>
                            </div>
                        </div>

                        <div className='flex shrink-0 items-center gap-2'>
                            <Button variant={'outline'} size={'sm'}
                                onClick={() => runAgent(agent)}
                                disabled={startingAgentId === agent.agentId}
                            >{startingAgentId === agent.agentId ? <Loader2 className='animate-spin' /> : <Play />}Run</Button>
                            <Button size={'sm'}
                                onClick={() => { setOpenChatDrawer(true); setSelectedEditAgent(agent) }}
                            ><MessageCircle />Chat</Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger render={<Button variant={'ghost'} size={'icon-sm'} />}>
                                    <Ellipsis />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => updateAgentStatus(agent)}>
                                            {agent?.status == 'active' ?
                                                <span className='flex items-center gap-2'><Pause /> Pause</span> :
                                                <span className='flex items-center gap-2'><PlaySquareIcon /> Resume</span>}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { setOpendEditAgentSheet(true); setSelectedEditAgent(agent) }}>
                                            <Pencil /> Tune settings</DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem variant='destructive'
                                            onClick={() => { setOpenDeleteAlert(true); setSelectedAgentId(agent.agentId) }}
                                        ><Trash /> Delete</DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}

            </div>
            {openEditAgentSheet && <AgentEditSheet
                agentConfig={selectedEditAgent}
                setUpdatedAgent={() => AllUsersAgent()}
                openSheet_={openEditAgentSheet}
                closeSheet={(v: boolean) => setOpendEditAgentSheet(v)}

            />}

            <AgentChatDrawer
                agent={selectedEditAgent}
                open={openChatDrawer}
                onOpenChange={setOpenChatDrawer}
            />

            <DeleteAgent
                openAlert={openDeleteAlert}
                closeAlert={(v: any) => setOpenDeleteAlert(v)}
                agentId={selectedAgentId}
                refreshData={() => AllUsersAgent()}
            />

        </div>
    )
}

function AgentCardSkeletonList() {
    return (
        <>
            {Array.from({ length: 3 }).map((_, index) => (
                <div className='flex items-center gap-3 p-4' key={index}>
                    <Skeleton className='size-11 rounded-md' />
                    <div className='flex-1'>
                        <Skeleton className='h-4 w-40' />
                        <Skeleton className='mt-2 h-3 w-full max-w-sm' />
                        <Skeleton className='mt-2 h-3 w-28' />
                    </div>
                    <Skeleton className='h-8 w-16 rounded-md' />
                    <Skeleton className='h-8 w-16 rounded-md' />
                </div>
            ))}
        </>
    )
}

export default MyAgents
