/**
 * API route that starts or removes Composio toolkit connections for a specific agent.
 */

//thsi file handles thereal OAuth
import { AgentConfig, db } from "@/db";
import { composio } from "@/lib/composio";
import { getActiveConnectedAccounts, getOrCreateAgentSession } from "@/lib/get-agent-composio-session";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { toolSlug, agentId } = await req.json();
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ 'error': 'Unauthorized User' }, { status: 400 })
        }

        const agentConfig = await db.select().from(AgentConfig)
            .where(eq(AgentConfig.agentId, agentId));

        //@ts-ignore
        const session = await getOrCreateAgentSession(agentConfig[0], user?.primaryEmailAddress?.emailAddress)
        const connectedAccounts = await getActiveConnectedAccounts(user?.primaryEmailAddress?.emailAddress ?? '', [toolSlug]);

        if (connectedAccounts[toolSlug.toLowerCase()]) {
            await session.update({ connectedAccounts });
            return NextResponse.json({ connected: true })
        }

        const connectionRequest = await session.authorize(toolSlug);

        return NextResponse.json({
            redirectUrl: connectionRequest.redirectUrl
        })
    } catch (e) {
        console.error('Tool connect error', e);
        const message = e instanceof Error ? e.message : String((e as any)?.message ?? e);
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
export async function DELETE(req: NextRequest) {
    try {
        const { toolSlug, agentId } = await req.json();

        const result = await db.select().from(AgentConfig)
            .where(eq(AgentConfig.agentId, agentId));

        const compositonSessionId = result[0].composioSessionId;
        const session = await composio.use(compositonSessionId ?? '')
        const toolKits = await session.toolkits();
        const toolKit = toolKits.items.find((item: any) => item.slug.toLowerCase() === toolSlug.toLowerCase());
        const sessionConnectedAccountId = toolKit?.connection?.connectedAccount?.id ?? null;

        if (!sessionConnectedAccountId) {
            return NextResponse.json({ error: 'Connection Not Found' }, { status: 404 })
        }

        await composio.connectedAccounts.delete(sessionConnectedAccountId);
        return NextResponse.json({ success: true })
    } catch (e) {
        console.error('Tool disconnect error', e);
        const message = e instanceof Error ? e.message : String((e as any)?.message ?? e);
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
