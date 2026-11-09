import { useState, useEffect } from "react";

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
    const API_URL = "http://127.0.0.1:5000";
  const [realInvoices, setRealInvoices] = useState([]);
    const total = realInvoices.reduce((s, r) => s + Number(r.amount || 0), 0);
  const paid = realInvoices
    .filter((r) => r.payment_status === "PAID")
    .reduce((s, r) => s + Number(r.amount || 0), 0);
  const paidCount = realInvoices.filter((r) => r.payment_status === "PAID").length;
  const pending = total - paid;
  const pendingCount = realInvoices.length - paidCount;
  const money = (n) => `USD ${n.toFixed(2)}`;

  useEffect(() => {
    fetch(`${API_URL}/api/paypal/invoices`)
      .then((res) => res.json())
      .then((data) => {
        console.log("INVOICES:", data);
        setRealInvoices(data.invoices || []);
      })
      .catch((err) => console.log("Invoice load error:", err));
  }, []);
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
          onClick={async () => {
            const client_email = prompt("Client email:");
            const freelancer_name = prompt("Your full name (first and last):");
            const amount = prompt("Amount in USD:");
            const description = prompt("Invoice description:");
            if (!client_email || !freelancer_name || !amount || !description) return;
            try {
              const res = await fetch(`${API_URL}/api/paypal/create-invoice`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  approved: true,
                  client_email,
                  freelancer_name,
                  amount,
                  description,
                  currency: "USD",
                }),
              });
              const data = await res.json();
              alert(res.ok ? "Draft invoice created: " + data.invoice_id : "Error: " + JSON.stringify(data));
            } catch (e) {
              alert("Error: " + e.message);
            }
          }}
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
          <strong>{money(total)}</strong>
          <small>Across {realInvoices.length} invoices</small>
        </div>

        <div className="invoice-stat-card">
          <div className="invoice-stat-top">
            <span>Amount Received</span>
            <CheckCircle2 size={19} />
          </div>
          <strong>{money(paid)}</strong>
          <small>{paidCount} successful payments</small>
        </div>

        <div className="invoice-stat-card">
          <div className="invoice-stat-top">
            <span>Pending Payments</span>
            <Clock size={19} />
          </div>
          <strong>{money(pending)}</strong>
          <small>{pendingCount} awaiting payment</small>
        </div>

        <div className="invoice-stat-card">
          <div className="invoice-stat-top">
            <span>Overdue Amount</span>
            <IndianRupee size={19} />
          </div>
          <strong>{money(0)}</strong>
          <small>No overdue tracking yet</small>
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
              {(realInvoices.length > 0
  ? realInvoices.map((r) => ({
      id: r.invoice_id,
      client: r.client_email,
      project: r.freelancer_name,
      date: r.created_at,
      amount: `${r.currency} ${r.amount}`,
      status: r.payment_status === "PAID" ? "Paid" : r.invoice_status === "DRAFT" ? "Pending" : r.invoice_status === "SENT" ? "Pending" : "Pending",
    }))
  : invoices
).map((invoice, i) => (
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
                      onClick={async () => {
  if (!String(invoice.id).startsWith("INV2-")) {
    alert("This is a demo invoice.");
    return;
  }
  if (!window.confirm("Send this invoice to the client through PayPal?")) return;
  try {
    const res = await fetch(`${API_URL}/api/paypal/send-invoice/${invoice.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    const data = await res.json();
    alert(res.ok ? "Invoice sent!" : "Error: " + JSON.stringify(data));
  } catch (e) {
    alert("Error: " + e.message);
  }
}}
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
          <span></span> Sandbox Mode
        </span>
      </section>

            <p className="invoice-demo-note">
        Invoice records and totals come from your backend and the PayPal sandbox.
        No real money is moved in sandbox mode.
      </p>

    </div>
  );
}
