import * as React from 'react';

const vscode = (() => {
  try {
    return (window as any).acquireVsCodeApi();
  } catch {
    return (window as any).vscode;
  }
})();
interface Task {
  id: number;
  text: string;
  status: 'running' | 'done' | 'queued';
}

export function TaskPanel() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [input, setInput] = React.useState('');

  const updateTaskStatus = (id: number, status: 'running' | 'done' | 'queued') => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const removeTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const assignTask = () => {
    if (!input.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      text: input,
      status: 'running'
    };
    setTasks(prev => [newTask, ...prev]);
    setInput('');
    vscode.postMessage({ command: 'assignTask', task: input });
  };

  React.useEffect(() => {
    console.log('TaskPanel mounted');
    
    // Listen for messages from the extension
    const messageListener = (event: MessageEvent) => {
      const message = event.data;
      console.log('TaskPanel received message:', message);
      
      if (message.command === 'taskUpdate') {
        // Find the most recent running task and update its status
        setTasks(prev => {
          const runningTask = prev.find(t => t.status === 'running');
          if (!runningTask) return prev;
          
          return prev.map(t => 
            t.id === runningTask.id 
              ? { ...t, status: message.status === 'done' ? 'done' : 'running' }
              : t
          );
        });
      }
    };
    
    window.addEventListener('message', messageListener);
    
    return () => {
      console.log('TaskPanel unmounted');
      window.removeEventListener('message', messageListener);
    };
  }, []);

  return (
    <div style={{ padding: 12, fontFamily: 'var(--vscode-font-family)' }}>
      {/* Heading */}
      <h2 style={{
        fontSize: 11, fontWeight: 600,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'var(--vscode-descriptionForeground)',
        marginBottom: 12
      }}>
         Surfer Tasks
      </h2>

      <textarea
        rows={3}
        value={input}
        onChange={e => {
          console.log('Input change:', e.target.value);
          setInput(e.target.value);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            assignTask();
          }
        }}
        placeholder="Assign a task... e.g. write tests for loginUser()"
        style={{
          width: '100%',
          background: 'var(--vscode-input-background)',
          color: 'var(--vscode-input-foreground)',
          border: '1px solid var(--vscode-input-border)',
          borderRadius: 4, padding: 8,
          fontSize: 12, resize: 'none',
          fontFamily: 'var(--vscode-font-family)',
          marginBottom: 8
        }}
      />

      <button
        onClick={assignTask}
        style={{
          width: '100%', padding: 6,
          background: 'var(--vscode-button-background)',
          color: 'var(--vscode-button-foreground)',
          border: 'none', borderRadius: 4,
          cursor: 'pointer', fontSize: 12
        }}
      >
        Assign to AI
      </button>

      <div style={{ marginTop: 16 }}>
        {tasks.map(task => (
          <div key={task.id} style={{
            background: 'var(--vscode-editor-background)',
            border: '1px solid var(--vscode-widget-border)',
            borderRadius: 4, padding: 8,
            marginBottom: 8, fontSize: 12
          }}>
            <div>{task.text}</div>
            <div style={{ fontSize: 10, color: '#3de8c0', marginTop: 4 }}>
              {task.status === 'running' ? ' Running...' :
               task.status === 'done' ? 'Done' : ' Queued'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}