/**
 * API route that starts or removes Composio toolkit connections for a specific agent.
 */

//thsi file handles thereal OAuth
import { getComposio } from "@/lib/composio";
import { getActiveConnectedAccounts, getOrCreateAgentSession } from "@/lib/get-agent-composio-session";
import { getOwnedAgent } from "@/lib/get-owned-agent";
import { logger } from "@/lib/logger";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { toolSlug, agentId } = await req.json();
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ 'error': 'Unauthorized User' }, { status: 400 })
        }

        const userEmail = user?.primaryEmailAddress?.emailAddress ?? '';
        const agentConfig = await getOwnedAgent(agentId, userEmail);

        if (!agentConfig) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
        }

        //@ts-ignore
        const session = await getOrCreateAgentSession(agentConfig, userEmail)
        const connectedAccounts = await getActiveConnectedAccounts(userEmail, [toolSlug]);

        if (connectedAccounts[toolSlug.toLowerCase()]) {
            await session.update({ connectedAccounts });
            return NextResponse.json({ connected: true })
        }

        const connectionRequest = await session.authorize(toolSlug);

        return NextResponse.json({
            redirectUrl: connectionRequest.redirectUrl
        })
    } catch (e) {
        logger.error({ err: e instanceof Error ? e.message : String(e) }, 'tool connect failed');
        const message = e instanceof Error ? e.message : String((e as any)?.message ?? e);
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
export async function DELETE(req: NextRequest) {
    try {
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress ?? '';

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized User' }, { status: 401 })
        }

        const { toolSlug, agentId } = await req.json();

        const agentConfig = await getOwnedAgent(agentId, userEmail);

        if (!agentConfig) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
        }

        const compositonSessionId = agentConfig.composioSessionId;
        const session = await getComposio().use(compositonSessionId ?? '')
        const toolKits = await session.toolkits();
        const toolKit = toolKits.items.find((item: any) => item.slug.toLowerCase() === toolSlug.toLowerCase());
        const sessionConnectedAccountId = toolKit?.connection?.connectedAccount?.id ?? null;

        if (!sessionConnectedAccountId) {
            return NextResponse.json({ error: 'Connection Not Found' }, { status: 404 })
        }

        await getComposio().connectedAccounts.delete(sessionConnectedAccountId);
        return NextResponse.json({ success: true })
    } catch (e) {
        logger.error({ err: e instanceof Error ? e.message : String(e) }, 'tool disconnect failed');
        const message = e instanceof Error ? e.message : String((e as any)?.message ?? e);
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
