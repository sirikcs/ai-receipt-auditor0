
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  BrainCircuit,
  MessageSquareText,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const disputes = [
  {
    id: "DSP-001",
    client: "Pixel Studio",
    invoice: "INV-2026-002",
    amount: "₹28,000",
    issue: "Payment amount disagreement",
    date: "03 Nov 2026",
    status: "Open",
  },
  {
    id: "DSP-002",
    client: "Nexa Solutions",
    invoice: "INV-2026-003",
    amount: "₹12,500",
    issue: "Additional work hours disputed",
    date: "04 Nov 2026",
    status: "Under Review",
  },
  {
    id: "DSP-003",
    client: "Bright Media",
    invoice: "INV-2026-004",
    amount: "₹8,000",
    issue: "Project delivery clarification",
    date: "01 Nov 2026",
    status: "Resolved",
  },
];

export default function Disputes() {
  return (
    <div className="disputes-page">

      <div className="disputes-heading">
        <div>
          <p className="eyebrow">WORKSPACE / DISPUTES</p>
          <h1>Dispute Management</h1>
          <p>Resolve client disagreements with AI-powered assistance.</p>
        </div>
        <span className="dispute-protection">
          <ShieldCheck size={16} /> Freelancer Protection
        </span>
      </div>

      <div className="dispute-banner">
        <div className="dispute-banner-icon">
          <BrainCircuit size={25} />
        </div>
        <div>
          <strong>Let AI help you resolve disputes</strong>
          <p>
            Analyse disagreements, review project evidence and
            generate professional response drafts.
          </p>
        </div>
        <Sparkles size={22} className="dispute-sparkle" />
      </div>

      <section className="dispute-stats">

        <div className="dispute-stat-card">
          <div className="dispute-stat-icon blue">
            <AlertCircle size={20} />
          </div>
          <span>Total Disputes</span>
          <strong>3</strong>
          <small>All recorded cases</small>
        </div>

        <div className="dispute-stat-card">
          <div className="dispute-stat-icon orange">
            <Clock size={20} />
          </div>
          <span>Open Disputes</span>
          <strong>1</strong>
          <small>Awaiting response</small>
        </div>

        <div className="dispute-stat-card">
          <div className="dispute-stat-icon purple">
            <BrainCircuit size={20} />
          </div>
          <span>Under Review</span>
          <strong>1</strong>
          <small>AI analysis in progress</small>
        </div>

        <div className="dispute-stat-card">
          <div className="dispute-stat-icon green">
            <CheckCircle2 size={20} />
          </div>
          <span>Resolved</span>
          <strong>1</strong>
          <small>Successfully closed</small>
        </div>

      </section>

      <section className="dispute-list-panel">

        <div className="dispute-section-heading">
          <div>
            <h2>Recent Disputes</h2>
            <p>Review and manage your client disagreements.</p>
          </div>
          <span className="dispute-count">3 Cases</span>
        </div>

        <div className="dispute-table-scroll">
          <table className="dispute-table">
            <thead>
              <tr>
                <th>Dispute ID</th>
                <th>Client / Issue</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {disputes.map((item) => (
                <tr key={item.id}>
                  <td className="dispute-id">{item.id}</td>
                  <td>
                    <strong>{item.client}</strong>
                    <small>{item.issue}</small>
                  </td>
                  <td>{item.invoice}</td>
                  <td className="dispute-amount">{item.amount}</td>
                  <td>{item.date}</td>
                  <td>
                    <span className={`dispute-status ${
                      item.status === "Open"
                        ? "open"
                        : item.status === "Resolved"
                        ? "resolved"
                        : "review"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>

      <section className="ai-dispute-panel">

        <div className="ai-dispute-header">
          <div className="ai-dispute-icon">
            <Sparkles size={21} />
          </div>
          <div>
            <h2>AI Dispute Assistant</h2>
            <p>Sample AI-generated analysis and response draft.</p>
          </div>
          <span className="ai-demo-label">DEMO</span>
        </div>

        <div className="dispute-analysis">
          <div className="analysis-heading">
            <BrainCircuit size={18} />
            <strong>AI Issue Analysis</strong>
          </div>
          <p>
            The client has questioned the billed project amount.
            The recorded work hours and agreed project amount
            should be compared with the contract before responding.
          </p>
        </div>

        <div className="dispute-evidence">
          <h3>
            <FileText size={17} /> Available Evidence
          </h3>

          <div className="evidence-items">
            <span><CheckCircle2 size={15} /> Client Agreement</span>
            <span><CheckCircle2 size={15} /> Work Log</span>
            <span><CheckCircle2 size={15} /> Invoice Record</span>
          </div>
        </div>

        <div className="response-draft">
          <div className="response-heading">
            <MessageSquareText size={18} />
            <strong>Suggested Response</strong>
          </div>

          <p>
            Hello,
            <br /><br />
            Thank you for raising your concern. We understand
            the importance of clarifying the invoice amount.
            We would be happy to review the agreed project scope,
            recorded work hours and invoice details together.
            <br /><br />
            Please let us know which specific item requires
            clarification so we can resolve this professionally.
            <br /><br />
            Thank you.
          </p>

          <button
            className="dispute-copy-button"
            onClick={() => navigator.clipboard.writeText(
              "Hello, Thank you for raising your concern. We understand the importance of clarifying the invoice amount. We would be happy to review the agreed project scope, recorded work hours and invoice details together. Please let us know which specific item requires clarification so we can resolve this professionally. Thank you."
            )}
          >
            Copy Response <ArrowRight size={15} />
          </button>
        </div>

      </section>

      <p className="dispute-demo-note">
        Demonstration data only. AI analysis and dispute records
        will be connected to the backend in a later integration step.
      </p>

    </div>
  );
}
