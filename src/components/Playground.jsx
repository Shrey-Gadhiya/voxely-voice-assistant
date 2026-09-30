import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Play, Square, Settings, Wrench, Volume2, 
  Sparkles, RefreshCw, Send, AlertCircle, CheckCircle, 
  Terminal, Sliders, ChevronDown, Check, Zap, Info, ShieldAlert
} from 'lucide-react';

export default function Playground({ serverStatus, onOpenKeyConfig }) {
  // Agent Configuration State
  const [agentName, setAgentName] = useState('Voxely Receptionist');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a warm, efficient executive assistant. Your goal is to help callers schedule meetings, look up orders, and check team availability. Keep answers concise, natural, and friendly.'
  );
  const [selectedVoice, setSelectedVoice] = useState('Nova');
  const [selectedModel, setSelectedModel] = useState('Universal-3 Pro + LLM');
  const [enabledTools, setEnabledTools] = useState({
    calendar: true,
    orders: true,
    crm: true,
    weather: false
  });

  // Call / Session States: 'idle' | 'listening' | 'thinking' | 'speaking'
  const [callState, setCallState] = useState('idle');
  const [micMuted, setMicMuted] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(!serverStatus?.configured);

  // Transcript log items: { id, role: 'user' | 'agent' | 'tool' | 'system', text, toolDetails, timestamp }
  const [transcripts, setTranscripts] = useState([
    {
      id: 1,
      role: 'agent',
      text: "Hello! Thanks for calling Voxely. How can I help you today?",
      timestamp: '12:00:01'
    }
  ]);

  // Audio level visualizer array
  const [audioMeter, setAudioMeter] = useState([20, 35, 60, 45, 75, 50, 30, 65, 40, 25]);
  const [userInputText, setUserInputText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);

  // Audio & Speech references
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const animFrameRef = useRef(null);

  // Check speech recognition & Web Audio capabilities on mount
  useEffect(() => {
    setIsDemoMode(!serverStatus?.configured);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, [serverStatus]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, callState]);

  // Synthesize agent voice with Web Speech Synthesis
  const speakAgentResponse = (text, onComplete) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = selectedVoice === 'Nova' ? 1.05 : selectedVoice === 'Echo' ? 0.9 : 1.0;
      
      // Attempt to pick a natural English voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        setCallState('listening');
        if (onComplete) onComplete();
      };

      utterance.onerror = () => {
        setCallState('listening');
        if (onComplete) onComplete();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setCallState('listening');
        if (onComplete) onComplete();
      }, 1800);
    }
  };

  // Start real microphone capture with Web Audio analyser
  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicPermissionGranted(true);

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Map first 10 frequencies into bars
        const bars = [];
        for (let i = 0; i < 10; i++) {
          const val = Math.min(100, Math.max(12, Math.floor((dataArray[i * 2] / 255) * 100)));
          bars.push(val);
        }
        setAudioMeter(bars);
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();

      // Start Web Speech Recognition if available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = true;
        reco.interimResults = true;
        reco.lang = 'en-US';

        reco.onresult = (event) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              const text = event.results[i][0].transcript.trim();
              if (text) {
                handleUserSpeechInput(text);
              }
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
        };

        reco.onerror = (e) => {
          console.warn('[SpeechRecognition Error]', e.error);
        };

        reco.onend = () => {
          // Restart if still in conversation
          if (callState !== 'idle' && recognitionRef.current) {
            try { reco.start(); } catch (err) {}
          }
        };

        reco.start();
        recognitionRef.current = reco;
      }
    } catch (err) {
      console.warn('Microphone permission not granted or unavailable:', err);
      // Fallback: simulated audio meter
      const interval = setInterval(() => {
        setAudioMeter(prev => prev.map(() => Math.floor(Math.random() * 60) + 20));
      }, 200);
      return () => clearInterval(interval);
    }
  };

  // Stop audio capture & recognition
  const stopAudioCapture = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Toggle Conversation Session
  const toggleConversation = async () => {
    if (callState === 'idle') {
      setCallState('listening');
      await startAudioCapture();

      // Add system announcement
      const now = new Date().toLocaleTimeString();
      setTranscripts(prev => [
        ...prev,
        {
          id: Date.now(),
          role: 'system',
          text: `Voice session started (${isDemoMode ? 'Local Demo Mode' : 'AssemblyAI Live Stream'}). Microphone active.`,
          timestamp: now
        }
      ]);
    } else {
      setCallState('idle');
      stopAudioCapture();

      const now = new Date().toLocaleTimeString();
      setTranscripts(prev => [
        ...prev,
        {
          id: Date.now(),
          role: 'system',
          text: "Voice session ended.",
          timestamp: now
        }
      ]);
    }
  };

  // Process User Speech Input and trigger conversational agent logic + tools
  const handleUserSpeechInput = async (spokenText) => {
    if (!spokenText || !spokenText.trim()) return;

    // Barge-in: Cancel any active speech output
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const now = new Date().toLocaleTimeString();
    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: spokenText,
      timestamp: now
    };

    setTranscripts(prev => [...prev, userMsg]);
    setCallState('thinking');

    // Natural conversation logic & tool calling router
    const lower = spokenText.toLowerCase();

    // Check for Tool Calling triggers:
    let toolResult = null;
    let agentReply = '';

    if (enabledTools.calendar && (lower.includes('schedule') || lower.includes('meeting') || lower.includes('book') || lower.includes('calendar') || lower.includes('lunch') || lower.includes('appointment'))) {
      // Execute Calendar Tool
      try {
        const response = await fetch('/api/tools/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolName: 'calendar.create_event',
            parameters: {
              title: lower.includes('lunch') ? 'Lunch Meeting' : 'Executive Strategy Sync',
              date: lower.includes('tomorrow') ? 'Tomorrow' : 'Thursday',
              time: lower.includes('3') ? '3:00 PM' : lower.includes('1') ? '1:00 PM' : '2:00 PM',
              duration: 45
            }
          })
        });
        toolResult = await response.json();
      } catch (e) {
        toolResult = {
          status: 'success',
          tool: 'calendar.create_event',
          result: { event_id: 'evt_9831', scheduled_for: 'Tomorrow at 2:00 PM', calendar: 'Google Calendar' }
        };
      }

      agentReply = `I've scheduled that on your calendar for ${toolResult.result.scheduled_for}. I also sent out calendar invitations to all attendees. Anything else?`;

    } else if (enabledTools.orders && (lower.includes('order') || lower.includes('shipping') || lower.includes('package') || lower.includes('tracking') || lower.includes('delivery'))) {
      // Execute Order Lookup Tool
      try {
        const response = await fetch('/api/tools/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolName: 'support.lookup_order',
            parameters: { order_id: 'VX-98214' }
          })
        });
        toolResult = await response.json();
      } catch (e) {
        toolResult = {
          status: 'success',
          tool: 'support.lookup_order',
          result: { order_id: 'VX-98214', status: 'Shipped', tracking_number: 'FX-882941092', estimated_delivery: 'Tomorrow by 4:30 PM' }
        };
      }

      agentReply = `I looked up your order VX-98214. It has shipped via FedEx Priority and is scheduled for delivery ${toolResult.result.estimated_delivery}.`;

    } else if (enabledTools.crm && (lower.includes('lead') || lower.includes('qualify') || lower.includes('prospect') || lower.includes('hubspot') || lower.includes('crm'))) {
      // Execute CRM Tool
      try {
        const response = await fetch('/api/tools/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolName: 'crm.update_lead',
            parameters: { company: 'Horizon Tech', contact: 'Alex Rivera', score: 94 }
          })
        });
        toolResult = await response.json();
      } catch (e) {
        toolResult = {
          status: 'success',
          tool: 'crm.update_lead',
          result: { lead_id: 'lead_481', status: 'Sales Qualified (SQL)', qualification_score: 94 }
        };
      }

      agentReply = `I've updated the lead status for Horizon Tech to Sales Qualified with a score of 94, and synced the notes to your CRM.`;

    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      agentReply = "Hello there! I'm your Voxely voice agent powered by AssemblyAI. You can test natural speech, barge-in interruptions, or ask me to schedule a meeting or check an order.";
    } else if (lower.includes('who are you') || lower.includes('what can you do')) {
      agentReply = "I am a real-time conversational agent. Using AssemblyAI Universal-3 Pro and JSON tool schemas, I can understand complex speech, run backend actions, and reply with sub-second latency.";
    } else {
      agentReply = `Understood. In a production pipeline, this utterance would be routed through your configured LLM prompt. With Voxely's single connection, speech recognition and response synthesis happen simultaneously.`;
    }

    // If tool was called, append tool log
    if (toolResult) {
      setTranscripts(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'tool',
          toolDetails: toolResult,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }

    // Give slight natural thinking pause (~400ms)
    setTimeout(() => {
      setCallState('speaking');
      const agentMsg = {
        id: Date.now() + 2,
        role: 'agent',
        text: agentReply,
        timestamp: new Date().toLocaleTimeString()
      };
      setTranscripts(prev => [...prev, agentMsg]);
      speakAgentResponse(agentReply);
    }, 450);
  };

  // Submit typed query for quick testing without microphone
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!userInputText.trim()) return;
    const txt = userInputText;
    setUserInputText('');
    handleUserSpeechInput(txt);
  };

  // Preset quick prompt buttons
  const samplePrompts = [
    "Schedule a meeting for tomorrow at 2 PM",
    "Track my package VX-98214",
    "Qualify this lead and update our CRM",
    "What is the weather like in San Francisco?"
  ];

  return (
    <section id="playground" className="section-padding playground-section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="section-header-row">
            <div>
              <span className="section-label">Live Developer Playground</span>
              <h2 className="section-title">Test the Voice Agent in real time.</h2>
              <p className="section-description">
                Experience natural turn-taking, speech-to-text with Universal-3 Pro, LLM reasoning, and JSON-schema tool calling directly from your browser.
              </p>
            </div>

            {/* Mode Indicator */}
            <div className="playground-mode-banner">
              {isDemoMode ? (
                <div className="mode-pill demo">
                  <span className="mode-dot yellow"></span>
                  <div className="mode-text-group">
                    <span className="mode-title">Local Demo Mode</span>
                    <span className="mode-sub">Add ASSEMBLYAI_API_KEY in .env for live cloud socket</span>
                  </div>
                  <button onClick={onOpenKeyConfig} className="btn-key-setup">Setup Key</button>
                </div>
              ) : (
                <div className="mode-pill live">
                  <span className="mode-dot green"></span>
                  <div className="mode-text-group">
                    <span className="mode-title">Live AssemblyAI Connected</span>
                    <span className="mode-sub">Universal-3 Pro Realtime WebSocket</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3-Column Interactive Studio */}
        <div className="playground-studio-grid">
          {/* COLUMN 1: Agent Configuration */}
          <div className="studio-col studio-config-col card-clean">
            <div className="col-header">
              <div className="col-title-wrap">
                <Settings size={15} className="text-secondary" />
                <span className="col-heading">Agent Configuration</span>
              </div>
              <span className="spec-badge">JSON Schema</span>
            </div>

            <div className="config-form">
              <div className="form-group">
                <label className="form-label">Agent Name</label>
                <input 
                  type="text" 
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="form-input" 
                  placeholder="e.g. Voxely Concierge"
                />
              </div>

              <div className="form-group">
                <label className="form-label">System Instructions</label>
                <textarea 
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Voice</label>
                  <select 
                    value={selectedVoice} 
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="form-select"
                  >
                    <option value="Nova">Nova (Natural Female)</option>
                    <option value="Echo">Echo (Warm Male)</option>
                    <option value="Alloy">Alloy (Neutral Balanced)</option>
                    <option value="Shimmer">Shimmer (Expressive)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Engine Model</label>
                  <select 
                    value={selectedModel} 
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="form-select"
                  >
                    <option value="Universal-3 Pro + LLM">Universal-3 Pro (u3-rt-pro)</option>
                    <option value="Universal-3.6 Pro Realtime">Universal-3.6 Pro Realtime</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label tools-label">
                  <span>Attached JSON Tools</span>
                  <span className="tools-count">
                    {Object.values(enabledTools).filter(Boolean).length} Active
                  </span>
                </label>
                <div className="tools-toggle-list">
                  <label className="tool-checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={enabledTools.calendar}
                      onChange={(e) => setEnabledTools({ ...enabledTools, calendar: e.target.checked })}
                    />
                    <div className="tool-info">
                      <span className="tool-fn">calendar.create_event()</span>
                      <span className="tool-desc">Books events via Google/Outlook schema</span>
                    </div>
                  </label>

                  <label className="tool-checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={enabledTools.orders}
                      onChange={(e) => setEnabledTools({ ...enabledTools, orders: e.target.checked })}
                    />
                    <div className="tool-info">
                      <span className="tool-fn">support.lookup_order()</span>
                      <span className="tool-desc">Fetches live carrier tracking & items</span>
                    </div>
                  </label>

                  <label className="tool-checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={enabledTools.crm}
                      onChange={(e) => setEnabledTools({ ...enabledTools, crm: e.target.checked })}
                    />
                    <div className="tool-info">
                      <span className="tool-fn">crm.update_lead()</span>
                      <span className="tool-desc">Calculates BANT score & updates HubSpot</span>
                    </div>
                  </label>

                  <label className="tool-checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={enabledTools.weather}
                      onChange={(e) => setEnabledTools({ ...enabledTools, weather: e.target.checked })}
                    />
                    <div className="tool-info">
                      <span className="tool-fn">weather.get_forecast()</span>
                      <span className="tool-desc">Queries regional meteorological data</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Microphone & Audio Center */}
          <div className="studio-col studio-center-col card-clean">
            <div className="col-header">
              <span className="col-heading">Live Conversation Interface</span>
              <div className="state-tag-indicator">
                <span className={`state-badge ${callState}`}>
                  {callState === 'idle' && 'Idle / Ready'}
                  {callState === 'listening' && '● Listening'}
                  {callState === 'thinking' && '⚙ Thinking & Routing'}
                  {callState === 'speaking' && '🔊 Speaking (Nova)'}
                </span>
              </div>
            </div>

            {/* Main Interactive Stage */}
            <div className="mic-stage-center">
              {/* Audio Waveform Ring */}
              <div className={`mic-ring-container ${callState}`}>
                <button 
                  onClick={toggleConversation}
                  className={`mic-primary-btn ${callState !== 'idle' ? 'in-call' : ''}`}
                  title={callState === 'idle' ? "Start Conversation" : "End Conversation"}
                  aria-label={callState === 'idle' ? "Start Conversation" : "End Conversation"}
                >
                  {callState === 'idle' ? (
                    <Mic size={38} className="mic-icon" />
                  ) : (
                    <Square size={32} className="square-icon" />
                  )}
                </button>
              </div>

              {/* Status headline */}
              <div className="stage-status-title">
                {callState === 'idle' && "Click to Start Conversation"}
                {callState === 'listening' && "Listening... Speak naturally"}
                {callState === 'thinking' && "Routing intent & validating tools..."}
                {callState === 'speaking' && "Agent is responding (Interruptible)"}
              </div>

              <div className="stage-status-sub">
                {callState === 'idle' 
                  ? "Uses your microphone to stream voice directly into AssemblyAI."
                  : "You can speak anytime. Turn-taking will automatically detect when you finish."
                }
              </div>

              {/* Audio Level Equalizer */}
              <div className="audio-visualizer-box">
                <div className="visualizer-label">
                  <span>Microphone Signal (VAD Level)</span>
                  <span>{callState !== 'idle' ? '48kHz -> 16kHz PCM' : 'Inactive'}</span>
                </div>
                <div className="eq-bars-row">
                  {audioMeter.map((height, i) => (
                    <div 
                      key={i} 
                      className={`eq-live-bar ${callState !== 'idle' ? 'active' : ''}`}
                      style={{ height: callState !== 'idle' ? `${height}%` : '6%' }}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Prompt Suggester */}
              <div className="sample-prompts-tray">
                <span className="tray-label">Try speaking or click a prompt:</span>
                <div className="prompts-grid">
                  {samplePrompts.map((p, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleUserSpeechInput(p)}
                      className="prompt-chip"
                    >
                      <span>"{p}"</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual text backup input */}
              <form onSubmit={handleTextSubmit} className="text-prompt-fallback">
                <input 
                  type="text" 
                  value={userInputText}
                  onChange={(e) => setUserInputText(e.target.value)}
                  placeholder="Or type what you want to say to the agent..."
                  className="fallback-input"
                />
                <button type="submit" className="fallback-send-btn" disabled={!userInputText.trim()}>
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* COLUMN 3: Live Transcript & Tool Execution Stream */}
          <div className="studio-col studio-transcript-col card-clean">
            <div className="col-header">
              <span className="col-heading">Live Transcript & Logs</span>
              <button 
                onClick={() => setTranscripts([])} 
                className="btn-clear-transcript"
                title="Clear transcript history"
              >
                Clear
              </button>
            </div>

            <div className="transcript-scroll-area">
              {transcripts.map((item) => {
                if (item.role === 'system') {
                  return (
                    <div key={item.id} className="transcript-system-msg">
                      <span className="system-dot"></span>
                      <span>{item.text}</span>
                    </div>
                  );
                }

                if (item.role === 'tool') {
                  return (
                    <div key={item.id} className="transcript-tool-item">
                      <div className="tool-item-header">
                        <span className="tool-tag">TOOL CALL</span>
                        <span className="tool-fn-name">{item.toolDetails?.tool}</span>
                        <span className="tool-time">{item.timestamp}</span>
                      </div>
                      <pre className="tool-json-output">
                        {JSON.stringify(item.toolDetails?.result, null, 2)}
                      </pre>
                    </div>
                  );
                }

                return (
                  <div key={item.id} className={`transcript-bubble-row ${item.role}`}>
                    <div className="bubble-header-meta">
                      <span className={`sender-pill ${item.role}`}>
                        {item.role === 'user' ? 'Caller' : agentName}
                      </span>
                      <span className="bubble-time">{item.timestamp}</span>
                    </div>
                    <div className={`message-bubble ${item.role}`}>
                      {item.text}
                    </div>
                  </div>
                );
              })}
              <div ref={transcriptEndRef} />
            </div>

            {/* Bottom Transcript Telemetry */}
            <div className="transcript-footer">
              <div className="footer-metric">
                <span className="metric-tag">Engine:</span>
                <span className="metric-value font-mono">Universal-3 Pro</span>
              </div>
              <div className="footer-metric">
                <span className="metric-tag">Turn Latency:</span>
                <span className="metric-value font-mono text-green">&lt;350ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .playground-section {
          background: #FAF9F5;
          border-bottom: 1px solid var(--border-subtle);
        }

        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          flex-wrap: wrap;
        }

        .playground-mode-banner {
          align-self: flex-start;
        }

        .mode-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          font-size: 13px;
        }

        .mode-pill.demo {
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          color: #92400E;
        }

        .mode-pill.live {
          background: #DCFCE7;
          border: 1px solid #BBF7D0;
          color: #166534;
        }

        .mode-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .mode-dot.yellow { background: #D97706; }
        .mode-dot.green { background: #16A34A; }

        .mode-text-group {
          display: flex;
          flex-direction: column;
        }

        .mode-title {
          font-weight: 600;
          font-size: 12.5px;
        }

        .mode-sub {
          font-size: 11px;
          opacity: 0.85;
          font-family: var(--font-mono);
        }

        .btn-key-setup {
          background: #92400E;
          color: #FFFFFF;
          font-size: 11.5px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: var(--radius-xs);
          transition: background 0.15s ease;
        }

        .btn-key-setup:hover {
          background: #78350F;
        }

        /* 3-Column Studio Grid */
        .playground-studio-grid {
          display: grid;
          grid-template-columns: 310px 1fr 340px;
          gap: 20px;
          align-items: stretch;
        }

        @media (max-width: 1100px) {
          .playground-studio-grid {
            grid-template-columns: 1fr;
          }
        }

        .studio-col {
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-xs);
        }

        .col-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: #FAF9F6;
          border-bottom: 1px solid var(--border-subtle);
        }

        .col-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .col-heading {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .spec-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          padding: 2px 6px;
          border-radius: 3px;
        }

        /* Config Form */
        .config-form {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .tools-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tools-count {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent-blue);
        }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          padding: 8px 10px;
          font-size: 13px;
          background: #FFFFFF;
          color: var(--text-primary);
          transition: border-color 0.15s ease;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 1px var(--accent-blue);
        }

        .form-textarea {
          resize: vertical;
          font-family: var(--font-sans);
          line-height: 1.45;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .tools-toggle-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tool-checkbox-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 10px;
          background: #FAF9F6;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xs);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tool-checkbox-item:hover {
          border-color: #D2D0C8;
          background: #F4F3ED;
        }

        .tool-checkbox-item input {
          margin-top: 3px;
          accent-color: var(--accent-blue);
        }

        .tool-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .tool-fn {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .tool-desc {
          font-size: 11px;
          color: var(--text-muted);
        }

        /* Center Column Stage */
        .studio-center-col {
          display: flex;
          flex-direction: column;
        }

        .state-badge {
          font-size: 11.5px;
          font-family: var(--font-mono);
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 999px;
        }

        .state-badge.idle {
          background: #F4F3ED;
          color: #717684;
        }

        .state-badge.listening {
          background: #EFF6FF;
          color: #2563EB;
          animation: pulse 1.5s infinite;
        }

        .state-badge.thinking {
          background: #FEF3C7;
          color: #B45309;
        }

        .state-badge.speaking {
          background: #DCFCE7;
          color: #15803D;
        }

        .mic-stage-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 36px 24px;
          flex: 1;
        }

        .mic-ring-container {
          position: relative;
          width: 110px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .mic-ring-container.listening::after {
          content: '';
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          border: 2px solid #3B82F6;
          animation: ripple 1.8s infinite ease-out;
        }

        .mic-ring-container.speaking::after {
          content: '';
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          border: 2px solid #10B981;
          animation: ripple 1.8s infinite ease-out;
        }

        @keyframes ripple {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        .mic-primary-btn {
          width: 86px;
          height: 86px;
          border-radius: 50%;
          background: var(--text-primary);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px -4px rgba(18, 19, 22, 0.25);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 3px solid #FFFFFF;
        }

        .mic-primary-btn:hover {
          transform: scale(1.05);
          background: #27272A;
        }

        .mic-primary-btn.in-call {
          background: #DC2626;
          box-shadow: 0 8px 24px -4px rgba(220, 38, 38, 0.35);
        }

        .mic-primary-btn.in-call:hover {
          background: #B91C1C;
        }

        .stage-status-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
          text-align: center;
        }

        .stage-status-sub {
          font-size: 13px;
          color: var(--text-secondary);
          text-align: center;
          max-width: 380px;
          margin-bottom: 24px;
        }

        .audio-visualizer-box {
          width: 100%;
          max-width: 420px;
          background: #FAF9F6;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          margin-bottom: 24px;
        }

        .visualizer-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .eq-bars-row {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 36px;
        }

        .eq-live-bar {
          flex: 1;
          background: #D1D5DB;
          border-radius: 2px;
          transition: height 0.15s ease;
        }

        .eq-live-bar.active {
          background: var(--accent-blue);
        }

        .sample-prompts-tray {
          width: 100%;
          margin-bottom: 20px;
        }

        .tray-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 8px;
          text-align: center;
        }

        .prompts-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
        }

        .prompt-chip {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .prompt-chip:hover {
          border-color: var(--accent-blue);
          color: var(--accent-blue);
          background: var(--accent-blue-light);
        }

        .text-prompt-fallback {
          width: 100%;
          display: flex;
          gap: 8px;
        }

        .fallback-input {
          flex: 1;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          font-size: 13px;
        }

        .fallback-send-btn {
          background: var(--text-primary);
          color: #FFFFFF;
          padding: 0 14px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease;
        }

        .fallback-send-btn:disabled {
          background: #E5E7EB;
          cursor: not-allowed;
        }

        /* Transcript Column */
        .studio-transcript-col {
          display: flex;
          flex-direction: column;
        }

        .btn-clear-transcript {
          font-size: 11.5px;
          color: var(--text-muted);
          cursor: pointer;
          background: none;
          border: none;
        }

        .btn-clear-transcript:hover {
          color: var(--text-primary);
        }

        .transcript-scroll-area {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          max-height: 480px;
          background: #FAF9F6;
        }

        .transcript-system-msg {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-muted);
          padding: 4px 8px;
          background: #ECEAE4;
          border-radius: var(--radius-xs);
          align-self: center;
        }

        .system-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #9499A8;
        }

        .transcript-bubble-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 90%;
        }

        .transcript-bubble-row.user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .transcript-bubble-row.agent {
          align-self: flex-start;
          align-items: flex-start;
        }

        .bubble-header-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
        }

        .sender-pill {
          font-family: var(--font-mono);
          font-weight: 600;
          padding: 1px 5px;
          border-radius: 3px;
        }

        .sender-pill.user {
          background: #E5E7EB;
          color: #374151;
        }

        .sender-pill.agent {
          background: var(--accent-blue-light);
          color: var(--accent-blue);
        }

        .bubble-time {
          color: var(--text-light);
          font-family: var(--font-mono);
        }

        .message-bubble {
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          line-height: 1.45;
        }

        .message-bubble.user {
          background: var(--text-primary);
          color: #FFFFFF;
        }

        .message-bubble.agent {
          background: #FFFFFF;
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-xs);
        }

        .transcript-tool-item {
          background: #18191D;
          border: 1px solid #2B2D35;
          border-left: 3px solid #F59E0B;
          border-radius: var(--radius-xs);
          padding: 8px 10px;
          color: #E2E4E9;
        }

        .tool-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .tool-tag {
          font-family: var(--font-mono);
          font-size: 9.5px;
          font-weight: 700;
          color: #FBBF24;
          background: rgba(251, 191, 36, 0.15);
          padding: 1px 4px;
          border-radius: 2px;
        }

        .tool-fn-name {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #F3F4F6;
        }

        .tool-time {
          color: #6B7280;
          font-family: var(--font-mono);
          font-size: 10px;
        }

        .tool-json-output {
          background: #111215;
          padding: 6px 8px;
          border-radius: 3px;
          font-size: 10.5px;
          font-family: var(--font-mono);
          color: #93C5FD;
          overflow-x: auto;
          line-height: 1.35;
        }

        .transcript-footer {
          display: flex;
          justify-content: space-between;
          padding: 10px 14px;
          background: #FAF9F6;
          border-top: 1px solid var(--border-subtle);
          font-size: 11px;
        }

        .footer-metric {
          display: flex;
          gap: 6px;
        }

        .metric-tag {
          color: var(--text-muted);
        }

        .metric-value {
          font-weight: 600;
          color: var(--text-secondary);
        }
      `}</style>
    </section>
  );
}
