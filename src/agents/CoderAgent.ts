import { generateText, stepCountIs } from 'ai';
import { workspaceTools } from './tools';
import { getGroqModel } from './groqProvider';
import { webSearch } from '@exalabs/ai-sdk';

console.log('[CoderAgent] Coder Agent module loaded');

export const CoderAgent = {
  generate: async ({ prompt }: { prompt: string }) => {
    console.log('[CoderAgent] Generating response for prompt:', prompt);
    
    try {
      const result = await generateText({
        model: getGroqModel('openai/gpt-oss-120b'),
        system: `You are a programming agent for Surfer AI, an assistant inside a VS Code extension. 

YOUR PRIMARY MISSION: CREATE FILES. You MUST use the create_file tool to write every requested file to disk.

CRITICAL RULES - FOLLOW THESE EXACTLY:
1. When asked to create files, you MUST create them using the create_file tool
2. Do NOT just describe what files to create - ACTUALLY CREATE THEM
3. Do NOT return code as text - USE THE create_file TOOL
4. Create ALL requested files before finishing
5. If the workspace is empty, skip analysis and start creating files immediately
6. If you need to understand the existing codebase, use list_files and read_file tools to analyze the structure and tech stack before creating new files
7. If you need acces to documentation or examples, use the websearch tool to find relevant information online

How to create files:
- Use create_file(path: "filename.html", content: "...") for each file
- Paths are relative to workspace root (e.g., "index.html", "css/style.css")
- For nested paths, create the folder first with create_folder(path: "css")
- Create one file at a time, then continue to the next

Example workflow for "create a website":
1. Call create_file for index.html
2. Call create_file for style.css  
3. Call create_file for script.js
4. Return summary: "Created 3 files: index.html, style.css, script.js"

If workspace has existing files:
- First call list_files to see structure
- Call read_file to understand the tech stack
- Match the existing code style when creating new files

REMEMBER: Your job is to CREATE files, not describe them. Use the tools!`,
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
      
      console.log('[CoderAgent] Generation completed');
      console.log('[CoderAgent] Steps taken:', result.steps?.length || 0);
      console.log('[CoderAgent] Final text:', result.text);
      console.log('[CoderAgent] Finish reason:', result.finishReason);
      
      if (result.steps) {
        result.steps.forEach((step, i) => {
          console.log(`[CoderAgent] Step ${i + 1}:`, step.toolCalls?.map(tc => tc.toolName).join(', ') || 'text response');
        });
      }
      
      return result;
    } catch (error) {
      console.error('[CoderAgent] Error during generation:', error);
      throw error;
    }
  }
};
