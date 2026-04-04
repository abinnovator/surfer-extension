import Groq from "groq-sdk";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const tools: Groq.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'add_task',
      description: 'Add a task to the Surfer task panel',
      parameters: {
        type: 'object',
        properties: {
          task: { type: 'string', description: 'The task description to add' }
        },
        required: ['task']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_file',
      description: 'Create or edit a file in the workspace',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path relative to workspace root' },
          content: { type: 'string', description: 'File content to write' }
        },
        required: ['path', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read the content of a file in the workspace',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to read' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'run_terminal',
      description: 'Run a terminal command in the workspace',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'The terminal command to run' }
        },
        required: ['command']
      }
    }
  },
  {
  type: 'function',
  function: {
    name: 'list_workspace_files',
    description: 'List all files in the workspace so you know what files exist before reading them',
    parameters: {
      type: 'object',
      properties: {
        directory: { 
          type: 'string', 
          description: 'Subdirectory to list, use "." for root',
          default: '.'
        }
      },
      required: []
    }
  }
}
]

let groqClient: Groq | null = null;

export function initGroq(apiKey: string) {
  groqClient = new Groq({ apiKey});
}

export async function getGroqChatCompletion(messages: Message[]) {
  if (!groqClient) throw new Error('Groq not initialized');

  const systemMessage: Message = {
    role: 'system',
     content: `You are Surfer AI, a coding assistant inside a VS Code extension.

RULES FOR TOOL USE:
- Only call list_workspace_files when the user explicitly asks you to read or understand the project.
- For simple questions or tasks, just respond with text — do NOT call any tools unless necessary.
- Call ONE tool at a time, never nest tool calls.
- Never call list_workspace_files automatically on every message.
- Only use tools when the user's request genuinely requires reading or writing files.`
}
  

  return groqClient.chat.completions.create({
    messages: [systemMessage, ...messages].map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    model: "llama-3.3-70b-versatile",
    tools,
    tool_choice: 'auto'
  });
}