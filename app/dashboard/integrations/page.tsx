"use client"

// Connections page: lists every app agents can use and lets you sign in or out of each.
import { Button } from '@/components/ui/button'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

type ToolsType = {
    connected: string,
    name: string,
    icon: string
    description: string,
    enabled: boolean,
    slug: string,
    account: any
}

function Integrations() {

    const [toolList, setToolList] = useState<ToolsType[]>();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        GetAllTools();
    }, [])

    const GetAllTools = async () => {
        setLoading(true);
        try {
            const result = await axios.get('/api/integrations');
            console.log(result.data)

            setToolList(result.data);
        } finally {
            setLoading(false);
        }
    }

    const connectTool = async (slug: string) => {
        setLoading(true);
        const result = await axios.post('/api/integrations/tool-connection', {
            slug: slug
        });
        window.open(result?.data?.redirectUrl);
        setLoading(false);
    }

    const disconnectTool = async (connectedAccountId: string) => {
        setLoading(true);
        const result = await axios.delete('/api/integrations/tool-connection', {
            data: {
                connectedAccountId
            }
        });

        console.log(result.data);
        GetAllTools();
        setLoading(false);

    }

    const connectedCount = toolList?.filter((tool) => tool.connected == 'Connected').length ?? 0

    return (
        <div className='mx-auto w-full max-w-6xl px-5 py-10 md:px-10'>
            <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
                <div>
                    <p className='label-mono'>connections</p>
                    <h2 className='mt-2 font-heading text-4xl font-semibold tracking-tight'>Keys to your apps</h2>
                    <p className='mt-2 max-w-xl text-sm text-muted-foreground'>Sign in once and any agent that needs the app can use it. Sign out here to cut access for all of them.</p>
                </div>
                {toolList && <span className='font-mono text-xs text-muted-foreground'>{connectedCount} / {toolList.length} signed in</span>}
            </div>

            <div className='mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
                {loading && !toolList && <IntegrationCardSkeletonList />}

                {toolList?.map((tool, index) => (
                    <div className='flex flex-col rounded-lg border bg-card p-4' key={tool.slug ?? index}>
                        <div className='flex items-center gap-3'>
                            <div className='flex size-10 shrink-0 items-center justify-center rounded-md border bg-white p-1.5'>
                                <img src={tool.icon} alt={tool.name} className='size-full object-contain' />
                            </div>
                            <div className='min-w-0 flex-1'>
                                <h3 className='truncate font-medium'>{tool.name}</h3>
                                <p className={`flex items-center gap-1.5 font-mono text-[11px] ${tool.connected == 'Connected' ? 'text-ok' : 'text-muted-foreground'}`}>
                                    <span className={`size-1.5 rounded-full ${tool.connected == 'Connected' ? 'bg-ok' : 'bg-muted-foreground/50'}`} />
                                    {tool.connected == 'Connected' ? 'signed in' : 'not signed in'}
                                </p>
                            </div>
                        </div>
                        <p className='mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground'>{tool.description}</p>
                        <div className='mt-4'>
                            {tool.connected == 'Connected' ?
                                <Button variant={'outline'} size={'sm'} className={'w-full'}
                                    onClick={() => disconnectTool(tool?.account?.id)}
                                    disabled={loading}
                                >Sign out</Button> :
                                <Button size={'sm'} className={'w-full'}
                                    disabled={loading}
                                    onClick={() => connectTool(tool.slug)}>Sign in</Button>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function IntegrationCardSkeletonList() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, index) => (
                <div className='rounded-lg border bg-card p-4' key={index}>
                    <div className='flex items-center gap-3'>
                        <Skeleton className='size-10 rounded-md' />
                        <div className='flex-1'>
                            <Skeleton className='h-4 w-28' />
                            <Skeleton className='mt-2 h-3 w-20' />
                        </div>
                    </div>
                    <Skeleton className='mt-4 h-3 w-full' />
                    <Skeleton className='mt-1.5 h-3 w-3/4' />
                    <Skeleton className='mt-4 h-8 w-full rounded-md' />
                </div>
            ))}
        </>
    )
}

export default Integrations
