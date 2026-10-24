"use client"

// Side sheet for editing an agent: name, goal, schedule, skills, avatar and app sign-ins.

import React, { useEffect, useMemo, useState } from "react"

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,

    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Link2,
    Loader2,
    Loader2Icon,
    Plus,
    Shuffle,
    Unlink,
    X,
} from "lucide-react"


import { toast } from "@/components/ui/toast"
import axios from "axios"
import Image from "next/image"
import { CreatedAgentType } from "@/components/custom/agents/CreateAgent"

type Props = {
    children?: React.ReactNode
    agentConfig: CreatedAgentType | null,
    setUpdatedAgent: any,
    openSheet_?: boolean,
    closeSheet?: any
}

type EditableTool = {
    name: string
    connected: boolean,
    slug: string,
    logo: string,

}

const frequencyOptions = [
    "hourly",
    "daily",
    "weekly",
    "monthly",
]

function AgentEditSheet({
    children,
    agentConfig,
    setUpdatedAgent,
    openSheet_ = false,
    closeSheet
}: Props) {
    const [draftAgent, setDraftAgent] =
        useState<CreatedAgentType | null>(agentConfig)

    const [skillInput, setSkillInput] = useState("")
    const [tools, setTools] = useState<EditableTool[]>([])
    const [openSheet, setOpenSheet] = useState(openSheet_);
    const [loadingTools, setLoadingTools] = useState(false);
    // Slug of the tool being disconnected, so only that tool's button shows a spinner.
    const [disconnectingSlug, setDisconnectingSlug] = useState<string | null>(null);
    useEffect(() => {
        setDraftAgent(agentConfig)
        agentConfig && GetTools();
    }, [agentConfig])

    const updateDraft = (key: string, value: any) => {
        setDraftAgent((prev: any) => ({
            ...prev,
            [key]: value,
        }))
    }

    const shuffleImage = () => {
        const newImage =
            `https://api.dicebear.com/10.x/bottts/svg?seed=${crypto.randomUUID()}`
        updateDraft("agentImage", newImage)
    }

    const addSkill = () => {
        if (!draftAgent) return

        const skill = skillInput.trim()

        if (!skill) return

        const existingSkills = draftAgent.skills ?? []

        const alreadyExists = existingSkills.some(
            (item) =>
                item.toLowerCase() === skill.toLowerCase()
        )

        if (alreadyExists) {
            setSkillInput("")
            return
        }

        updateDraft("skills", [
            ...existingSkills,
            skill,
        ])

        setSkillInput("")
    }

    const removeSkill = (skillToRemove: string) => {
        if (!draftAgent) return

        updateDraft(
            "skills",
            (draftAgent.skills ?? []).filter(
                (skill) => skill !== skillToRemove
            )
        )
    }


    //Get Tools
    const GetTools = async () => {
        setLoadingTools(true);
        const result = await axios.get('/api/agent/tools?agentId=' + agentConfig?.agentId)
        console.log(result.data);
        setTools(result.data);
        setLoadingTools(false);
    }

    const ConnectedTools = tools.filter(tool => tool.connected == true);



    const hasSchedule =
        draftAgent?.schedule?.type === "once" ||
        draftAgent?.schedule?.type === "recurring"

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        //update to DB as well
        try {
            await axios.put('/api/agent/configure', {
                ...draftAgent
            })
        } catch (e: any) {
            const error = e?.response?.data?.error;
            const message = typeof error === 'string' ? error : 'Unable to update agent.';
            toast.add({ type: 'error', title: message });
            return;
        }
        //Update Updated Agent to parent 
        setUpdatedAgent(draftAgent)

        toast.add({
            type: 'success',
            title: "Agent Updated!",
        })

        setOpenSheet(false);
        closeSheet?.(false)

    }

    if (!draftAgent) {
        return null
    }

    const connectTool = async (slug: string) => {
        const result = await axios.post('/api/agent/tools/connect', {
            agentId: agentConfig?.agentId ?? '',
            toolSlug: slug
        });
        console.log(result.data);

        window.open(result?.data?.redirectUrl);


    }

    const disconnectTool = async (slug: string) => {

        setDisconnectingSlug(slug);
        try {
            await axios.delete('/api/agent/tools/connect', {
                data: {
                    toolSlug: slug,
                    agentId: agentConfig?.agentId
                }
            })
            toast.add({
                type: 'success',
                title: 'Tool disconnected!'
            })
            // Refresh tool status instead of closing the sheet.
            await GetTools();
        } catch (e: any) {
            const error = e?.response?.data?.error;
            const message = typeof error === 'string' ? error : 'Unable to disconnect tool.';
            toast.add({ type: 'error', title: message })
        } finally {
            setDisconnectingSlug(null);
        }
    }

    return (
        <Sheet open={openSheet} onOpenChange={(v: boolean) => { setOpenSheet(v); closeSheet?.(v) }}>
            {children && <SheetTrigger render={children as React.ReactElement} />}

            <SheetContent className="flex w-full flex-col p-0 sm:max-w-xl">
                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <SheetHeader className="border-b px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <img
                                src={draftAgent.agentImage ?? "/logo.svg"}
                                alt={draftAgent.name ?? "Agent"}
                                className="size-10 rounded-xl border bg-muted p-1"
                            />

                            <div>
                                <p className="label-mono">agent settings</p>
                                <SheetTitle className="mt-1 font-heading text-xl">
                                    Tune this agent
                                </SheetTitle>

                                <SheetDescription>
                                    Change its job, its hours and
                                    the apps it can reach.
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <ScrollArea className="min-h-0 flex-1">
                        <div className="space-y-6 p-5">

                            {/* Image */}
                            <section className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
                                <img
                                    src={
                                        draftAgent.agentImage ??
                                        "/logo.svg"
                                    }
                                    alt={
                                        draftAgent.name ??
                                        "Agent"
                                    }
                                    className="size-20 rounded-lg border bg-secondary p-2 object-cover"
                                />

                                <div className="space-y-2">
                                    <div>
                                        <p className="font-medium">
                                            Agent Image
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            Roll the dice for a new avatar
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={shuffleImage}
                                    >
                                        <Shuffle className="size-4" />
                                        New avatar
                                    </Button>
                                </div>
                            </section>

                            {/* Name */}
                            <section className="space-y-2">
                                <Label htmlFor="agent-name">
                                    Name
                                </Label>

                                <Input
                                    id="agent-name"
                                    value={draftAgent.name ?? ""}
                                    onChange={(event) =>
                                        updateDraft(
                                            "name",
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. Morning inbox digest"
                                />
                            </section>

                            {/* Objective */}
                            <section className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="agent-objective">
                                        Goal
                                    </Label>

                                    <Textarea
                                        id="agent-objective"
                                        value={
                                            draftAgent.objective ?? ""
                                        }
                                        onChange={(event) =>
                                            updateDraft(
                                                "objective",
                                                event.target.value
                                            )
                                        }
                                        placeholder="What does a good run look like?"
                                        className="min-h-24 resize-y"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="agent-instructions">
                                        Instructions
                                    </Label>

                                    <Textarea
                                        id="agent-instructions"
                                        value={
                                            draftAgent.instructions ??
                                            ""
                                        }
                                        onChange={(event) =>
                                            updateDraft(
                                                "instructions",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Step-by-step notes, rules, things to avoid"
                                        className="min-h-32 resize-y"
                                    />
                                </div>
                            </section>

                            {/* Schedule */}
                            <section className="space-y-4 rounded-lg border p-4">
                                <div>
                                    <h3 className="font-medium">
                                        Working hours
                                    </h3>

                                    <p className="text-xs text-muted-foreground">
                                        Pick when it clocks in and how
                                        often.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">

                                    <div className="space-y-2">
                                        <Label>
                                            Mode
                                        </Label>

                                        <Select
                                            value={
                                                draftAgent.schedule
                                                    ?.type ??
                                                "manual"
                                            }
                                            onValueChange={(value) =>
                                                updateDraft(
                                                    "schedule",
                                                    {
                                                        ...draftAgent.schedule,
                                                        type: value,
                                                    }
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="manual">
                                                    Manual
                                                </SelectItem>

                                                <SelectItem value="once">
                                                    Once
                                                </SelectItem>

                                                <SelectItem value="recurring">
                                                    Recurring
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="schedule-time">
                                            Start time
                                        </Label>

                                        <Input
                                            id="schedule-time"
                                            type="time"
                                            value={
                                                draftAgent.schedule
                                                    ?.time ??
                                                "09:00"
                                            }
                                            disabled={!hasSchedule}
                                            onChange={(event) =>
                                                updateDraft(
                                                    "schedule",
                                                    {
                                                        ...draftAgent.schedule,
                                                        time: event
                                                            .target
                                                            .value,
                                                    }
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2 sm:col-span-2">
                                        <Label>
                                            Repeats
                                        </Label>

                                        <Select
                                            value={
                                                draftAgent.schedule
                                                    ?.frequency ??
                                                "daily"
                                            }
                                            disabled={
                                                draftAgent.schedule
                                                    ?.type !==
                                                "recurring"
                                            }
                                            onValueChange={(value) =>
                                                updateDraft(
                                                    "schedule",
                                                    {
                                                        ...draftAgent.schedule,
                                                        frequency:
                                                            value,
                                                    }
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {frequencyOptions.map(
                                                    (frequency) => (
                                                        <SelectItem
                                                            key={
                                                                frequency
                                                            }
                                                            value={
                                                                frequency
                                                            }
                                                        >
                                                            {frequency
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase() +
                                                                frequency.slice(
                                                                    1
                                                                )}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </section>

                            {/* Skills */}
                            <section className="space-y-3">
                                <div>
                                    <h3 className="font-medium">
                                        Skills
                                    </h3>

                                    <p className="text-xs text-muted-foreground">
                                        Short tags for what this agent is
                                        good at.
                                    </p>
                                </div>

                                <div className="flex min-h-12 flex-wrap gap-2 rounded-xl border bg-muted/20 p-2.5">
                                    {(draftAgent.skills ?? []).map(
                                        (skill) => (
                                            <Badge
                                                key={skill}
                                                variant="secondary"
                                                className="h-7 gap-1.5 px-2.5"
                                            >
                                                {skill}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSkill(
                                                            skill
                                                        )
                                                    }
                                                >
                                                    <X className="size-3" />
                                                </button>
                                            </Badge>
                                        )
                                    )}

                                    {(draftAgent.skills ?? [])
                                        .length === 0 && (
                                            <span className="text-sm text-muted-foreground">
                                                No skills added
                                            </span>
                                        )}
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        value={skillInput}
                                        onChange={(event) =>
                                            setSkillInput(
                                                event.target.value
                                            )
                                        }
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Enter"
                                            ) {
                                                event.preventDefault()
                                                addSkill()
                                            }
                                        }}
                                        placeholder="Add a tag and press enter"
                                    />

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addSkill}
                                    >
                                        <Plus className="size-4" />
                                        Add
                                    </Button>
                                </div>
                            </section>

                            {/* Tools */}
                            <section className="space-y-3">
                                <div>
                                    <h3 className="font-medium">
                                        Apps it can use
                                    </h3>

                                    <p className="text-xs text-muted-foreground">
                                        {ConnectedTools.length} of{" "}
                                        {tools.length} signed in
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {loadingTools &&
                                        <div className="p-2 border rounded-lg flex items-center">
                                            <Loader2Icon className="animate-spin" /> Checking connections...
                                        </div>
                                    }
                                    {tools.map((tool, index) => (
                                        <div
                                            key={`${tool.name}-${index}`}
                                            className="flex items-center justify-between gap-3 rounded-xl border p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                                    {/* {tool.connected ? (
                                                        <Link2 className="size-4 text-ok" />
                                                    ) : (
                                                        <Unlink className="size-4 text-muted-foreground" />
                                                    )} */}
                                                    <img src={tool.logo} alt={tool.name} width={30} height={30}
                                                        className="rounded-lg"
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {tool.name}
                                                    </p>

                                                    <p
                                                        className={`text-xs ${tool.connected
                                                            ? "text-ok"
                                                            : "text-muted-foreground"
                                                            }`}
                                                    >
                                                        {tool.connected
                                                            ? <span className="text-ok">Signed in</span>
                                                            : <span className="text-muted-foreground">Not signed in</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                onClick={() => tool.connected ? disconnectTool(tool.slug) : connectTool(tool.slug)}
                                                variant={
                                                    tool.connected
                                                        ? "outline"
                                                        : "default"
                                                }
                                                size="sm"
                                                disabled={disconnectingSlug === tool.slug}
                                            >
                                                {disconnectingSlug === tool.slug && <Loader2 className="animate-spin" />}
                                                {tool.connected
                                                    ? "Sign out"
                                                    : "Sign in"}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Output */}
                            <section className="space-y-2">
                                <Label htmlFor="output-format">
                                    How to hand back results
                                </Label>

                                <Textarea
                                    id="output-format"
                                    value={
                                        draftAgent.outputFormat ??
                                        ""
                                    }
                                    onChange={(event) =>
                                        updateDraft(
                                            "outputFormat",
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. Short bullet list, link to the doc at the end"
                                    className="min-h-24 resize-y"
                                />
                            </section>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="border-t p-4">
                        <div className="flex w-full justify-end gap-2.5">
                            <SheetClose render={<Button type="button" variant="outline" />}>
                                Cancel
                            </SheetClose>

                            <Button
                                type="submit"
                                className=""
                            >
                                Save agent
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}

export default AgentEditSheet