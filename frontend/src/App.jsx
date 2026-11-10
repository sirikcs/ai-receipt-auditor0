
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  Wallet,
  MessageSquareWarning,
  Settings,
  Bell,
  Search,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  CircleAlert,
  TrendingUp,
  Plus,
  Menu,
  X,
  BrainCircuit,
  ChevronRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import NewAudit from "./pages/NewAudit";
import AuditResults from "./pages/AuditResults";
import Invoices from "./pages/Invoices";
import Disputes from "./pages/Disputes";
import "./App.css";

const API_URL = "http://127.0.0.1:5000";

// Format dashboard amounts in US Dollars.
const formatUSD = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "New AI Audit", icon: FilePlus2 },
  { name: "Audit Reports", icon: FileText },
  { name: "Invoices & Payments", icon: Wallet },
  { name: "Disputes", icon: MessageSquareWarning },
];

function getInvoiceStatus(invoice) {
  const invoiceStatus = String(
    invoice.invoice_status || ""
  ).toUpperCase();

  const paymentStatus = String(
    invoice.payment_status || ""
  ).toUpperCase();

  if (paymentStatus === "REFUNDED" || invoiceStatus === "REFUNDED") {
    return "Refunded";
  }

  if (paymentStatus === "PAID" || invoiceStatus === "PAID") {
    return "Paid";
  }

  if (invoiceStatus === "CANCELLED") {
    return "Cancelled";
  }

  if (invoiceStatus === "OVERDUE") {
    return "Overdue";
  }

  if (invoiceStatus === "SENT") {
    return "Sent";
  }

  if (invoiceStatus === "DRAFT") {
    return "Draft";
  }

  return invoiceStatus || paymentStatus || "Unknown";
}

function Dashboard({
  onCreateAudit,
  onViewInvoices,
  onViewAudits,
  auditCount,
}) {
  const [dashboardInvoices, setDashboardInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [invoiceLoadError, setInvoiceLoadError] = useState("");
  const [chartPeriod, setChartPeriod] = useState("6");

  // Load actual invoices from the backend.
  useEffect(() => {
    const loadDashboardInvoices = async () => {
      try {
        setLoadingInvoices(true);
        setInvoiceLoadError("");

        const res = await fetch(`${API_URL}/api/paypal/invoices`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to load invoices"
          );
        }

        setDashboardInvoices(
          Array.isArray(data.invoices) ? data.invoices : []
        );
      } catch (error) {
        console.error("Dashboard invoice loading error:", error);
        setInvoiceLoadError(error.message);
      } finally {
        setLoadingInvoices(false);
      }
    };

    loadDashboardInvoices();
  }, []);

  // Calculate total earnings from paid invoices.
  const totalEarnings = dashboardInvoices
    .filter((invoice) => {
      const invoiceStatus = String(
        invoice.invoice_status || ""
      ).toUpperCase();

      const paymentStatus = String(
        invoice.payment_status || ""
      ).toUpperCase();

      return (
        invoiceStatus === "PAID" ||
        paymentStatus === "PAID"
      );
    })
    .reduce(
      (sum, invoice) => sum + Number(invoice.amount || 0),
      0
    );

  // Find unpaid draft and sent invoices.
  const pendingInvoices = dashboardInvoices.filter((invoice) => {
    const invoiceStatus = String(
      invoice.invoice_status || ""
    ).toUpperCase();

    const paymentStatus = String(
      invoice.payment_status || ""
    ).toUpperCase();

    return (
      paymentStatus !== "PAID" &&
      ["DRAFT", "SENT"].includes(invoiceStatus)
    );
  });

  const pendingPayments = pendingInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount || 0),
    0
  );

  const totalInvoiceCount = dashboardInvoices.length;

  // Show the latest three actual invoices.
  const recentInvoices = [...dashboardInvoices]
    .sort((a, b) => {
      const dateA = new Date(
        a.created_at || a.issue_date || a.date || 0
      ).getTime();

      const dateB = new Date(
        b.created_at || b.issue_date || b.date || 0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 3);

  // Build the earnings chart from actual paid invoices.
  const earningsData = (() => {
    const monthsToShow = Number(chartPeriod);
    const now = new Date();
    const months = [];
    const monthMap = new Map();

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const entry = {
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        earnings: 0,
      };

      months.push(entry);
      monthMap.set(key, entry);
    }

    dashboardInvoices.forEach((invoice) => {
      const paid =
        String(invoice.payment_status || "").toUpperCase() === "PAID" ||
        String(invoice.invoice_status || "").toUpperCase() === "PAID";

      if (!paid) return;

      const date = new Date(
        invoice.created_at ||
        invoice.issue_date ||
        invoice.date
      );

      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const month = monthMap.get(key);

      if (month) {
        month.earnings += Number(invoice.amount || 0);
      }
    });

    return months;
  })();

  const chartEarningsTotal = earningsData.reduce(
    (sum, month) => sum + month.earnings,
    0
  );

  return (
    <>
      <div className="welcome-section">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Good morning, Alex! 👋</h1>
          <p className="welcome-text">
            Here's what's happening with your freelance business.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={onCreateAudit}
        >
          <Plus size={18} />
          Create New Audit
        </button>
      </div>

      {/* Dashboard Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span>Total Earnings</span>
            <span className="stat-icon blue">
              <TrendingUp />
            </span>
          </div>

          <h2>
            {loadingInvoices
              ? "Loading..."
              : formatUSD(totalEarnings)}
          </h2>

          <p className="neutral">From paid invoices</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Pending Payments</span>
            <span className="stat-icon orange">
              <Clock />
            </span>
          </div>

          <h2>
            {loadingInvoices
              ? "Loading..."
              : formatUSD(pendingPayments)}
          </h2>

          <p className="neutral">
            Across {loadingInvoices ? "..." : pendingInvoices.length} invoices
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Total Invoices</span>
            <span className="stat-icon purple">
              <FileText />
            </span>
          </div>

          <h2>
            {loadingInvoices ? "..." : totalInvoiceCount}
          </h2>

          <p className="neutral">Loaded from backend</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>AI Audits Completed</span>
            <span className="stat-icon green">
              <BrainCircuit />
            </span>
          </div>

          <h2>{auditCount}</h2>

          <p className="neutral">Completed this session</p>
        </div>
      </div>

      {invoiceLoadError && (
        <p className="demo-note">
          <CircleAlert size={14} />
          Could not load dashboard invoices: {invoiceLoadError}
        </p>
      )}

      {/* Dashboard Charts and Activity */}
      <div className="dashboard-grid">

        {/* Actual Earnings Chart */}
        <section className="panel earnings-panel">
          <div className="panel-heading">
            <div>
              <h3>Earnings Overview</h3>
              <p>Based on actual paid invoices</p>
            </div>

            <select
              className="period-select"
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value)}
            >
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
            </select>
          </div>

          <div className="chart-summary">
            <h2>
              {loadingInvoices
                ? "Loading..."
                : formatUSD(chartEarningsTotal)}
            </h2>

            <span className="neutral">
              Paid earnings in selected period
            </span>
          </div>

          <div className="chart-container">
            {loadingInvoices ? (
              <p className="neutral">
                Loading earnings data...
              </p>
            ) : invoiceLoadError ? (
              <p className="neutral">
                Earnings data could not be loaded.
              </p>
            ) : chartEarningsTotal === 0 ? (
              <p className="neutral">
                No paid invoice earnings recorded in this period yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient
                      id="earningsFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#2673e8"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="100%"
                        stopColor="#2673e8"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#edf0f5"
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                    width={55}
                  />

                  <Tooltip
                    formatter={(value) => formatUSD(Number(value))}
                  />

                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#2673e8"
                    strokeWidth={3}
                    fill="url(#earningsFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Actual Audit Activity - No Fake Records */}
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>AI Audit Activity</h3>
              <p>Recent audit history</p>
            </div>

            <button
              className="text-button"
              onClick={onViewAudits}
            >
              View all <ChevronRight size={15} />
            </button>
          </div>

          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <BrainCircuit size={19} />
              </div>

              <div className="activity-info">
                <strong>No saved audit history yet</strong>

                <span>
                  Completed audits are counted during the current session.
                </span>

                <small>
                  Permanent audit history is not connected yet.
                </small>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Recent Real Invoices */}
      <section className="panel invoices-panel">
        <div className="panel-heading">
          <div>
            <h3>Recent Invoices</h3>
            <p>Latest invoices loaded from your backend</p>
          </div>

          <button
            className="text-button"
            onClick={onViewInvoices}
          >
            View all <ChevronRight size={15} />
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Client</th>
                <th>Issue Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loadingInvoices ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "24px" }}
                  >
                    Loading invoices...
                  </td>
                </tr>
              ) : invoiceLoadError ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "24px" }}
                  >
                    Unable to load invoices.
                  </td>
                </tr>
              ) : recentInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "24px" }}
                  >
                    No invoices available.
                  </td>
                </tr>
              ) : (
                recentInvoices.map((invoice, index) => {
                  const status = getInvoiceStatus(invoice);

                  const invoiceId =
                    invoice.invoice_id || invoice.id || "—";

                  const client =
                    invoice.client_email ||
                    invoice.client_name ||
                    invoice.client ||
                    "—";

                  const issueDate =
                    invoice.issue_date ||
                    invoice.created_at ||
                    invoice.date ||
                    "—";

                  return (
                    <tr key={invoiceId || index}>
                      <td className="invoice-id">{invoiceId}</td>

                      <td>{client}</td>

                      <td>{issueDate}</td>

                      <td className="amount">
                        {formatUSD(Number(invoice.amount || 0))}
                      </td>

                      <td>
                        <span
                          className={`invoice-status ${status.toLowerCase()}`}
                        >
                          {status === "Paid" && (
                            <CheckCircle2 size={14} />
                          )}

                          {status === "Sent" && (
                            <ArrowUpRight size={14} />
                          )}

                          {status === "Draft" && (
                            <Clock size={14} />
                          )}

                          {status === "Overdue" && (
                            <CircleAlert size={14} />
                          )}

                          {status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="view-button"
                          onClick={onViewInvoices}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="demo-note">
        <CircleAlert size={14} />
        Dashboard statistics and earnings chart use actual backend
        invoice data. The AI audit count tracks successful audits
        during the current session. Permanent audit history is
        not connected yet.
      </p>
    </>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">
        <BrainCircuit size={32} />
      </div>

      <h2>{title}</h2>

      <p>
        This page is part of the AI Receipt Auditor application.
      </p>

      <span>We're building this screen next.</span>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // Tracks successful audits completed during this app session.
  const [auditCount, setAuditCount] = useState(0);

  return (
    <div className="app-layout">
      <aside
        className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}
      >
        <div className="brand">
          <div className="brand-logo">
            <BrainCircuit size={24} />
          </div>

          <div>
            <strong>Receipt Auditor</strong>
            <span>FREELANCER SUITE</span>
          </div>

          <button
            className="close-menu"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => {
                  setActivePage(item.name);
                  setMobileMenu(false);
                }}
              >
                <Icon size={19} />

                <span>{item.name}</span>

                {activePage === item.name && (
                  <span className="active-dot" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="profile">
            <div className="avatar">A</div>

            <div className="profile-info">
              <strong>Alex Morgan</strong>
              <span>Freelancer</span>
            </div>

            <ChevronRight size={17} />
          </div>
        </div>
      </aside>

      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={22} />
          </button>

          <div className="search-box">
            <Search size={18} />

            <input placeholder="Search anything..." />

            <kbd>⌘ K</kbd>
          </div>

          <div className="topbar-right">
            <button className="notification-button">
              <Bell size={20} />
              <span />
            </button>

            <div className="top-avatar">A</div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "Dashboard" ? (
            <Dashboard
              onCreateAudit={() => setActivePage("New AI Audit")}
              onViewInvoices={() => setActivePage("Invoices & Payments")}
              onViewAudits={() => setActivePage("Audit Reports")}
              auditCount={auditCount}
            />
          ) : activePage === "New AI Audit" ? (
            <NewAudit
              onComplete={(data) => {
                setAuditResult(data);
                setAuditCount((previousCount) => previousCount + 1);
                setActivePage("Audit Reports");
              }}
            />
          ) : activePage === "Audit Reports" ? (
            <AuditResults
              result={auditResult}
              onContinue={() => setActivePage("Invoices & Payments")}
            />
          ) : activePage === "Invoices & Payments" ? (
            <Invoices />
          ) : activePage === "Disputes" ? (
            <Disputes />
          ) : (
            <PlaceholderPage title={activePage} />
          )}
        </div>
      </main>
    </div>
  );
}
