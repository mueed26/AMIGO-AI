"use client"

// Dashboard sidebar with the main sections, account menu and current user.
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { UserDetailContext } from "@/context/UserDetailContext"

import { UserButton } from "@clerk/nextjs"
import { Activity, Bot, Cable, LayoutGrid, SlidersHorizontal, UserRound } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useContext } from "react"

const workspaceLinks = [
    { label: "Overview", href: "/dashboard", icon: LayoutGrid },
    { label: "Agents", href: "/dashboard/agents", icon: Bot },
    { label: "Run log", href: "/dashboard/run", icon: Activity },
    { label: "Connections", href: "/dashboard/integrations", icon: Cable },
]

const accountLinks = [
    { label: "Preferences", href: "/dashboard/settings", icon: SlidersHorizontal },
    { label: "Account", href: "/dashboard/profile", icon: UserRound },
]

export function AppSidebar() {

    const path = usePathname();
    const { userDetail } = useContext(UserDetailContext);
    const router = useRouter();

    const renderLink = (link: typeof workspaceLinks[number]) => {
        const active = path == link.href
        return (
            <SidebarMenuButton key={link.href} onClick={() => router.push(link.href)}
                className={`relative h-9 gap-3 rounded-md px-3 text-[13px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground
                ${active ? 'bg-sidebar-accent text-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-signal' : ''}`}>
                <link.icon className={`size-4 ${active ? 'text-signal' : ''}`} />
                <span>{link.label}</span>
            </SidebarMenuButton>
        )
    }

    return (
        <Sidebar>
            <SidebarHeader className="px-4 pt-5 pb-3">
                <Link href="/" className="flex items-center gap-2.5">
                    <Image src={"/logo.svg"} alt="logo" width={28} height={28} />
                    <span className="font-heading text-lg font-semibold tracking-tight">amigo</span>
                    <span className="label-mono ml-auto rounded border px-1.5 py-0.5 text-[10px]">console</span>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-1">
                <SidebarGroup className="gap-0.5">
                    <SidebarGroupLabel className="label-mono">Workspace</SidebarGroupLabel>
                    {workspaceLinks.map(renderLink)}
                </SidebarGroup>
                <SidebarGroup className="gap-0.5">
                    <SidebarGroupLabel className="label-mono">You</SidebarGroupLabel>
                    {accountLinks.map(renderLink)}
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t p-3">
                <div className="flex items-center gap-2.5">
                    <UserButton />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{userDetail?.name}</p>
                        <p className="truncate font-mono text-[11px] text-muted-foreground">{userDetail?.email}</p>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
