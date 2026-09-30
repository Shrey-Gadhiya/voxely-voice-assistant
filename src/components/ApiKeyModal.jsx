import React, { useState } from 'react';
import { X, Key, ShieldCheck, Terminal, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, serverStatus, onRefreshStatus }) {
  const [testKey, setTestKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Key size={18} className="text-blue" />
            <div>
              <h3 className="modal-title">AssemblyAI API Configuration</h3>
              <p className="modal-subtitle">Manage connection credentials & environment variables</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close Modal">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Active Status Banner */}
          <div className={`status-callout ${serverStatus?.configured ? 'success' : 'warning'}`}>
            <div className="callout-icon">
              {serverStatus?.configured ? (
                <ShieldCheck size={20} className="text-green" />
              ) : (
                <AlertTriangle size={20} className="text-amber" />
              )}
            </div>
            <div className="callout-text">
              <strong>{serverStatus?.configured ? 'AssemblyAI Live Engine Connected' : 'Running in Local Demo Mode'}</strong>
              <p>
                {serverStatus?.configured 
                  ? 'Your backend loaded ASSEMBLYAI_API_KEY successfully. Real-time audio is proxied directly to AssemblyAI Universal-3 Pro.'
                  : 'No ASSEMBLYAI_API_KEY detected in your local .env file. The playground is operating in high-fidelity Demo Mode with Web Speech & local JSON tools.'
                }
              </p>
            </div>
          </div>

          <div className="env-instructions">
            <h4>How to configure your live credentials:</h4>
            <ol className="step-list">
              <li>
                Open the <code>.env</code> file in your workspace root:
                <pre className="env-code-box">ASSEMBLYAI_API_KEY=your_actual_api_key_here</pre>
              </li>
              <li>
                Save the file and restart the server, or hit <strong>Refresh Status</strong> below.
              </li>
              <li>
                Never commit your secret API key to public GitHub repositories.
              </li>
            </ol>
          </div>

          <div className="engine-specs-card">
            <div className="spec-item">
              <span className="spec-lbl">Speech Recognition Model:</span>
              <span className="spec-val">Universal-3 Pro Streaming (u3-rt-pro)</span>
            </div>
            <div className="spec-item">
              <span className="spec-lbl">Sampling Frequency:</span>
              <span className="spec-val">16,000 Hz PCM (Linear S16LE)</span>
            </div>
            <div className="spec-item">
              <span className="spec-lbl">Voice Activity Detection:</span>
              <span className="spec-val">Acoustic Energy & Silence Detection</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            onClick={onRefreshStatus} 
            className="btn-secondary refresh-btn"
          >
            <RefreshCw size={13} />
            <span>Refresh Server Status</span>
          </button>

          <button onClick={onClose} className="btn-primary">
            Done
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
          max-width: 600px;
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
        }

        .modal-close-btn:hover {
          background: var(--bg-muted);
          color: var(--text-primary);
        }

        .modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .status-callout {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-radius: var(--radius-sm);
        }

        .status-callout.success {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: #166534;
        }

        .status-callout.warning {
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          color: #92400E;
        }

        .callout-text strong {
          display: block;
          font-size: 13.5px;
          margin-bottom: 4px;
        }

        .callout-text p {
          font-size: 12.5px;
          color: inherit;
          line-height: 1.45;
          margin: 0;
        }

        .env-instructions h4 {
          font-size: 13.5px;
          font-weight: 600;
          margin-bottom: 10px;
          color: var(--text-primary);
        }

        .step-list {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .step-list code {
          font-family: var(--font-mono);
          background: #F4F3ED;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 12px;
        }

        .env-code-box {
          margin-top: 6px;
          background: #141518;
          color: #34D399;
          font-family: var(--font-mono);
          padding: 8px 12px;
          border-radius: var(--radius-xs);
          font-size: 12px;
        }

        .engine-specs-card {
          background: #FAF9F6;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .spec-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .spec-lbl {
          color: var(--text-muted);
        }

        .spec-val {
          font-family: var(--font-mono);
          color: var(--text-primary);
          font-weight: 500;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          background: #FAF9F6;
          border-top: 1px solid var(--border-subtle);
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
        }

        .text-green { color: #16A34A; }
        .text-amber { color: #D97706; }
      `}</style>
    </div>
  );
}
