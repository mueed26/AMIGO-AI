// Marks agent runs as failed when they've been "queued" or "running" for too long.
// A run gets stuck if its worker pod dies mid-run (crash, node restart, deleted pod) before it can record the result.
// Run on a schedule by the Kubernetes CronJob in k8s/06-cronjob-cleanup.yaml. Exits 0 on success, 1 on failure.
import { neon } from "@neondatabase/serverless";

const STUCK_AFTER_MINUTES = Number(process.env.STUCK_AFTER_MINUTES ?? 30);

// One JSON object per line, same shape as the app's pino logs, so kubectl logs reads the same everywhere.
function log(level, msg, fields = {}) {
    console.log(JSON.stringify({ level, time: new Date().toISOString(), service: "amigo-cleanup", pod: process.env.POD_NAME, msg, ...fields }));
}

async function main() {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
    const sql = neon(process.env.DATABASE_URL);

    // The time a run last made progress: started, else queued, else created.
    // Scheduled runs (waiting for their time slot) are never touched.
    const rows = await sql`
        update "agentRun"
        set status = 'failed',
            error = ${`Stopped: no progress for ${STUCK_AFTER_MINUTES} minutes (worker likely died). Cleaned up automatically.`},
            completed_at = now()
        where status in ('queued', 'running')
          and coalesce(started_at, queued_at, created_at) < now() - make_interval(mins => ${STUCK_AFTER_MINUTES})
        returning id, "agentId"`;

    for (const row of rows) log(40, "stuck run marked failed", { runId: row.id, agentId: row.agentId });
    log(30, "cleanup finished", { cleaned: rows.length, stuckAfterMinutes: STUCK_AFTER_MINUTES });
}

main().catch((e) => {
    log(50, "cleanup failed", { err: e instanceof Error ? e.message : String(e) });
    process.exit(1);
});
