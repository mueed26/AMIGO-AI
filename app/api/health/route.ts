// Liveness check: "is this process still alive?" Kubernetes restarts the pod if this stops answering.
// It touches nothing else (no database), so a slow database never gets a healthy pod killed.
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.json({
        status: "ok",
        service: process.env.SERVICE_NAME ?? "amigo-web",
        uptimeSeconds: Math.round(process.uptime()),
    })
}
