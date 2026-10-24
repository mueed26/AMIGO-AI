/**
 * API route that turns a natural-language prompt into a saved agent configuration and manages agent CRUD.
 */
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { AgentConfigRespSchema } from "@/data/ResponseSchema";
import { AgentConfigSystemPrompt } from "@/data/Prompt";
import { AgentConfig, AgentRun, db, tools } from "@/db";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { calculateNextDailyRun } from "@/lib/agent-schedule";
import { getOwnedAgent } from "@/lib/get-owned-agent";
import { logFor, logger } from "@/lib/logger";

export async function POST(req: NextRequest) {

    const { prompt, timezone } = await req.json();
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress ?? '';

    if (!userEmail) {
        return NextResponse.json({ error: 'Unauthorized User' }, { status: 401 })
    }

    if (!prompt?.trim()) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_CLOUD_GEMINI_API_KEY;

    try {

        // Send only the tool metadata Gemini needs for planning; credentials and
        // connected-account details stay server-side.
        const aiTools = await db.select({
            slug: tools.slug,
            name: tools.name,
            description: tools.description,
            category: tools.category,
            provider: tools.provider,
            capabilities: tools.capabilities,
            useCases: tools.useCases
        }).from(tools)

        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: AgentConfigSystemPrompt
                .replace('{USER_PROMPT}', prompt)
                .replace('{AVAILABLE_TOOLS}', JSON.stringify(aiTools, null, 2)),
            config: {
                thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
                responseMimeType: 'application/json',
                responseSchema: AgentConfigRespSchema
            }
        })


        // Gemini returns either clarification questions or a ready-to-save config.
        const aiOutput = JSON.parse(response.text ?? '{}');

        if (aiOutput.status == 'ready') {
            const agentId = crypto.randomUUID();
            const dbResult = await db.insert(AgentConfig).values({
                ...aiOutput.config,
                agentImage: 'https://api.dicebear.com/10.x/bottts/svg?seed=4hwns28e' + agentId,
                agentId: agentId,
                userEmail: userEmail,
                schedule: {
                    time: aiOutput?.config?.schedule.time,
                    type: aiOutput?.config?.schedule.type,
                    frequency: aiOutput?.config?.schedule.frequency,
                    timezone: timezone
                }
            }).returning();

            // Pre-create the first scheduled occurrence so Inngest can pick it up.
            const schedule = aiOutput?.config?.schedule;
            const firstRun = schedule?.type == 'recurring'
                && schedule.frequency == 'daily' ? calculateNextDailyRun({
                    time: schedule.time,
                    timezone: timezone
                }) : null

            if (firstRun) {
                await db.insert(AgentRun)
                    .values({
                        agentId,
                        userEmail: userEmail,
                        scheduledFor: firstRun,
                        timezone: timezone,
                        status: 'scheduled',
                    });
                logFor({ agentId, userEmail }).info({ scheduledFor: firstRun }, "first daily run scheduled");
            }


            return NextResponse.json({ ...dbResult[0], status_: 'ready' });
        }


        return NextResponse.json(JSON.parse(response.text ?? '{}'));
    } catch (e) {
        logger.error({ err: e instanceof Error ? e.message : String(e), userEmail }, 'agent configure failed');
        const message = e instanceof Error ? e.message : String((e as any)?.message ?? e);
        return NextResponse.json({ error: message }, { status: 500 })
    }

}

export async function PUT(req: NextRequest) {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress ?? '';

    if (!userEmail) {
        return NextResponse.json({ error: 'Unauthorized User' }, { status: 401 })
    }

    const agentConfig = await req.json();

    try {
        const existingAgent = await getOwnedAgent(agentConfig?.agentId, userEmail);

        if (!existingAgent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
        }

        // Only editable fields are saved, so the owner, ids, session and createdAt can't be changed.
        const result = await db.update(AgentConfig).set({
            name: agentConfig?.name,
            agentImage: agentConfig?.agentImage,
            description: agentConfig?.description,
            instructions: agentConfig?.instructions,
            objective: agentConfig?.objective,
            tools: agentConfig?.tools,
            skills: agentConfig?.skills,
            schedule: agentConfig?.schedule,
            outputFormat: agentConfig?.outputFormat,
            status: agentConfig?.status,
        }).where(eq(AgentConfig.agentId, existingAgent.agentId))
            .returning();

        const updatedAgent = result[0];

        // Remove stale future occurrences before creating a replacement schedule.
        await db.delete(AgentRun)
            .where(and(eq(AgentRun.agentId, existingAgent.agentId), eq(AgentRun.status, 'scheduled')))

        const schedule = updatedAgent?.schedule as {
            type?: string;
            frequency?: string;
            time?: string;
            timezone?: string;
        } | null;

        // Active daily agents should always have exactly one upcoming run.
        if (updatedAgent?.status == 'active'
            && schedule?.type == 'recurring'
            && schedule.frequency == 'daily'
            && schedule.time) {
            const timezone = schedule.timezone ?? 'UTC';
            const nextRun = calculateNextDailyRun({ time: schedule.time, timezone });

            await db
                .insert(AgentRun)
                .values({
                    agentId: existingAgent.agentId,
                    userEmail: userEmail,
                    scheduledFor: nextRun,
                    timezone: timezone,
                    status: "scheduled",
                })
                .onConflictDoNothing();
        }

        return NextResponse.json(updatedAgent)
    }
    catch (e) {
        logger.error({ err: e instanceof Error ? e.message : String(e), agentId: agentConfig?.agentId }, 'agent update failed');
        const message = e instanceof Error ? e.message : String((e as any)?.message ?? e);
        return NextResponse.json({ error: message }, { status: 500 })
    }
}


export async function GET(req: NextRequest) {
    const user = await currentUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized User' }, { status: 400 })
    }

    const result = await db.select().from(AgentConfig)
        .where(eq(AgentConfig.userEmail, user?.primaryEmailAddress?.emailAddress ?? ''))
        .orderBy(desc(AgentConfig?.createdAt))

    return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress ?? '';

    if (!userEmail) {
        return NextResponse.json({ error: 'Unauthorized User' }, { status: 401 })
    }

    const { agentId } = await req.json();

    try {
        const existingAgent = await getOwnedAgent(agentId, userEmail);

        if (!existingAgent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
        }

        await db.delete(AgentRun)
            .where(eq(AgentRun.agentId, existingAgent.agentId))

        await db.delete(AgentConfig)
            .where(eq(AgentConfig.agentId, existingAgent.agentId));


        return NextResponse.json({ msg: 'Agent Deleted!' }, { status: 200 })
    }
    catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 400 })
    }

}
