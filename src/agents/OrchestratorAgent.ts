import { generateText, tool } from 'ai';
import { z } from 'zod';
import { CoderAgent } from './CoderAgent';
import { getGroqModel } from './groqProvider';

export function createOrchestratorAgent(onUpdate: (msg: string) => void) {
  console.log('[OrchestratorAgent] Creating orchestrator agent');
  
  return {
    generate: async ({ prompt }: { prompt: string }) => {
      console.log('[OrchestratorAgent] Received prompt:', prompt);
      
      // For now, directly call the coder agent with the user's request
      // This bypasses the complex orchestration temporarily
      onUpdate('Processing request...');
      
      try {
        console.log('[OrchestratorAgent] Delegating to coder agent');
        const result = await CoderAgent.generate({ prompt });
        console.log('[OrchestratorAgent] Coder agent completed');
        return result;
      } catch (error) {
        console.error('[OrchestratorAgent] Error:', error);
        throw error;
      }
    }
  };
}