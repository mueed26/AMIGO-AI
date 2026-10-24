// Runs an agent with safety guardrails and returns its answer plus the guardrail verdict.
import { CreatedAgentType } from "@/components/custom/agents/CreateAgent";
import { buildAgent } from "./build-agent";
import { InputGuardrailTripwireTriggered, OutputGuardrailTripwireTriggered, run } from "@openai/agents";
import { GuardrailContext, redactSecrets, summariseGuardrail } from "./guardrails";

export async function executeAgent({
    agentConfig,
    userEmail,
    input,
}: {
    agentConfig: CreatedAgentType,
    userEmail: string,
    input: string
}) {

    if (agentConfig.status.toLowerCase() !== 'active') {
        throw new Error('Agent is not active!')
    }

    // Build the runtime agent lazily so tool connections are fresh for each run.
    const agent = await buildAgent(agentConfig, userEmail);

    // Record every tool result so the output judge can compare the answer with what really happened.
    const guardrailState: GuardrailContext = { toolTrail: [] };
    agent.on('agent_tool_end', (_context, tool, result) => {
        guardrailState.toolTrail.push({ tool: tool.name, result: String(result) })
    })

    try {
        // Chat messages provide input; scheduled/manual runs fall back to the saved objective.
        const result = await run(agent, input?.trim() || agentConfig?.objective, { context: guardrailState })

        return {
            // Strip any secret that slipped through, even when the judge passed it.
            finalOutput: redactSecrets(String(result?.finalOutput ?? '')),
            blocked: false,
            guardrail: summariseGuardrail(guardrailState),
        }
    } catch (e) {
        // A tripwire means a guardrail stopped the run on purpose. Return a clear message instead of failing.
        if (e instanceof InputGuardrailTripwireTriggered) {
            return {
                finalOutput: `Blocked before running: ${guardrailState.input?.reason || 'this task looks unsafe.'}`,
                blocked: true,
                guardrail: summariseGuardrail(guardrailState, 'input'),
            }
        }
        if (e instanceof OutputGuardrailTripwireTriggered) {
            return {
                finalOutput: `The result was held back: ${guardrailState.output?.reason || 'it contained unsafe content.'}`,
                blocked: true,
                guardrail: summariseGuardrail(guardrailState, 'output'),
            }
        }
        throw e
    }
}
