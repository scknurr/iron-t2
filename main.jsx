// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css'; // your global CSS
import '@workday/canvas-kit-css/dist/canvas-kit.css';


// If you installed Workday Canvas kit via npm, optionally import the CSS here:
// import '@workday/canvas-kit-css/dist/canvas-kit.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
