import { createOrchestratorAgent } from './agents/OrchestratorAgent';

export async function runAgent(
  userRequest: string,
  onUpdate: (msg: string) => void
): Promise<string> {
  const orchestrator = createOrchestratorAgent(onUpdate);
  const result = await orchestrator.generate({ prompt: userRequest });
  return result.text;
}