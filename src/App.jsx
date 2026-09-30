import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Square, Settings as SettingsIcon, Key, ExternalLink, 
  Check, ArrowRight, CornerDownLeft, AlertCircle, ShieldAlert,
  Search, Video, Globe, Cloud, Clock, RefreshCw, X, Play, Volume2,
  Copy, Download, Pause, Trash2, FileText, Sparkles
} from 'lucide-react';

export default function App() {
  // Mode selection on the SAME single-page interface: 'command' | 'stt'
  const [appMode, setAppMode] = useState('command'); // Default: Voice Command

  // ----------------------------------------------------
  // VOICE COMMAND MODE STATE
  // ----------------------------------------------------
  // States: 'idle' | 'listening' | 'thinking' | 'executing' | 'speaking' | 'error'
  const [voiceState, setVoiceState] = useState('idle');
  const [executingText, setExecutingText] = useState('Executing action...');
  const [typedInput, setTypedInput] = useState('');
  const [interimCommandText, setInterimCommandText] = useState('');

  // Real-time Transcript: current exchange
  const [currentExchange, setCurrentExchange] = useState({
    userText: "Open YouTube and search for Python tutorials",
    agentText: "Sure, searching YouTube for Python tutorials.",
    hasSpoken: true
  });

  // Action Log (Activity Section on same page)
  const [activities, setActivities] = useState([
    { id: 'act_1', time: '10:32 AM', action: 'YouTube opened', status: 'Completed', url: 'https://www.youtube.com' },
    { id: 'act_2', time: '10:34 AM', action: 'YouTube searched: Python automation', status: 'Completed', url: 'https://www.youtube.com/results?search_query=Python%20automation' },
    { id: 'act_3', time: '10:36 AM', action: 'Google searched: AssemblyAI Voice Agent API', status: 'Completed', url: 'https://www.google.com/search?q=AssemblyAI%20Voice%20Agent%20API' }
  ]);

  // Context Memory for Smart Context ("Open the first one", "Go back", etc.)
  const [contextMemory, setContextMemory] = useState({
    lastQuery: 'Python automation',
    lastUrl: 'https://www.youtube.com/results?search_query=Python%20automation'
  });

  // Safety Confirmation Gate
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  // ----------------------------------------------------
  // SPEECH-TO-TEXT MODE STATE
  // ----------------------------------------------------
  // 'idle' | 'recording' | 'paused' | 'stopped'
  const [sttState, setSttState] = useState('idle');
  const [sttFinalText, setSttFinalText] = useState(
    "Today I want to create a voice assistant that can search the web, open websites, and control browser actions using natural voice commands."
  );
  const [sttInterimText, setSttInterimText] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(14);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [sttEntries, setSttEntries] = useState([
    { time: '00:00', text: "Today I want to create a voice assistant that can search the web, open websites, and control browser actions using natural voice commands." }
  ]);

  // ----------------------------------------------------
  // GLOBAL & SETTINGS STATE
  // ----------------------------------------------------
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Nova');
  const [safetyGateEnabled, setSafetyGateEnabled] = useState(true);

  // Server Connection Status
  const [serverStatus, setServerStatus] = useState({
    configured: false,
    mode: 'demo',
    model: 'Universal-3 Pro Realtime'
  });

  // Audio frequency meter simulation / real analyser
  const [audioMeter, setAudioMeter] = useState([14, 28, 55, 38, 75, 48, 22, 65, 40, 18]);

  // Media / Speech references
  const micStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const recognitionRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const editorScrollRef = useRef(null);

  // Load server status on mount
  const checkStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Auto-scroll transcript editor when new text arrives
  useEffect(() => {
    if (editorScrollRef.current) {
      editorScrollRef.current.scrollTop = editorScrollRef.current.scrollHeight;
    }
  }, [sttFinalText, sttInterimText]);

  // Helper to format MM:SS
  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Vocalize agent response with Web Speech Synthesis
  const speakResponse = (text, onFinish) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = selectedVoice === 'Echo' ? 0.95 : 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
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
      }, 1600);
    }
  };

  // Stop all audio & recognition streams
  const stopAllAudio = () => {
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
    clearInterval(timerIntervalRef.current);
  };

  // Setup Web Audio Analyser
  const setupAudioAnalyser = (stream) => {
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
        const val = Math.min(100, Math.max(10, Math.floor((data[i * 2] / 255) * 100)));
        bars.push(val);
      }
      setAudioMeter(bars);
      animFrameRef.current = requestAnimationFrame(updateMeter);
    };
    updateMeter();
  };

  // ----------------------------------------------------
  // 1. VOICE COMMAND RECORDING & STREAMING
  // ----------------------------------------------------
  const startCommandListening = async () => {
    try {
      stopAllAudio();
      setInterimCommandText('');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setupAudioAnalyser(stream);

      setVoiceState('listening');

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = true;
        reco.lang = 'en-US';

        reco.onresult = (e) => {
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; ++i) {
            if (e.results[i].isFinal) {
              const finalTranscript = e.results[i][0].transcript;
              setInterimCommandText(finalTranscript);
              processVoiceCommand(finalTranscript);
            } else {
              interim += e.results[i][0].transcript;
              setInterimCommandText(interim);
            }
          }
        };

        reco.onerror = (e) => {
          if (e.error !== 'no-speech') {
            setVoiceState('error');
            setTimeout(() => setVoiceState('idle'), 2200);
          } else {
            setVoiceState('idle');
          }
        };

        reco.start();
        recognitionRef.current = reco;
      }
    } catch (err) {
      console.warn('Microphone permission or hardware unavailable:', err);
      setVoiceState('listening');
    }
  };

  const toggleCommandMicrophone = () => {
    if (voiceState === 'idle') {
      startCommandListening();
    } else {
      stopAllAudio();
      setVoiceState('idle');
    }
  };

  // Main Intent Classifier & Action Dispatcher
  const processVoiceCommand = async (rawInput) => {
    const input = rawInput.trim();
    if (!input) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setVoiceState('thinking');

    try {
      // 1. Send input to backend intent router
      const routeRes = await fetch('/api/agent/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, context: contextMemory })
      });
      const routeData = await routeRes.json();

      const toolName = routeData.toolName;
      const parameters = routeData.parameters || {};
      const spokenReply = routeData.spokenReply || "Working on it.";

      // Update real-time transcript YOU:
      setCurrentExchange({
        userText: input,
        agentText: spokenReply,
        hasSpoken: true
      });

      // Conversational responses without tool (e.g. "Hey Voxely" -> "Yes? How can I help you?")
      if (!toolName) {
        setVoiceState('speaking');
        speakResponse(spokenReply);
        return;
      }

      // Check for Confirmation Gate on sensitive actions
      const sensitiveTools = ['send_email', 'send_message', 'delete_file', 'purchase', 'submit_form', 'execute_shell'];
      if (sensitiveTools.includes(toolName) && safetyGateEnabled) {
        setPendingConfirmation({
          toolName,
          parameters,
          prompt: "Do you want me to continue?"
        });
        setVoiceState('speaking');
        speakResponse("Do you want me to continue?");
        return;
      }

      // 2. Execute tool
      const displayToolLabel = formatToolLabel(toolName, parameters);
      setExecutingText(`Executing: ${displayToolLabel}`);
      setVoiceState('executing');

      const execRes = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName, parameters })
      });
      const execResult = await execRes.json();

      // Handle browser opening
      if (execResult.actionType === 'browser_open' && execResult.url) {
        window.open(execResult.url, '_blank');
        setContextMemory(prev => ({ ...prev, lastUrl: execResult.url }));
      }
      if (parameters.query) {
        setContextMemory(prev => ({ ...prev, lastQuery: parameters.query }));
      }

      // Handle browser back/forward/refresh
      if (execResult.actionType === 'browser_back') {
        window.history.back();
      } else if (execResult.actionType === 'browser_forward') {
        window.history.forward();
      } else if (execResult.actionType === 'browser_refresh') {
        window.location.reload();
      }

      // Add to compact Activity log
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newActivity = {
        id: `act_${Date.now()}`,
        time: timeStr,
        action: execResult.displayAction || displayToolLabel,
        status: 'Completed',
        url: execResult.url
      };
      setActivities(prev => [newActivity, ...prev]);

      // Final spoken response
      const finalSpeech = execResult.spokenResponse || spokenReply;
      setCurrentExchange(prev => ({ ...prev, agentText: finalSpeech }));

      // Speak response in natural voice
      speakResponse(finalSpeech);

    } catch (err) {
      console.error('[Voice Command Error]', err);
      setVoiceState('error');
      setCurrentExchange({
        userText: input,
        agentText: "Something went wrong. Please try again.",
        hasSpoken: true
      });
      setTimeout(() => setVoiceState('idle'), 2400);
    }
  };

  const formatToolLabel = (tool, params) => {
    switch (tool) {
      case 'open_website': return `Open ${params.url || 'website'}`;
      case 'youtube_search': return `Search YouTube for ${params.query}`;
      case 'web_search': return `Search Google for ${params.query}`;
      case 'get_weather': return `Check Weather in ${params.location || 'Surat'}`;
      case 'get_current_time': return `Check Current Time`;
      case 'open_application': return `Open ${params.application}`;
      case 'browser_back': return `Go Back`;
      case 'browser_refresh': return `Refresh Page`;
      case 'create_reminder': return `Set Reminder`;
      default: return tool;
    }
  };

  const handleConfirmation = async (confirmed) => {
    if (!pendingConfirmation) return;
    const { toolName, parameters } = pendingConfirmation;
    setPendingConfirmation(null);

    if (confirmed) {
      setExecutingText(`Executing: ${toolName}`);
      setVoiceState('executing');
      const res = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName, parameters, userConfirmed: true })
      });
      const data = await res.json();
      const reply = "Done. Action confirmed and completed.";
      setCurrentExchange(prev => ({ ...prev, agentText: reply }));
      speakResponse(reply);
    } else {
      const reply = "Action cancelled.";
      setCurrentExchange(prev => ({ ...prev, agentText: reply }));
      speakResponse(reply);
    }
  };

  const handleTypedSubmit = (e) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    const text = typedInput;
    setTypedInput('');
    processVoiceCommand(text);
  };

  // ----------------------------------------------------
  // 2. SPEECH-TO-TEXT MODE RECORDING & FEATURES
  // ----------------------------------------------------
  const startSTTTranscription = async () => {
    try {
      stopAllAudio();
      setSttInterimText('');
      setRecordingSeconds(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setupAudioAnalyser(stream);

      setSttState('recording');

      // Start recording timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = true;
        reco.interimResults = true;
        reco.lang = 'en-US';

        reco.onresult = (e) => {
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; ++i) {
            const transcript = e.results[i][0].transcript;
            if (e.results[i].isFinal) {
              setSttFinalText(prev => (prev ? prev + ' ' : '') + transcript.trim());
              setSttInterimText('');
              const timeStamp = formatTimer(recordingSeconds);
              setSttEntries(prev => [...prev, { time: timeStamp, text: transcript.trim() }]);
            } else {
              interim += transcript;
              setSttInterimText(interim);
            }
          }
        };

        reco.onerror = (e) => {
          console.warn('[STT Error]', e.error);
        };

        reco.onend = () => {
          // Restart if still in recording state
          if (sttState === 'recording' && recognitionRef.current) {
            try { reco.start(); } catch (err) {}
          }
        };

        reco.start();
        recognitionRef.current = reco;
      }
    } catch (err) {
      console.warn('Microphone error in STT mode:', err);
      setSttState('recording');
    }
  };

  const pauseSTT = () => {
    if (sttState === 'recording') {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      clearInterval(timerIntervalRef.current);
      setSttState('paused');
    } else if (sttState === 'paused') {
      // Resume
      setSttState('recording');
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    }
  };

  const stopSTT = () => {
    stopAllAudio();
    setSttState('stopped');
    setSttInterimText('');
  };

  const clearSTT = () => {
    stopAllAudio();
    setSttState('idle');
    setSttFinalText('');
    setSttInterimText('');
    setRecordingSeconds(0);
    setSttEntries([]);
  };

  const copyTranscriptText = () => {
    const fullText = (sttFinalText + (sttInterimText ? ' ' + sttInterimText : '')).trim();
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const downloadTranscriptTXT = () => {
    const fullText = (sttFinalText + (sttInterimText ? ' ' + sttInterimText : '')).trim();
    if (!fullText) return;

    const element = document.createElement("a");
    const file = new Blob([
      `Voxely Speech-to-Text Transcript\nDate: ${new Date().toLocaleString()}\nDuration: ${formatTimer(recordingSeconds)}\nModel: AssemblyAI Universal-3 Pro\n\n--------------------------------\n\n${fullText}`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `voxely-transcript-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Switch Mode Handler (Cleans up previous audio safely)
  const handleModeChange = (newMode) => {
    stopAllAudio();
    setVoiceState('idle');
    setInterimCommandText('');
    if (newMode === 'stt' && sttState === 'recording') {
      setSttState('stopped');
    }
    setAppMode(newMode);
  };

  const trySayingPrompts = [
    "Open YouTube",
    "Search for Python tutorials",
    "Open GitHub",
    "Search Google for AssemblyAI",
    "What's the weather in Surat?"
  ];

  return (
    <div className="single-page-app">
      {/* 1. SINGLE-PAGE HEADER */}
      <header className="single-header">
        <div className="header-container">
          {/* Logo */}
          <div className="header-brand">
            <div className="brand-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 6v12M7 6v12M2 10v4M22 10v4" />
              </svg>
            </div>
            <span className="brand-title">Voxely</span>
          </div>

          {/* Right Status & Settings */}
          <div className="header-right">
            <div className={`status-pill ${serverStatus.configured ? 'live' : 'demo'}`}>
              <span className={`pill-dot ${serverStatus.configured ? 'live' : 'demo'}`}></span>
              <span>{serverStatus.configured ? 'Connected' : 'Demo Mode'}</span>
            </div>

            <button 
              onClick={() => setSettingsOpen(true)}
              className="settings-icon-btn"
              title="Open Settings"
              aria-label="Settings"
            >
              <SettingsIcon size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN SINGLE-PAGE VIEW */}
      <main className="main-content-flow">
        <div className="hero-voice-center">
          {/* Large Heading */}
          <h1 className="hero-title">Talk. Command. Done.</h1>
          
          {/* Subtitle */}
          <p className="hero-subtitle">
            Control your browser and everyday tasks with your voice.
          </p>

          {/* MODE SWITCHER TABS (ON THE SAME SINGLE PAGE) */}
          <div className="mode-switcher-container">
            <button 
              onClick={() => handleModeChange('command')} 
              className={`mode-tab-button ${appMode === 'command' ? 'active' : ''}`}
            >
              <Sparkles size={14} />
              <span>Voice Command</span>
            </button>
            <button 
              onClick={() => handleModeChange('stt')} 
              className={`mode-tab-button ${appMode === 'stt' ? 'active' : ''}`}
            >
              <FileText size={14} />
              <span>Speech to Text</span>
            </button>
          </div>

          {/* ============================================================ */}
          {/* MODE A: VOICE COMMAND MODE                                   */}
          {/* ============================================================ */}
          {appMode === 'command' && (
            <div className="mode-content-block">
              {/* Central Circular Microphone Button */}
              <div className="mic-interactive-wrapper">
                <div className={`mic-ring-halo ${voiceState}`}>
                  <button 
                    onClick={toggleCommandMicrophone}
                    className={`main-mic-button ${voiceState !== 'idle' ? 'in-action' : ''}`}
                    title={voiceState === 'idle' ? "Click to speak" : "Click to stop listening"}
                    aria-label="Microphone Button"
                  >
                    {voiceState === 'idle' ? (
                      <Mic size={46} className="mic-icon-svg" />
                    ) : (
                      <Square size={34} className="stop-icon-svg" />
                    )}
                  </button>
                </div>

                {/* Voice States Headline */}
                <div className="voice-state-label">
                  {voiceState === 'idle' && "Listening for your command"}
                  {voiceState === 'listening' && (interimCommandText ? `"${interimCommandText}..."` : "Listening...")}
                  {voiceState === 'thinking' && "Understanding your request..."}
                  {voiceState === 'executing' && executingText}
                  {voiceState === 'speaking' && "Voxely is responding..."}
                  {voiceState === 'error' && "Something went wrong"}
                </div>

                {/* Live partial streaming transcript while speaking */}
                {voiceState === 'listening' && interimCommandText && (
                  <div className="live-interim-bubble">
                    <span className="live-bubble-dot"></span>
                    <span>{interimCommandText}</span>
                  </div>
                )}

                {/* Audio Waveform Spectrum */}
                <div className="audio-meter-strip">
                  {audioMeter.map((height, idx) => (
                    <div 
                      key={idx} 
                      className={`audio-bar ${voiceState !== 'idle' ? 'active' : ''}`}
                      style={{ height: voiceState !== 'idle' ? `${height}%` : '8%' }}
                    />
                  ))}
                </div>

                {/* Try Saying Section */}
                <div className="try-saying-section">
                  <span className="try-saying-label">Try saying:</span>
                  <div className="try-saying-chips">
                    {trySayingPrompts.map((prompt, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => processVoiceCommand(prompt)}
                        className="saying-chip"
                      >
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Typed Command Bar */}
                <form onSubmit={handleTypedSubmit} className="command-input-container">
                  <input 
                    type="text" 
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    placeholder="Or type a command: 'Search YouTube for Python tutorials', 'Open GitHub'..."
                    className="command-input-box"
                  />
                  <button 
                    type="submit" 
                    className="command-execute-btn"
                    disabled={!typedInput.trim()}
                  >
                    Execute
                  </button>
                </form>
              </div>

              {/* Real-time Transcript Card */}
              <div className="transcript-card">
                <div className="transcript-item">
                  <span className="speaker-tag you">YOU</span>
                  <p className="speaker-text">"{currentExchange.userText}"</p>
                </div>
                <div className="transcript-divider"></div>
                <div className="transcript-item">
                  <span className="speaker-tag voxely">VOXELY</span>
                  <p className="speaker-text voxely-text">"{currentExchange.agentText}"</p>
                </div>
              </div>

              {/* Safety Confirmation Alert Box */}
              {pendingConfirmation && (
                <div className="confirmation-modal-banner">
                  <div className="confirm-icon-area">
                    <ShieldAlert size={22} className="text-amber" />
                  </div>
                  <div className="confirm-text-area">
                    <strong>Confirmation Required</strong>
                    <p>Do you want me to continue with this action?</p>
                    <div className="confirm-action-buttons">
                      <button onClick={() => handleConfirmation(true)} className="btn-confirm-yes">
                        Yes, Continue
                      </button>
                      <button onClick={() => handleConfirmation(false)} className="btn-confirm-cancel">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Section (Action Log on same page) */}
              <section className="activity-section">
                <div className="activity-header">
                  <h2 className="activity-title">Activity</h2>
                  <span className="activity-subtitle">Real-time actions executed by Voxely</span>
                </div>

                <div className="activity-list">
                  {activities.map((item) => (
                    <div key={item.id} className="activity-row">
                      <div className="activity-status-icon">
                        <Check size={14} className="check-svg" />
                      </div>
                      <div className="activity-info">
                        <span className="activity-action-name">{item.action}</span>
                        <span className="activity-time-stamp">{item.time}</span>
                      </div>
                      <div className="activity-right-col">
                        <span className="activity-status-badge">Completed</span>
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noreferrer" className="activity-link-icon" title="Open Link">
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODE B: SPEECH-TO-TEXT MODE                                  */}
          {/* ============================================================ */}
          {appMode === 'stt' && (
            <div className="mode-content-block stt-mode-wrapper">
              <div className="stt-section-header">
                <h2 className="stt-main-heading">Speech to Text</h2>
                <p className="stt-sub-heading">Turn your voice into accurate text in real time.</p>
              </div>

              {/* Demo Mode Notice if key is missing */}
              {!serverStatus.configured && (
                <div className="stt-demo-notice">
                  <span>Demo Mode — connect AssemblyAI to enable real-time cloud transcription.</span>
                  <button onClick={() => setSettingsOpen(true)} className="btn-stt-key-config">Setup Key</button>
                </div>
              )}

              {/* Recording Status Bar */}
              <div className="stt-recording-status-bar">
                <div className="stt-state-pill">
                  {sttState === 'recording' ? (
                    <div className="recording-live-indicator">
                      <span className="recording-red-dot"></span>
                      <span>Recording</span>
                    </div>
                  ) : sttState === 'paused' ? (
                    <div className="recording-paused-indicator">
                      <span className="paused-dot"></span>
                      <span>Paused</span>
                    </div>
                  ) : (
                    <span className="text-muted">Ready to Transcribe</span>
                  )}
                </div>

                <div className="stt-timer-display">
                  <span className="timer-label">Recording time:</span>
                  <code className="timer-digits">{formatTimer(recordingSeconds)}</code>
                </div>
              </div>

              {/* Central Large Microphone Button for STT */}
              <div className="stt-mic-row">
                <div className={`mic-ring-halo ${sttState === 'recording' ? 'listening' : ''}`}>
                  <button 
                    onClick={sttState === 'recording' ? stopSTT : startSTTTranscription}
                    className={`main-mic-button ${sttState === 'recording' ? 'in-action' : ''}`}
                    title={sttState === 'recording' ? "Stop Transcription" : "Start Transcription"}
                    aria-label="Toggle Transcription"
                  >
                    {sttState === 'recording' ? (
                      <Square size={34} className="stop-icon-svg" />
                    ) : (
                      <Mic size={46} className="mic-icon-svg" />
                    )}
                  </button>
                </div>
                <div className="stt-mic-caption">
                  {sttState === 'recording' ? "Click to Stop" : "Start Transcription"}
                </div>
              </div>

              {/* STT Controls Toolbar */}
              <div className="stt-toolbar">
                <button 
                  onClick={pauseSTT} 
                  disabled={sttState === 'idle' || sttState === 'stopped'}
                  className="btn-toolbar"
                  title="Pause or Resume"
                >
                  {sttState === 'paused' ? <Play size={13} /> : <Pause size={13} />}
                  <span>{sttState === 'paused' ? 'Resume' : 'Pause'}</span>
                </button>

                <button 
                  onClick={stopSTT} 
                  disabled={sttState === 'idle' || sttState === 'stopped'}
                  className="btn-toolbar"
                  title="Stop Recording"
                >
                  <Square size={13} />
                  <span>Stop</span>
                </button>

                <button 
                  onClick={clearSTT} 
                  className="btn-toolbar"
                  title="Clear all text"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>

                <button 
                  onClick={copyTranscriptText} 
                  className="btn-toolbar primary"
                  title="Copy transcript to clipboard"
                >
                  {copyFeedback ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copyFeedback ? 'Copied!' : 'Copy Text'}</span>
                </button>

                <button 
                  onClick={downloadTranscriptTXT} 
                  className="btn-toolbar accent"
                  title="Download transcript as .txt"
                >
                  <Download size={13} />
                  <span>Download TXT</span>
                </button>
              </div>

              {/* Professional Transcript Editor View */}
              <div className="stt-editor-card">
                <div className="editor-top-bar">
                  <div className="editor-title-group">
                    <FileText size={15} className="text-blue" />
                    <span className="editor-title">LIVE TRANSCRIPT</span>
                  </div>
                  <div className="editor-meta">
                    <span>Universal-3 Pro</span>
                    <span>•</span>
                    <span>{sttFinalText.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                </div>

                <div className="editor-text-area" ref={editorScrollRef}>
                  {sttFinalText ? (
                    <div className="final-transcript-text">
                      {sttFinalText}
                      {sttInterimText && (
                        <span className="interim-text-stream">
                          {' '}{sttInterimText}
                        </span>
                      )}
                    </div>
                  ) : sttInterimText ? (
                    <div className="interim-text-stream">
                      {sttInterimText}
                    </div>
                  ) : (
                    <div className="editor-placeholder">
                      {sttState === 'recording' 
                        ? "Listening... Speak naturally, your words will appear here in real time." 
                        : "Click 'Start Transcription' or the microphone above to begin turning your speech into text."}
                    </div>
                  )}
                </div>

                <div className="editor-footer-bar">
                  <span className="footer-status-text">
                    {sttState === 'recording' ? 'Continuous stream active' : 'Transcription complete'}
                  </span>

                  <div className="editor-footer-actions">
                    <button onClick={copyTranscriptText} className="footer-action-btn">
                      <Copy size={12} />
                      <span>{copyFeedback ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button onClick={downloadTranscriptTXT} className="footer-action-btn">
                      <Download size={12} />
                      <span>Download TXT</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. SETTINGS SLIDE-OVER DRAWER (Same page overlay) */}
      {settingsOpen && (
        <div className="drawer-backdrop" onClick={() => setSettingsOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title-wrap">
                <SettingsIcon size={18} className="text-blue" />
                <h3>Voxely Settings</h3>
              </div>
              <button onClick={() => setSettingsOpen(false)} className="drawer-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Voice selection */}
              <div className="drawer-form-group">
                <label className="drawer-label">Assistant Voice</label>
                <select 
                  value={selectedVoice} 
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="drawer-select"
                >
                  <option value="Nova">Nova (Natural Calm Female)</option>
                  <option value="Echo">Echo (Executive Male)</option>
                  <option value="Alloy">Alloy (Neutral Studio)</option>
                  <option value="Shimmer">Shimmer (Clear & Expressive)</option>
                </select>
                <span className="drawer-hint">Synthesized natural speech cadence.</span>
              </div>

              {/* Safety Confirmation Gate Toggle */}
              <div className="drawer-form-group">
                <div className="drawer-toggle-row">
                  <div>
                    <label className="drawer-label mb-0">Safety Confirmation Gate</label>
                    <p className="drawer-hint mt-1">Prompt "Do you want me to continue?" before destructive or external actions.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={safetyGateEnabled} 
                    onChange={(e) => setSafetyGateEnabled(e.target.checked)}
                    className="drawer-checkbox"
                  />
                </div>
              </div>

              {/* AssemblyAI Voice Agent Engine status */}
              <div className="drawer-form-group">
                <label className="drawer-label">AssemblyAI Voice Agent API</label>
                <div className="drawer-status-box">
                  <div className="status-row">
                    <span>Engine:</span>
                    <code>Universal-3 Pro Realtime</code>
                  </div>
                  <div className="status-row">
                    <span>WebSocket:</span>
                    <code>wss://agents.assemblyai.com/v1/ws</code>
                  </div>
                  <div className="status-row">
                    <span>Connection:</span>
                    <span className={serverStatus.configured ? 'text-green' : 'text-amber'}>
                      {serverStatus.configured ? '● Live API Key Loaded' : '● Local Demo Mode'}
                    </span>
                  </div>
                </div>
                <p className="drawer-hint mt-2">
                  Configure <code>ASSEMBLYAI_API_KEY</code> in <code>.env</code> on the server to enable live cloud streaming.
                </p>
              </div>
            </div>

            <div className="drawer-footer">
              <button onClick={() => setSettingsOpen(false)} className="btn-drawer-done">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        /* Global Reset & Single Page Foundation */
        .single-page-app {
          min-height: 100vh;
          background-color: var(--bg-page);
          color: var(--text-primary);
          font-family: var(--font-sans);
          display: flex;
          flex-direction: column;
        }

        /* 1. Header */
        .single-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(250, 249, 245, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border-subtle);
          height: 64px;
        }

        .header-container {
          max-width: 820px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .brand-icon-box {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-xs);
          background: var(--text-primary);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-title {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 11.5px;
          font-weight: 500;
        }

        .status-pill.live {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: #166534;
        }

        .status-pill.demo {
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          color: #92400E;
        }

        .pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .pill-dot.live {
          background: #16A34A;
        }

        .pill-dot.demo {
          background: #D97706;
        }

        .settings-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-xs);
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .settings-icon-btn:hover {
          background: var(--bg-muted);
          color: var(--text-primary);
          border-color: #D6D3CB;
        }

        /* 2. Main Content Flow */
        .main-content-flow {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 44px 20px 80px 20px;
        }

        .hero-voice-center {
          width: 100%;
          max-width: 680px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .hero-title {
          font-size: 54px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--text-primary);
          margin-bottom: 12px;
          line-height: 1.08;
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 38px;
          }
        }

        .hero-subtitle {
          font-size: 18px;
          color: var(--text-secondary);
          max-width: 480px;
          margin-bottom: 28px;
          line-height: 1.5;
        }

        /* Mode Switcher Tabs */
        .mode-switcher-container {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-muted);
          padding: 4px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          margin-bottom: 36px;
        }

        .mode-tab-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: var(--radius-xs);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mode-tab-button:hover {
          color: var(--text-primary);
        }

        .mode-tab-button.active {
          background: #FFFFFF;
          color: var(--text-primary);
          font-weight: 600;
          box-shadow: var(--shadow-xs);
        }

        .mode-content-block {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Microphone Area */
        .mic-interactive-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          margin-bottom: 32px;
        }

        .mic-ring-halo {
          position: relative;
          width: 124px;
          height: 124px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .mic-ring-halo.listening::after {
          content: '';
          position: absolute;
          inset: -14px;
          border-radius: 50%;
          border: 2px solid var(--accent-blue);
          animation: mic-pulse 1.8s infinite ease-out;
        }

        .mic-ring-halo.speaking::after {
          content: '';
          position: absolute;
          inset: -14px;
          border-radius: 50%;
          border: 2px solid #16A34A;
          animation: mic-pulse 1.8s infinite ease-out;
        }

        @keyframes mic-pulse {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.35); opacity: 0; }
        }

        .main-mic-button {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--text-primary);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid #FFFFFF;
          box-shadow: 0 12px 32px -4px rgba(18, 19, 22, 0.22);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .main-mic-button:hover {
          transform: scale(1.04);
          background: #27272A;
        }

        .main-mic-button.in-action {
          background: #DC2626;
          box-shadow: 0 12px 32px -4px rgba(220, 38, 38, 0.35);
        }

        .voice-state-label {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .live-interim-bubble {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #EFF6FF;
          border: 1px solid var(--accent-blue-border);
          color: var(--accent-blue);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .live-bubble-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-blue);
          animation: blink-dot 1s infinite;
        }

        @keyframes blink-dot {
          50% { opacity: 0.3; }
        }

        .audio-meter-strip {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 28px;
          width: 210px;
          background: #FFFFFF;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid var(--border-subtle);
          margin-bottom: 24px;
        }

        .audio-bar {
          flex: 1;
          background: #D1D5DB;
          border-radius: 2px;
          transition: height 0.15s ease;
        }

        .audio-bar.active {
          background: var(--accent-blue);
        }

        /* Try Saying */
        .try-saying-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 22px;
          width: 100%;
        }

        .try-saying-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .try-saying-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .saying-chip {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .saying-chip:hover {
          border-color: var(--accent-blue);
          color: var(--accent-blue);
          background: var(--accent-blue-light);
        }

        /* Command Input Bar */
        .command-input-container {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 5px;
          box-shadow: var(--shadow-xs);
        }

        .command-input-box {
          flex: 1;
          border: none;
          padding: 8px 12px;
          font-size: 13.5px;
          color: var(--text-primary);
          outline: none;
          background: transparent;
        }

        .command-execute-btn {
          background: var(--text-primary);
          color: #FFFFFF;
          border: none;
          border-radius: var(--radius-xs);
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .command-execute-btn:hover {
          background: #27272A;
        }

        .command-execute-btn:disabled {
          background: #E5E7EB;
          cursor: not-allowed;
        }

        /* Real-Time Transcript Card */
        .transcript-card {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 20px 24px;
          margin-bottom: 36px;
          box-shadow: var(--shadow-xs);
          display: flex;
          flex-direction: column;
          gap: 14px;
          text-align: left;
        }

        .transcript-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .speaker-tag {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .speaker-tag.you {
          color: var(--text-secondary);
        }

        .speaker-tag.voxely {
          color: var(--accent-blue);
        }

        .speaker-text {
          font-size: 15px;
          color: var(--text-primary);
          line-height: 1.5;
        }

        .voxely-text {
          color: #1E3A8A;
          font-weight: 500;
        }

        .transcript-divider {
          height: 1px;
          background: var(--border-subtle);
        }

        /* Safety Confirmation Banner */
        .confirmation-modal-banner {
          width: 100%;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: var(--radius-md);
          padding: 16px 20px;
          margin-bottom: 32px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          text-align: left;
        }

        .confirm-text-area strong {
          display: block;
          font-size: 14px;
          color: #92400E;
          margin-bottom: 4px;
        }

        .confirm-text-area p {
          font-size: 13.5px;
          color: #78350F;
          margin-bottom: 12px;
        }

        .confirm-action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-confirm-yes {
          background: var(--accent-blue);
          color: #FFFFFF;
          border: none;
          padding: 6px 14px;
          border-radius: var(--radius-xs);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-confirm-cancel {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          padding: 6px 14px;
          border-radius: var(--radius-xs);
          font-size: 13px;
          cursor: pointer;
        }

        /* Compact Activity Section */
        .activity-section {
          width: 100%;
          text-align: left;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 14px;
        }

        .activity-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .activity-subtitle {
          font-size: 12px;
          color: var(--text-muted);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .activity-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          font-size: 13.5px;
        }

        .activity-status-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #F0FDF4;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .check-svg {
          color: #16A34A;
        }

        .activity-info {
          flex: 1;
          display: flex;
          align-items: baseline;
          gap: 12px;
        }

        .activity-action-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .activity-time-stamp {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }

        .activity-right-col {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .activity-status-badge {
          font-family: var(--font-mono);
          font-size: 10.5px;
          color: #166534;
          background: #DCFCE7;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .activity-link-icon {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          padding: 2px;
        }

        .activity-link-icon:hover {
          color: var(--accent-blue);
        }

        /* ============================================================ */
        /* SPEECH-TO-TEXT MODE STYLING                                  */
        /* ============================================================ */
        .stt-mode-wrapper {
          width: 100%;
        }

        .stt-section-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .stt-main-heading {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .stt-sub-heading {
          font-size: 15px;
          color: var(--text-secondary);
        }

        .stt-demo-notice {
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          color: #92400E;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-size: 12.5px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          margin-bottom: 20px;
        }

        .btn-stt-key-config {
          background: #92400E;
          color: #FFFFFF;
          border: none;
          padding: 3px 8px;
          border-radius: var(--radius-xs);
          font-size: 11.5px;
          cursor: pointer;
        }

        .stt-recording-status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 10px 16px;
          margin-bottom: 24px;
        }

        .recording-live-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 13px;
          color: #DC2626;
        }

        .recording-red-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #DC2626;
          animation: blink-dot 1s infinite;
        }

        .recording-paused-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 13px;
          color: #D97706;
        }

        .paused-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #D97706;
        }

        .stt-timer-display {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .timer-label {
          color: var(--text-muted);
        }

        .timer-digits {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 15px;
          color: var(--text-primary);
        }

        .stt-mic-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
        }

        .stt-mic-caption {
          font-size: 14.5px;
          font-weight: 600;
          color: var(--text-primary);
          margin-top: -6px;
        }

        /* STT Toolbar */
        .stt-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 24px;
          width: 100%;
        }

        .btn-toolbar {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-toolbar:hover:not(:disabled) {
          background: var(--bg-muted);
          border-color: #D6D3CB;
        }

        .btn-toolbar:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-toolbar.primary {
          background: var(--text-primary);
          color: #FFFFFF;
          border-color: var(--text-primary);
        }

        .btn-toolbar.primary:hover:not(:disabled) {
          background: #27272A;
        }

        .btn-toolbar.accent {
          background: var(--accent-blue);
          color: #FFFFFF;
          border-color: var(--accent-blue);
        }

        .btn-toolbar.accent:hover:not(:disabled) {
          background: var(--accent-blue-hover);
        }

        /* STT Professional Editor Card */
        .stt-editor-card {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .editor-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: #FAF9F6;
          border-bottom: 1px solid var(--border-subtle);
        }

        .editor-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .editor-title {
          font-family: var(--font-mono);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-primary);
        }

        .editor-meta {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .editor-text-area {
          padding: 24px;
          min-height: 220px;
          max-height: 400px;
          overflow-y: auto;
          font-size: 16px;
          line-height: 1.7;
          color: var(--text-primary);
          background: #FFFFFF;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .final-transcript-text {
          color: var(--text-primary);
        }

        .interim-text-stream {
          color: #3B82F6;
          text-decoration: underline dotted #93C5FD;
        }

        .editor-placeholder {
          color: var(--text-muted);
          font-style: italic;
        }

        .editor-footer-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 18px;
          background: #FAF9F6;
          border-top: 1px solid var(--border-subtle);
          font-size: 12px;
        }

        .footer-status-text {
          font-family: var(--font-mono);
          color: var(--text-muted);
        }

        .editor-footer-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .footer-action-btn:hover {
          color: var(--accent-blue);
        }

        /* 3. Settings Slide-over Drawer */
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18, 19, 22, 0.45);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }

        .drawer-panel {
          width: 100%;
          max-width: 400px;
          height: 100%;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 24px rgba(0, 0, 0, 0.08);
          animation: slide-in 0.2s ease-out;
        }

        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid var(--border-subtle);
          background: #FAF9F6;
        }

        .drawer-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .drawer-title-wrap h3 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .drawer-close-btn {
          color: var(--text-muted);
          cursor: pointer;
          border: none;
          background: none;
        }

        .drawer-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex: 1;
          overflow-y: auto;
        }

        .drawer-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .drawer-label {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .drawer-hint {
          font-size: 11.5px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .drawer-select {
          width: 100%;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          padding: 8px 10px;
          font-size: 13px;
          background: #FFFFFF;
        }

        .drawer-toggle-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .drawer-status-box {
          background: #FAF9F6;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-row code {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent-blue);
        }

        .drawer-footer {
          padding: 16px 20px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          justify-content: flex-end;
          background: #FAF9F6;
        }

        .btn-drawer-done {
          background: var(--text-primary);
          color: #FFFFFF;
          border: none;
          padding: 8px 20px;
          border-radius: var(--radius-xs);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .text-green { color: #16A34A; }
        .text-amber { color: #D97706; }
        .mt-1 { margin-top: 4px; }
        .mt-2 { margin-top: 8px; }
        .mb-0 { margin-bottom: 0; }
      `}</style>
    </div>
  );
}
