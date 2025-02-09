// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// index.ts
import '@workday/canvas-tokens-web/css/base/_variables.css';
import '@workday/canvas-tokens-web/css/system/_variables.css';
import '@workday/canvas-tokens-web/css/brand/_variables.css';

// Import CanvasKit's SCSS for global styling:

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
