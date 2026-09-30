import React, { useState } from 'react';
import { 
  Headset, CalendarCheck, PhoneCall, TrendingUp, 
  Plane, UserCheck, ArrowRight, CheckCircle2 
} from 'lucide-react';

export default function UseCases({ onOpenPlayground }) {
  const [selectedCase, setSelectedCase] = useState(0);

  const useCases = [
    {
      id: 'support',
      title: 'Customer Support',
      icon: Headset,
      badge: 'Support & Telephony',
      description: 'Resolve high-frequency tier-1 inquiries, authenticate accounts, verify shipping tracking numbers, and initiate RMAs in seconds.',
      sampleDialogue: {
        user: "My package was supposed to arrive today but the tracking link says pending.",
        agent: "I can check that for you right away. What's your order or tracking number?",
        tool: "support.lookup_order(order_id='VX-88192')"
      },
      outcomes: ['Zero hold time for repetitive questions', 'Direct CRM and Zendesk ticket synchronization', 'Instant warm transfer to human agents with context']
    },
    {
      id: 'booking',
      title: 'Appointment Booking',
      icon: CalendarCheck,
      badge: 'Healthcare & Services',
      description: 'Handle incoming patient or client calls, check calendar availability across multiple staff, and confirm time slots without double-booking.',
      sampleDialogue: {
        user: "Can I schedule a dental cleaning for next Tuesday morning?",
        agent: "Dr. Evans has an opening next Tuesday at 9:30 AM or 11:15 AM. Which works best?",
        tool: "calendar.get_availability(staff_id='dr_evans', date='2026-10-06')"
      },
      outcomes: ['Automated SMS & calendar confirmations', 'Direct integration with Google Calendar / Outlook', 'Rescheduling and cancellation handling']
    },
    {
      id: 'receptionist',
      title: 'Voice Receptionist',
      icon: PhoneCall,
      badge: 'Front Desk & Offices',
      description: 'Answer inbound business lines 24/7, answer FAQ inquiries about office hours and location, and transfer calls to the appropriate department.',
      sampleDialogue: {
        user: "Hi, I'm trying to reach someone in accounts payable regarding an invoice.",
        agent: "Connecting you with Accounts Payable now. One moment while I transfer you.",
        tool: "telephony.transfer_call(department='accounts_payable')"
      },
      outcomes: ['Never miss an inbound client lead after hours', 'Accurate call routing without clunky touch-tone menus', 'Summarized voicemail sent via email or Slack']
    },
    {
      id: 'sales',
      title: 'Sales Qualification',
      icon: TrendingUp,
      badge: 'B2B & Inbound Leads',
      description: 'Qualify inbound prospects against BANT criteria, collect budget and timeline specifics, and schedule demos directly with account executives.',
      sampleDialogue: {
        user: "We are evaluating voice agents for a team of 40 contact center reps.",
        agent: "That sounds like a great fit. What is your target deployment timeline?",
        tool: "crm.log_qualification(team_size=40, stage='evaluation')"
      },
      outcomes: ['Instant response while inbound prospect interest is high', 'Automatic Salesforce & HubSpot lead enrichment', 'Pre-qualified calendar bookings for sales reps']
    },
    {
      id: 'travel',
      title: 'Travel Assistant',
      icon: Plane,
      badge: 'Hospitality & Airlines',
      description: 'Search available itineraries, handle flight delay re-bookings, and provide gate numbers and hotel reservation updates naturally.',
      sampleDialogue: {
        user: "My flight from SFO was delayed. Are there seats on the next flight to JFK?",
        agent: "Yes, Flight 412 departs in 90 minutes with 4 seats open. Shall I re-book you?",
        tool: "airline.rebook_passenger(flight='UA412', pnr='KJ992')"
      },
      outcomes: ['Conversational rebooking during irregular flight operations', 'Context-aware loyalty program lookups', 'Multilingual support for international passengers']
    },
    {
      id: 'personal',
      title: 'Personal Assistant',
      icon: UserCheck,
      badge: 'Executive & Productivity',
      description: 'Execute personal tasks, query connected databases, summarize unread communications, and automate reminders through voice commands.',
      sampleDialogue: {
        user: "Remind me to send the Q3 board deck at 4 PM and draft an outline.",
        agent: "Reminder set for 4:00 PM. I've also created a preliminary outline in your notes.",
        tool: "reminders.create(time='16:00', title='Send Q3 board deck')"
      },
      outcomes: ['Hands-free workflow while driving or multitasking', 'Bi-directional synchronization with personal productivity stacks', 'Custom skill expansion through webhooks']
    }
  ];

  return (
    <section id="use-cases" className="section-padding use-cases-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Proven Deployments</span>
          <h2 className="section-title">Built for real-world conversations.</h2>
          <p className="section-description">
            Practical voice automation that solves real operational bottlenecks across support, booking, scheduling, and frontline customer communication.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="use-cases-grid">
          {useCases.map((uc, index) => {
            const Icon = uc.icon;
            return (
              <div 
                key={uc.id} 
                className="use-case-card card-clean"
              >
                <div className="uc-top-meta">
                  <div className="uc-icon-wrap">
                    <Icon size={18} />
                  </div>
                  <span className="uc-badge">{uc.badge}</span>
                </div>

                <h3 className="uc-title">{uc.title}</h3>
                <p className="uc-desc">{uc.description}</p>

                {/* Sample Conversational Snippet */}
                <div className="dialogue-mini-box">
                  <div className="dialogue-line user-line">
                    <span className="speaker-label">User:</span> "{uc.sampleDialogue.user}"
                  </div>
                  <div className="dialogue-line agent-line">
                    <span className="speaker-label">Agent:</span> "{uc.sampleDialogue.agent}"
                  </div>
                  <div className="dialogue-tool">
                    <span className="tool-code-tag">Tool:</span> <code>{uc.sampleDialogue.tool}</code>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="uc-outcomes-list">
                  {uc.outcomes.map((out, i) => (
                    <div key={i} className="uc-outcome-item">
                      <CheckCircle2 size={13} className="text-blue" />
                      <span>{out}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .use-cases-section {
          background: #FFFFFF;
          border-bottom: 1px solid var(--border-subtle);
        }

        .use-cases-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .use-cases-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .use-cases-grid {
            grid-template-columns: 1fr;
          }
        }

        .use-case-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          background: #FAF9F5;
          border: 1px solid var(--border-subtle);
        }

        .uc-top-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .uc-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-xs);
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }

        .uc-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          background: #FFFFFF;
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid var(--border-subtle);
        }

        .uc-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .uc-desc {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.55;
          margin-bottom: 16px;
        }

        .dialogue-mini-box {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          padding: 12px;
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .dialogue-line {
          font-size: 12px;
          line-height: 1.45;
        }

        .dialogue-line.user-line {
          color: #374151;
        }

        .dialogue-line.agent-line {
          color: #1E3A8A;
        }

        .speaker-label {
          font-weight: 600;
          font-family: var(--font-mono);
          margin-right: 4px;
        }

        .dialogue-tool {
          margin-top: 4px;
          padding-top: 6px;
          border-top: 1px dashed var(--border-subtle);
          font-size: 11px;
        }

        .tool-code-tag {
          font-family: var(--font-mono);
          font-weight: 600;
          color: #D97706;
          margin-right: 4px;
        }

        .dialogue-tool code {
          font-family: var(--font-mono);
          color: #2563EB;
          font-size: 11px;
        }

        .uc-outcomes-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid var(--border-subtle);
        }

        .uc-outcome-item {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .text-blue {
          color: var(--accent-blue);
          flex-shrink: 0;
          margin-top: 2px;
        }
      `}</style>
    </section>
  );
}
