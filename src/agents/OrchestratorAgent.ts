import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { PlannerAgent } from './PlannerAgent';
import { CoderAgent } from './CoderAgent';
import { ReviewerAgent } from './ReviewerAgent';

export function createOrchestratorAgent(onUpdate: (msg: string) => void) {
  return new ToolLoopAgent({
    model: anthropic('claude-sonnet-4-5'),
    instructions: 'You are the head orchestrator agent...',
    stopWhen: stepCountIs(20),
    tools: {
      call_planner: tool({
        description: 'Call the planner agent to break down a complex task',
        inputSchema: z.object({
          task: z.string().describe('The task to plan')
        }),
        execute: async ({ task }) => {
          onUpdate('Planning task...');
          const result = await PlannerAgent.generate({ prompt: task });
          return result.text;
        }
      }),
      call_coder: tool({
        description: 'Call the coder agent to write code',
        inputSchema: z.object({
          plan: z.string().describe('The plan or task to code')
        }),
        execute: async ({ plan }) => {
          onUpdate('Writing code...');
          const result = await CoderAgent.generate({ prompt: plan });
          return result.text;
        }
      }),
      call_reviewer: tool({
        description: 'Call the reviewer agent to review code',
        inputSchema: z.object({
          code: z.string().describe('The code to review')
        }),
        execute: async ({ code }) => {
          onUpdate(' Reviewing code...');
          const result = await ReviewerAgent.generate({ prompt: code });
          return result.text;
        }
      })
    }
  });
}