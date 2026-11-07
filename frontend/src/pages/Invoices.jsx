
import {
  IndianRupee,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Download,
  Search,
  ArrowUpRight,
  Wallet,
  CreditCard,
} from "lucide-react";

const invoices = [
  {
    id: "INV-2026-001",
    client: "Aarav Technologies",
    project: "Website Development",
    date: "02 Nov 2026",
    amount: "₹45,000",
    status: "Paid",
  },
  {
    id: "INV-2026-002",
    client: "Pixel Studio",
    project: "UI/UX Design",
    date: "03 Nov 2026",
    amount: "₹28,000",
    status: "Pending",
  },
  {
    id: "INV-2026-003",
    client: "Nexa Solutions",
    project: "Mobile App Design",
    date: "04 Nov 2026",
    amount: "₹36,500",
    status: "Overdue",
  },
  {
    id: "INV-2026-004",
    client: "Bright Media",
    project: "Brand Identity",
    date: "05 Nov 2026",
    amount: "₹18,000",
    status: "Paid",
  },
];

export default function Invoices() {
  return (
    <div className="invoices-page">

      <div className="invoices-heading">
        <div>
          <p className="eyebrow">WORKSPACE / INVOICES & PAYMENTS</p>
          <h1>Invoices & Payments</h1>
          <p>Manage client invoices and track incoming payments.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => alert("Invoice creation will be enabled in a later step.")}
        >
          <Plus size={17} /> Create Invoice
        </button>
      </div>

      <div className="payment-info-banner">
        <div className="payment-info-icon">
          <CreditCard size={23} />
        </div>
        <div>
          <strong>Receive payments through PayPal</strong>
          <p>Create invoices for your clients and let them pay you securely through PayPal.</p>
        </div>
        <span className="paypal-label">PayPal</span>
      </div>

      <section className="invoice-stats">

        <div className="invoice-stat-card">
          <div className="invoice-stat-top">
            <span>Total Invoiced</span>
            <FileText size={19} />
          </div>
          <strong>₹1,27,500</strong>
          <small>Across 4 invoices</small>
        </div>

        <div className="invoice-stat-card">
          <div className="invoice-stat-top">
            <span>Amount Received</span>
            <CheckCircle2 size={19} />
          </div>
          <strong>₹63,000</strong>
          <small>2 successful payments</small>
        </div>

        <div className="invoice-stat-card">
          <div className="invoice-stat-top">
            <span>Pending Payments</span>
            <Clock size={19} />
          </div>
          <strong>₹28,000</strong>
          <small>1 awaiting payment</small>
        </div>

        <div className="invoice-stat-card">
          <div className="invoice-stat-top">
            <span>Overdue Amount</span>
            <IndianRupee size={19} />
          </div>
          <strong>₹36,500</strong>
          <small>1 overdue invoice</small>
        </div>

      </section>

      <section className="invoice-table-panel">

        <div className="invoice-table-heading">
          <div>
            <h2>Recent Invoices</h2>
            <p>Track and manage your client invoices.</p>
          </div>

          <button
            className="invoice-filter-button"
            onClick={() => alert("Invoice search will be enabled in a later step.")}
          >
            <Search size={16} /> Search
          </button>
        </div>

        <div className="invoice-table-scroll">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Client / Project</th>
                <th>Issue Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="invoice-id">{invoice.id}</td>

                  <td>
                    <strong>{invoice.client}</strong>
                    <small>{invoice.project}</small>
                  </td>

                  <td>{invoice.date}</td>

                  <td className="invoice-amount">{invoice.amount}</td>

                  <td>
                    <span className={`invoice-status ${invoice.status.toLowerCase()}`}>
                      {invoice.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="invoice-action"
                      title="Download invoice"
                      onClick={() => alert("Invoice download will be added later.")}
                    >
                      <Download size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>

      <section className="paypal-payment-panel">
        <div className="paypal-payment-icon">
          <Wallet size={23} />
        </div>

        <div className="paypal-payment-content">
          <h3>PayPal Payment Tracking</h3>
          <p>
            Monitor payments received from clients. PayPal transaction
            references and verified payment status will appear here
            once the payment service is connected.
          </p>
        </div>

        <span className="connection-status">
          <span></span> Demo Mode
        </span>
      </section>

      <p className="invoice-demo-note">
        All invoice records and amounts shown here are fictional demonstration data.
        No actual invoices or payments have been created.
      </p>

    </div>
  );
}
