import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { getGroqModel } from './groqProvider';
import { z } from 'zod';
import { PlannerAgent } from './PlannerAgent';
import { CoderAgent } from './CoderAgent';
import { ReviewerAgent } from './ReviewerAgent';

export function createOrchestratorAgent(onUpdate: (msg: string) => void) {
  let totalTokens = 0;

  const agent = new ToolLoopAgent({
    model: getGroqModel('openai/gpt-oss-120b'),
    instructions: `You are the Lead Orchestrator for Surfer AI. Your role is to manage the end-to-end lifecycle of a coding task by delegating to specialized sub-agents.

    WORKFLOW RULES:
    1. DELEGATE FIRST: Do not write code or plans yourself. Use your tools.
    2. THE SEQUENCE:
       - Start by calling 'call_planner' to analyze the request and create a technical breakdown.
       - Take the plan produced by the Planner and pass it to 'call_coder'.
       - Take the output/confirmation from the Coder and pass it to 'call_reviewer' to ensure quality.
    3. RECURSION: If the Reviewer suggests fixes, send the feedback back to the 'call_coder'.
    4. FINAL RESPONSE: Once the Reviewer approves or the task is confirmed complete, provide a concise summary to the user of what was built.`,
    
    stopWhen: stepCountIs(15),
    tools: {
      call_planner: tool({
        description: 'Sends a task to the Planner Agent to get a file structure and step-by-step breakdown.',
        inputSchema: z.object({ task: z.string() }),
        execute: async ({ task }) => {
          onUpdate('Step 1: Planning architecture...')
          const result = await PlannerAgent.generate({ prompt: task })
          totalTokens += result.usage?.totalTokens ?? 0
          return result.text
        }
      }),
      call_coder: tool({
        description: 'Sends a plan to the Coder Agent to physically create files in the VS Code workspace.',
        inputSchema: z.object({ plan: z.string() }),
        execute: async ({ plan }) => {
          onUpdate('Step 2: Writing and creating files...')
          const result = await CoderAgent.generate({ prompt: plan })
          totalTokens += result.usage?.totalTokens ?? 0
          return result.text
        }
      }),
      call_reviewer: tool({
        description: 'Sends code or a completion report to the Reviewer Agent for quality insurance and fixes.',
        inputSchema: z.object({ codeOrReport: z.string() }),
        execute: async ({ codeOrReport }) => {
          onUpdate('Step 3: Reviewing code quality...')
          const result = await ReviewerAgent.generate({ prompt: codeOrReport })
          totalTokens += result.usage?.totalTokens ?? 0
          return result.text
        }
      }),
    }
  })

  return { agent, getTokens: () => totalTokens }
}