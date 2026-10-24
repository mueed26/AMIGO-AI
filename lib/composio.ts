// Shared Composio SDK client, created on first use instead of when the file is imported.
// next build loads every route file with no secrets present, and Composio throws if the API key is missing,
// so building the client lazily keeps the Docker build working. The real key is there at run time.
import { Composio } from '@composio/core';
import { OpenAIAgentsProvider } from "@composio/openai-agents";

let client: Composio<OpenAIAgentsProvider> | null = null;

export function getComposio() {
    if (!client) {
        client = new Composio({
            apiKey: process.env.COMPOSIO_API_KEY,
            provider: new OpenAIAgentsProvider(),
        });
    }
    return client;
}
