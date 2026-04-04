import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getGroqChatCompletion } from './Groq';

export class SurferRightSidebarProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = { 
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    
    webviewView.webview.html = this._getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      console.log('Received message:', message.command);

      if (message.command === 'sendChat') {
        try {
          const response = await getGroqChatCompletion(message.messages);
          const choice = response.choices[0];

          console.log('Finish reason:', choice.finish_reason);
          console.log('Tool calls:', JSON.stringify(choice.message.tool_calls));
          console.log('Content:', choice.message.content);

          // AI wants to call a tool
          if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
            for (const toolCall of choice.message.tool_calls) {
              const args = JSON.parse(toolCall.function.arguments);

              switch (toolCall.function.name) {
                case 'add_task':
                  webviewView.webview.postMessage({
                    command: 'chatResponse',
                    content: `Added task: ${args.task}`
                  })
                  // Also forward to task panel
                  vscode.commands.executeCommand('surfer.addTask', args.task)
                  break

                case 'create_file':
                  const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath
                  if (workspacePath) {
                    const fullPath = path.join(workspacePath, args.path)
                    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
                    fs.writeFileSync(fullPath, args.content)
                    webviewView.webview.postMessage({
                      command: 'chatResponse',
                      content: `Created file: ${args.path}`
                    })
                  } else {
                    webviewView.webview.postMessage({
                      command: 'chatResponse',
                      content: 'No workspace folder open'
                    })
                  }
                  break

                case 'read_file':
                  const wsPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath
                  if (wsPath) {
                    try {
                      const filePath = path.join(wsPath, args.path)
                      const content = fs.readFileSync(filePath, 'utf8')
                      // Send file content back to AI for context
                      webviewView.webview.postMessage({
                        command: 'chatResponse',
                        content: `📄 **${args.path}**:\n\`\`\`\n${content}\n\`\`\``
                      })
                    } catch {
                      webviewView.webview.postMessage({
                        command: 'chatResponse',
                        content: ` Could not read file: ${args.path}`
                      })
                    }
                  }
                  break

                case 'run_terminal':
                  const terminal = vscode.window.createTerminal('Surfer AI')
                  terminal.show()
                  terminal.sendText(args.command)
                  webviewView.webview.postMessage({
                    command: 'chatResponse',
                    content: `🖥️ Running: \`${args.command}\``
                  })
                  break
                case 'list_workspace_files':
                  const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath
                  if (workspaceRoot) {
                    const dir = args.directory ? path.join(workspaceRoot, args.directory) : workspaceRoot
                    const files = getAllFiles(dir, workspaceRoot)
                    
                    // Send file list back into the conversation
                    const fileList = files.join('\n')
                    webviewView.webview.postMessage({
                      command: 'chatResponse',
                      content: `📁 Workspace files:\n\`\`\`\n${fileList}\n\`\`\``
                    })
                  }
                  break
                default:
                  webviewView.webview.postMessage({
                    command: 'chatResponse',
                    content: `Unknown tool: ${toolCall.function.name}`
                  })
              }
            }
          } else {
            // Normal text reply
            webviewView.webview.postMessage({
              command: 'chatResponse',
              content: choice.message.content || 'No response'
            })
          }
        } catch (error) {
          console.error('Groq API error:', error);
          webviewView.webview.postMessage({
            command: 'chatResponse',
            content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
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
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline' ${webview.cspSource};">
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
        // Store relative path
        files.push(path.relative(root, fullPath))
      }
    }
  } catch {
    // skip unreadable dirs
  }
  
  return files
}