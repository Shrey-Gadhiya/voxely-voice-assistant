import React from 'react';
import { Mic, Radio, Brain, Wrench, Volume2, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Speak',
      tagline: 'User talks naturally',
      description: 'Continuous audio capture with client-side or server acoustic Voice Activity Detection.',
      icon: Mic
    },
    {
      number: '02',
      title: 'Transcribe',
      tagline: 'Universal-3 Pro converts speech to text',
      description: 'Low-latency streaming transcription yields partial and final transcripts with word timestamps.',
      icon: Radio
    },
    {
      number: '03',
      title: 'Understand',
      tagline: 'LLM determines intent & context',
      description: 'Integrated language model interprets meaning, retains session memory, and picks tools.',
      icon: Brain
    },
    {
      number: '04',
      title: 'Act',
      tagline: 'JSON-schema tools execute actions',
      description: 'External APIs, database queries, and booking tools run safely with structured parameters.',
      icon: Wrench
    },
    {
      number: '05',
      title: 'Respond',
      tagline: 'Voice response is generated immediately',
      description: 'Natural speech stream begins playback in &lt;400ms total latency, fully interruptible.',
      icon: Volume2
    }
  ];

  return (
    <section id="how-it-works" className="section-padding how-it-works-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Workflow Architecture</span>
          <h2 className="section-title">How Voxely handles real-time dialogue.</h2>
          <p className="section-description">
            From the moment acoustic vibrations hit the microphone to synthesized audio playback, every stage is optimized for natural conversational cadence.
          </p>
        </div>

        {/* Horizontal Workflow Stepper */}
        <div className="workflow-stepper">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.number}>
                <div className="workflow-card card-clean">
                  <div className="card-step-header">
                    <div className="step-icon-box">
                      <Icon size={18} />
                    </div>
                    <span className="step-num">{step.number}</span>
                  </div>

                  <h3 className="step-title">{step.title}</h3>
                  <div className="step-tagline">{step.tagline}</div>
                  <p className="step-desc" dangerouslySetInnerHTML={{ __html: step.description }} />
                </div>

                {idx < steps.length - 1 && (
                  <div className="workflow-arrow-divider">
                    <ArrowRight size={18} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <style>{`
        .how-it-works-section {
          background: #FAF9F5;
          border-bottom: 1px solid var(--border-subtle);
        }

        .workflow-stepper {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          align-items: stretch;
          position: relative;
        }

        @media (max-width: 1024px) {
          .workflow-stepper {
            grid-template-columns: repeat(2, 1fr);
          }
          .workflow-arrow-divider {
            display: none !important;
          }
        }

        @media (max-width: 600px) {
          .workflow-stepper {
            grid-template-columns: 1fr;
          }
        }

        .workflow-card {
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #FFFFFF;
        }

        .card-step-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .step-icon-box {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-xs);
          background: var(--bg-muted);
          border: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }

        .step-num {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 700;
          color: var(--accent-blue);
        }

        .step-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
          color: var(--text-primary);
        }

        .step-tagline {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--accent-blue);
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .step-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .workflow-arrow-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #B4B7C2;
          display: none; /* using clean card separation */
        }
      `}</style>
    </section>
  );
}
