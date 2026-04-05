import { ToolLoopAgent } from 'ai';
import { workspaceTools } from './tools';
import { getGroqModel } from './groqProvider';

console.log('[PlannerAgent] Planner Agent module loaded');

let plannerAgentInstance: any = null;

export function createPlannerAgent() {
  if (!plannerAgentInstance) {
    console.log('[PlannerAgent] Creating Planner Agent instance');
    plannerAgentInstance = new ToolLoopAgent({
      model: getGroqModel('openai/gpt-oss-20b'),
      instructions: 'You are the planner agent for Surfer AI, a coding assistant inside a VS Code extension. Your job is to break down complex tasks into simpler parts and determine which subagents can handle each part.',
      tools: {
        list_files: workspaceTools.list_files,
        read_file: workspaceTools.read_file,
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
