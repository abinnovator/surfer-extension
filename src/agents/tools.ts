import { tool } from 'ai';
import { z } from 'zod';

import * as vscode from 'vscode';
import path from 'path';

export const workspaceTools = {
  list_files: tool({
    description: 'List all files in the workspace',
    inputSchema: z.object({}),
    execute: async () => {
        console.log('[WorkspaceTools] Listing files in workspace');
        try {
          const entries = await vscode.workspace.fs.readDirectory(vscode.workspace.workspaceFolders![0].uri);
          console.log('[WorkspaceTools] Found', entries.length, 'entries');
          return { entries };
        } catch (error) {
          console.error('[WorkspaceTools] Failed to list files:', error);
          throw error;
        }
    }
  }),

  read_file: tool({
    description: 'Read a file from the workspace. Use relative paths from workspace root.',
    inputSchema: z.object({
      path: z.string().describe('Relative path from workspace root')
    }),
    execute: async ({ path: filePath }) => {
        console.log('[WorkspaceTools] Reading file:', filePath);
        try {
          const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
          if (!workspaceFolder) {
            throw new Error('No workspace folder open');
          }
          
          const fullPath = vscode.Uri.joinPath(workspaceFolder.uri, filePath);
          const bytes = await vscode.workspace.fs.readFile(fullPath);
          const content = Buffer.from(bytes).toString('utf8');
          console.log('[WorkspaceTools] Successfully read file, length:', content.length);
          return { content };
        } catch (error) {
          console.error('[WorkspaceTools] Failed to read file:', filePath, error);
          throw error;
        }
    }
  }),

  create_file: tool({
    description: 'Create or overwrite a file in the workspace. Use relative paths from the workspace root (e.g., "index.html", "src/app.js").',
    inputSchema: z.object({
      path: z.string().describe('Relative path from workspace root'),
      content: z.string().describe('File content to write')
    }),
    execute: async ({ path: filePath, content }) => {
        console.log('[WorkspaceTools] Creating file:', filePath);
        console.log('[WorkspaceTools] Content length:', content.length);
        try {
          const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
          if (!workspaceFolder) {
            throw new Error('No workspace folder open');
          }
          
          // Resolve the path relative to workspace root
          const fullPath = vscode.Uri.joinPath(workspaceFolder.uri, filePath);
          console.log('[WorkspaceTools] Full path:', fullPath.fsPath);
          
          await vscode.workspace.fs.writeFile(fullPath, Buffer.from(content, 'utf8'));
          console.log('[WorkspaceTools] Successfully created file:', filePath);
          
          return { 
            success: true, 
            path: filePath,
            message: `File created successfully at ${filePath}` 
          };
        } catch (error) {
          console.error('[WorkspaceTools] Failed to create file:', filePath, error);
          throw error;
        }
    }
  }),

  run_terminal: tool({
    description: 'Run a terminal command',
    inputSchema: z.object({
      command: z.string()
    }),
    execute: async ({ command }) => {
        console.log('[WorkspaceTools] Running terminal command:', command);
        try {
          const terminal = vscode.window.createTerminal('Surfer AI');
          terminal.show();
          terminal.sendText(command);
          console.log('[WorkspaceTools] Terminal command sent successfully');
        } catch (error) {
          console.error('[WorkspaceTools] Failed to run terminal command:', error);
          throw error;
        }
    }
  }),
  create_folder: tool({
    description: 'Create a folder in the workspace. Use relative paths from the workspace root (e.g., "src/components").',
    inputSchema: z.object({path: z.string().describe('Relative path from workspace root')}),
    execute: async ({ path: folderPath }) => {
        console.log('[WorkspaceTools] Creating folder:', folderPath);
        const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, folderPath)));
        if (entries.length > 0) {
          console.log('[WorkspaceTools] Folder already exists:', folderPath);
          return { success: true, path: folderPath, message: 'Folder already exists' };
        }
        await vscode.workspace.fs.createDirectory(vscode.Uri.file(path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, folderPath)));
        console.log('[WorkspaceTools] Folder created successfully:', folderPath);
        return { success: true, path: folderPath, message: 'Folder created successfully' };

    }})
};