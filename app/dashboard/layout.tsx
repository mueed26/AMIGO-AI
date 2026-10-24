// Dashboard shell that wraps protected pages with navigation and shared sidebar state.

import { AppSidebar } from '@/components/custom/dashboard/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { auth } from '@clerk/nextjs/server'

import React from 'react'

async function Dashboardlayout({ children }: any) {
    // Sends logged-out users to sign-in before any dashboard page renders.
    await auth.protect()

    return (
        <SidebarProvider>
            <AppSidebar />
            <div className='relative min-w-0 flex-1 overflow-x-hidden'>
                <div className='bg-dots pointer-events-none absolute inset-x-0 top-0 h-80 [mask-image:linear-gradient(to_bottom,black,transparent)]' />
                <div className='sticky top-0 z-10 flex h-12 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur'>
                    <SidebarTrigger className='text-muted-foreground' />
                    <span className='label-mono'>amigo / console</span>
                </div>
                <div className='relative'>{children}</div>
            </div>
        </SidebarProvider>
    )
}

export default Dashboardlayout
