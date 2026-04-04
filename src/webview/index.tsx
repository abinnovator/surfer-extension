import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { TaskPanel } from './TaskPanel';

console.log('index.tsx loaded');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<TaskPanel />);
  console.log('TaskPanel rendered');
} else {
  console.error('Root element not found!');
}