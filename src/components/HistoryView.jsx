import React from 'react';
import { History, Play, CheckCircle2, RotateCcw, Trash2, ArrowUpRight, Search, Video, Globe, Cloud, Clock } from 'lucide-react';

export default function HistoryView({ historyList = [], onReplayCommand, onClearHistory }) {
  const getToolIcon = (tool) => {
    switch (tool) {
      case 'youtube_search': return <Video size={15} className="text-red-600" />;
      case 'web_search': return <Search size={15} className="text-blue" />;
      case 'open_website': return <Globe size={15} className="text-blue" />;
      case 'get_weather': return <Cloud size={15} className="text-blue" />;
      case 'get_current_time': return <Clock size={15} className="text-blue" />;
      default: return <CheckCircle2 size={15} className="text-green" />;
    }
  };

  return (
    <div className="history-page-wrapper section-padding">
      <div className="container">
        {/* Header */}
        <div className="history-header-row">
          <div>
            <span className="section-label">Audit & Logs</span>
            <h2 className="section-title">Command History</h2>
            <p className="section-description">
              Timeline of executed voice commands and actions. Replay any command with a single click.
            </p>
          </div>

          {historyList.length > 0 && (
            <button 
              onClick={onClearHistory} 
              className="btn-secondary btn-clear-history"
              title="Clear all command logs"
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* History Timeline */}
        <div className="history-timeline-box card-clean">
          {historyList.length === 0 ? (
            <div className="empty-history-state">
              <History size={36} className="empty-icon text-muted" />
              <p>No commands recorded in this session yet.</p>
              <span className="empty-sub">Speak or type a command in the Assistant view to see it logged here.</span>
            </div>
          ) : (
            <div className="timeline-items-list">
              {historyList.map((item, index) => (
                <div key={item.id || index} className="timeline-entry-row">
                  <div className="timeline-time-col">
                    <span className="timestamp-badge">{item.timestamp}</span>
                  </div>

                  <div className="timeline-indicator-node">
                    <span className="node-dot"></span>
                    {index < historyList.length - 1 && <span className="node-line"></span>}
                  </div>

                  <div className="timeline-content-card">
                    <div className="entry-main-info">
                      <div className="entry-tool-header">
                        <span className="tool-icon-wrap">{getToolIcon(item.tool)}</span>
                        <code className="entry-tool-fn">{item.tool}()</code>
                        <span className="entry-status-badge">
                          <CheckCircle2 size={12} />
                          <span>{item.status || 'Completed'}</span>
                        </span>
                      </div>

                      <div className="entry-command-text">
                        "{item.text}"
                      </div>

                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer" className="entry-url-link">
                          <span>{item.url}</span>
                          <ArrowUpRight size={11} />
                        </a>
                      )}
                    </div>

                    <div className="entry-actions-col">
                      <button 
                        onClick={() => onReplayCommand(item.text)} 
                        className="btn-secondary btn-replay"
                        title="Replay this voice command"
                      >
                        <RotateCcw size={12} />
                        <span>Replay Command</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .history-page-wrapper {
          background: #FAF9F5;
          min-height: calc(100vh - var(--nav-height));
        }

        .history-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }

        .btn-clear-history {
          padding: 8px 14px;
          font-size: 13px;
        }

        .history-timeline-box {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 32px;
        }

        .empty-history-state {
          padding: 48px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-icon {
          margin-bottom: 14px;
        }

        .empty-history-state p {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .empty-sub {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .timeline-items-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .timeline-entry-row {
          display: grid;
          grid-template-columns: 80px 24px 1fr;
          gap: 16px;
          align-items: flex-start;
        }

        @media (max-width: 640px) {
          .timeline-entry-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .timeline-indicator-node {
            display: none;
          }
        }

        .timestamp-badge {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-muted);
          padding: 4px 8px;
          border-radius: var(--radius-xs);
          display: inline-block;
          white-space: nowrap;
        }

        .timeline-indicator-node {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          padding-top: 6px;
        }

        .node-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent-blue);
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 0 2px var(--accent-blue-border);
          z-index: 2;
        }

        .node-line {
          position: absolute;
          top: 16px;
          bottom: -24px;
          width: 2px;
          background: var(--border-subtle);
          z-index: 1;
        }

        .timeline-content-card {
          background: #FAF9F6;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .timeline-content-card {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .entry-main-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .entry-tool-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tool-icon-wrap {
          display: flex;
          align-items: center;
        }

        .entry-tool-fn {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--accent-blue);
          font-weight: 600;
        }

        .entry-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: #166534;
          background: #DCFCE7;
          padding: 2px 7px;
          border-radius: 3px;
        }

        .entry-command-text {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .entry-url-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: var(--text-muted);
          text-decoration: underline;
        }

        .entry-actions-col {
          display: flex;
          align-items: center;
        }

        .btn-replay {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          padding: 6px 12px;
          white-space: nowrap;
        }

        .text-green { color: #16A34A; }
        .text-blue { color: var(--accent-blue); }
        .text-red-600 { color: #DC2626; }
      `}</style>
    </div>
  );
}
