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
            <SidebarTrigger />
            <div className='min-w-0 flex-1 overflow-x-hidden'>{children}</div>
        </SidebarProvider>
    )
}

export default Dashboardlayout
