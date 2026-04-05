import * as vscode from 'vscode';
import { runAgent } from './AgentRunner';
import { isGroqProviderInitialized } from './agents/groqProvider';

export class SurferSidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    console.log('[SurferSidebarProvider] Resolving Task Panel webview');
    
    this._view = webviewView;
    
    webviewView.webview.options = { 
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    
    // Important: Set this before setting HTML to prevent re-renders
    webviewView.webview.html = this._getHtml(webviewView.webview);
    console.log('[SurferSidebarProvider] Task Panel HTML set');

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      console.log('[SurferSidebarProvider] Received message:', message);
      
      if (message.command === 'assignTask') {
        console.log('[SurferSidebarProvider] Task assigned:', message.task);
        
        // Check if Groq provider is initialized
        if (!isGroqProviderInitialized()) {
          console.error('[SurferSidebarProvider] Groq provider not initialized');
          
          webviewView.webview.postMessage({
            command: 'taskUpdate',
            status: 'error',
            message: 'No API key configured. Please reload VS Code and enter your Groq API key.'
          });
          
          vscode.window.showErrorMessage(
            'surfer: No API key configured. Please reload VS Code and enter your Groq API key.',
            'Get API Key'
          ).then(selection => {
            if (selection === 'Get API Key') {
              vscode.env.openExternal(vscode.Uri.parse('https://console.groq.com'));
            }
          });
          
          return;
        }
        
        try {
          console.log('[SurferSidebarProvider] Starting agent execution...');
          
          // Show progress notification
          vscode.window.showInformationMessage(
            `Surfer: Processing task — "${message.task}"`
          );

          // Send status update to webview
          webviewView.webview.postMessage({
            command: 'taskUpdate',
            status: 'running',
            message: 'Starting agent...'
          });

          // Run the agent
          const result = await runAgent(message.task, (update) => {
            console.log('[SurferSidebarProvider] Agent update:', update);
            webviewView.webview.postMessage({
              command: 'taskUpdate',
              status: 'running',
              message: update
            });
          });

          console.log('[SurferSidebarProvider] Agent completed successfully');
          console.log('[SurferSidebarProvider] Result:', result);

          // Send completion to webview
          webviewView.webview.postMessage({
            command: 'taskUpdate',
            status: 'done',
            message: 'Task completed!',
            result: result
          });

          vscode.window.showInformationMessage(
            `Surfer: Task completed!`
          );

        } catch (error) {
          console.error('[SurferSidebarProvider] Agent execution failed:', error);
          
          webviewView.webview.postMessage({
            command: 'taskUpdate',
            status: 'error',
            message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          });

          vscode.window.showErrorMessage(
            `Surfer: Task failed — ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    });
    
    console.log('[SurferSidebarProvider] Task Panel ready');
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