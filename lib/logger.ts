// Shared JSON logger. Every line is one JSON object, so Docker, kubectl and log tools can search and filter it.
import pino from "pino";

export const logger = pino({
    level: process.env.LOG_LEVEL ?? "info",
    // Added to every line: which service wrote it and which container/pod it ran in.
    // POD_NAME is set by Kubernetes (see the deployment manifests); HOSTNAME is the fallback outside k8s.
    // HOSTNAME alone isn't enough because the Docker image sets it to 0.0.0.0 so Next.js listens on all interfaces.
    base: {
        service: process.env.SERVICE_NAME ?? "amigo-web",
        pod: process.env.POD_NAME ?? process.env.HOSTNAME,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Never print secrets, even if someone logs a whole object by mistake.
    redact: {
        paths: ["apiKey", "*.apiKey", "authorization", "*.authorization", "password", "*.password", "token", "*.token"],
        censor: "[redacted]",
    },
});

// Child logger that stamps the same fields (like runId) on every line it writes.
export function logFor(fields: Record<string, unknown>) {
    return logger.child(fields);
}
