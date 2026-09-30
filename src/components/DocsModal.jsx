import React, { useState } from 'react';
import { X, BookOpen, Terminal, Code2, Copy, Check, ArrowRight, ExternalLink } from 'lucide-react';

export default function DocsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('quickstart');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyText = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <BookOpen size={18} className="text-blue" />
            <div>
              <h3 className="modal-title">Voxely Documentation</h3>
              <p className="modal-subtitle">AssemblyAI Voice Agent API Integration Reference</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close Modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs">
          <button 
            onClick={() => setActiveTab('quickstart')} 
            className={`tab-btn ${activeTab === 'quickstart' ? 'active' : ''}`}
          >
            Quickstart
          </button>
          <button 
            onClick={() => setActiveTab('websocket')} 
            className={`tab-btn ${activeTab === 'websocket' ? 'active' : ''}`}
          >
            WebSocket Protocol
          </button>
          <button 
            onClick={() => setActiveTab('tools')} 
            className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
          >
            Tool Calling Schemas
          </button>
          <button 
            onClick={() => setActiveTab('env')} 
            className={`tab-btn ${activeTab === 'env' ? 'active' : ''}`}
          >
            Environment & Security
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {activeTab === 'quickstart' && (
            <div className="docs-content-section">
              <h4>1. Install the SDK</h4>
              <p>Install the official AssemblyAI client in your Node.js or Python backend:</p>
              <div className="code-snippet-box">
                <code>npm install assemblyai ws dotenv</code>
                <button onClick={() => copyText('npm install assemblyai ws dotenv')} className="btn-copy">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>

              <h4>2. Add your AssemblyAI API Key</h4>
              <p>Create a <code>.env</code> file in your project root with your secret key:</p>
              <div className="code-snippet-box">
                <code>ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here</code>
                <button onClick={() => copyText('ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here')} className="btn-copy">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>

              <h4>3. Connect via Realtime WebSocket</h4>
              <p>Open a WebSocket connection to the streaming endpoint at 16,000 Hz PCM audio:</p>
              <pre className="code-block">
{`const WebSocket = require('ws');
const ws = new WebSocket('wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000', {
  headers: { Authorization: process.env.ASSEMBLYAI_API_KEY }
});

ws.on('open', () => {
  console.log('Voice Agent pipeline active');
});`}
              </pre>
            </div>
          )}

          {activeTab === 'websocket' && (
            <div className="docs-content-section">
              <h4>WebSocket Message Lifecycle</h4>
              <p>The AssemblyAI Voice Agent API operates via bidirectional streaming JSON and PCM audio chunks.</p>

              <div className="protocol-table-wrap">
                <table className="protocol-table">
                  <thead>
                    <tr>
                      <th>Direction</th>
                      <th>Message Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>Client → Server</code></td>
                      <td><code>Binary Buffer</code></td>
                      <td>Raw 16-bit linear PCM audio sampled at 16kHz or 24kHz.</td>
                    </tr>
                    <tr>
                      <td><code>Server → Client</code></td>
                      <td><code>transcript</code></td>
                      <td>Word-level and final utterance transcriptions with confidence.</td>
                    </tr>
                    <tr>
                      <td><code>Server → Client</code></td>
                      <td><code>tool_call</code></td>
                      <td>Deterministic JSON schema tool execution request with arguments.</td>
                    </tr>
                    <tr>
                      <td><code>Client → Server</code></td>
                      <td><code>tool_response</code></td>
                      <td>Structured result returned from your backend execution.</td>
                    </tr>
                    <tr>
                      <td><code>Server → Client</code></td>
                      <td><code>audio</code></td>
                      <td>Synthesized speech audio chunks streamed to the client speaker.</td>
                    </tr>
                    <tr>
                      <td><code>Client → Server</code></td>
                      <td><code>barge_in</code></td>
                      <td>Signal to abort downstream speech synthesis when user talks.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="docs-content-section">
              <h4>Defining JSON-Schema Tools</h4>
              <p>Tools enable the voice agent to query databases, book appointments, or update your CRM during live speech:</p>

              <pre className="code-block">
{`{
  "name": "calendar_create_event",
  "description": "Schedules a calendar invitation with attendees",
  "parameters": {
    "type": "object",
    "properties": {
      "title": { "type": "string", "description": "Title of the meeting" },
      "start_time": { "type": "string", "description": "ISO 8601 or relative date string" },
      "attendees": {
        "type": "array",
        "items": { "type": "string" },
        "description": "List of participant email addresses"
      }
    },
    "required": ["title", "start_time"]
  }
}`}
              </pre>
            </div>
          )}

          {activeTab === 'env' && (
            <div className="docs-content-section">
              <h4>Security & Environment Rules</h4>
              <div className="security-notice">
                <strong>Crucial Rule:</strong> Never expose <code>ASSEMBLYAI_API_KEY</code> directly in frontend JavaScript bundles or public HTML files.
              </div>

              <p>Always route authentication through your backend:</p>
              <ul className="docs-list">
                <li>Keep <code>ASSEMBLYAI_API_KEY</code> securely stored in <code>.env</code> on the Node.js/Python server.</li>
                <li>Generate temporary ephemeral tokens via <code>POST /v2/realtime/token</code> for client-side WebSockets if connecting from the browser.</li>
                <li>Or proxy WebSocket connections through <code>server.js</code> (which Voxely handles automatically out of the box).</li>
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <a 
            href="https://www.assemblyai.com/docs" 
            target="_blank" 
            rel="noreferrer" 
            className="btn-secondary"
          >
            <span>Official AssemblyAI Docs</span>
            <ExternalLink size={13} />
          </a>
          <button onClick={onClose} className="btn-primary">
            Close Reference
          </button>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18, 19, 22, 0.65);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-container {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 740px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-panel);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-subtle);
          background: #FAF9F6;
        }

        .modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .modal-subtitle {
          font-size: 12px;
          color: var(--text-muted);
        }

        .modal-close-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-xs);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .modal-close-btn:hover {
          background: var(--bg-muted);
          color: var(--text-primary);
        }

        .modal-tabs {
          display: flex;
          gap: 8px;
          padding: 10px 24px;
          background: #FFFFFF;
          border-bottom: 1px solid var(--border-subtle);
          overflow-x: auto;
        }

        .tab-btn {
          font-family: var(--font-mono);
          font-size: 12px;
          padding: 6px 12px;
          border-radius: var(--radius-xs);
          color: var(--text-secondary);
          background: var(--bg-muted);
          border: 1px solid var(--border-light);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .tab-btn:hover {
          background: #EAE8E0;
          color: var(--text-primary);
        }

        .tab-btn.active {
          background: var(--text-primary);
          color: #FFFFFF;
          border-color: var(--text-primary);
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .docs-content-section h4 {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 16px 0 6px 0;
        }

        .docs-content-section h4:first-child {
          margin-top: 0;
        }

        .docs-content-section p {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .code-snippet-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #121316;
          color: #E2E4E9;
          padding: 10px 14px;
          border-radius: var(--radius-xs);
          font-family: var(--font-mono);
          font-size: 12.5px;
          margin-bottom: 16px;
        }

        .code-block {
          background: #121316;
          color: #D1D5DB;
          padding: 14px;
          border-radius: var(--radius-xs);
          font-family: var(--font-mono);
          font-size: 12px;
          line-height: 1.5;
          overflow-x: auto;
          margin-bottom: 16px;
        }

        .btn-copy {
          color: #9CA3AF;
          cursor: pointer;
          background: none;
          border: none;
        }

        .btn-copy:hover {
          color: #FFFFFF;
        }

        .protocol-table-wrap {
          overflow-x: auto;
          margin-top: 12px;
        }

        .protocol-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
        }

        .protocol-table th, .protocol-table td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid var(--border-subtle);
        }

        .protocol-table th {
          background: #FAF9F6;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }

        .protocol-table td code {
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: var(--accent-blue);
        }

        .security-notice {
          background: #FEF3C7;
          border-left: 3px solid #D97706;
          padding: 12px 14px;
          border-radius: var(--radius-xs);
          font-size: 13px;
          color: #92400E;
          margin-bottom: 16px;
        }

        .docs-list {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          background: #FAF9F6;
          border-top: 1px solid var(--border-subtle);
        }
      `}</style>
    </div>
  );
}
