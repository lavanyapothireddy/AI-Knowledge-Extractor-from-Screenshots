import React from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import ExtractorPage from './pages/ExtractorPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#f0f0ff',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#0a0a0f' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' } },
        }}
      />
      <Header />
      <main className="main-content">
        <ExtractorPage />
      </main>
    </div>
  );
}

export default App;
