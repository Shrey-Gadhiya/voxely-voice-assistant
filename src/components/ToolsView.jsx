import React, { useState } from 'react';
import { 
  Search, Video, Globe, Cloud, Clock, Bell, 
  Terminal, ArrowLeft, ArrowRight, RotateCw, Play, CheckCircle2, ShieldCheck, ShieldAlert 
} from 'lucide-react';

export default function ToolsView({ onExecuteTestTool }) {
  const [testResult, setTestResult] = useState(null);
  const [testingTool, setTestingTool] = useState(null);

  const toolsList = [
    {
      id: 'open_website',
      name: 'Open Website',
      fn: 'open_website(url)',
      description: 'Resolves website destinations (YouTube, GitHub, Gmail, Instagram, etc.) and opens the destination URL securely in the browser.',
      status: 'Active & Verified',
      permission: 'SAFE ACTION',
      isSafe: true,
      parameters: { url: 'string (e.g. "https://github.com")' },
      icon: Globe,
      sampleTest: { url: 'github' }
    },
    {
      id: 'web_search',
      name: 'Web Search',
      fn: 'web_search(query, engine)',
      description: 'Performs web search across Google, properly URI-encoding queries to extract relevant documentation and updates.',
      status: 'Active & Verified',
      permission: 'SAFE ACTION',
      isSafe: true,
      parameters: { query: 'string', engine: 'string (default: google)' },
      icon: Search,
      sampleTest: { query: 'AssemblyAI Voice Agent API' }
    },
    {
      id: 'youtube_search',
      name: 'YouTube Search',
      fn: 'youtube_search(query)',
      description: 'Searches YouTube directly for video tutorials, lectures, reviews, and musical performances.',
      status: 'Active & Verified',
      permission: 'SAFE ACTION',
      isSafe: true,
      parameters: { query: 'string' },
      icon: Video,
      sampleTest: { query: 'Python automation tutorials' }
    },
    {
      id: 'open_search_result',
      name: 'Open Search Result',
      fn: 'open_search_result(result_id)',
      description: 'Preserves conversational search context and opens a numbered result from the preceding web search.',
      status: 'Active & Verified',
      permission: 'SAFE ACTION',
      isSafe: true,
      parameters: { result_id: 'number (1-indexed)' },
      icon: Search,
      sampleTest: { result_id: 1 }
    },
    {
      id: 'get_weather',
      name: 'Weather Forecast',
      fn: 'get_weather(location)',
      description: 'Fetches real-time temperature, meteorological condition, humidity, and wind vector for any city worldwide.',
      status: 'Active & Verified',
      permission: 'SAFE ACTION',
      isSafe: true,
      parameters: { location: 'string (e.g. "Surat", "San Francisco")' },
      icon: Cloud,
      sampleTest: { location: 'Surat' }
    },
    {
      id: 'get_current_time',
      name: 'Current Time & Date',
      fn: 'get_current_time(timezone)',
      description: 'Returns the exact localized time, date, day of the week, and timezone representation.',
      status: 'Active & Verified',
      permission: 'SAFE ACTION',
      isSafe: true,
      parameters: { timezone: 'string (e.g. "Asia/Kolkata")' },
      icon: Clock,
      sampleTest: { timezone: 'Asia/Kolkata' }
    },
    {
      id: 'create_reminder',
      name: 'Create Reminder',
      fn: 'create_reminder(title, datetime)',
      description: 'Schedules a persistent reminder notification with title and target time slot.',
      status: 'Active & Verified',
      permission: 'SAFE ACTION',
      isSafe: true,
      parameters: { title: 'string', datetime: 'string' },
      icon: Bell,
      sampleTest: { title: 'Submit Voice Agent Hackathon', datetime: 'Today at 8:00 PM' }
    },
    {
      id: 'open_application',
      name: 'Application Launcher',
      fn: 'open_application(application)',
      description: 'Launches approved system desktop applications (Calculator, Notepad, VS Code) in a secure, sandboxed manner.',
      status: 'Active & Verified',
      permission: 'SAFE ACTION (Whitelisted)',
      isSafe: true,
      parameters: { application: 'string ("Calculator", "Notepad", "VS Code")' },
      icon: Terminal,
      sampleTest: { application: 'Calculator' }
    },
    {
      id: 'navigate_browser',
      name: 'Navigate Browser',
      fn: 'navigate_browser(url)',
      description: 'Directs the active browser window or tab to navigate directly to an address.',
      status: 'Active & Verified',
      permission: 'SAFE ACTION',
      isSafe: true,
      parameters: { url: 'string' },
      icon: Globe,
      sampleTest: { url: 'https://www.assemblyai.com' }
    },
    {
      id: 'browser_back',
      name: 'Browser Back',
      fn: 'browser_back()',
      description: 'Navigates back to the previous web page in the session history.',
      status: 'Active & Verified',
      permission: 'SAFE ACTION',
      isSafe: true,
      parameters: {},
      icon: ArrowLeft,
      sampleTest: {}
    },
    {
      id: 'browser_forward',
      name: 'Browser Forward',
      fn: 'browser_forward()',
      description: 'Navigates forward in the session page history.',
      status: 'Active & Verified',
      permission: 'SAFE ACTION',
      isSafe: true,
      parameters: {},
      icon: ArrowRight,
      sampleTest: {}
    },
    {
      id: 'browser_refresh',
      name: 'Browser Refresh',
      fn: 'browser_refresh()',
      description: 'Reloads the current web page.',
      status: 'Active & Verified',
      permission: 'SAFE ACTION',
      isSafe: true,
      parameters: {},
      icon: RotateCw,
      sampleTest: {}
    }
  ];

  const handleTest = async (tool) => {
    setTestingTool(tool.id);
    try {
      const res = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: tool.id,
          parameters: tool.sampleTest
        })
      });
      const data = await res.json();
      setTestResult({ toolId: tool.id, data });
      if (data.actionType === 'browser_open' && data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      setTestResult({ toolId: tool.id, data: { status: 'error', message: err.message } });
    } finally {
      setTestingTool(null);
    }
  };

  return (
    <div className="tools-page-wrapper section-padding">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-label">Modular Architecture</span>
          <h2 className="section-title">Registered Voice Tools</h2>
          <p className="section-description">
            Voxely uses JSON-Schema tool calling via the AssemblyAI Voice Agent API. The model identifies user intent and triggers deterministic actions without rigid pattern matching.
          </p>
        </div>

        {/* Tools Catalog Grid */}
        <div className="tools-cards-grid">
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            return (
              <div key={tool.id} className="tool-directory-card card-clean">
                <div className="tool-card-top">
                  <div className="tool-icon-frame">
                    <Icon size={18} />
                  </div>
                  <div className="tool-permission-tag safe">
                    <ShieldCheck size={12} />
                    <span>{tool.permission}</span>
                  </div>
                </div>

                <h3 className="tool-heading">{tool.name}</h3>
                <code className="tool-code-signature">{tool.fn}</code>
                <p className="tool-description-text">{tool.description}</p>

                <div className="tool-schema-block">
                  <span className="schema-label">Parameters (OpenAPI 3.1):</span>
                  <pre className="schema-json">
                    {JSON.stringify(tool.parameters, null, 2)}
                  </pre>
                </div>

                <div className="tool-card-footer">
                  <div className="tool-status-ind">
                    <span className="status-live-dot"></span>
                    <span>{tool.status}</span>
                  </div>

                  <button 
                    onClick={() => handleTest(tool)} 
                    className="btn-secondary btn-test-tool"
                    disabled={testingTool === tool.id}
                  >
                    <Play size={12} />
                    <span>{testingTool === tool.id ? 'Running...' : 'Test Tool'}</span>
                  </button>
                </div>

                {/* Test Output preview if active */}
                {testResult?.toolId === tool.id && (
                  <div className="test-result-box">
                    <span className="test-result-title">Execution Output:</span>
                    <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .tools-page-wrapper {
          background: #FAF9F5;
          min-height: calc(100vh - var(--nav-height));
        }

        .tools-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .tools-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .tools-cards-grid {
            grid-template-columns: 1fr;
          }
        }

        .tool-directory-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .tool-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .tool-icon-frame {
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

        .tool-permission-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-mono);
          font-size: 10.5px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 999px;
        }

        .tool-permission-tag.safe {
          background: #F0FDF4;
          color: #166534;
          border: 1px solid #BBF7D0;
        }

        .tool-heading {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .tool-code-signature {
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: var(--accent-blue);
          margin-bottom: 12px;
          display: block;
        }

        .tool-description-text {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 16px;
          flex: 1;
        }

        .tool-schema-block {
          background: #FAF9F6;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          padding: 10px;
          margin-bottom: 18px;
        }

        .schema-label {
          font-family: var(--font-mono);
          font-size: 10.5px;
          color: var(--text-muted);
          display: block;
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .schema-json {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-primary);
          overflow-x: auto;
          line-height: 1.4;
        }

        .tool-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);
        }

        .tool-status-ind {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-secondary);
        }

        .status-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16A34A;
        }

        .btn-test-tool {
          padding: 6px 12px;
          font-size: 12px;
        }

        .test-result-box {
          margin-top: 12px;
          padding: 10px;
          background: #121316;
          border-radius: var(--radius-xs);
          color: #34D399;
          font-family: var(--font-mono);
          font-size: 10.5px;
          overflow-x: auto;
        }

        .test-result-title {
          color: #9CA3AF;
          display: block;
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}
