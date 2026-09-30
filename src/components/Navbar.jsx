import React from 'react';
import { Mic, Key, Settings as SettingsIcon, Terminal, Activity, CheckCircle, ShieldAlert } from 'lucide-react';

export default function Navbar({ activeView, setActiveView, serverStatus, onOpenKeyConfig }) {
  return (
    <header className="navbar-container">
      <div className="container nav-content">
        {/* Brand / Logo */}
        <button 
          onClick={() => setActiveView('home')} 
          className="nav-logo-btn"
          aria-label="Voxely Home"
        >
          <div className="logo-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18M17 7v10M7 7v10M2 11v2M22 11v2" />
            </svg>
          </div>
          <span className="logo-text">VOXELY</span>
        </button>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button 
            onClick={() => setActiveView('home')} 
            className={`nav-tab-btn ${activeView === 'home' ? 'active' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => setActiveView('assistant')} 
            className={`nav-tab-btn ${activeView === 'assistant' ? 'active' : ''}`}
          >
            Assistant
          </button>
          <button 
            onClick={() => setActiveView('tools')} 
            className={`nav-tab-btn ${activeView === 'tools' ? 'active' : ''}`}
          >
            Tools
          </button>
          <button 
            onClick={() => setActiveView('history')} 
            className={`nav-tab-btn ${activeView === 'history' ? 'active' : ''}`}
          >
            History
          </button>
          <button 
            onClick={() => setActiveView('settings')} 
            className={`nav-tab-btn ${activeView === 'settings' ? 'active' : ''}`}
          >
            Settings
          </button>
        </nav>

        {/* Right Status & Quick Action */}
        <div className="nav-actions">
          {/* Connection status */}
          <div 
            className={`connection-status-pill ${serverStatus?.configured ? 'live' : 'demo'}`}
            title={serverStatus?.configured ? "Connected to AssemblyAI Voice Agent Engine" : "Connected in Local Demo Mode"}
          >
            <span className={`status-dot ${serverStatus?.configured ? 'dot-live' : 'dot-demo'}`}></span>
            <span className="status-label">
              {serverStatus?.configured ? 'Connected' : 'Demo Mode'}
            </span>
          </div>

          <button 
            onClick={onOpenKeyConfig} 
            className="btn-icon-secondary"
            title="Configure AssemblyAI Credentials"
            aria-label="API Settings"
          >
            <Key size={15} />
          </button>

          <button 
            onClick={() => setActiveView('assistant')} 
            className="btn-accent nav-mic-cta"
          >
            <Mic size={15} />
            <span>Talk to Voxely</span>
          </button>
        </div>
      </div>

      <style>{`
        .navbar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(250, 249, 245, 0.94);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-subtle);
          height: var(--nav-height);
        }

        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
        }

        .nav-logo-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }

        .logo-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-xs);
          background: var(--text-primary);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease;
        }

        .nav-logo-btn:hover .logo-icon-wrap {
          transform: scale(1.04);
        }

        .logo-text {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-muted);
          padding: 4px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }

        .nav-tab-btn {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-secondary);
          padding: 6px 14px;
          border-radius: var(--radius-xs);
          cursor: pointer;
          background: transparent;
          border: none;
          transition: all 0.15s ease;
        }

        .nav-tab-btn:hover {
          color: var(--text-primary);
        }

        .nav-tab-btn.active {
          background: #FFFFFF;
          color: var(--text-primary);
          font-weight: 600;
          box-shadow: var(--shadow-xs);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .connection-status-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-family: var(--font-mono);
          font-weight: 500;
        }

        .connection-status-pill.live {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: #166534;
        }

        .connection-status-pill.demo {
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          color: #92400E;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .dot-live {
          background: #16A34A;
          box-shadow: 0 0 0 2px #BBF7D0;
        }

        .dot-demo {
          background: #D97706;
          box-shadow: 0 0 0 2px #FDE68A;
        }

        .btn-icon-secondary {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-xs);
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-icon-secondary:hover {
          background: var(--bg-muted);
          color: var(--text-primary);
          border-color: #D6D3CB;
        }

        .nav-mic-cta {
          padding: 8px 16px;
          font-size: 13.5px;
        }

        @media (max-width: 860px) {
          .nav-links {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
