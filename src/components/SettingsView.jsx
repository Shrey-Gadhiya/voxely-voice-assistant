import React, { useState } from 'react';
import { 
  Settings, Key, ShieldCheck, Volume2, Mic, Check, 
  Terminal, ShieldAlert, Cpu, RefreshCw 
} from 'lucide-react';

export default function SettingsView({ serverStatus, onRefreshStatus, onOpenKeyConfig }) {
  const [selectedVoice, setSelectedVoice] = useState('Nova');
  const [speechRate, setSpeechRate] = useState(1.05);
  const [safetyGateEnabled, setSafetyGateEnabled] = useState(true);
  const [allowAppLaunch, setAllowAppLaunch] = useState(true);
  const [vadThreshold, setVadThreshold] = useState(0.5);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="settings-page-wrapper section-padding">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-label">Preferences & Engine</span>
          <h2 className="section-title">Assistant Settings</h2>
          <p className="section-description">
            Customize voice parameters, safety confirmation gates, application permissions, and AssemblyAI connection credentials.
          </p>
        </div>

        <div className="settings-panels-grid">
          {/* Panel 1: Voice & Speech Persona */}
          <div className="settings-card card-clean">
            <div className="card-header-row">
              <div className="card-title-group">
                <Volume2 size={18} className="text-blue" />
                <h3 className="card-title">Voice & Speech Persona</h3>
              </div>
              <span className="card-badge">Web Speech / TTS</span>
            </div>

            <div className="settings-form-body">
              <div className="setting-item">
                <label className="setting-label">Voice Profile</label>
                <select 
                  value={selectedVoice} 
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="form-select"
                >
                  <option value="Nova">Nova (Natural Female - Recommended)</option>
                  <option value="Echo">Echo (Warm Executive Male)</option>
                  <option value="Alloy">Alloy (Neutral Studio Balanced)</option>
                  <option value="Shimmer">Shimmer (Expressive & Clear)</option>
                </select>
                <span className="setting-hint">Speech synthesis adapts pitch and cadence automatically.</span>
              </div>

              <div className="setting-item">
                <div className="slider-label-row">
                  <label className="setting-label">Speech Rate ({speechRate}x)</label>
                </div>
                <input 
                  type="range" 
                  min="0.8" 
                  max="1.4" 
                  step="0.05"
                  value={speechRate} 
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="form-range"
                />
              </div>

              <div className="setting-item">
                <div className="slider-label-row">
                  <label className="setting-label">VAD Silence Duration Threshold ({vadThreshold}s)</label>
                </div>
                <input 
                  type="range" 
                  min="0.3" 
                  max="1.0" 
                  step="0.05"
                  value={vadThreshold} 
                  onChange={(e) => setVadThreshold(parseFloat(e.target.value))}
                  className="form-range"
                />
                <span className="setting-hint">Determines pause length before turn detection triggers LLM reasoning.</span>
              </div>
            </div>
          </div>

          {/* Panel 2: Safety & Confirmation Architecture */}
          <div className="settings-card card-clean">
            <div className="card-header-row">
              <div className="card-title-group">
                <ShieldCheck size={18} className="text-green" />
                <h3 className="card-title">Safety & Permission Architecture</h3>
              </div>
              <span className="card-badge green">Zero Arbitrary Shell Execution</span>
            </div>

            <div className="settings-form-body">
              <div className="toggle-setting-row">
                <div className="toggle-info">
                  <span className="toggle-title">Enforce Explicit Confirmation Gates</span>
                  <span className="toggle-desc">
                    Prompts "Do you want me to continue?" before high-risk actions (sending emails, purchases, modifying records).
                  </span>
                </div>
                <label className="switch-control">
                  <input 
                    type="checkbox" 
                    checked={safetyGateEnabled} 
                    onChange={(e) => setSafetyGateEnabled(e.target.checked)} 
                  />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="toggle-setting-row">
                <div className="toggle-info">
                  <span className="toggle-title">Allow Desktop Application Launching</span>
                  <span className="toggle-desc">
                    Permits launching strictly whitelisted Windows desktop tools (Calculator, Notepad, VS Code).
                  </span>
                </div>
                <label className="switch-control">
                  <input 
                    type="checkbox" 
                    checked={allowAppLaunch} 
                    onChange={(e) => setAllowAppLaunch(e.target.checked)} 
                  />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="safety-policy-note">
                <ShieldAlert size={16} className="text-amber" />
                <span>
                  Voxely enforces strict boundaries. Arbitrary terminal execution or destructive file mutations from voice input are blocked.
                </span>
              </div>
            </div>
          </div>

          {/* Panel 3: AssemblyAI Voice Agent Engine Config */}
          <div className="settings-card card-clean">
            <div className="card-header-row">
              <div className="card-title-group">
                <Key size={18} className="text-blue" />
                <h3 className="card-title">AssemblyAI Voice Agent Engine</h3>
              </div>
              <span className={`engine-badge ${serverStatus?.configured ? 'live' : 'demo'}`}>
                {serverStatus?.configured ? 'Live Key Active' : 'Local Demo Mode'}
              </span>
            </div>

            <div className="settings-form-body">
              <div className="setting-item">
                <label className="setting-label">WebSocket Connection Endpoint</label>
                <div className="code-read-box">
                  <code>wss://agents.assemblyai.com/v1/ws</code>
                </div>
                <span className="setting-hint">Client authenticates via server-generated ephemeral token from <code>GET /api/voice-token</code>.</span>
              </div>

              <div className="setting-item">
                <label className="setting-label">Speech-to-Text Model</label>
                <div className="code-read-box">
                  <code>Universal-3 Pro Realtime (u3-rt-pro)</code>
                </div>
              </div>

              <div className="setting-item">
                <label className="setting-label">Server Security Status</label>
                <p className="security-status-text">
                  {serverStatus?.configured 
                    ? 'ASSEMBLYAI_API_KEY is safely stored on the server in .env and proxied securely. No keys exposed to client bundles.'
                    : 'Running in Local Demo Mode. Add ASSEMBLYAI_API_KEY in .env to connect to AssemblyAI cloud websockets.'
                  }
                </p>
              </div>

              <div className="settings-action-row">
                <button onClick={onOpenKeyConfig} className="btn-secondary">
                  <Key size={14} />
                  <span>Configure API Key</span>
                </button>
                <button onClick={onRefreshStatus} className="btn-secondary">
                  <RefreshCw size={14} />
                  <span>Refresh Server Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-footer-actions">
          <button onClick={handleSave} className="btn-primary btn-save-settings">
            {savedNotice ? <Check size={15} /> : null}
            <span>{savedNotice ? 'Preferences Saved' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>

      <style>{`
        .settings-page-wrapper {
          background: #FAF9F5;
          min-height: calc(100vh - var(--nav-height));
        }

        .settings-panels-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        @media (max-width: 1024px) {
          .settings-panels-grid {
            grid-template-columns: 1fr;
          }
        }

        .settings-card {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .card-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 20px;
        }

        .card-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .card-badge {
          font-family: var(--font-mono);
          font-size: 10.5px;
          color: var(--text-muted);
          background: var(--bg-muted);
          padding: 3px 8px;
          border-radius: var(--radius-xs);
        }

        .card-badge.green {
          color: #166534;
          background: #DCFCE7;
        }

        .engine-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 999px;
        }

        .engine-badge.live {
          background: #DCFCE7;
          color: #166534;
        }

        .engine-badge.demo {
          background: #FEF3C7;
          color: #92400E;
        }

        .settings-form-body {
          display: flex;
          flex-direction: column;
          gap: 18px;
          flex: 1;
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .setting-label {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .setting-hint {
          font-size: 11.5px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .form-select {
          width: 100%;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          padding: 8px 10px;
          font-size: 13px;
          background: #FFFFFF;
        }

        .form-range {
          width: 100%;
          accent-color: var(--accent-blue);
        }

        .code-read-box {
          background: #FAF9F6;
          border: 1px solid var(--border-subtle);
          padding: 8px 12px;
          border-radius: var(--radius-xs);
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--accent-blue);
        }

        .security-status-text {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .settings-action-row {
          display: flex;
          gap: 10px;
          margin-top: auto;
          padding-top: 12px;
        }

        .toggle-setting-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .toggle-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .toggle-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .toggle-desc {
          font-size: 11.5px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        /* Switch toggle */
        .switch-control {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
          flex-shrink: 0;
        }

        .switch-control input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider-round {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: #D1D5DB;
          transition: 0.2s;
          border-radius: 22px;
        }

        .slider-round:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.2s;
          border-radius: 50%;
        }

        input:checked + .slider-round {
          background-color: var(--accent-blue);
        }

        input:checked + .slider-round:before {
          transform: translateX(18px);
        }

        .safety-policy-note {
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          border-radius: var(--radius-xs);
          padding: 10px 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12px;
          color: #92400E;
          line-height: 1.45;
        }

        .settings-footer-actions {
          display: flex;
          justify-content: flex-end;
        }

        .btn-save-settings {
          padding: 10px 24px;
          font-size: 14px;
        }

        .text-green { color: #16A34A; }
      `}</style>
    </div>
  );
}
