import React from 'react';
import { ArrowRight, BookOpen, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';
import HeroDashboard from './HeroDashboard';

export default function Hero({ onOpenDocs, onOpenPlayground }) {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Editorial Value Proposition */}
          <div className="hero-content">
            {/* Small Badge */}
            <div className="hero-badge">
              <span className="badge-pulse"></span>
              <span>Powered by AssemblyAI</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-title">
              Build voice agents that actually feel natural.
            </h1>

            {/* Description */}
            <p className="hero-description">
              Create real-time voice experiences with speech recognition, intelligent routing, tool calling, and natural voice responses through one simple connection.
            </p>

            {/* Primary Action Buttons */}
            <div className="hero-buttons">
              <button onClick={onOpenPlayground} className="btn-primary hero-btn-main">
                <span>Start Building</span>
                <ArrowRight size={15} />
              </button>

              <button onClick={onOpenDocs} className="btn-secondary hero-btn-sub">
                <BookOpen size={15} />
                <span>View Documentation</span>
              </button>
            </div>

            {/* Quick Proof Points */}
            <div className="hero-features-list">
              <div className="feature-item">
                <CheckCircle2 size={15} className="check-icon" />
                <span>Universal-3 Pro Streaming</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={15} className="check-icon" />
                <span>Turn-taking & Acoustic VAD</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={15} className="check-icon" />
                <span>Instant JSON Tool Calling</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Product Dashboard */}
          <div className="hero-dashboard-col">
            <HeroDashboard onOpenPlayground={onOpenPlayground} />
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          padding: 72px 0 80px 0;
          background: var(--bg-page);
          position: relative;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 56px;
          align-items: center;
        }

        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          padding: 5px 12px;
          border-radius: 999px;
          margin-bottom: 24px;
          box-shadow: var(--shadow-xs);
        }

        .badge-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-blue);
          box-shadow: 0 0 0 2px var(--accent-blue-border);
        }

        .hero-title {
          font-size: 52px;
          line-height: 1.08;
          letter-spacing: -0.035em;
          color: var(--text-primary);
          margin-bottom: 20px;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 38px;
          }
        }

        .hero-description {
          font-size: 18px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 32px;
          max-width: 520px;
        }

        .hero-buttons {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }

        .hero-btn-main {
          padding: 12px 24px;
          font-size: 14.5px;
        }

        .hero-btn-sub {
          padding: 12px 20px;
          font-size: 14.5px;
        }

        .hero-features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          padding-top: 18px;
          border-top: 1px solid var(--border-subtle);
          width: 100%;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .check-icon {
          color: var(--status-success);
        }

        .hero-dashboard-col {
          width: 100%;
        }
      `}</style>
    </section>
  );
}
