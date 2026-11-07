
import { useState } from "react";
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
  ArrowDownRight,
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

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const earningsData = [
  { month: "Jun", earnings: 42000 },
  { month: "Jul", earnings: 58000 },
  { month: "Aug", earnings: 51000 },
  { month: "Sep", earnings: 76000 },
  { month: "Oct", earnings: 68000 },
  { month: "Nov", earnings: 92000 },
];

const invoices = [
  {
    id: "INV-2026-024",
    client: "Aarav Technologies",
    date: "04 Nov 2026",
    amount: 45000,
    status: "Paid",
  },
  {
    id: "INV-2026-023",
    client: "Pixel Studio",
    date: "02 Nov 2026",
    amount: 28000,
    status: "Pending",
  },
  {
    id: "INV-2026-022",
    client: "Nexa Solutions",
    date: "29 Oct 2026",
    amount: 36500,
    status: "Overdue",
  },
];

const activities = [
  {
    name: "Website Development",
    client: "Aarav Technologies",
    time: "Today, 10:30 AM",
    status: "Completed",
  },
  {
    name: "UI/UX Design Project",
    client: "Pixel Studio",
    time: "Yesterday, 4:15 PM",
    status: "Review",
  },
  {
    name: "Mobile App Development",
    client: "Nexa Solutions",
    time: "30 Oct 2026",
    status: "Completed",
  },
];

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "New AI Audit", icon: FilePlus2 },
  { name: "Audit Reports", icon: FileText },
  { name: "Invoices & Payments", icon: Wallet },
  { name: "Disputes", icon: MessageSquareWarning },
];

function Dashboard() {
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

        <button className="primary-button">
          <Plus size={18} />
          Create New Audit
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span>Total Earnings</span>
            <span className="stat-icon blue"><TrendingUp /></span>
          </div>
          <h2>₹8,45,000</h2>
          <p className="positive"><ArrowUpRight size={15} /> 12.8% this month</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Pending Payments</span>
            <span className="stat-icon orange"><Clock /></span>
          </div>
          <h2>₹1,25,000</h2>
          <p className="neutral">Across 5 invoices</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Total Invoices</span>
            <span className="stat-icon purple"><FileText /></span>
          </div>
          <h2>24</h2>
          <p className="positive"><ArrowUpRight size={15} /> 4 new this month</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>AI Audits Completed</span>
            <span className="stat-icon green"><BrainCircuit /></span>
          </div>
          <h2>18</h2>
          <p className="neutral">3 awaiting review</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel earnings-panel">
          <div className="panel-heading">
            <div>
              <h3>Earnings Overview</h3>
              <p>Your monthly freelance income</p>
            </div>
            <select className="period-select" defaultValue="6">
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
            </select>
          </div>

          <div className="chart-summary">
            <h2>₹3,87,000</h2>
            <span className="positive">
              <ArrowUpRight size={15} /> 18.4%
            </span>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2673e8" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2673e8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                  width={55}
                />
                <Tooltip formatter={(value) => formatINR(value)} />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#2673e8"
                  strokeWidth={3}
                  fill="url(#earningsFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent AI Audits</h3>
              <p>Your latest analysis activity</p>
            </div>
            <button className="text-button">View all <ChevronRight size={15} /></button>
          </div>

          <div className="activity-list">
            {activities.map((item, index) => (
              <div className="activity-item" key={index}>
                <div className="activity-icon">
                  <BrainCircuit size={19} />
                </div>
                <div className="activity-info">
                  <strong>{item.name}</strong>
                  <span>{item.client}</span>
                  <small>{item.time}</small>
                </div>
                <span className={`activity-status ${item.status === "Completed" ? "completed" : "review"}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel invoices-panel">
        <div className="panel-heading">
          <div>
            <h3>Recent Invoices</h3>
            <p>Track your latest client invoices</p>
          </div>
          <button className="text-button">View all <ChevronRight size={15} /></button>
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
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="invoice-id">{invoice.id}</td>
                  <td>{invoice.client}</td>
                  <td>{invoice.date}</td>
                  <td className="amount">{formatINR(invoice.amount)}</td>
                  <td>
                    <span className={`invoice-status ${invoice.status.toLowerCase()}`}>
                      {invoice.status === "Paid" && <CheckCircle2 size={14} />}
                      {invoice.status === "Pending" && <Clock size={14} />}
                      {invoice.status === "Overdue" && <CircleAlert size={14} />}
                      {invoice.status}
                    </span>
                  </td>
                  <td><button className="view-button">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="demo-note">
        <CircleAlert size={14} />
        Demonstration data only. No real payments or AI audits have been performed.
      </p>
    </>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon"><BrainCircuit size={32} /></div>
      <h2>{title}</h2>
      <p>This page is part of the AI Receipt Auditor application.</p>
      <span>We're building this screen next.</span>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="app-layout">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-logo"><BrainCircuit size={24} /></div>
          <div>
            <strong>Receipt Auditor</strong>
            <span>FREELANCER SUITE</span>
          </div>
          <button className="close-menu" onClick={() => setMobileMenu(false)}>
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
                className={`nav-item ${activePage === item.name ? "active" : ""}`}
                onClick={() => {
                  setActivePage(item.name);
                  setMobileMenu(false);
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
                {activePage === item.name && <span className="active-dot" />}
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
        <div className="mobile-overlay" onClick={() => setMobileMenu(false)} />
      )}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(true)}>
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
  <Dashboard />
) : activePage === "New AI Audit" ? (
  <NewAudit />
) : activePage === "Audit Reports" ? (
  <AuditResults />
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
