/**
 * Shared Composio SDK client configured from the server environment.
 */

import { Composio } from '@composio/core';


import { OpenAIAgentsProvider } from "@composio/openai-agents";


export const composio = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY,
    provider: new OpenAIAgentsProvider(),
});