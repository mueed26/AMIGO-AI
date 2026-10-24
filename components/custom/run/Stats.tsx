// Totals strip for the run log: finished, failed and queued runs.
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
    completed: number | undefined,
    failed: number | undefined,
    scheduled: number | undefined,
    loading?: boolean
}

function Stats({ completed, failed, scheduled, loading }: Props) {
    const items = [
        { label: 'Finished', value: completed, className: 'bg-ok' },
        { label: 'Failed', value: failed, className: 'bg-fail' },
        { label: 'Queued', value: scheduled, className: 'bg-signal' },
    ]

    return (
        <div className='mt-8 grid grid-cols-3 divide-x overflow-hidden rounded-lg border bg-card'>
            {items.map((item) => (
                <div className='p-5' key={item.label}>
                    <p className='label-mono flex items-center gap-2'>
                        <span className={`size-1.5 rounded-full ${item.className}`} />
                        {item.label}
                    </p>
                    {loading
                        ? <Skeleton className='mt-3 h-8 w-12' />
                        : <p className='mt-3 font-heading text-3xl font-semibold leading-none'>{item.value ?? 0}</p>}
                </div>
            ))}
        </div>
    )
}

export default Stats
