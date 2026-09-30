import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, ShieldCheck, Cpu, Play, Square, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';

export default function HeroDashboard({ onOpenPlayground }) {
  const [micActive, setMicActive] = useState(true);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Subtle realistic audio visualizer simulation
  const [audioBars, setAudioBars] = useState([18, 42, 65, 30, 85, 48, 25, 70, 52, 38]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAudioBars(prev => prev.map(() => Math.floor(Math.random() * 65) + 15));
    }, 280);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-dashboard-wrapper">
      {/* Outer Browser/Product Frame */}
      <div className="dashboard-window">
        {/* Window Top Bar */}
        <div className="window-header">
          <div className="window-controls">
            <span className="control-dot red"></span>
            <span className="control-dot yellow"></span>
            <span className="control-dot green"></span>
          </div>

          <div className="window-title">
            <span className="endpoint-method">WSS</span>
            <span className="endpoint-url">api.assemblyai.com/v2/realtime/ws</span>
          </div>

          <div className="window-badges">
            <span className="badge-model">Universal-3 Pro</span>
            <span className="badge-live-dot"></span>
          </div>
        </div>

        {/* Dashboard Main Workspace */}
        <div className="dashboard-grid">
          {/* Left Column: Telemetry & Controls */}
          <div className="dashboard-sidebar">
            <div className="telemetry-block">
              <div className="telemetry-label">Session Status</div>
              <div className="telemetry-value active-text">
                <span className="pulse-indicator"></span> Live Connected
              </div>
            </div>

            <div className="telemetry-block">
              <div className="telemetry-label">Audio Pipeline</div>
              <div className="spec-row">
                <span>Input</span>
                <code>16kHz PCM (S16LE)</code>
              </div>
              <div className="spec-row">
                <span>VAD Mode</span>
                <code>Server Acoustic VAD</code>
              </div>
              <div className="spec-row">
                <span>Barge-in</span>
                <span className="text-success">Interruptible</span>
              </div>
            </div>

            {/* Audio Waveform Meter */}
            <div className="telemetry-block">
              <div className="telemetry-label">Microphone Signal</div>
              <div className="waveform-meter">
                {audioBars.map((height, i) => (
                  <div 
                    key={i} 
                    className="wave-bar" 
                    style={{ height: micActive ? `${height}%` : '8%' }}
                  />
                ))}
              </div>
              <div className="spec-row mt-2">
                <span>Noise floor</span>
                <code>-48 dBFS</code>
              </div>
            </div>

            {/* Turn Latency Breakdown */}
            <div className="telemetry-block">
              <div className="telemetry-label">Pipeline Latency</div>
              <div className="latency-bar-group">
                <div className="latency-metric">
                  <span>STT (U3-Pro)</span>
                  <span className="latency-ms">142ms</span>
                </div>
                <div className="latency-metric">
                  <span>LLM First-Token</span>
                  <span className="latency-ms">128ms</span>
                </div>
                <div className="latency-metric">
                  <span>TTS Synthesis</span>
                  <span className="latency-ms">74ms</span>
                </div>
                <div className="latency-total">
                  <span>Total Turn-around</span>
                  <span className="latency-total-ms">~344ms</span>
                </div>
              </div>
            </div>

            {/* Call Controls */}
            <div className="sidebar-controls">
              <button 
                onClick={() => setMicActive(!micActive)} 
                className={`control-btn ${micActive ? 'active' : 'muted'}`}
                title="Toggle Mic Input"
              >
                {micActive ? <Mic size={14} /> : <MicOff size={14} />}
                <span>{micActive ? 'Mute' : 'Unmute'}</span>
              </button>

              <button 
                onClick={onOpenPlayground}
                className="control-btn accent"
              >
                <Play size={13} />
                <span>Test Live</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Conversation Timeline */}
          <div className="dashboard-console">
            <div className="console-header">
              <div className="console-status">
                <span className="console-title">Live Transcript & Tool Calls</span>
                <span className="turn-indicator">Turn-Taking: Auto</span>
              </div>
              <span className="time-code">Session: 00:01:24</span>
            </div>

            <div className="transcript-stream">
              {/* Turn 1: User */}
              <div className="chat-bubble-wrap user">
                <div className="bubble-meta">
                  <span className="role-tag user-tag">Caller</span>
                  <span className="timestamp">12:04:18.210</span>
                  <span className="confidence-pill">conf: 0.99</span>
                </div>
                <div className="chat-bubble user-bubble">
                  "Hey, could you check my calendar for tomorrow and book lunch with Sarah Chen at 1:00 PM?"
                </div>
              </div>

              {/* Turn 2: Agent Tool Calling in Progress */}
              <div className="tool-call-banner">
                <div className="tool-call-header">
                  <div className="tool-title-wrap">
                    <span className="tool-icon">⚡</span>
                    <span className="tool-name">calendar.create_event()</span>
                  </div>
                  <span className="tool-status success">200 OK (84ms)</span>
                </div>
                <pre className="tool-payload">
{`{
  "summary": "Lunch with Sarah Chen",
  "start": "2026-10-01T13:00:00-04:00",
  "duration_minutes": 60,
  "attendees": ["sarah.chen@example.com"],
  "calendar_id": "primary"
}`}
                </pre>
              </div>

              {/* Turn 3: Agent Response */}
              <div className="chat-bubble-wrap agent">
                <div className="bubble-meta">
                  <span className="role-tag agent-tag">Voxely Agent</span>
                  <span className="timestamp">12:04:18.554</span>
                  <span className="tts-pill">TTS: Nova (Natural)</span>
                </div>
                <div className="chat-bubble agent-bubble">
                  "You're all set! I've scheduled lunch with Sarah Chen for tomorrow at 1:00 PM and sent her a calendar invite."
                </div>
                <div className="audio-output-indicator">
                  <Volume2 size={13} className="text-blue" />
                  <span>Synthesizing audio stream (24kHz Opus)</span>
                  <div className="mini-equalizer">
                    <span className="eq-bar bar-1"></span>
                    <span className="eq-bar bar-2"></span>
                    <span className="eq-bar bar-3"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Bottom Bar */}
            <div className="console-footer">
              <div className="state-badge-row">
                <span className="state-pill active">
                  <span className="pill-dot green"></span> VAD: Listening
                </span>
                <span className="state-pill">
                  <span className="pill-dot blue"></span> Universal-3 Pro Ready
                </span>
                <span className="state-pill">
                  <span className="pill-dot"></span> Tool Execution Enabled
                </span>
              </div>
              <button onClick={onOpenPlayground} className="btn-jump-playground">
                Open Full Playground <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-dashboard-wrapper {
          width: 100%;
          position: relative;
        }

        .dashboard-window {
          background: #121316;
          border: 1px solid #282930;
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 50px -10px rgba(18, 19, 22, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.05);
          overflow: hidden;
          font-family: var(--font-sans);
        }

        .window-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: #18191E;
          border-bottom: 1px solid #282930;
        }

        .window-controls {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .control-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .control-dot.red { background: #FF5F56; }
        .control-dot.yellow { background: #FFBD2E; }
        .control-dot.green { background: #27C93F; }

        .window-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: #A0A5B5;
        }

        .endpoint-method {
          color: #60A5FA;
          font-weight: 600;
        }

        .window-badges {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .badge-model {
          font-family: var(--font-mono);
          font-size: 11px;
          background: #23252C;
          color: #E2E4E9;
          padding: 2px 7px;
          border-radius: var(--radius-xs);
          border: 1px solid #333640;
        }

        .badge-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22C55E;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: 440px;
        }

        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-sidebar {
            display: none;
          }
        }

        .dashboard-sidebar {
          background: #15161A;
          border-right: 1px solid #24252C;
          padding: 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .telemetry-block {
          background: #1A1C22;
          border: 1px solid #282A33;
          border-radius: var(--radius-sm);
          padding: 10px 12px;
        }

        .telemetry-label {
          font-size: 11px;
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #7A8090;
          margin-bottom: 6px;
        }

        .telemetry-value {
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .active-text {
          color: #34D399;
        }

        .pulse-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 6px #10B981;
        }

        .spec-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11.5px;
          margin-top: 5px;
          color: #9499A8;
        }

        .spec-row code {
          font-family: var(--font-mono);
          font-size: 10.5px;
          color: #E2E4E9;
        }

        .text-success {
          color: #34D399;
          font-weight: 500;
        }

        .waveform-meter {
          height: 28px;
          display: flex;
          align-items: flex-end;
          gap: 3px;
          padding: 2px 0;
        }

        .wave-bar {
          flex: 1;
          background: #3B82F6;
          border-radius: 2px;
          transition: height 0.2s ease;
          min-height: 4px;
        }

        .latency-bar-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 11px;
        }

        .latency-metric {
          display: flex;
          justify-content: space-between;
          color: #8C91A0;
        }

        .latency-ms {
          font-family: var(--font-mono);
          color: #E2E4E9;
        }

        .latency-total {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
          padding-top: 5px;
          border-top: 1px dashed #2E313D;
          font-weight: 600;
          color: #38BDF8;
        }

        .latency-total-ms {
          font-family: var(--font-mono);
        }

        .sidebar-controls {
          margin-top: auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .control-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 500;
          border-radius: var(--radius-xs);
          border: 1px solid #333642;
          background: #1F2128;
          color: #E2E4E9;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .control-btn:hover {
          background: #282B34;
        }

        .control-btn.active {
          color: #60A5FA;
          border-color: #2563EB;
        }

        .control-btn.muted {
          color: #EF4444;
          border-color: #7F1D1D;
        }

        .control-btn.accent {
          background: #2563EB;
          border-color: #1D4ED8;
          color: #FFFFFF;
        }

        .control-btn.accent:hover {
          background: #1D4ED8;
        }

        /* Console styling */
        .dashboard-console {
          background: #111215;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .console-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          border-bottom: 1px solid #202228;
          background: #14161A;
        }

        .console-status {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .console-title {
          font-size: 13px;
          font-weight: 600;
          color: #E2E4E9;
        }

        .turn-indicator {
          font-size: 11px;
          font-family: var(--font-mono);
          color: #38BDF8;
          background: rgba(56, 189, 248, 0.1);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
        }

        .time-code {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #717684;
        }

        .transcript-stream {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          max-height: 380px;
        }

        .chat-bubble-wrap {
          display: flex;
          flex-direction: column;
          gap: 5px;
          max-width: 90%;
        }

        .chat-bubble-wrap.user {
          align-self: flex-start;
        }

        .chat-bubble-wrap.agent {
          align-self: flex-start;
        }

        .bubble-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
        }

        .role-tag {
          font-size: 10.5px;
          font-family: var(--font-mono);
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 3px;
        }

        .user-tag {
          background: #252830;
          color: #9CA3AF;
        }

        .agent-tag {
          background: rgba(37, 99, 235, 0.2);
          color: #60A5FA;
        }

        .timestamp {
          color: #555A66;
          font-family: var(--font-mono);
        }

        .confidence-pill, .tts-pill {
          font-family: var(--font-mono);
          color: #6B7280;
        }

        .chat-bubble {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 13.5px;
          line-height: 1.5;
        }

        .user-bubble {
          background: #1C1E24;
          color: #E2E4E9;
          border: 1px solid #282B33;
        }

        .agent-bubble {
          background: #182030;
          color: #EFF6FF;
          border: 1px solid #1E3A8A;
        }

        .audio-output-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #60A5FA;
          margin-top: 3px;
        }

        .mini-equalizer {
          display: flex;
          gap: 2px;
          align-items: flex-end;
          height: 10px;
        }

        .eq-bar {
          width: 2px;
          background: #3B82F6;
          border-radius: 1px;
          animation: eq-bounce 0.8s infinite ease-in-out alternate;
        }

        .bar-1 { height: 6px; animation-delay: 0.1s; }
        .bar-2 { height: 10px; animation-delay: 0.3s; }
        .bar-3 { height: 4px; animation-delay: 0.2s; }

        @keyframes eq-bounce {
          from { height: 3px; }
          to { height: 10px; }
        }

        .tool-call-banner {
          background: #17181D;
          border: 1px solid #2D303A;
          border-left: 3px solid #F59E0B;
          border-radius: var(--radius-xs);
          padding: 10px 14px;
        }

        .tool-call-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .tool-title-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tool-name {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          color: #FBBF24;
        }

        .tool-status.success {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #34D399;
          background: rgba(16, 185, 129, 0.1);
          padding: 2px 6px;
          border-radius: 3px;
        }

        .tool-payload {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #9CA3AF;
          background: #0F1012;
          padding: 8px 10px;
          border-radius: 4px;
          overflow-x: auto;
          line-height: 1.4;
        }

        .console-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          border-top: 1px solid #202228;
          background: #14161A;
        }

        .state-badge-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .state-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: #7A8090;
        }

        .pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #555A66;
        }

        .pill-dot.green { background: #10B981; }
        .pill-dot.blue { background: #3B82F6; }

        .btn-jump-playground {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 500;
          color: #E2E4E9;
          background: #20222A;
          border: 1px solid #333642;
          padding: 5px 10px;
          border-radius: var(--radius-xs);
          transition: all 0.15s ease;
        }

        .btn-jump-playground:hover {
          background: #282B34;
          color: #FFFFFF;
        }
      `}</style>
    </div>
  );
}
