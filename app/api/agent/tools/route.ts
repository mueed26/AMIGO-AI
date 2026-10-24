/**
 * API route that returns tool metadata and connection state for an agent, to show in frontend where its connected or not.
 */
import { getOrCreateAgentSession } from "@/lib/get-agent-composio-session";
import { getOwnedAgent } from "@/lib/get-owned-agent";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const agentId = searchParams.get('agentId')

    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized User' }, { status: 400 })
    }

    const userEmail = user?.primaryEmailAddress?.emailAddress ?? '';

    // Fetch the saved allowed tool slugs before asking Composio for live status.
    const agentConfig = await getOwnedAgent(agentId, userEmail);

    if (!agentConfig) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    const allowedTools: any = agentConfig?.tools;
    //@ts-ignore
    const session = await getOrCreateAgentSession(agentConfig, userEmail)
    const toolKitResult = await session.toolkits();

    // Preserve the agent's configured order while attaching current connection data.
    const tools = allowedTools.map((slug: string) => {
        const toolKit = toolKitResult.items.find(
            (item) => item.slug.toLowerCase() === slug.toLowerCase()
        )

        return {
            slug,
            name: toolKit?.name,
            logo: toolKit?.logo,
            connected: toolKit?.connection?.isActive ?? false,
            connectedAccountId: toolKit?.connection?.connectedAccount?.id ?? null
        }
    })
//return the response or else ofc it will fail 
    return NextResponse.json(tools)


}
