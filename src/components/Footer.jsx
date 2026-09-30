import React from 'react';

export default function Footer({ onOpenDocs, onOpenKeyConfig }) {
  return (
    <footer className="footer-wrapper">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <div className="logo-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18M17 7v10M7 7v10M2 11v2M22 11v2" />
                </svg>
              </div>
              <span className="logo-text">Voxely</span>
            </div>
            <p className="footer-tagline">
              Build voice agents that actually feel natural. Powered by AssemblyAI Universal-3 Pro.
            </p>
            <div className="footer-status-tag">
              <span className="dot-green"></span>
              <span>AssemblyAI Voice Agent API v1.0.0</span>
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4 className="footer-col-title">Product</h4>
              <ul className="footer-list">
                <li><a href="#features">Features</a></li>
                <li><a href="#playground">Live Playground</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#use-cases">Use Cases</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Developers</h4>
              <ul className="footer-list">
                <li><button onClick={onOpenDocs} className="footer-btn-link">Documentation</button></li>
                <li><a href="#developers">Quickstart SDK</a></li>
                <li><button onClick={onOpenKeyConfig} className="footer-btn-link">API Key Configuration</button></li>
                <li><a href="https://github.com/AssemblyAI" target="_blank" rel="noreferrer">GitHub</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Resources</h4>
              <ul className="footer-list">
                <li><a href="#use-cases">Use Cases</a></li>
                <li><a href="https://www.assemblyai.com" target="_blank" rel="noreferrer">AssemblyAI</a></li>
                <li><a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Voxely processes real-time audio streams ephemerally. No voice data is stored without explicit developer opt-in."); }}>Privacy</a></li>
                <li><a href="mailto:support@voxely.dev">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            © {new Date().getFullYear()} Voxely. Built for the AssemblyAI Voice Agent Hackathon.
          </div>
          <div className="footer-fineprint">
            Universal-3 Pro Streaming • VAD • JSON-Schema Tool Calling
          </div>
        </div>
      </div>

      <style>{`
        .footer-wrapper {
          background: #FFFFFF;
          border-top: 1px solid var(--border-subtle);
          padding: 64px 0 36px 0;
          font-size: 13.5px;
        }

        .footer-top {
          display: grid;
          grid-template-columns: 1.4fr 2fr;
          gap: 48px;
          margin-bottom: 48px;
        }

        @media (max-width: 800px) {
          .footer-top {
            grid-template-columns: 1fr;
          }
        }

        .footer-brand-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon-wrap {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-xs);
          background: var(--text-primary);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .footer-tagline {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          max-width: 320px;
        }

        .footer-status-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          background: var(--bg-muted);
          padding: 4px 8px;
          border-radius: var(--radius-xs);
          border: 1px solid var(--border-light);
        }

        .dot-green {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16A34A;
        }

        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .footer-col-title {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 14px;
        }

        .footer-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-list a, .footer-btn-link {
          color: var(--text-secondary);
          font-size: 13px;
          transition: color 0.15s ease;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
        }

        .footer-list a:hover, .footer-btn-link:hover {
          color: var(--text-primary);
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 28px;
          border-top: 1px solid var(--border-subtle);
          font-size: 12px;
          color: var(--text-muted);
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-fineprint {
          font-family: var(--font-mono);
        }
      `}</style>
    </footer>
  );
}
