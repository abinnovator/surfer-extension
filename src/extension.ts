// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SurferSidebarProvider } from './SurferSidebarProvider';
import { SurferRightSidebarProvider } from './SurferRightSidebarProvider';
import { initGroq } from './Groq';

export async function activate(context: vscode.ExtensionContext) {


	console.log('Congratulations, your extension "pointer" is now active!');

	const provider = new SurferSidebarProvider(context.extensionUri);
 	 context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'surfer.taskPanel',
      provider
    )
  );
  const SecondaryProvider = new SurferRightSidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'surfer.aiPanel',
      SecondaryProvider
    ))
  let apiKey = await context.secrets.get('groq-api-key');
  
  if (!apiKey) {
    apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your Groq API key',
      password: true
    }) ?? '';
    if (apiKey) await context.secrets.store('groq-api-key', apiKey);
  }

  initGroq(apiKey);
}

// This method is called when your extension is deactivated
export function deactivate() {}
