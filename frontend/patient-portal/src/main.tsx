import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(8, 17, 34, 0.92)',
          color: '#f8fafc',
          border: '1px solid rgba(125, 211, 252, 0.2)',
        },
      }}
    />
  </React.StrictMode>,
);
