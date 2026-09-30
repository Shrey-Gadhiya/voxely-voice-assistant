import React, { useState } from 'react';
import { Mic, Activity, Network, Volume2, Code2, Play, Check, ChevronRight, Pause, CornerDownRight } from 'lucide-react';

export default function Features() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      id: 'stt',
      number: '01',
      title: 'Real-Time Speech-to-Text',
      tagline: 'Turn spoken words into accurate text with low-latency transcription.',
      description: 'Powered by AssemblyAI Universal-3 Pro, streaming audio chunks are transcribed continuously with word-level timestamps, keyterm biasing, and robust handling of background noise.',
      techDetails: ['Universal-3 Pro Streaming Engine', 'Word-level confidence metrics', 'Sub-150ms transcription latency', 'Keyterm custom vocabulary'],
      renderVisual: () => (
        <div className="feature-demo-card">
          <div className="card-top-bar">
            <span className="demo-badge">Stream Inspector</span>
            <span className="demo-meta">16,000 Hz • PCM16</span>
          </div>
          <div className="stt-stream-preview">
            <div className="stt-token confirmed">"Can</div>
            <div className="stt-token confirmed">you</div>
            <div className="stt-token confirmed">reschedule</div>
            <div className="stt-token confirmed">my</div>
            <div className="stt-token confirmed">dentist</div>
            <div className="stt-token confirmed">appointment</div>
            <div className="stt-token partial">for</div>
            <div className="stt-token partial">Thursday</div>
            <div className="stt-token live-cursor">at 3 PM?"</div>
          </div>
          <div className="token-metrics">
            <div className="metric-box">
              <span className="metric-lbl">Acoustic Confidence</span>
              <span className="metric-val text-green">99.2%</span>
            </div>
            <div className="metric-box">
              <span className="metric-lbl">Token Latency</span>
              <span className="metric-val">138 ms</span>
            </div>
            <div className="metric-box">
              <span className="metric-lbl">Vocabulary Bias</span>
              <span className="metric-val">Active</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'turn-taking',
      number: '02',
      title: 'Natural Turn-Taking',
      tagline: 'Detect when users start and stop speaking so conversations feel natural.',
      description: 'Integrated Voice Activity Detection (VAD) and intelligent pause analysis prevent awkward interruptions while allowing immediate barge-in when the caller interrupts the agent.',
      techDetails: ['Server-side acoustic VAD', 'Dynamic silence thresholds (400-800ms)', 'Instant audio playback cancellation', 'Graceful disfluency handling'],
      renderVisual: () => (
        <div className="feature-demo-card">
          <div className="card-top-bar">
            <span className="demo-badge">VAD & Turn State Timeline</span>
            <span className="demo-meta">Barge-in Enabled</span>
          </div>
          <div className="turn-timeline-wrap">
            <div className="timeline-row">
              <span className="channel-name">User Voice</span>
              <div className="timeline-track">
                <div className="segment speech" style={{ width: '40%' }}>User Speaking...</div>
                <div className="segment pause" style={{ width: '15%' }}>Pause (420ms)</div>
                <div className="segment bargein" style={{ width: '45%' }}>⚡ Interrupted Agent</div>
              </div>
            </div>
            <div className="timeline-row">
              <span className="channel-name">Agent Audio</span>
              <div className="timeline-track">
                <div className="segment silent" style={{ width: '55%' }}>Listening</div>
                <div className="segment speaking" style={{ width: '15%' }}>TTS Playback</div>
                <div className="segment cancelled" style={{ width: '30%' }}>Playback Cancelled</div>
              </div>
            </div>
          </div>
          <div className="feature-annotation">
            <span className="annotation-tag">Barge-in:</span> User spoke while agent was talking; downstream audio playback was aborted in &lt;50ms.
          </div>
        </div>
      )
    },
    {
      id: 'routing',
      number: '03',
      title: 'LLM Routing',
      tagline: 'Route conversations intelligently and generate contextual responses.',
      description: 'Seamlessly pass transcripts to leading reasoning models with rolling conversation buffers, system instructions, and deterministic intent classification.',
      techDetails: ['Zero-hop streaming context', 'Rolling state management', 'Configurable system persona', 'Sub-token first response generation'],
      renderVisual: () => (
        <div className="feature-demo-card">
          <div className="card-top-bar">
            <span className="demo-badge">Intent Router Pipeline</span>
            <span className="demo-meta">Router: Claude 3.5 / GPT-4o</span>
          </div>
          <div className="router-flow">
            <div className="flow-step">
              <div className="step-badge">1. Input Transcript</div>
              <div className="step-content">"What is the status of my order VX-98214?"</div>
            </div>
            <div className="flow-arrow">
              <CornerDownRight size={14} />
            </div>
            <div className="flow-step router-decision">
              <div className="step-badge text-blue">2. Intent Classification</div>
              <div className="step-content">
                <code>intent: "ORDER_TRACKING_INQUIRY"</code>
                <code>confidence: 0.98</code>
              </div>
            </div>
            <div className="flow-arrow">
              <CornerDownRight size={14} />
            </div>
            <div className="flow-step tool-trigger">
              <div className="step-badge text-amber">3. Dispatch Target</div>
              <div className="step-content font-mono">execute: support.lookup_order(order_id)</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'voice-output',
      number: '04',
      title: 'Voice Output',
      tagline: 'Return responses as natural speech in real time.',
      description: 'Stream natural speech back to callers with ultra-low first-byte latency. Multiple voices, custom cadences, and chunked audio buffers ensure zero conversational stutter.',
      techDetails: ['Real-time Opus/PCM streaming', 'Human-like cadence & inflection', 'Multi-speaker voice profiles', 'Continuous buffer synchronization'],
      renderVisual: () => (
        <div className="feature-demo-card">
          <div className="card-top-bar">
            <span className="demo-badge">Audio Stream Generator</span>
            <span className="demo-meta">Codec: Opus 24kHz</span>
          </div>
          <div className="voice-preview-box">
            <div className="voice-meta-header">
              <div className="voice-profile-info">
                <span className="avatar-dot"></span>
                <div>
                  <div className="voice-name">Nova (Natural Calm)</div>
                  <div className="voice-sample-meta">Latency: 76ms to first audio buffer</div>
                </div>
              </div>
              <span className="voice-badge">Active</span>
            </div>
            <div className="synth-audio-bars">
              {[40, 65, 80, 55, 90, 70, 45, 60, 85, 95, 60, 40, 75, 85, 50, 65, 45, 30].map((h, i) => (
                <div key={i} className="synth-bar" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="synth-text">
              "Your order has cleared customs and will arrive tomorrow before 4:30 PM."
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tool-calling',
      number: '05',
      title: 'JSON Tool Calling',
      tagline: 'Let your agent perform real actions through structured tools.',
      description: 'Empower your voice agents to book meetings, trigger webhooks, query databases, or execute internal functions with guaranteed JSON-schema compliance.',
      techDetails: ['Strict JSON Schema validation', 'Parallel tool execution', 'Deterministic argument extraction', 'Seamless function result injection'],
      renderVisual: () => (
        <div className="feature-demo-card">
          <div className="card-top-bar">
            <span className="demo-badge">JSON-Schema Tool Dispatcher</span>
            <span className="demo-meta">Schema: OpenAPI 3.1</span>
          </div>
          <div className="code-split-view">
            <div className="code-split-col">
              <div className="col-title">Agent Tool Definition</div>
              <pre className="mini-code">
{`{
  "name": "calendar.create_event",
  "parameters": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "start": { "type": "string" }
    },
    "required": ["title", "start"]
  }
}`}
              </pre>
            </div>
            <div className="code-split-col">
              <div className="col-title">Execution Result</div>
              <pre className="mini-code text-green">
{`{
  "status": "200_OK",
  "event_id": "evt_94821",
  "booked": true,
  "invite_sent": "yes"
}`}
              </pre>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="features" className="section-padding features-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label">Architecture & Features</span>
          <h2 className="section-title">The anatomy of a natural voice agent.</h2>
          <p className="section-description">
            Traditional voice bots feel robotic because speech-to-text, reasoning, and speech synthesis run in disconnected silos. Voxely unifies these layers into a single real-time stream.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="feature-tabs-bar">
          {features.map((feat, index) => (
            <button
              key={feat.id}
              onClick={() => setActiveTab(index)}
              className={`feature-tab-btn ${activeTab === index ? 'active' : ''}`}
            >
              <span className="tab-number">{feat.number}</span>
              <span className="tab-title">{feat.title}</span>
            </button>
          ))}
        </div>

        {/* Active Feature Showcase */}
        <div className="feature-showcase-panel">
          <div className="feature-info-col">
            <div className="feat-number-pill">Stage {features[activeTab].number}</div>
            <h3 className="feat-headline">{features[activeTab].title}</h3>
            <div className="feat-tagline">{features[activeTab].tagline}</div>
            <p className="feat-description">{features[activeTab].description}</p>

            <div className="feat-checklist">
              {features[activeTab].techDetails.map((detail, idx) => (
                <div key={idx} className="feat-check-item">
                  <Check size={14} className="check-icon-blue" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="feature-visual-col">
            {features[activeTab].renderVisual()}
          </div>
        </div>

        {/* All 5 Features Grid View (for comprehensive reading & mobile accessibility) */}
        <div className="features-grid-mini">
          {features.map((feat, idx) => (
            <div 
              key={feat.id} 
              className={`feature-mini-card ${activeTab === idx ? 'highlighted' : ''}`}
              onClick={() => setActiveTab(idx)}
            >
              <div className="mini-card-num">{feat.number}</div>
              <h4 className="mini-card-title">{feat.title}</h4>
              <p className="mini-card-tagline">{feat.tagline}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .features-section {
          background: var(--bg-page);
          border-bottom: 1px solid var(--border-subtle);
        }

        .feature-tabs-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 12px;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .feature-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-secondary);
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .feature-tab-btn:hover {
          background: var(--bg-muted);
          color: var(--text-primary);
        }

        .feature-tab-btn.active {
          background: var(--text-primary);
          color: #FFFFFF;
          border-color: var(--text-primary);
        }

        .tab-number {
          font-family: var(--font-mono);
          font-size: 11px;
          opacity: 0.7;
        }

        .feature-showcase-panel {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 40px;
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 48px;
          align-items: center;
          box-shadow: var(--shadow-sm);
          margin-bottom: 40px;
        }

        @media (max-width: 900px) {
          .feature-showcase-panel {
            grid-template-columns: 1fr;
            padding: 24px;
            gap: 28px;
          }
        }

        .feat-number-pill {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          color: var(--accent-blue);
          background: var(--accent-blue-light);
          padding: 3px 8px;
          border-radius: var(--radius-xs);
          margin-bottom: 12px;
        }

        .feat-headline {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.025em;
        }

        .feat-tagline {
          font-size: 15.5px;
          font-weight: 500;
          color: var(--accent-blue);
          margin-bottom: 16px;
        }

        .feat-description {
          font-size: 14.5px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        .feat-checklist {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .feat-check-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .check-icon-blue {
          color: var(--accent-blue);
        }

        /* Demo Card Styling */
        .feature-demo-card {
          background: #141518;
          border: 1px solid #26272E;
          border-radius: var(--radius-md);
          padding: 20px;
          color: #E2E4E9;
          font-family: var(--font-mono);
          box-shadow: var(--shadow-md);
        }

        .card-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 1px solid #24252D;
          font-size: 11px;
        }

        .demo-badge {
          color: #60A5FA;
          font-weight: 600;
        }

        .demo-meta {
          color: #717684;
        }

        /* STT Visualizer */
        .stt-stream-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 16px 14px;
          background: #191B20;
          border: 1px solid #2B2D36;
          border-radius: var(--radius-xs);
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .stt-token.confirmed {
          color: #E2E4E9;
        }

        .stt-token.partial {
          color: #93C5FD;
          text-decoration: underline dotted #3B82F6;
        }

        .stt-token.live-cursor {
          color: #FCD34D;
          border-right: 2px solid #60A5FA;
          animation: blink-cur 1s infinite;
        }

        @keyframes blink-cur {
          50% { border-color: transparent; }
        }

        .token-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .metric-box {
          background: #191B20;
          padding: 8px 10px;
          border-radius: var(--radius-xs);
          border: 1px solid #282A33;
        }

        .metric-lbl {
          display: block;
          font-size: 10px;
          color: #717684;
          margin-bottom: 2px;
        }

        .metric-val {
          font-size: 12.5px;
          font-weight: 600;
          color: #E2E4E9;
        }

        .text-green { color: #34D399; }
        .text-blue { color: #60A5FA; }
        .text-amber { color: #FBBF24; }

        /* Turn-taking visualizer */
        .turn-timeline-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 14px;
        }

        .timeline-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .channel-name {
          font-size: 11px;
          color: #8C91A0;
        }

        .timeline-track {
          display: flex;
          height: 30px;
          background: #1A1C22;
          border-radius: var(--radius-xs);
          overflow: hidden;
          border: 1px solid #282A34;
        }

        .segment {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10.5px;
          font-weight: 500;
          padding: 0 6px;
          white-space: nowrap;
        }

        .segment.speech {
          background: #1D4ED8;
          color: #FFFFFF;
        }

        .segment.pause {
          background: #27272A;
          color: #A1A1AA;
        }

        .segment.bargein {
          background: #B45309;
          color: #FEF3C7;
          font-weight: 600;
        }

        .segment.silent {
          background: #191A1E;
          color: #52525B;
        }

        .segment.speaking {
          background: #047857;
          color: #ECFDF5;
        }

        .segment.cancelled {
          background: #7F1D1D;
          color: #FEE2E2;
          text-decoration: line-through;
        }

        .feature-annotation {
          font-size: 11.5px;
          color: #9499A8;
          line-height: 1.5;
        }

        .annotation-tag {
          color: #F59E0B;
          font-weight: 600;
        }

        /* Routing visualizer */
        .router-flow {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .flow-step {
          background: #1A1C22;
          border: 1px solid #282A33;
          border-radius: var(--radius-xs);
          padding: 10px 12px;
        }

        .step-badge {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #717684;
          margin-bottom: 4px;
        }

        .step-content {
          font-size: 12px;
          color: #E2E4E9;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .flow-arrow {
          display: flex;
          align-items: center;
          padding-left: 12px;
          color: #4B5563;
        }

        /* Voice Output visualizer */
        .voice-preview-box {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .voice-meta-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .voice-profile-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3B82F6;
        }

        .voice-name {
          font-size: 13px;
          font-weight: 600;
          color: #E2E4E9;
        }

        .voice-sample-meta {
          font-size: 11px;
          color: #717684;
        }

        .voice-badge {
          font-size: 10px;
          background: #1E293B;
          color: #60A5FA;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .synth-audio-bars {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 40px;
          background: #191B20;
          padding: 0 10px;
          border-radius: var(--radius-xs);
          border: 1px solid #262832;
        }

        .synth-bar {
          flex: 1;
          background: #3B82F6;
          border-radius: 1px;
        }

        .synth-text {
          font-size: 12.5px;
          color: #D1D5DB;
          font-style: italic;
          line-height: 1.4;
        }

        /* Tool calling split view */
        .code-split-view {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 600px) {
          .code-split-view {
            grid-template-columns: 1fr;
          }
        }

        .col-title {
          font-size: 10.5px;
          color: #717684;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .mini-code {
          background: #191B20;
          border: 1px solid #282A33;
          border-radius: var(--radius-xs);
          padding: 10px;
          font-size: 11px;
          line-height: 1.4;
          overflow-x: auto;
          color: #D1D5DB;
        }

        /* 5-Card Bottom Grid */
        .features-grid-mini {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .features-grid-mini {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .features-grid-mini {
            grid-template-columns: 1fr;
          }
        }

        .feature-mini-card {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 18px 16px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .feature-mini-card:hover {
          border-color: #CBD5E1;
          box-shadow: var(--shadow-sm);
        }

        .feature-mini-card.highlighted {
          border-color: var(--accent-blue);
          background: #FAFBFD;
          box-shadow: 0 0 0 1px var(--accent-blue);
        }

        .mini-card-num {
          font-family: var(--font-mono);
          font-size: 11.5px;
          font-weight: 600;
          color: var(--accent-blue);
          margin-bottom: 8px;
        }

        .mini-card-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--text-primary);
        }

        .mini-card-tagline {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.45;
        }
      `}</style>
    </section>
  );
}
