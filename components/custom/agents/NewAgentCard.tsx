// Card shown right after an agent is generated and saved.
import React from 'react'

import { CalendarClock, CheckCircle2, Pencil } from 'lucide-react'
import { Button } from "@/components/ui/button"
import AgentEditSheet from './AgentEditSheet'
import { CreatedAgentType } from './CreateAgent'


type Props = {
    createdAgent: CreatedAgentType | null,
    setUpdatedAgent: any
}

function NewAgentCard({ createdAgent, setUpdatedAgent }: Props) {
    const schedule = createdAgent?.schedule

    return (
        <div className='mt-8 overflow-hidden rounded-lg border border-ok/30 bg-card'>
            <div className='flex items-center gap-2 border-b border-ok/20 bg-ok/5 px-4 py-2.5'>
                <CheckCircle2 className='size-4 text-ok' />
                <span className='label-mono text-ok'>agent saved and ready</span>
            </div>

            <div className='flex items-start justify-between gap-4 p-4'>
                <div className='flex min-w-0 gap-4'>
                    <img src={createdAgent?.agentImage} alt={createdAgent?.name}
                        width={64} height={64}
                        className='size-16 shrink-0 rounded-lg border bg-secondary p-2' />
                    <div className='min-w-0'>
                        <h2 className='font-heading text-lg font-semibold'>{createdAgent?.name}</h2>
                        <p className='mt-0.5 line-clamp-2 text-sm text-muted-foreground'>{createdAgent?.description}</p>
                        <p className='mt-3 flex items-center gap-2 font-mono text-xs text-muted-foreground'>
                            <CalendarClock className='size-3.5 text-signal' />
                            {schedule?.type == 'recurring' ? `${schedule?.frequency} at ${schedule?.time}` : 'runs when you start it'}
                        </p>
                    </div>
                </div>

                <AgentEditSheet agentConfig={createdAgent}
                    setUpdatedAgent={setUpdatedAgent}>
                    <Button variant={'outline'} size={'sm'}>
                        <Pencil /> Tune
                    </Button>
                </AgentEditSheet>
            </div>

            <p className='border-t px-4 py-2.5 text-xs text-muted-foreground'>
                Run it, chat with it or pause it from the <span className='text-foreground'>My agents</span> tab.
            </p>
        </div>
    )
}

export default NewAgentCard
