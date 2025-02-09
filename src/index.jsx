// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import CanvasKit's SCSS for global styling:
import '@workday/canvas-kit-react/core/index.scss';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
