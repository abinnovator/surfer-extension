import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { createSurfer } from 'surfer-sdk';

export class SurferRightSidebarProvider implements vscode.WebviewViewProvider {
  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    console.log('[SurferRightSidebarProvider] Resolving Chat Panel webview');
    
    webviewView.webview.options = { 
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    
    webviewView.webview.html = this._getHtml(webviewView.webview);
    console.log('[SurferRightSidebarProvider] Chat Panel HTML set');

    webviewView.webview.onDidReceiveMessage(async (message) => {
      console.log('[SurferRightSidebarProvider] Received message:', message.command);

      if (message.command === 'sendChat') {
        console.log('[SurferRightSidebarProvider] Processing chat message');

        const token = await this._context.secrets.get('surfer-token')

        if (!token) {
          webviewView.webview.postMessage({
            command: 'chatResponse',
            content: 'Not signed in. Run "Surfer: Sign In" first.'
          })
          return
        }

        try {
          const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath
          const workspaceFiles = workspaceRoot ? getAllFiles(workspaceRoot, workspaceRoot) : []

          const surfer = createSurfer(token)

          const response = await surfer.chat(message.messages, {
            workspaceFiles,
            workspaceRoot: workspaceRoot ? path.basename(workspaceRoot) : undefined,
            tools: {
              create_file: async (args: Record<string, any>) => {
              const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath
              if (!workspacePath) return 'No workspace folder open'
              const fullPath = path.join(workspacePath, args.path)
              fs.mkdirSync(path.dirname(fullPath), { recursive: true })
              fs.writeFileSync(fullPath, args.content)
              return `Created file: ${args.path}`
            },

            read_file: async (args: Record<string, any>) => {
              const wsPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath
              if (!wsPath) return 'No workspace folder open'
              try {
                const fullPath = path.join(wsPath, args.path)
                const content = fs.readFileSync(fullPath, 'utf8')
                return `📄 **${args.path}**:\n\`\`\`\n${content}\n\`\`\``
              } catch {
                return `Could not read file: ${args.path}`
              }
            },

            run_terminal: async (args: Record<string, any>) => {
              const terminal = vscode.window.createTerminal('Surfer AI')
              terminal.show()
              terminal.sendText(args.command)
              return `🖥️ Running: \`${args.command}\``
            },

            list_workspace_files: async (args: Record<string, any>) => {
              const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath
              if (!workspaceRoot) return 'No workspace folder open'
              const dir = args.directory ? path.join(workspaceRoot, args.directory) : workspaceRoot
              const files = getAllFiles(dir, workspaceRoot)
              return `📁 Workspace files:\n\`\`\`\n${files.join('\n')}\n\`\`\``
            },

            add_task: async (args: Record<string, any>) => {
              vscode.commands.executeCommand('surfer.addTask', args.task)
              return `Added task: ${args.task}`
            },
            edit_file: async (args: Record<string, any>) => {
              const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath
              if (!workspacePath) return 'No workspace folder open'
              const fullPath = path.join(workspacePath, args.path)
              fs.mkdirSync(path.dirname(fullPath), { recursive: true })
              fs.writeFileSync(fullPath, args.content)
              return `Edited file: ${args.path}`
            },
            }
          })

          webviewView.webview.postMessage({
            command: 'chatResponse',
            content: response
          })

        } catch (error) {
          console.error('[SurferRightSidebarProvider] Error:', error)
          webviewView.webview.postMessage({
            command: 'chatResponse',
            content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
        }
      }
    });
  }

  private _getHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'RightIndex.js')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline' ${webview.cspSource}; connect-src https://surfer-dash.vercel.app;">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      height: 100%; 
      width: 100%;
      overflow: hidden;
      background: transparent;
    }
    #root {
      height: 100%;
      width: 100%;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getAllFiles(dir: string, root: string, files: string[] = []): string[] {
  const ignored = ['node_modules', '.git', 'out', 'dist', '.next']
  
  try {
    const items = fs.readdirSync(dir)
    for (const item of items) {
      if (ignored.includes(item)) continue
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        getAllFiles(fullPath, root, files)
      } else {
        files.push(path.relative(root, fullPath))
      }
    }
  } catch {
  }
  
  return files
}