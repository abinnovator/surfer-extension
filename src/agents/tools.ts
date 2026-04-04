import { tool } from 'ai';
import { z } from 'zod';

import * as vscode from 'vscode';

export const workspaceTools = {
  list_files: tool({
    description: 'List all files in the workspace',
    inputSchema: z.object({}),
    execute: async () => {
        const entries = await vscode.workspace.fs.readDirectory(vscode.workspace.workspaceFolders![0].uri);
        return { entries };
    }
  }),

  read_file: tool({
    description: 'Read a file from the workspace',
    inputSchema: z.object({
      path: z.string()
    }),
    execute: async ({ path: filePath }) => {
        const uri = vscode.Uri.file(filePath);
        const bytes = await vscode.workspace.fs.readFile(uri);
        const content = Buffer.from(bytes).toString('utf8');
        return { content };
    }
  }),

  create_file: tool({
    description: 'Create or overwrite a file',
    inputSchema: z.object({
      path: z.string(),
      content: z.string()
    }),
    execute: async ({ path: filePath, content }) => {
        await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), Buffer.from(content, 'utf8'));
    }
  }),

  run_terminal: tool({
    description: 'Run a terminal command',
    inputSchema: z.object({
      command: z.string()
    }),
    execute: async ({ command }) => {
        const terminal = vscode.window.createTerminal('Surfer AI');
        terminal.show();
        terminal.sendText(command);
    }
  })
};