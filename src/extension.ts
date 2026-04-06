// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SurferSidebarProvider } from './SurferSidebarProvider';
import { SurferRightSidebarProvider } from './SurferRightSidebarProvider';
import { initGroq } from './Groq';
import { initGroqProvider } from './agents/groqProvider';

export async function activate(context: vscode.ExtensionContext) {
  const createProjectCommand = 'surfer.createProject';
  
  const terminal = vscode.window.createTerminal('Surfer AI');


  const commandHandler = async () => {
    const projectType = await vscode.window.showQuickPick(
      [
        { label: 'Vite Project, React, TypeScript', description: 'Create a new React application', value: 'react' },
        { label: 'Next.js Project', description: 'Create a Next.js application', value: 'nextjs' },
        { label: 'Tanstack project', description: 'Create a tanstack application', value: 'tanstack' },
        { label: 'React Native Project', description: 'Create a React Native application', value: 'react-native' }

      ],
      {
        placeHolder: 'Select a project type to create',
        title: 'Create New Project'
      }
    );

    if (!projectType) {
      return; // User cancelled
    }

    switch (projectType.value) {
      case 'react':
        vscode.window.showInformationMessage('Creating vite project...');
        terminal.show();
        terminal.sendText('npm create vite@latest . -- --template react-ts');
        break;
      case 'tanstack':
        vscode.window.showInformationMessage('Creating Tanstack project...');
        terminal.show();
        terminal.sendText('npx @tanstack/cli@latest create');
        break;
      case 'nextjs':
        vscode.window.showInformationMessage('Creating Next.js project...');
        terminal.show();
        terminal.sendText('npx create-next-app@latest ./ --yes');
        break;
      case 'react-native':
        vscode.window.showInformationMessage('Creating React Native project...');
        terminal.show();
        terminal.sendText('npx create-expo-app@latest');
        break;
    }
  };

  context.subscriptions.push(vscode.commands.registerCommand(createProjectCommand, commandHandler));


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
  console.log('[Extension] Chat Panel provider registered');

  console.log('[Extension] Retrieving Groq API key');
  let apiKey = await context.secrets.get('groq-api-key');
  
  if (!apiKey) {
    console.log('[Extension] No API key found, prompting user');
    apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your Groq API key (get one free at console.groq.com)',
      password: true,
      placeHolder: 'gsk_...'
    }) ?? '';
    if (apiKey && apiKey.trim()) {
      try {
        await context.secrets.store('groq-api-key', apiKey);
        console.log('[Extension] API key stored successfully');
      } catch (error) {
        console.error('[Extension] Failed to store API key:', error);
        vscode.window.showErrorMessage('Failed to store API key. Please try again.');
      }
    } else {
      console.log('[Extension] No API key provided - extension features will be limited');
      vscode.window.showWarningMessage(
        'surfer: No API key provided. Please restart VS Code and enter your Groq API key to use AI features.'
      );
      return;
    }
  } else {
    console.log('[Extension] API key found in secrets');
  }

  // Command to update API key
  const updateApiKeyCommand = vscode.commands.registerCommand('surfer.updateApiKey', async () => {
    const newApiKey = await vscode.window.showInputBox({
      prompt: 'Enter your new Groq API key',
      password: true,
      placeHolder: 'gsk_...'
    });
    if (newApiKey && newApiKey.trim()) {
      try {
        await context.secrets.store('groq-api-key', newApiKey);
        initGroq(newApiKey);
        initGroqProvider(newApiKey);
        vscode.window.showInformationMessage('Groq API key updated successfully! Please reload the window.');
      } catch (error) {
        vscode.window.showErrorMessage('Failed to update API key.');
      }
    }
  });
  context.subscriptions.push(updateApiKeyCommand);


}

export function deactivate() {}
