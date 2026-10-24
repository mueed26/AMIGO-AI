"use client"

/**
 * Settings page for account preferences and product-level controls.
 */

import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Bell, ShieldCheck } from "lucide-react"
import React from "react"

function SettingsPage() {
    return (
        <div className="mx-auto w-full max-w-4xl px-6 py-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">Control your workspace preferences.</p>
            </div>

            <section className="mt-6 rounded-2xl border bg-background p-5 shadow-sm">
                <h2 className="text-lg font-semibold">Preferences</h2>
                <div className="mt-5 space-y-5">
                    <SettingRow
                        icon={<Bell className="size-4 text-blue-700" />}
                        title="Run notifications"
                        description="Get notified when agent runs complete or fail."
                        checked
                    />
                    <Separator />
                    <SettingRow
                        icon={<ShieldCheck className="size-4 text-green-700" />}
                        title="Approval reminders"
                        description="Show reminders before agents use connected tools."
                        checked
                    />
                </div>
            </section>
        </div>
    )
}

function SettingRow({ icon, title, description, checked = false }: { icon: React.ReactNode, title: string, description: string, checked?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    {icon}
                </div>
                <div className="min-w-0">
                    <h3 className="font-medium">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            <Switch defaultChecked={checked} />
        </div>
    )
}

export default SettingsPage
