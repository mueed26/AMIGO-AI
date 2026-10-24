"use client"

// Agent creation flow: takes the prompt, asks follow-up questions if needed, and shows the saved agent.
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { ArrowUp, BriefcaseBusiness, Loader2, Loader2Icon, Mail, Search } from 'lucide-react'
import React, { useState } from 'react'

import { toast } from '@/components/ui/toast'
import NewAgentCard from '@/components/custom/agents/NewAgentCard'
import AIAgentQuestions from '@/components/custom/agents/AIAgentQuestions'

const quickSuggestions = [
    {
        label: "Job hunt",
        prompt: "Every morning, look for new AI engineering roles posted in the last 24 hours that fit my skills and send me the five best with links.",
    },
    {
        label: "Inbox triage",
        prompt: "Go through my inbox and pull out the emails that need a reply from me today, with a one-line summary of each.",
    },
    {
        label: "Deep dive",
        prompt: "Research a topic across several sources on the web and give me a short brief with the key points and where each one came from.",
    },
    {
        label: "Day planner",
        prompt: "Look at my calendar for today and put together a simple plan with what to focus on first and what can wait.",
    },
    {
        label: "Reddit pulse",
        prompt: "Find the most talked-about Reddit threads about AI agents this week and summarise what people are saying.",
    },
]

const templates = [
    {
        title: "Job radar",
        description: "Scans fresh postings and shortlists the ones worth applying to.",
        prompt: "Every weekday at 9am, search the web for new full-stack and AI engineering jobs posted in the last day and send me a shortlist with links.",
        icon: BriefcaseBusiness,
    },
    {
        title: "Morning inbox digest",
        description: "Reads overnight mail and tells you what actually needs you.",
        prompt: "Every morning at 7am, read my new Gmail messages and save a short digest of what needs my attention to a Google Doc.",
        icon: Mail,
    },
    {
        title: "Topic brief",
        description: "Pulls a few good sources together into one short write-up.",
        prompt: "Research a topic I give you across multiple websites and write a one-page brief with sources at the end.",
        icon: Search,
    },
]

type AgentConfigResp = {
    status: 'needs_clarification' | 'ready',
    clarificationQuestions: ClarificationQuestion[],
    config: any
}

export type ClarificationQuestion = {
    id: string
    question: string
    type: "single_select" | "multi_select" | "text" | "number" | "date" | "time"
    options: string[]
    allowCustom: boolean
    customPlaceholder: string
}

export type CreatedAgentType = {
    id: number,
    userEmail: string,
    agentId: string,
    name: string,
    agentImage: string,
    description: string,
    instructions: string,
    objective: string,
    tools: any,
    skills: string[],
    schedule: AgentSchedule,
    outputFormat: string,
    status: string,//Active, Pause
    createdAt: string,
    composioSessionId?: string
}

export type AgentSchedule = {
    type: "once" | "recurring" | "manual"
    frequency?: "hourly" | "daily" | "weekly" | "monthly"
    time?: string
    timezone?: string
}

function CreateAgent() {

    const [prompt, setPrompt] = useState('')
    const [configResult, setConfigResult] = useState<AgentConfigResp | null>(null);
    const [createdAgent, setCreatedAgent] = useState<CreatedAgentType | null>(null);
    const [loading, setLoading] = useState(false);

    const getBrowserTimezone = () => {
        return (Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC")
    }

    const OnSubmit = async () => {
        if (!prompt.trim()) {
            toast.add({
                type: 'error',
                title: 'Tell it what to do first'
            })
            return;
        }

        try {
            setLoading(true);
            const timezone = getBrowserTimezone();
            const result = await axios.post('/api/agent/configure', {
                prompt: prompt,
                timezone: timezone
            });

            console.log(result.data);
            setConfigResult(result.data);
            if (result.data?.status_ == 'ready') {
                setCreatedAgent(result.data);
            }
        } catch (error: any) {
            const message = error?.response?.data?.error || 'Unable to create agent';
            toast.add({
                type: 'error',
                title: message
            })
        } finally {
            setLoading(false);
        }
    }


    const onComplete = async (ans: any) => {
        console.log("OnComplete", ans);
        setConfigResult(null)
        const updatedPrompt = prompt + "\n" + JSON.stringify(ans);
        try {
            setLoading(true);
            const result = await axios.post('/api/agent/configure', {
                prompt: updatedPrompt,
                timezone: getBrowserTimezone()
            });
            console.log("--", result.data);
            setConfigResult(result.data);
            setCreatedAgent(result.data);
        } catch (error: any) {
            const message = error?.response?.data?.error || 'Unable to create agent';
            toast.add({
                type: 'error',
                title: message
            })
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className='mt-6'>
            <div>
                <p className='label-mono'>new agent</p>
                <h2 className='mt-2 font-heading text-3xl font-semibold tracking-tight'>What should it take off your plate?</h2>
                <p className='mt-2 text-sm text-muted-foreground'>Describe the job in plain words: what to do, which apps to use, and when. AMIGO fills in the rest.</p>
            </div>

            <div className='mt-5 rounded-lg border bg-panel p-3 transition-colors focus-within:border-signal/60'>
                <textarea placeholder='e.g. Every morning at 7, read my new emails and save a short digest to Google Docs'
                    className='min-h-[100px] w-full resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground/70'
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                />
                <div className='flex items-center justify-between border-t pt-3'>
                    <span className='label-mono px-2'>{prompt.length} chars</span>
                    <Button
                        disabled={loading}
                        onClick={OnSubmit}>
                        {loading ? <Loader2 className='animate-spin' /> : <ArrowUp />}
                        Build agent
                    </Button>
                </div>
            </div>

            <div className='mt-3 flex flex-wrap gap-2'>
                {quickSuggestions.map((suggestion, index) => (
                    <button key={index}
                        onClick={() => setPrompt(suggestion.prompt)}
                        className='rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-signal/50 hover:text-signal'>
                        + {suggestion.label}
                    </button>
                ))}
            </div>


            {loading ? <div className='bg-scan mt-8 flex items-center gap-3 rounded-lg border bg-panel p-5 font-mono text-sm'>
                <Loader2Icon className='size-4 animate-spin text-signal' />
                <span>Drafting the agent: picking apps, writing its instructions...</span>
            </div> :

                !configResult && <div className='mt-12'>
                    <p className='label-mono'>or start from one of these</p>
                    <div className='mt-3 grid grid-cols-1 gap-3 md:grid-cols-3'>
                        {templates.map((template, index) => (
                            <button key={index} onClick={() => setPrompt(template.prompt)}
                                className='group rounded-lg border bg-card p-4 text-left transition-colors hover:border-signal/50'>
                                <template.icon className='size-5 text-muted-foreground transition-colors group-hover:text-signal' />
                                <h3 className='mt-6 font-medium'>{template.title}</h3>
                                <p className='mt-1.5 text-sm leading-5 text-muted-foreground'>{template.description}</p>
                            </button>
                        ))}
                    </div>
                </div>}

            {configResult &&
                configResult.status == 'needs_clarification'
                &&
                <div className='mt-6 rounded-lg border bg-card p-5'>
                    <AIAgentQuestions
                        questionList={configResult.clarificationQuestions}
                        onComplete={(resp: any) => onComplete(resp)}
                    />
                </div>

            }

            {createdAgent && <NewAgentCard createdAgent={createdAgent}
                setUpdatedAgent={(value: CreatedAgentType) => setCreatedAgent(value)} />}

        </div>
    )
}

export default CreateAgent
