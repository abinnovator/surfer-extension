import * as vscode from 'vscode';

export class SurferSidebarProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = { 
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    
    // Important: Set this before setting HTML to prevent re-renders
    webviewView.webview.html = this._getHtml(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'assignTask') {
        // Claude API call goes here later
        vscode.window.showInformationMessage(
          `Surfer: Task assigned — "${message.task}"`
        );
      }
    });
  }

  private _getHtml(webview: vscode.Webview): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'index.js')
  );

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <div id="root"></div>
    <script src="${scriptUri}"></script>
  </body>
  </html>`;
}
}