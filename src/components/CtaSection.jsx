import React from 'react';
import { ArrowRight, BookOpen, Terminal } from 'lucide-react';

export default function CtaSection({ onOpenPlayground, onOpenDocs }) {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-box card-clean">
          <div className="cta-content">
            <span className="cta-badge">GET STARTED WITH VOXELY</span>
            <h2 className="cta-title">Give your product a voice.</h2>
            <p className="cta-text">
              Build real-time conversations without stitching together the entire voice stack yourself.
            </p>

            <div className="cta-buttons">
              <button onClick={onOpenPlayground} className="btn-primary cta-btn">
                <span>Start Building</span>
                <ArrowRight size={15} />
              </button>

              <button onClick={onOpenDocs} className="btn-secondary cta-btn">
                <BookOpen size={15} />
                <span>Read the Docs</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cta-section {
          padding: 80px 0;
          background: #FAF9F5;
        }

        .cta-box {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 64px 32px;
          text-align: center;
          box-shadow: var(--shadow-sm);
        }

        .cta-content {
          max-width: 620px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cta-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--accent-blue);
          margin-bottom: 16px;
        }

        .cta-title {
          font-size: 42px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        @media (max-width: 640px) {
          .cta-title {
            font-size: 32px;
          }
        }

        .cta-text {
          font-size: 17px;
          color: var(--text-secondary);
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .cta-buttons {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .cta-btn {
          padding: 12px 24px;
          font-size: 14.5px;
        }
      `}</style>
    </section>
  );
}
