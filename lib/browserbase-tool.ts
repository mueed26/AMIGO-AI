// Read-only live web research for agents, using Browserbase's Search and Fetch APIs.
// The agent searches, picks the most relevant links, reads them, and writes the answer itself.
// (This replaced Browserbase's hosted Agents API, which the free plan limits to 3 runs a month;
// Search and Fetch each allow 1,000 calls a month and are much faster.)
import Browserbase from "@browserbasehq/sdk";
import { tool } from "@openai/agents";
import { z } from 'zod'
import { logger } from "./logger";

// Pages can be huge; keep each one small enough to fit comfortably in the agent's context.
const MAX_PAGE_CHARS = 8000;

let client: Browserbase | null = null;

// Created on first use, so a missing key never breaks the build (same pattern as the Composio client).
function getBrowserbase() {
    if (!client) client = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });
    return client;
}

function errorMessage(e: unknown) {
    return e instanceof Error ? e.message : String(e);
}

export const webSearchTool = tool({
    name: 'web_search',
    description: `Search the live web. Returns titles, links and publish dates for the top results.
Use it for current news, prices, availability, comparisons and any fact that may have changed recently.
Then use fetch_page on the most relevant links to read them before answering.`,
    parameters: z.object({
        query: z.string().min(3).describe('What to search for, like a search engine query'),
        // No .default(): OpenAI's strict tool schemas reject defaults, so the agent always passes a number.
        numResults: z.number().int().min(1).max(10).describe('How many results to return, usually 5'),
    }),

    async execute({ query, numResults }) {
        try {
            const resp = await getBrowserbase().search.web({ query, numResults });
            return JSON.stringify(resp.results.map((result) => ({
                title: result.title,
                url: result.url,
                publishedDate: result.publishedDate ?? null,
            })));
        } catch (e) {
            logger.warn({ tool: 'web_search', err: errorMessage(e) }, 'web search failed');
            return JSON.stringify({ status: 'ERROR', error: errorMessage(e) });
        }
    }
})

export const fetchPageTool = tool({
    name: 'fetch_page',
    description: `Read one web page and get its main text as Markdown. Read-only: it never logs in,
submits forms or buys anything. Use it on links found with web_search, and cite the URL in your answer.`,
    parameters: z.object({
        // Plain string, checked in execute(): z.string().url() becomes "format": "uri", which OpenAI's strict schemas reject.
        url: z.string().describe('The full URL of the page to read, starting with https://'),
    }),

    async execute({ url }) {
        if (!/^https?:\/\//i.test(url)) {
            return JSON.stringify({ status: 'ERROR', url, error: 'Not a valid web address. Use a full URL starting with https://' });
        }
        try {
            const resp = await getBrowserbase().fetchAPI.create({ url, format: 'markdown', allowRedirects: true });
            const text = typeof resp.content == 'string' ? resp.content : JSON.stringify(resp.content);
            return JSON.stringify({
                url,
                statusCode: resp.statusCode,
                content: text.length > MAX_PAGE_CHARS ? `${text.slice(0, MAX_PAGE_CHARS)}\n\n[page truncated]` : text,
            });
        } catch (e) {
            logger.warn({ tool: 'fetch_page', url, err: errorMessage(e) }, 'page fetch failed');
            return JSON.stringify({ status: 'ERROR', url, error: errorMessage(e) });
        }
    }
})

// Both research tools, attached to every agent at run time.
export const webResearchTools = [webSearchTool, fetchPageTool];
