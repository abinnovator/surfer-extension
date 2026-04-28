import { generateText, stepCountIs } from 'ai';
import { workspaceTools } from './tools';
import { getGroqModel } from './groqProvider';
import { webSearch } from '@exalabs/ai-sdk';

console.log('[CoderAgent] Coder Agent module loaded');

export const AssetAgent = {
  generate: async ({ prompt }: { prompt: string }) => {
    console.log('[CoderAgent] Generating response for prompt:', prompt);
    
    try {
      const result = await generateText({
        model: getGroqModel('openai/gpt-oss-120b'),
        system: `You are a asset generation agent for Surfer AI, an assistant inside a VS Code extension. 

YOUR PRIMARY MISSION: CREATE ASSETS. You MUST use the create_file tool to write every requested file to disk.
CRITICAL RULES - FOLLOW THESE EXACTLY:
1. When asked to create assets, you MUST create them using the create_file tool
2. Do NOT just describe what assets to create - ACTUALLY CREATE THEM
3. Do NOT return images as text - USE THE create_file TOOL
4. Create ALL requested assets before finishing
5. If the workspace is empty, skip analysis and start creating assets immediately
6. If you need to understand the existing codebase, use list_files and read_file tools to analyze the structure and tech stack before creating new assets
7. If you need acces to documentation or examples, use the websearch tool to find relevant information online`,
        prompt,
        tools: {
          read_file: workspaceTools.read_file,
          create_file: workspaceTools.create_file,
          run_terminal: workspaceTools.run_terminal,
          list_files: workspaceTools.list_files,
          create_folder: workspaceTools.create_folder,
          websearch: webSearch()
        },
        stopWhen: stepCountIs(20),
        });
      
      console.log('[AssetAgent] Generation completed');
      console.log('[AssetAgent] Steps taken:', result.steps?.length || 0);
      console.log('[AssetAgent] Final text:', result.text);
      console.log('[AssetAgent] Finish reason:', result.finishReason);
      
      if (result.steps) {
        result.steps.forEach((step, i) => {
          console.log(`[AssetAgent] Step ${i + 1}:`, step.toolCalls?.map(tc => tc.toolName).join(', ') || 'text response');
        });
      }
      
      return result;
    } catch (error) {
      console.error('[AssetAgent] Error during generation:', error);
      throw error;
    }
  }
};
