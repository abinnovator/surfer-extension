import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { createAgent } from 'surfer-sdk';

export class SurferSidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    console.log('[SurferSidebarProvider] Resolving Task Panel webview');
    
    this._view = webviewView;
    
    webviewView.webview.options = { 
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    
    webviewView.webview.html = this._getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'assignTask') {

        const token = await this._context.secrets.get('surfer-token')

        if (!token) {
          webviewView.webview.postMessage({
            command: 'taskUpdate',
            status: 'error',
            message: 'Not signed in. Run "Surfer: Sign In" first.'
          })
          vscode.window.showErrorMessage(
            'Surfer: Please sign in first.',
            'Sign In'
          ).then(selection => {
            if (selection === 'Sign In') {
              vscode.commands.executeCommand('surfer.signIn')
            }
          })
          return
        }

        try {
          vscode.window.showInformationMessage(`Surfer: Processing task — "${message.task}"`)

          webviewView.webview.postMessage({
            command: 'taskUpdate',
            status: 'running',
            message: 'Starting agent...'
          })

          const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath
          const workspaceFiles = workspaceRoot ? getAllFiles(workspaceRoot, workspaceRoot) : []

          const agent = createAgent(token)

          const result = await agent.run(
            message.task,
            workspaceFiles,
            {
              create_file: async (args: Record<string, any>) => {
                if (!workspaceRoot) return 'No workspace open'
                const fullPath = path.join(workspaceRoot, args.path)
                fs.mkdirSync(path.dirname(fullPath), { recursive: true })
                fs.writeFileSync(fullPath, args.content)
                webviewView.webview.postMessage({
                  command: 'taskUpdate',
                  status: 'running',
                  message: `Created: ${args.path}`
                })
                return `Created file: ${args.path}`
              },
              edit_file: async (args: Record<string, any>) => {
                if (!workspaceRoot) return 'No workspace open'
                const fullPath = path.join(workspaceRoot, args.path)
                fs.mkdirSync(path.dirname(fullPath), { recursive: true })
                fs.writeFileSync(fullPath, args.content)
                webviewView.webview.postMessage({
                  command: 'taskUpdate',
                  status: 'running',
                  message: `Edited: ${args.path}`
                })
                return `Edited file: ${args.path}`
              },
              read_file: async (args: Record<string, any>) => {
                if (!workspaceRoot) return 'No workspace open'
                try {
                  return fs.readFileSync(path.join(workspaceRoot, args.path), 'utf8')
                } catch {
                  return `Could not read: ${args.path}`
                }
              },
              list_workspace_files: async (args: Record<string, any>) => {
                if (!workspaceRoot) return 'No workspace open'
                const dir = args.directory ? path.join(workspaceRoot, args.directory) : workspaceRoot
                return getAllFiles(dir, workspaceRoot).join('\n')
              },
              run_terminal: async (args: Record<string, any>) => {
                const terminal = vscode.window.createTerminal('Surfer AI')
                terminal.show()
                terminal.sendText(args.command)
                webviewView.webview.postMessage({
                  command: 'taskUpdate',
                  status: 'running',
                  message: `Running: ${args.command}`
                })
                return `Running: ${args.command}`
              }
            },
            (step, msg) => {
              webviewView.webview.postMessage({
                command: 'taskUpdate',
                status: 'running',
                message: msg
              })
            }
          )

          webviewView.webview.postMessage({
            command: 'taskUpdate',
            status: 'done',
            message: result
          })

          vscode.window.showInformationMessage('Surfer: Task completed!')

        } catch (error) {
          console.error('[SurferSidebarProvider] Task failed:', error)
          webviewView.webview.postMessage({
            command: 'taskUpdate',
            status: 'error',
            message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
          vscode.window.showErrorMessage(
            `Surfer: Task failed — ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        }
      }
    });
  }

  private _getHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'index.js')
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
      html, body { height: 100%; width: 100%; overflow: hidden; background: transparent; }
      #root { height: 100%; width: 100%; }
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
  } catch {}
  return files
}