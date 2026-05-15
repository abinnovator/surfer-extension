import { createOrchestratorAgent } from './agents/OrchestratorAgent';

export async function runAgent(
  userRequest: string,
  onUpdate: (msg: string) => void
): Promise<{ text: string, tokensUsed: number }> {
  console.log('[AgentRunner] Starting agent execution')
  console.log('[AgentRunner] User request:', userRequest)
  
  const { agent, getTokens } = createOrchestratorAgent(onUpdate)
  console.log('[AgentRunner] Orchestrator agent created')
  
  try {
    console.log('[AgentRunner] Calling agent.generate()...')
    const result = await agent.generate({ prompt: userRequest })
    
    // Add orchestrator's own token usage
    const totalTokens = getTokens() + (result.usage?.totalTokens ?? 0)
    
    console.log('[AgentRunner] Agent execution completed')
    console.log('[AgentRunner] Total tokens used:', totalTokens)
    
    return { text: result.text, tokensUsed: totalTokens }
  } catch (error) {
    console.error('[AgentRunner] Agent execution failed:', error)
    throw error;
  }
}