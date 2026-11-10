
import { useState, useEffect } from "react";
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

const API_URL = "http://127.0.0.1:5000";

function formatAmount(amount) {
  if (!amount) return "—";

  const value = Number(amount.value);

  if (!Number.isFinite(value)) return "—";

  const currency = amount.currency_code || "USD";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status) {
  if (!status) return "Unknown";

  return String(status)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClass(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "RESOLVED") return "resolved";
  if (normalized === "OPEN") return "open";

  return "review";
}

function getDisputeDetails(dispute) {
  const transaction = dispute.disputed_transactions?.[0] || {};
  const buyer = transaction.buyer || {};

  return {
    id: dispute.dispute_id || "—",
    client:
      buyer.name ||
      buyer.email ||
      "Client details unavailable",
    invoice:
      transaction.invoice_number ||
      transaction.seller_transaction_id ||
      "—",
    amount: formatAmount(dispute.dispute_amount),
    issue: formatStatus(dispute.reason),
    date: formatDate(dispute.create_time),
    status: dispute.status || "UNKNOWN",
  };
}

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDisputes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/paypal/disputes`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load PayPal disputes."
          );
        }

        const items = Array.isArray(data.disputes?.items)
          ? data.disputes.items
          : Array.isArray(data.disputes)
          ? data.disputes
          : [];

        setDisputes(items);
      } catch (err) {
        console.error("Dispute loading error:", err);
        setError(err.message || "Unable to load disputes.");
      } finally {
        setLoading(false);
      }
    };

    loadDisputes();
  }, []);

  const list = disputes.map(getDisputeDetails);

  const openCount = disputes.filter(
    (d) => String(d.status).toUpperCase() === "OPEN"
  ).length;

  const reviewCount = disputes.filter((d) =>
    [
      "UNDER_REVIEW",
      "WAITING_FOR_SELLER_RESPONSE",
      "WAITING_FOR_BUYER_RESPONSE",
    ].includes(String(d.status).toUpperCase())
  ).length;

  const resolvedCount = disputes.filter(
    (d) => String(d.status).toUpperCase() === "RESOLVED"
  ).length;

  const responseDraft =
    "Hello, Thank you for raising your concern. We understand the importance of clarifying the invoice amount. We would be happy to review the agreed project scope, recorded work hours and invoice details together. Please let us know which specific item requires clarification so we can resolve this professionally. Thank you.";

  return (
    <div className="disputes-page">

      <div className="disputes-heading">
        <div>
          <p className="eyebrow">WORKSPACE / DISPUTES</p>
          <h1>Dispute Management</h1>
          <p>
            Resolve client disagreements with AI-powered assistance.
          </p>
        </div>

        <span className="dispute-protection">
          <ShieldCheck size={16} />
          Freelancer Protection
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
          <strong>{loading ? "..." : list.length}</strong>
          <small>PayPal recorded cases</small>
        </div>

        <div className="dispute-stat-card">
          <div className="dispute-stat-icon orange">
            <Clock size={20} />
          </div>
          <span>Open Disputes</span>
          <strong>{loading ? "..." : openCount}</strong>
          <small>Open cases</small>
        </div>

        <div className="dispute-stat-card">
          <div className="dispute-stat-icon purple">
            <BrainCircuit size={20} />
          </div>
          <span>Under Review</span>
          <strong>{loading ? "..." : reviewCount}</strong>
          <small>Awaiting review or response</small>
        </div>

        <div className="dispute-stat-card">
          <div className="dispute-stat-icon green">
            <CheckCircle2 size={20} />
          </div>
          <span>Resolved</span>
          <strong>{loading ? "..." : resolvedCount}</strong>
          <small>Closed cases</small>
        </div>

      </section>

      <section className="dispute-list-panel">

        <div className="dispute-section-heading">
          <div>
            <h2>Recent Disputes</h2>
            <p>
              Review and manage your PayPal dispute records.
            </p>
          </div>

          <span className="dispute-count">
            {loading ? "Loading..." : `${list.length} Cases`}
          </span>
        </div>

        {loading && (
          <p style={{ padding: "16px", color: "#6b7280" }}>
            Loading disputes from PayPal...
          </p>
        )}

        {!loading && error && (
          <p style={{ padding: "16px", color: "#dc2626" }}>
            Could not load disputes: {error}
          </p>
        )}

        {!loading && !error && list.length === 0 && (
          <p style={{ padding: "16px", color: "#6b7280" }}>
            No disputes found in your PayPal Sandbox account.
          </p>
        )}

        {!loading && !error && list.length > 0 && (
          <div className="dispute-table-scroll">
            <table className="dispute-table">
              <thead>
                <tr>
                  <th>Dispute ID</th>
                  <th>Client / Issue</th>
                  <th>Invoice / Transaction</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="dispute-id">
                      {item.id}
                    </td>

                    <td>
                      <strong>{item.client}</strong>
                      <small>{item.issue}</small>
                    </td>

                    <td>{item.invoice}</td>

                    <td className="dispute-amount">
                      {item.amount}
                    </td>

                    <td>{item.date}</td>

                    <td>
                      <span
                        className={`dispute-status ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </section>

      <section className="ai-dispute-panel">

        <div className="ai-dispute-header">
          <div className="ai-dispute-icon">
            <Sparkles size={21} />
          </div>

          <div>
            <h2>AI Dispute Assistant</h2>
            <p>
              Sample AI-generated analysis and response draft.
            </p>
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
            <FileText size={17} />
            Available Evidence
          </h3>

          <div className="evidence-items">
            <span>
              <CheckCircle2 size={15} /> Client Agreement
            </span>
            <span>
              <CheckCircle2 size={15} /> Work Log
            </span>
            <span>
              <CheckCircle2 size={15} /> Invoice Record
            </span>
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
            onClick={() =>
              navigator.clipboard.writeText(responseDraft)
            }
          >
            Copy Response <ArrowRight size={15} />
          </button>
        </div>

      </section>

      <p className="dispute-demo-note">
        Dispute records are retrieved from the PayPal Sandbox API.
        The AI analysis and suggested response are demonstration
        content and are not generated from an individual dispute.
      </p>

    </div>
  );
}
