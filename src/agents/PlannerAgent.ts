import { ToolLoopAgent } from 'ai';
import { workspaceTools } from './tools';
import { getGroqModel } from './groqProvider';
import { webSearch } from '@exalabs/ai-sdk';

console.log('[PlannerAgent] Planner Agent module loaded');

let plannerAgentInstance: any = null;

export function createPlannerAgent() {
  if (!plannerAgentInstance) {
    console.log('[PlannerAgent] Creating Planner Agent instance');
    plannerAgentInstance = new ToolLoopAgent({
      model: getGroqModel('openai/gpt-oss-20b'),
      instructions: 'You are the planner agent for Surfer AI, a coding assistant inside a VS Code extension. Your job is to break down complex tasks into simpler parts and determine which subagents can handle each part. If you need access to online resources to answer a question, use the websearch tool. Always try to use the workspace tools to read files and understand the codebase before using websearch.',
      tools: {
        list_files: workspaceTools.list_files,
        read_file: workspaceTools.read_file,
        websearch: webSearch()
      },
    });
    console.log('[PlannerAgent] Planner Agent instance created');
  }
  return plannerAgentInstance;
}

export const PlannerAgent = {
  generate: (input: any) => {
    return createPlannerAgent().generate(input);
  }
};
