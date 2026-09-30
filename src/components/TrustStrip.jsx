import React from 'react';
import { Cpu, Zap, Activity, Radio, Code2 } from 'lucide-react';

export default function TrustStrip() {
  const technologies = [
    { label: 'AssemblyAI Voice Agent API', icon: Radio },
    { label: 'Universal-3 Pro Streaming', icon: Cpu },
    { label: 'Real-time STT (PCM/Opus)', icon: Zap },
    { label: 'Acoustic Voice Activity Detection', icon: Activity },
    { label: 'JSON-Schema Tool Calling', icon: Code2 }
  ];

  return (
    <div className="trust-strip-wrapper">
      <div className="container">
        <div className="trust-strip-content">
          <div className="trust-strip-label">CORE INFRASTRUCTURE:</div>
          <div className="tech-pills-row">
            {technologies.map((tech, index) => {
              const Icon = tech.icon;
              return (
                <div key={index} className="tech-pill">
                  <Icon size={14} className="tech-pill-icon" />
                  <span>{tech.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .trust-strip-wrapper {
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
          background: #FFFFFF;
          padding: 18px 0;
        }

        .trust-strip-content {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .trust-strip-label {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--text-light);
          white-space: nowrap;
        }

        .tech-pills-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          flex: 1;
        }

        .tech-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 12.5px;
          color: var(--text-secondary);
          background: var(--bg-muted);
          padding: 6px 12px;
          border-radius: var(--radius-xs);
          border: 1px solid var(--border-light);
          transition: all 0.15s ease;
        }

        .tech-pill:hover {
          color: var(--text-primary);
          background: #EAE8E0;
          border-color: #D8D5CD;
        }

        .tech-pill-icon {
          color: var(--accent-blue);
        }
      `}</style>
    </div>
  );
}
