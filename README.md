# surfer - AI Agentic Coding Assistant

**surfer** is an intelligent VS Code extension powered by AI that helps you create, modify, and manage files in your workspace through natural language commands. Think of it as your AI coding companion that understands what you want to build and creates it for you.

## ✨ Features

### 🤖 AI-Powered Task Execution
- **Natural Language Commands**: Simply describe what you want to build, and surfer will create it for you
- **Multi-Agent Architecture**: Intelligent agents work together to understand, plan, and execute your requests
- **File Operations**: Automatically creates files, folders, and manages your project structure

### 🎯 Task Panel
- Dedicated sidebar panel for assigning tasks to the AI agent
- Real-time progress updates as the agent works
- Clear feedback on task completion or errors

### 💬 AI Chat Interface
- Interactive chat panel for conversing with the AI
- Get coding assistance, explanations, and guidance
- Context-aware responses based on your workspace

### 🛠️ Workspace Tools
The AI agent has access to powerful workspace tools:
- **Read Files**: Analyze existing code and understand your project structure
- **Create Files**: Generate new files with complete, working code
- **List Files**: Explore workspace contents
- **Create Folders**: Organize your project structure
- **Run Terminal Commands**: Execute commands in your workspace

## 📋 Requirements

- Visual Studio Code v1.110.0 or higher
- **Groq API Key**: You'll need a free API key from [Groq](https://console.groq.com)

## 🚀 Getting Started

1. **Install the Extension**
   - Install surfer from the VS Code Marketplace or OpenVSX
   
2. **Set Up Your API Key**
   - On first activation, you'll be prompted to enter your Groq API key
   - The key is securely stored in VS Code's secret storage
   - Don't have a key? Get one free at [console.groq.com](https://console.groq.com)

3. **Open a Workspace**
   - Open a folder in VS Code where you want to work
   
4. **Start Using surfer**
   - Click the surfer icon in the Activity Bar (sidebar)
   - Type your task in the Task Panel (e.g., "create a simple HTML landing page")
   - Press Enter and watch surfer work!

## 📖 Usage Examples

Here are some tasks you can assign to surfer:

- **"Create a React component for a login form"**
- **"Build a simple Express.js API with CRUD endpoints"**
- **"Generate a Python script to process CSV files"**
- **"Create an HTML/CSS/JS calculator"**
- **"Set up a basic Node.js project with TypeScript"**

## 🎨 Interface

surfer adds two panels to VS Code:

1. **Task Panel** (Left Sidebar)
   - Primary interface for assigning coding tasks
   - Shows real-time progress and status
   - Displays completion messages and results

2. **Surfer AI Chat** (Right Sidebar)
   - Interactive chat interface
   - Ask questions and get AI assistance
   - Conversational coding help

## ⚙️ How It Works

surfer uses a sophisticated multi-agent system:

1. **Orchestrator Agent**: Receives your request and coordinates the workflow
2. **Coder Agent**: Executes file operations and writes code
3. **Workspace Tools**: Provides the agent with abilities to interact with your files

The agents are powered by Groq's high-performance AI models, ensuring fast and accurate responses.

## 🔒 Privacy & Security

- Your Groq API key is stored securely using VS Code's built-in secret storage
- No code or data is sent to any servers except Groq's API for processing
- All file operations happen locally in your workspace

## 🐛 Known Issues

- Currently in early development (v0.0.1)
- Limited to 20 agent steps per task
- Error handling is basic and will be improved

## 📝 Release Notes

### 0.0.1 (Initial Release)

- AI-powered task execution with natural language commands
- Task Panel for assigning work to the AI agent
- AI Chat Panel for interactive assistance
- Workspace file operations (read, create, list, organize)
- Integration with Groq API for fast AI inference
- Secure API key storage

## 🤝 Contributing

This extension is in active development. Feedback, bug reports, and contributions are welcome!


## 🙏 Acknowledgments

- Powered by [Groq](https://groq.com) for lightning-fast AI inference
- Built with the [Vercel AI SDK](https://sdk.vercel.ai)

---

**Enjoy coding with surfer! 🚀**
