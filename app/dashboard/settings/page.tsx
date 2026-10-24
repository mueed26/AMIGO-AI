"use client"

// Preferences page with on/off switches for workspace behaviour.

import { Switch } from "@/components/ui/switch"
import { Bell, ShieldCheck } from "lucide-react"
import React from "react"

function SettingsPage() {
    return (
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
            <p className="label-mono">preferences</p>
            <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">How AMIGO behaves</h1>
            <p className="mt-2 text-sm text-muted-foreground">Small switches for how your workspace keeps you in the loop.</p>

            <section className="mt-8 rounded-lg border bg-card">
                <div className="divide-y">
                    <SettingRow
                        icon={<Bell className="size-4 text-run" />}
                        title="Ping me when a run ends"
                        description="Let me know when an agent finishes or trips up."
                        checked
                    />
                    <SettingRow
                        icon={<ShieldCheck className="size-4 text-ok" />}
                        title="Check with me before risky actions"
                        description="Agents ask first before sending, deleting or posting in your apps."
                        checked
                    />
                </div>
            </section>
        </div>
    )
}

function SettingRow({ icon, title, description, checked = false }: { icon: React.ReactNode, title: string, description: string, checked?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-4 p-5">
            <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-secondary">
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
