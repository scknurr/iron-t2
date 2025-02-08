// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css'; // Global CSS

// If you installed Workday CanvasKit via npm and want the CSS globally:
// import '@workday/canvas-kit-css/dist/canvas-kit.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
