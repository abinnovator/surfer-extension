import { ToolLoopAgent } from 'ai';
import { workspaceTools } from './tools';

export const PlannerAgent = new ToolLoopAgent({
  model: "anthropic/claude-sonnet-4.5",
  instructions: 'You are the planner agent for Surfer AI, a coding assistant inside a VS Code extension. Your job is to break down complex tasks into simpler parts and determine which subagents can handle each part.',
  tools: {
    list_files: workspaceTools.list_files,
    read_file: workspaceTools.read_file,
  },
});