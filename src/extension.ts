// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SurferSidebarProvider } from './SurferSidebarProvider';
import { SurferRightSidebarProvider } from './SurferRightSidebarProvider';
import { initGroq } from './Groq';
import { initGroqProvider } from './agents/groqProvider';

export async function activate(context: vscode.ExtensionContext) {

	console.log('=== POINTER EXTENSION ACTIVATING ===');
	console.log('Congratulations, your extension "pointer" is now active!');

	console.log('[Extension] Creating Task Panel provider');
	const provider = new SurferSidebarProvider(context.extensionUri);
 	 context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'surfer.taskPanel',
      provider
    )
  );
  console.log('[Extension] Task Panel provider registered');

  console.log('[Extension] Creating Chat Panel provider');
  const SecondaryProvider = new SurferRightSidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'surfer.aiPanel',
      SecondaryProvider
    ))
  console.log('[Extension] Chat Panel provider registered');

  console.log('[Extension] Retrieving Groq API key');
  let apiKey = await context.secrets.get('groq-api-key');
  
  if (!apiKey) {
    console.log('[Extension] No API key found, prompting user');
    apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your Groq API key',
      password: true
    }) ?? '';
    if (apiKey) {
      await context.secrets.store('groq-api-key', apiKey);
      console.log('[Extension] API key stored');
    }
  } else {
    console.log('[Extension] API key found in secrets');
  }

  console.log('[Extension] Initializing Groq');
  initGroq(apiKey);

  // Initialize Groq provider for AI SDK agents
  if (apiKey) {
    console.log('[Extension] Initializing Groq provider for AI SDK agents');
    initGroqProvider(apiKey);
  }

  console.log('=== POINTER EXTENSION ACTIVATED ===');
}

// This method is called when your extension is deactivated
export function deactivate() {}
