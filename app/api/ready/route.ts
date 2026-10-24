// Readiness check: "can this pod do real work right now?" It pings the database.
// If it fails, Kubernetes stops sending traffic to this pod until it passes again (no restart).
import { db } from "@/db";
import { logger } from "@/lib/logger";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const started = Date.now();
    try {
        await db.execute(sql`select 1`);
        return NextResponse.json({ status: "ready", dbLatencyMs: Date.now() - started })
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        logger.warn({ err: message }, "readiness check failed: database unreachable");
        return NextResponse.json({ status: "not_ready", error: message }, { status: 503 })
    }
}
