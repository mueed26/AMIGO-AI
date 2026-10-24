// Loads an agent only if it belongs to the given user, so routes never touch someone else's agent.
import { AgentConfig, db } from "@/db";
import { and, eq } from "drizzle-orm";

export async function getOwnedAgent(agentId: string | null | undefined, userEmail: string) {
    if (!agentId || !userEmail) {
        return null;
    }

    const result = await db.select().from(AgentConfig)
        .where(and(eq(AgentConfig.agentId, agentId), eq(AgentConfig.userEmail, userEmail)));

    return result[0] ?? null;
}
