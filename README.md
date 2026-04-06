# Surfer
Surfer is a VS Code extension that helps developers build apps faster by automating repetitive tasks. Its built on top of the vercel ai sdk and groq. It adds to panels to your IDE: The chat panel and the task panel. The chat panel is a chat interface that allows you to chat with the AI. The task panel is a task interface that allows you to create and manage tasks. The chat panel like its sounds is a simple coding chatbot while the task panel is run by a head orchestration agent and 3 sub agents. The head has to determine what agents need to be called. the three agents are: the planner agent, the coder agent and the reviewer agent. The planner agent is responsible for planning the tasks. The coder agent is responsible for coding the tasks. The reviewer agent is responsible for reviewing the code generated. The reviewer is called in particularly long or big tasks.

You can also press ctrl + shift+ p and search create project to get access to a quick create menu.  This will allow you to create web projects and react native projects. The menu supports these four frameworks - Vite, next.js , tanstack and expo.

# Tech Stack
- Vercel AI SDK
- Groq
- Tailwind CSS
- TypeScript
- VSCode Extension API

# How to use:
- First go to https://surfer-web-five.vercel.app
- Then click on the "Try now" link
- This will open the open-vsx registry page for the extension
- Click on the "download" button
- After the download is done go to your extensions panel in VS Code(or and editor which uses open vsx) and click on the three dots and click on "Install from VSIX..."
- After it is installed you will see two more badges in the primary panel.
-  Move one of them to the secondary sidebar for easy use and you are done!

# Video of how to install

https://surfer-web-five.vercel.app/demo