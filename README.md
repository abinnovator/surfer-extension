# Surfer AI

Surfer AI is a VS Code extension that helps developers build apps faster by automating repetitive coding tasks. It adds two panels to your IDE: the **Chat Panel** and the **Task Panel**.

## How it works

**Chat Panel** — A smart coding assistant that can read, create, and edit files in your workspace. Ask it questions, get code suggestions, or have it make changes directly to your project.

**Task Panel** — An agentic system powered by a multi-agent orchestration pipeline:
- **Orchestrator** — the lead agent that delegates work to the right sub-agents
- **Planner Agent** — breaks down the task into a technical plan
- **Coder Agent** — implements the plan by creating and editing files
- **Reviewer Agent** — reviews the generated code for quality and correctness

Both panels are powered by your Surfer AI account — no API keys required. Just sign in and start building.

## Quick Project Creation

Press `Ctrl + Shift + P` and search **"Create Project"** to access a quick project creation menu. Supports:
- Vite (React + TypeScript)
- Next.js
- TanStack
- Expo (React Native)

## Tech Stack

- Vercel AI SDK
- Groq (GPT-OSS 120B for free users)
- Claude Sonnet (for Pro/Max users)(Backend done but not enabled yet sadly)
- TypeScript
- VS Code Extension API
- Surfer SDK

## How to install

1. Go to [surfer.aaditbhambri.com](https://surfer.aaditbhambri.com) and create an account
2. After signing in, go to **Settings → Connect VS Code** to get your token
3. Install the extension from the [Open VSX Registry](https://open-vsx.org)
4. Press `Ctrl + Shift + P` → **Surfer: Sign In** and paste your token
5. Move one panel to the secondary sidebar for the best experience
