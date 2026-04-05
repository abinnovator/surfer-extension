import { createOrchestratorAgent } from './agents/OrchestratorAgent';

export async function runAgent(
  userRequest: string,
  onUpdate: (msg: string) => void
): Promise<string> {
  console.log('[AgentRunner] Starting agent execution');
  console.log('[AgentRunner] User request:', userRequest);
  
  const orchestrator = createOrchestratorAgent(onUpdate);
  console.log('[AgentRunner] Orchestrator agent created');
  
  try {
    console.log('[AgentRunner] Calling orchestrator.generate()...');
    const result = await orchestrator.generate({ prompt: userRequest });
    console.log('[AgentRunner] Agent execution completed successfully');
    console.log('[AgentRunner] Result:', result.text);
    return result.text;
  } catch (error) {
    console.error('[AgentRunner] Agent execution failed:', error);
    throw error;
  }
}