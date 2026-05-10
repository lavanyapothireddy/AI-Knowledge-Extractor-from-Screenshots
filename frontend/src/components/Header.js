import React from 'react';
import { Cpu, Zap } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header glass">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-icon">
            <Cpu size={20} />
          </div>
          <div className="logo-text">
            <span className="logo-title">KnowledgeX</span>
            <span className="logo-sub">AI Screenshot Extractor</span>
          </div>
        </div>

        <nav className="header-nav">
          <div className="status-badge">
            <Zap size={12} />
            <span>Claude Powered</span>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
