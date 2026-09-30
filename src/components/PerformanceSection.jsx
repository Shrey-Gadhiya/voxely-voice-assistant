import React from 'react';
import { Gauge, Zap, VolumeX, FileCheck, Layers } from 'lucide-react';

export default function PerformanceSection() {
  const capabilities = [
    {
      id: 'latency',
      title: 'Low-latency interaction',
      icon: Gauge,
      mechanism: 'Streaming chunk pipelining',
      description: 'Audio frames are streamed directly over full-duplex WebSockets in 100ms chunks rather than batched file uploads, ensuring sub-second response times from speech-end to audio playback.'
    },
    {
      id: 'stt',
      title: 'Real-time transcription',
      icon: Zap,
      mechanism: 'Universal-3 Pro Streaming Engine',
      description: 'Built on AssemblyAI’s flagship acoustic streaming model, delivering word-level timestamps, keyterm biasing, and accurate transcription under conversational speaking speeds.'
    },
    {
      id: 'interruption',
      title: 'Interruptible conversations',
      icon: VolumeX,
      mechanism: 'Acoustic server-side VAD',
      description: 'When the caller speaks while the agent is responding, the system immediately recognizes incoming voice energy, halts downstream TTS playback, and switches back to caller listening.'
    },
    {
      id: 'tools',
      title: 'Structured tool calls',
      icon: FileCheck,
      mechanism: 'Strict JSON-Schema validation',
      description: 'Guarantees typed parameters before function execution. If arguments are missing or malformed, the agent conversationally clarifies with the user instead of failing silently.'
    },
    {
      id: 'context',
      title: 'Context-aware responses',
      icon: Layers,
      mechanism: 'Rolling conversation memory',
      description: 'Maintains dialogue state, entity references, and previous tool outputs across multi-turn exchanges without bloating token budgets or introducing degradation over long calls.'
    }
  ];

  return (
    <section className="section-padding performance-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Engineering Principles</span>
          <h2 className="section-title">Measurable capabilities. Zero fake benchmarks.</h2>
          <p className="section-description">
            Rather than quoting misleading marketing numbers, Voxely is architected around transparent real-time audio primitives and proven system design.
          </p>
        </div>

        <div className="capabilities-grid">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div key={cap.id} className="capability-card card-clean">
                <div className="cap-top-row">
                  <div className="cap-icon-box">
                    <Icon size={18} />
                  </div>
                  <span className="cap-mech-tag">{cap.mechanism}</span>
                </div>

                <h3 className="cap-title">{cap.title}</h3>
                <p className="cap-desc">{cap.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .performance-section {
          background: #FFFFFF;
          border-bottom: 1px solid var(--border-subtle);
        }

        .capabilities-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .capabilities-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .capabilities-grid {
            grid-template-columns: 1fr;
          }
        }

        .capability-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          background: #FAF9F5;
          border: 1px solid var(--border-subtle);
        }

        .cap-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .cap-icon-box {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-xs);
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-blue);
        }

        .cap-mech-tag {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          background: #FFFFFF;
          padding: 3px 8px;
          border-radius: var(--radius-xs);
          border: 1px solid var(--border-subtle);
        }

        .cap-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .cap-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }
      `}</style>
    </section>
  );
}
