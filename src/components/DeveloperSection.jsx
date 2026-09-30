import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink, Code2, BookOpen } from 'lucide-react';

export default function DeveloperSection({ onOpenDocs }) {
  const [activeLang, setActiveLang] = useState('typescript');
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    typescript: `import { AssemblyAI } from 'assemblyai';
import WebSocket from 'ws';

// 1. Initialize client with environment API key
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY
});

// 2. Open full-duplex realtime voice agent session
const agentWs = new WebSocket('wss://api.assemblyai.com/v2/realtime/ws', {
  headers: {
    Authorization: process.env.ASSEMBLYAI_API_KEY
  }
});

// 3. Define agent configuration & JSON-schema tools
const agentConfig = {
  model: 'u3-rt-pro', // Universal-3 Pro Realtime
  sample_rate: 16000,
  turn_detection: {
    type: 'server_vad',
    threshold: 0.5,
    silence_duration_ms: 500
  },
  system_prompt: 'You are Voxely, an executive scheduling assistant.',
  tools: [
    {
      name: 'calendar_create_event',
      description: 'Creates a calendar event with time and attendees',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          start_time: { type: 'string' },
          duration_minutes: { type: 'number' }
        },
        required: ['title', 'start_time']
      }
    }
  ]
};

// 4. Handle real-time conversational streaming events
agentWs.on('open', () => {
  console.log('[Voxely] Connected to AssemblyAI Voice Agent Engine');
  agentWs.send(JSON.stringify({ type: 'configure', config: agentConfig }));
});

agentWs.on('message', async (data) => {
  const event = JSON.parse(data.toString());

  switch (event.type) {
    case 'transcript':
      console.log(\`[\${event.role}] \${event.text}\`);
      break;

    case 'tool_call':
      // Execute local/remote action deterministically
      const result = await executeCalendarTool(event.parameters);
      agentWs.send(JSON.stringify({
        type: 'tool_response',
        call_id: event.call_id,
        output: result
      }));
      break;

    case 'audio':
      // Direct raw PCM/Opus buffer to speaker stream
      playAudioChunk(event.audio_buffer);
      break;

    case 'barge_in':
      // Caller interrupted: stop ongoing audio playback instantly
      stopAudioPlayback();
      break;
  }
});`,

    python: `import os
import json
import asyncio
import websockets
from assemblyai import RealtimeTranscriber

# 1. Establish asynchronous Voice Agent WebSocket connection
async def run_voice_agent():
    api_key = os.environ.get("ASSEMBLYAI_API_KEY")
    url = "wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000"

    headers = {"Authorization": api_key}

    async with websockets.connect(url, extra_headers=headers) as ws:
        # 2. Register agent configuration and JSON Schema tools
        init_payload = {
            "type": "session_init",
            "model": "u3-rt-pro",
            "voice": "nova",
            "tools": [
                {
                    "name": "lookup_customer",
                    "description": "Fetches CRM account details by phone number",
                    "parameters": {
                        "type": "object",
                        "properties": {"phone": {"type": "string"}},
                        "required": ["phone"]
                    }
                }
            ]
        }
        await ws.send(json.dumps(init_payload))

        # 3. Stream microphone chunks & handle downstream events
        async for message in ws:
            event = json.loads(message)
            if event["type"] == "tool_call":
                result = await handle_tool_call(event["name"], event["args"])
                await ws.send(json.dumps({
                    "type": "tool_result",
                    "call_id": event["call_id"],
                    "data": result
                }))`,

    curl: `# 1. Generate an ephemeral token for client-side WebSockets
curl -X POST https://api.assemblyai.com/v2/realtime/token \\
  -H "Authorization: $ASSEMBLYAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"expires_in": 3600}'

# 2. Connect with token via WebSocket:
# wss://api.assemblyai.com/v2/realtime/ws?token=<TEMPORARY_TOKEN>`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="section-padding developer-section">
      <div className="container">
        <div className="developer-layout">
          {/* Header Info */}
          <div className="dev-header-col">
            <span className="section-label">Developer First</span>
            <h2 className="section-title">One connection. Your entire voice stack.</h2>
            <p className="section-description">
              Stop stitching together third-party STT websockets, LLM completions, and speech synthesis latency buffers. Voxely leverages the AssemblyAI Voice Agent API into a clean, event-driven interface.
            </p>

            <div className="dev-bullets">
              <div className="dev-bullet-item">
                <span className="bullet-point"></span>
                <div>
                  <strong>Single WebSocket endpoint</strong>
                  <p>Send 16kHz audio upstream; receive transcripts, tool calls, and streaming audio downstream.</p>
                </div>
              </div>

              <div className="dev-bullet-item">
                <span className="bullet-point"></span>
                <div>
                  <strong>Deterministic JSON schemas</strong>
                  <p>Define functions using standard JSON Schema. Guaranteed argument typing.</p>
                </div>
              </div>

              <div className="dev-bullet-item">
                <span className="bullet-point"></span>
                <div>
                  <strong>Zero-configuration barge-in</strong>
                  <p>Server-side acoustic VAD automatically halts TTS playback when the caller starts talking.</p>
                </div>
              </div>
            </div>

            <div className="dev-action-row">
              <button onClick={onOpenDocs} className="btn-primary">
                <BookOpen size={15} />
                <span>View API Docs</span>
              </button>
              <a 
                href="https://www.assemblyai.com/docs" 
                target="_blank" 
                rel="noreferrer" 
                className="btn-secondary"
              >
                <span>AssemblyAI Docs</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Code Panel */}
          <div className="dev-code-col">
            <div className="dark-panel code-editor-card">
              <div className="dark-panel-header">
                <div className="code-lang-tabs">
                  <button 
                    onClick={() => setActiveLang('typescript')} 
                    className={`lang-tab ${activeLang === 'typescript' ? 'active' : ''}`}
                  >
                    TypeScript / Node.js
                  </button>
                  <button 
                    onClick={() => setActiveLang('python')} 
                    className={`lang-tab ${activeLang === 'python' ? 'active' : ''}`}
                  >
                    Python
                  </button>
                  <button 
                    onClick={() => setActiveLang('curl')} 
                    className={`lang-tab ${activeLang === 'curl' ? 'active' : ''}`}
                  >
                    cURL & Token
                  </button>
                </div>

                <button 
                  onClick={handleCopy} 
                  className="btn-copy-code"
                  title="Copy code snippet"
                >
                  {copied ? <Check size={13} className="text-green" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="code-content-block">
                <pre className="code-body">
                  <code>{codeSnippets[activeLang]}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .developer-section {
          background: #FAF9F5;
          border-bottom: 1px solid var(--border-subtle);
        }

        .developer-layout {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 52px;
          align-items: center;
        }

        @media (max-width: 1024px) {
          .developer-layout {
            grid-template-columns: 1fr;
          }
        }

        .dev-header-col {
          display: flex;
          flex-direction: column;
        }

        .dev-bullets {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin: 28px 0;
        }

        .dev-bullet-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .bullet-point {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-blue);
          margin-top: 6px;
          flex-shrink: 0;
        }

        .dev-bullet-item strong {
          display: block;
          font-size: 14.5px;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .dev-bullet-item p {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .dev-action-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .code-editor-card {
          box-shadow: 0 16px 36px -8px rgba(18, 19, 22, 0.14);
        }

        .code-lang-tabs {
          display: flex;
          gap: 6px;
        }

        .lang-tab {
          font-family: var(--font-mono);
          font-size: 12px;
          padding: 4px 10px;
          border-radius: var(--radius-xs);
          color: #8C91A0;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .lang-tab:hover {
          color: #E2E4E9;
        }

        .lang-tab.active {
          color: #FFFFFF;
          background: #252830;
          font-weight: 500;
        }

        .btn-copy-code {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #8C91A0;
          font-size: 11.5px;
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .btn-copy-code:hover {
          color: #E2E4E9;
        }

        .code-content-block {
          padding: 20px;
          background: #121316;
          max-height: 520px;
          overflow: auto;
        }

        .code-body {
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 1.6;
          color: #D1D5DB;
        }

        .text-green {
          color: #34D399;
        }
      `}</style>
    </section>
  );
}
