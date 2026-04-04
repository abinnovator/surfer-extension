import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ChatPanel } from './ChatPanel';

console.log('RightIndex.tsx loaded');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<ChatPanel />);
  console.log('ChatPanel rendered');
} else {
  console.error('Root element not found!');
}