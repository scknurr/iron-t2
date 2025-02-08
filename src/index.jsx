// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css'; // Global CSS
// Option A: Precompiled CSS
import '@workday/canvas-kit-react/dist/index.css';

// If you installed Workday CanvasKit via npm and want the CSS globally:
// import '@workday/canvas-kit-css/dist/canvas-kit.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);