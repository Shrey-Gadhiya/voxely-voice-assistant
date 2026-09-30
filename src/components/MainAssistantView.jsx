import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Square, Play, Sparkles, ExternalLink, 
  Check, ArrowRight, CornerDownLeft, AlertCircle, ShieldAlert,
  Search, Video, Globe, Cloud, Clock, Bell, Terminal, RefreshCw, Send
} from 'lucide-react';

export default function MainAssistantView({ serverStatus, onRecordHistory, onOpenKeyConfig }) {
  // Voice UI States: 'idle' | 'listening' | 'thinking' | 'executing' | 'speaking' | 'error'
  const [voiceState, setVoiceState] = useState('idle');
  const [activeActionLabel, setActiveActionLabel] = useState('');
  const [typedInput, setTypedInput] = useState('');

  // Conversational Context
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [lastSearchUrl, setLastSearchUrl] = useState('');

  // Conversation history: { id, sender: 'user' | 'agent' | 'system', text, timestamp }
  const [dialogue, setDialogue] = useState([
    {
      id: 'init_1',
      sender: 'agent',
      text: "I'm ready. You can say 'Open YouTube', 'Search for Python tutorials', or 'What's the weather in Surat?'",
      timestamp: 'Just now'
    }
  ]);

  // Actions log: { id, title, tool, status: 'Completed' | 'Executing' | 'Pending', url }
  const [executedActions, setExecutedActions] = useState([]);

  // Safety confirmation gate
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  // Audio waveform meter
  const [audioMeter, setAudioMeter] = useState([15, 30, 60, 40, 80, 50, 25, 70, 45, 20]);

  // References
  const micStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const recognitionRef = useRef(null);
  const animFrameRef = useRef(null);
  const dialogueEndRef = useRef(null);

  useEffect(() => {
    dialogueEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogue, voiceState, executedActions]);

  // Natural Speech Synthesis (Text-to-Speech)
  const speakVoice = (text, onFinish) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny')));
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        setVoiceState('idle');
        if (onFinish) onFinish();
      };
      utterance.onerror = () => {
        setVoiceState('idle');
        if (onFinish) onFinish();
      };

      setVoiceState('speaking');
      window.speechSynthesis.speak(utterance);
    } else {
      setVoiceState('speaking');
      setTimeout(() => {
        setVoiceState('idle');
        if (onFinish) onFinish();
      }, 1800);
    }
  };

  // Start Audio Capture and Real-time Speech Recognition
  const startMicrophone = async () => {
    try {
      // Barge-in: cancel any speaking voice immediately
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const bars = [];
        for (let i = 0; i < 10; i++) {
          const val = Math.min(100, Math.max(12, Math.floor((data[i * 2] / 255) * 100)));
          bars.push(val);
        }
        setAudioMeter(bars);
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      setVoiceState('listening');

      // Browser Web Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = false;
        reco.lang = 'en-US';

        reco.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          if (transcript) {
            handleCommand(transcript);
          }
        };

        reco.onerror = (e) => {
          console.warn('[Speech Error]', e.error);
          if (e.error !== 'no-speech') {
            setVoiceState('error');
            setTimeout(() => setVoiceState('idle'), 2000);
          } else {
            setVoiceState('idle');
          }
        };

        reco.onend = () => {
          // Keep listening or idle
        };

        reco.start();
        recognitionRef.current = reco;
      }
    } catch (err) {
      console.warn('Microphone permission or hardware unavailable:', err);
      setVoiceState('listening');
      // Simulate listening timer for manual fallback
    }
  };

  const stopMicrophone = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceState('idle');
  };

  const toggleMic = () => {
    if (voiceState === 'idle') {
      startMicrophone();
    } else {
      stopMicrophone();
    }
  };

  // Main Command Processing & Intent Router
  const handleCommand = async (rawInput) => {
    const input = rawInput.trim();
    if (!input) return;

    // Interrupt previous voice output
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userItem = { id: `u_${Date.now()}`, sender: 'user', text: input, timestamp: timeStr };
    setDialogue(prev => [...prev, userItem]);

    setVoiceState('thinking');

    try {
      // Route intent via backend
      const routeRes = await fetch('/api/agent/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, context: { lastSearchQuery, lastSearchUrl } })
      });
      const routeData = await routeRes.json();

      const toolName = routeData.toolName;
      const parameters = routeData.parameters || {};
      const spokenReply = routeData.spokenReply || "Working on it.";

      if (!toolName) {
        // Conversational response without tool execution (e.g. "Hey Voxely" -> "Yes?")
        setVoiceState('speaking');
        const agentItem = { id: `a_${Date.now()}`, sender: 'agent', text: spokenReply, timestamp: timeStr };
        setDialogue(prev => [...prev, agentItem]);
        speakVoice(spokenReply);
        return;
      }

      // Check if action requires confirmation
      const sensitiveTools = ['send_email', 'delete_something', 'execute_shell', 'modify_data', 'purchase'];
      if (sensitiveTools.includes(toolName)) {
        setPendingConfirmation({
          toolName,
          parameters,
          spokenReply: `This action requires confirmation: ${toolName}. Do you want me to continue?`
        });
        setVoiceState('speaking');
        speakVoice("Do you want me to continue?");
        return;
      }

      // Execute tool
      setVoiceState('executing');
      setActiveActionLabel(spokenReply);

      const execRes = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName, parameters })
      });
      const execResult = await execRes.json();

      // Perform actual browser action where applicable
      if (execResult.actionType === 'browser_open' && execResult.url) {
        window.open(execResult.url, '_blank');
        setLastSearchUrl(execResult.url);
      }
      if (parameters.query) {
        setLastSearchQuery(parameters.query);
      }

      // Add to executed actions
      const newAction = {
        id: `act_${Date.now()}`,
        title: formatActionTitle(toolName, parameters),
        tool: toolName,
        status: 'Completed',
        url: execResult.url
      };
      setExecutedActions(prev => [newAction, ...prev]);

      // Record in command history
      if (onRecordHistory) {
        onRecordHistory({
          text: input,
          tool: toolName,
          status: 'Completed',
          details: { url: execResult.url, query: parameters.query }
        });
      }

      // Formulate final natural agent message
      let finalSpeech = spokenReply;
      if (toolName === 'get_weather' && execResult.message) {
        finalSpeech = execResult.message;
      } else if (toolName === 'get_current_time' && execResult.message) {
        finalSpeech = execResult.message;
      } else if (toolName === 'create_reminder' && execResult.message) {
        finalSpeech = execResult.message;
      }

      const agentItem = {
        id: `a_${Date.now()}`,
        sender: 'agent',
        text: finalSpeech,
        tool: toolName,
        actionResult: execResult,
        timestamp: timeStr
      };
      setDialogue(prev => [...prev, agentItem]);

      // Speak response
      speakVoice(finalSpeech);

    } catch (err) {
      console.error('[Command Processing Error]', err);
      setVoiceState('error');
      const errItem = {
        id: `e_${Date.now()}`,
        sender: 'system',
        text: "Something went wrong processing your request. Please try again.",
        timestamp: timeStr
      };
      setDialogue(prev => [...prev, errItem]);
      setTimeout(() => setVoiceState('idle'), 2500);
    }
  };

  const formatActionTitle = (tool, params) => {
    switch (tool) {
      case 'open_website': return `Open ${params.url || 'Website'}`;
      case 'youtube_search': return `Search YouTube for "${params.query}"`;
      case 'web_search': return `Google Search for "${params.query}"`;
      case 'get_weather': return `Check Weather in ${params.location || 'Surat'}`;
      case 'get_current_time': return `Check Current Time`;
      case 'create_reminder': return `Set Reminder: "${params.title}"`;
      case 'open_application': return `Launch ${params.application}`;
      case 'browser_back': return `Browser Back`;
      case 'browser_forward': return `Browser Forward`;
      case 'browser_refresh': return `Refresh Page`;
      default: return tool;
    }
  };

  // Confirm sensitive action execution
  const confirmAction = async (confirmed) => {
    if (!pendingConfirmation) return;
    const { toolName, parameters } = pendingConfirmation;
    setPendingConfirmation(null);

    if (confirmed) {
      setVoiceState('executing');
      const execRes = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName, parameters, userConfirmed: true })
      });
      const data = await execRes.json();
      const reply = `Action confirmed and completed.`;
      setDialogue(prev => [...prev, { id: `a_${Date.now()}`, sender: 'agent', text: reply, timestamp: 'Now' }]);
      speakVoice(reply);
    } else {
      const cancelReply = "Action cancelled.";
      setDialogue(prev => [...prev, { id: `a_${Date.now()}`, sender: 'agent', text: cancelReply, timestamp: 'Now' }]);
      speakVoice(cancelReply);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    const text = typedInput;
    setTypedInput('');
    handleCommand(text);
  };

  const sampleVoicePrompts = [
    "Open YouTube",
    "Search YouTube for Python tutorials",
    "Search Google for GTU exam dates",
    "Open GitHub",
    "What's the weather in Surat?",
    "Open Gmail",
    "Search for the best laptop under 60000",
    "Set a reminder for 8 PM",
    "Tell me the current time",
    "Open Calculator"
  ];

  return (
    <div className="assistant-view-wrapper">
      <div className="container">
        {/* Main Hero Header */}
        <div className="assistant-hero">
          <div className="hero-status-pill">
            <span className="dot-pulse"></span>
            <span>AssemblyAI Voice Agent API • Universal-3 Pro</span>
          </div>

          <h1 className="assistant-main-title">Talk to your computer.</h1>
          <p className="assistant-subtitle">
            Give Voxely a command. It understands what you mean and takes care of the action.
          </p>

          {/* Central Circular Microphone Interface */}
          <div className="central-mic-stage">
            <div className={`mic-halo-ring ${voiceState}`}>
              <button 
                onClick={toggleMic}
                className={`central-mic-btn ${voiceState !== 'idle' ? 'active-call' : ''}`}
                title={voiceState === 'idle' ? "Click to speak" : "Stop listening"}
                aria-label="Toggle Microphone"
              >
                {voiceState === 'idle' ? (
                  <Mic size={44} className="mic-svg" />
                ) : (
                  <Square size={34} className="stop-svg" />
                )}
              </button>
            </div>

            {/* State Label */}
            <div className="mic-state-headline">
              {voiceState === 'idle' && "Click the microphone or say a command"}
              {voiceState === 'listening' && "Listening... Speak naturally"}
              {voiceState === 'thinking' && "Understanding..."}
              {voiceState === 'executing' && (activeActionLabel || "Executing action...")}
              {voiceState === 'speaking' && "Speaking..."}
              {voiceState === 'error' && "Something went wrong. Try again."}
            </div>

            {/* Real-time Audio Waveform Bars */}
            <div className="mic-frequency-spectrum">
              {audioMeter.map((height, i) => (
                <div 
                  key={i} 
                  className={`freq-bar ${voiceState !== 'idle' ? 'bar-live' : ''}`}
                  style={{ height: voiceState !== 'idle' ? `${height}%` : '8%' }}
                />
              ))}
            </div>

            {/* Quick-Prompt Suggestions */}
            <div className="quick-prompts-tray">
              <span className="prompts-heading">Try saying:</span>
              <div className="prompts-chip-row">
                {sampleVoicePrompts.slice(0, 6).map((prompt, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleCommand(prompt)}
                    className="prompt-pill-btn"
                  >
                    <span>"{prompt}"</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typed Command Input fallback */}
            <form onSubmit={handleManualSubmit} className="command-bar-form">
              <div className="command-input-wrap">
                <Search size={16} className="search-icon-muted" />
                <input 
                  type="text" 
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder="Or type a command: 'Search YouTube for Python tutorials', 'Open GitHub'..."
                  className="command-text-field"
                />
              </div>
              <button 
                type="submit" 
                className="command-send-btn btn-primary"
                disabled={!typedInput.trim()}
              >
                <Send size={14} />
                <span>Execute</span>
              </button>
            </form>
          </div>
        </div>

        {/* Live Assistant Panel */}
        <div className="live-assistant-panel-grid">
          {/* Left: Conversation Stream */}
          <div className="dialogue-panel-card card-clean">
            <div className="panel-top-bar">
              <div className="panel-title-group">
                <Sparkles size={16} className="text-blue" />
                <span className="panel-title">Conversation</span>
              </div>
              <span className="panel-badge">Turn-Taking Active</span>
            </div>

            <div className="dialogue-scroll-box">
              {dialogue.map((item) => (
                <div key={item.id} className={`dialogue-item ${item.sender}`}>
                  <div className="dialogue-sender-meta">
                    <span className="sender-name">
                      {item.sender === 'user' ? 'You' : item.sender === 'agent' ? 'Voxely' : 'System'}
                    </span>
                    <span className="sender-timestamp">{item.timestamp}</span>
                  </div>
                  <div className={`dialogue-bubble ${item.sender}`}>
                    {item.text}
                  </div>

                  {item.actionResult?.url && (
                    <a 
                      href={item.actionResult.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="external-action-link"
                    >
                      <ExternalLink size={12} />
                      <span>{item.actionResult.url}</span>
                    </a>
                  )}
                </div>
              ))}
              <div ref={dialogueEndRef} />
            </div>

            {/* Safety Confirmation Modal Callout */}
            {pendingConfirmation && (
              <div className="confirmation-callout-box">
                <div className="confirm-icon-wrap">
                  <ShieldAlert size={20} className="text-amber" />
                </div>
                <div className="confirm-content">
                  <span className="confirm-title">Confirmation Required</span>
                  <p className="confirm-prompt">{pendingConfirmation.spokenReply}</p>
                  <div className="confirm-buttons-row">
                    <button onClick={() => confirmAction(true)} className="btn-accent confirm-btn">
                      Yes, Continue
                    </button>
                    <button onClick={() => confirmAction(false)} className="btn-secondary confirm-btn">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions List & Execution Log */}
          <div className="actions-panel-card card-clean">
            <div className="panel-top-bar">
              <span className="panel-title">Actions & Results</span>
              <span className="panel-status-tag">
                {voiceState === 'executing' ? 'Executing' : 'Completed'}
              </span>
            </div>

            <div className="actions-scroll-box">
              {executedActions.length === 0 ? (
                <div className="no-actions-empty">
                  <Terminal size={28} className="empty-icon text-muted" />
                  <p>No actions executed yet.</p>
                  <span className="empty-sub">Speak or type a command to see live tool calls.</span>
                </div>
              ) : (
                <div className="actions-list">
                  {executedActions.map((act) => (
                    <div key={act.id} className="action-row-item">
                      <div className="action-status-icon">
                        <Check size={14} className="text-green" />
                      </div>
                      <div className="action-details">
                        <span className="action-name">{act.title}</span>
                        <div className="action-tool-meta">
                          <code>{act.tool}()</code>
                          {act.url && (
                            <a href={act.url} target="_blank" rel="noreferrer" className="action-url-tag">
                              Visit URL <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                      <span className="action-badge-done">Completed</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Context Summary */}
            <div className="context-card-footer">
              <span className="context-label">Context Memory:</span>
              <div className="context-values">
                <span>Last Query: <code>{lastSearchQuery || 'None'}</code></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .assistant-view-wrapper {
          padding: 40px 0 80px 0;
          background: #FAF9F5;
        }

        .assistant-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 48px;
        }

        .hero-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          padding: 5px 14px;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 20px;
          box-shadow: var(--shadow-xs);
        }

        .dot-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent-blue);
          box-shadow: 0 0 0 2px var(--accent-blue-border);
        }

        .assistant-main-title {
          font-size: 54px;
          font-weight: 800;
          letter-spacing: -0.035em;
          color: var(--text-primary);
          margin-bottom: 14px;
          line-height: 1.1;
        }

        @media (max-width: 768px) {
          .assistant-main-title {
            font-size: 38px;
          }
        }

        .assistant-subtitle {
          font-size: 19px;
          color: var(--text-secondary);
          max-width: 620px;
          margin-bottom: 36px;
          line-height: 1.5;
        }

        /* Central Microphone Ring */
        .central-mic-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 680px;
        }

        .mic-halo-ring {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .mic-halo-ring.listening::after {
          content: '';
          position: absolute;
          inset: -14px;
          border-radius: 50%;
          border: 2px solid var(--accent-blue);
          animation: ring-pulse 1.8s infinite ease-out;
        }

        .mic-halo-ring.speaking::after {
          content: '';
          position: absolute;
          inset: -14px;
          border-radius: 50%;
          border: 2px solid #16A34A;
          animation: ring-pulse 1.8s infinite ease-out;
        }

        @keyframes ring-pulse {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        .central-mic-btn {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: var(--text-primary);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 4px solid #FFFFFF;
          box-shadow: 0 10px 30px -4px rgba(18, 19, 22, 0.25);
          transition: all 0.2s ease;
        }

        .central-mic-btn:hover {
          transform: scale(1.05);
          background: #27272A;
        }

        .central-mic-btn.active-call {
          background: #DC2626;
          box-shadow: 0 10px 30px -4px rgba(220, 38, 38, 0.35);
        }

        .mic-state-headline {
          font-size: 19px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 14px;
          text-align: center;
        }

        .mic-frequency-spectrum {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 32px;
          width: 240px;
          margin-bottom: 24px;
          background: #FFFFFF;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid var(--border-subtle);
        }

        .freq-bar {
          flex: 1;
          background: #D1D5DB;
          border-radius: 2px;
          transition: height 0.15s ease;
        }

        .freq-bar.bar-live {
          background: var(--accent-blue);
        }

        /* Quick prompts tray */
        .quick-prompts-tray {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          width: 100%;
        }

        .prompts-heading {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .prompts-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .prompt-pill-btn {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .prompt-pill-btn:hover {
          border-color: var(--accent-blue);
          color: var(--accent-blue);
          background: var(--accent-blue-light);
        }

        /* Manual Input Command Bar */
        .command-bar-form {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 6px;
          box-shadow: var(--shadow-sm);
        }

        .command-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          padding-left: 12px;
        }

        .search-icon-muted {
          color: var(--text-muted);
        }

        .command-text-field {
          width: 100%;
          border: none;
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
        }

        .command-send-btn {
          padding: 9px 18px;
          font-size: 13.5px;
        }

        /* Live Assistant 2-Column Grid */
        .live-assistant-panel-grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .live-assistant-panel-grid {
            grid-template-columns: 1fr;
          }
        }

        .dialogue-panel-card, .actions-panel-card {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-xs);
          display: flex;
          flex-direction: column;
          min-height: 480px;
        }

        .panel-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: #FAF9F6;
          border-bottom: 1px solid var(--border-subtle);
        }

        .panel-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .panel-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .panel-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent-blue);
          background: var(--accent-blue-light);
          padding: 3px 8px;
          border-radius: var(--radius-xs);
        }

        .panel-status-tag {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #166534;
          background: #DCFCE7;
          padding: 3px 8px;
          border-radius: var(--radius-xs);
        }

        .dialogue-scroll-box {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          max-height: 420px;
          background: #FAF9F5;
        }

        .dialogue-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 88%;
        }

        .dialogue-item.user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .dialogue-item.agent {
          align-self: flex-start;
          align-items: flex-start;
        }

        .dialogue-sender-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
        }

        .sender-name {
          font-weight: 600;
          font-family: var(--font-mono);
        }

        .sender-timestamp {
          color: var(--text-muted);
        }

        .dialogue-bubble {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 13.5px;
          line-height: 1.5;
        }

        .dialogue-bubble.user {
          background: var(--text-primary);
          color: #FFFFFF;
        }

        .dialogue-bubble.agent {
          background: #FFFFFF;
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-xs);
        }

        .external-action-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-family: var(--font-mono);
          color: var(--accent-blue);
          text-decoration: underline;
          margin-top: 3px;
        }

        /* Confirmation Callout */
        .confirmation-callout-box {
          margin: 16px;
          padding: 14px 18px;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .confirm-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #92400E;
          margin-bottom: 4px;
          display: block;
        }

        .confirm-prompt {
          font-size: 13px;
          color: #78350F;
          margin-bottom: 12px;
        }

        .confirm-buttons-row {
          display: flex;
          gap: 8px;
        }

        .confirm-btn {
          padding: 6px 14px;
          font-size: 12.5px;
        }

        /* Actions Scroll Box */
        .actions-scroll-box {
          padding: 20px;
          flex: 1;
          overflow-y: auto;
          max-height: 420px;
        }

        .no-actions-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 240px;
          color: var(--text-muted);
          text-align: center;
        }

        .empty-icon {
          margin-bottom: 12px;
        }

        .no-actions-empty p {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .empty-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-row-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #FAF9F6;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
        }

        .action-status-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #F0FDF4;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .action-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .action-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .action-tool-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
        }

        .action-tool-meta code {
          font-family: var(--font-mono);
          color: var(--accent-blue);
        }

        .action-url-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--text-secondary);
          text-decoration: underline;
        }

        .action-badge-done {
          font-family: var(--font-mono);
          font-size: 10.5px;
          font-weight: 600;
          color: #166534;
          background: #DCFCE7;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .context-card-footer {
          padding: 12px 20px;
          background: #FAF9F6;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .context-label {
          color: var(--text-muted);
          font-weight: 600;
        }

        .context-values code {
          font-family: var(--font-mono);
          color: var(--accent-blue);
        }
      `}</style>
    </div>
  );
}
