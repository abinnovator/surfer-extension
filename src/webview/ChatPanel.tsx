import * as React from 'react';

const vscode = (() => {
  try {
    return (window as any).acquireVsCodeApi();
  } catch {
    return (window as any).vscode;
  }
})();

// Helper function to format message content with code blocks
function formatMessageContent(content: string) {
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block (with inline code formatting)
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      parts.push(
        <span key={`text-${lastIndex}`} style={{ whiteSpace: 'pre-wrap' }}>
          {formatInlineCode(textBefore)}
        </span>
      );
    }

    // Add code block
    const language = match[1] || '';
    const code = match[2];
    parts.push(
      <div key={`code-${match.index}`} style={{
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 4,
        overflow: 'auto',
        background: 'var(--vscode-textCodeBlock-background)',
        border: '1px solid var(--vscode-widget-border)'
      }}>
        {language && (
          <div style={{
            fontSize: 10,
            padding: '4px 8px',
            color: 'var(--vscode-descriptionForeground)',
            borderBottom: '1px solid var(--vscode-widget-border)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {language}
          </div>
        )}
        <pre style={{
          margin: 0,
          padding: 8,
          fontSize: 11,
          fontFamily: 'var(--vscode-editor-font-family)',
          lineHeight: 1.5,
          overflow: 'auto'
        }}>
          <code>{code}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text (with inline code formatting)
  if (lastIndex < content.length) {
    const remainingText = content.substring(lastIndex);
    parts.push(
      <span key={`text-${lastIndex}`} style={{ whiteSpace: 'pre-wrap' }}>
        {formatInlineCode(remainingText)}
      </span>
    );
  }

  return parts.length > 0 ? parts : content;
}

// Helper function to format inline code (single backticks)
function formatInlineCode(text: string) {
  const parts: React.ReactNode[] = [];
  const inlineCodeRegex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match;

  while ((match = inlineCodeRegex.exec(text)) !== null) {
    // Add text before inline code
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add inline code
    parts.push(
      <code key={`inline-${match.index}`} style={{
        background: 'var(--vscode-textCodeBlock-background)',
        padding: '2px 4px',
        borderRadius: 3,
        fontSize: 11,
        fontFamily: 'var(--vscode-editor-font-family)',
        border: '1px solid var(--vscode-widget-border)'
      }}>
        {match[1]}
      </code>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function ChatPanel() {
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<{ role: string; content: string }[]>([]);
  
  React.useEffect(() => {
    console.log('ChatPanel mounted');
    
    // Listen for messages from the extension
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === 'chatResponse') {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: message.content 
        }]);
      }
    };
    
    window.addEventListener('message', messageHandler);
    return () => {
      console.log('ChatPanel unmounted');
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  const sendMessage = React.useCallback((message: string, role: string) => {
    // Add user message to UI
    const updatedMessages = [...messages, { role, content: message }];
    setMessages(updatedMessages);
    
    // Send full message history to extension host to call Groq API
    vscode.postMessage({ 
      command: 'sendChat', 
      messages: updatedMessages
    });
  }, [messages]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: '8px'
    }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: 8,
            padding: '6px 8px',
            borderRadius: 4,
            background: msg.role === 'user' 
              ? 'var(--vscode-input-background)' 
              : 'transparent',
            fontSize: 12,
            lineHeight: 1.5
          }}>
            <div style={{ 
              fontSize: 10, 
              fontWeight: 600,
              marginBottom: 4,
              color: msg.role === 'user' 
                ? '#3de8c0' 
                : 'var(--vscode-descriptionForeground)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {msg.role === 'user' ? 'You' : 'Surfer AI'}
            </div>
            <div style={{ color: 'var(--vscode-foreground)' }}>
              {formatMessageContent(msg.content)}
            </div>
          </div>
        ))}
      </div>

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
            if (!input.trim()) return;
            sendMessage(input, 'user');
            setInput('');
          }
        }}
        placeholder="Explore and understand code."
        style={{
          width: '100%',
          background: 'var(--vscode-input-background)',
          color: 'var(--vscode-input-foreground)',
          border: '1px solid var(--vscode-input-border)',
          borderRadius: 4,
          padding: 8,
          fontSize: 12,
          resize: 'none',
          fontFamily: 'var(--vscode-font-family)',
        }}
      />
    </div>
  );
}