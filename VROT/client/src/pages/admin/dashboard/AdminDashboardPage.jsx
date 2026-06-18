import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboardPage.css";

// Status mapping for UI display
const statusDisplay = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  "under-review": "Under Review",
  "send-back": "Send Back",
  "payment-verification-pending": "Payment Pending",
};

const statusClass = {
  pending: "status pending",
  approved: "status approved",
  rejected: "status rejected",
  "under-review": "status review",
  "send-back": "status review",
  "payment-verification-pending": "status payment",
};

// Service display
const serviceDisplay = {
  registration: "Vehicle Registration",
  transfer: "Ownership Transfer",
  noc: "NOC Application",
};

export default function AdminDashboardPage() {
  const { user, getAllUsers, getApplications } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setError("You must be logged in as admin.");
        setLoading(false);
        return;
      }
      try {
        const [usersData, appsData] = await Promise.all([
          getAllUsers(),
          getApplications(true),
        ]);
        setUsers(usersData);
        setApplications(appsData);
        if (appsData.length > 0) setSelectedId(appsData[0].id);
        setError("");
      } catch (err) {
        console.error("Load dashboard error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, getAllUsers, getApplications]);

  // Compute KPIs
  const kpis = useMemo(() => {
    const totalApps = applications.length;
    const pending = applications.filter(
      (a) => a.status === "pending" || a.status === "under-review" || a.status === "payment-verification-pending"
    ).length;
    const approvedToday = applications.filter(
      (a) => a.status === "approved" && new Date(a.createdAt).toDateString() === new Date().toDateString()
    ).length;
    const rejectedToday = applications.filter(
      (a) => a.status === "rejected" && new Date(a.createdAt).toDateString() === new Date().toDateString()
    ).length;
    const activeUsers = users.filter((u) => u.isVerified).length;

    return [
      { label: "Total Applications", value: totalApps.toString(), delta: `${pending} pending`, tone: "blue" },
      { label: "Pending Reviews", value: pending.toString(), delta: "Need attention", tone: "amber" },
      { label: "Approved Today", value: approvedToday.toString(), delta: "Today's approvals", tone: "green" },
      { label: "Rejected Today", value: rejectedToday.toString(), delta: "Doc issues flagged", tone: "red" },
      { label: "Active Users", value: activeUsers.toString(), delta: "Verified accounts", tone: "violet" },
    ];
  }, [applications, users]);

  // Alerts derived from data
  const alerts = useMemo(() => {
    const alertList = [];
    const pendingLong = applications.filter(
      (a) => a.status === "pending" && (Date.now() - new Date(a.createdAt).getTime()) > 48 * 60 * 60 * 1000
    );
    if (pendingLong.length > 0) {
      alertList.push({ type: "Overdue", text: `${pendingLong.length} applications pending review for more than 48 hours.` });
    }
    const docMissing = applications.filter(
      (a) => a.status === "pending" && (!a.documents || a.documents.length === 0)
    );
    if (docMissing.length > 0) {
      alertList.push({ type: "Documents Missing", text: `${docMissing.length} applications missing required documents.` });
    }
    const paymentPending = applications.filter(
      (a) => a.status === "payment-verification-pending"
    );
    if (paymentPending.length > 0) {
      alertList.push({ type: "Payment Pending", text: `${paymentPending.length} applications waiting for payment verification.` });
    }
    if (alertList.length === 0) {
      alertList.push({ type: "System Notice", text: "All systems operational. No pending issues." });
    }
    return alertList;
  }, [applications]);

  // Recent activity: latest 4 applications sorted by creation
  const activityData = useMemo(() => {
    return applications
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4)
      .map((app) => {
        const time = new Date(app.createdAt).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const text = `${statusDisplay[app.status] || app.status} application ${app.id} by ${app.userName || "user"}`;
        return { time, text };
      });
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    if (filter === "All") return applications;
    return applications.filter((a) => a.status === filter);
  }, [applications, filter]);

  const selectedApp = applications.find((a) => a.id === selectedId) || applications[0] || null;

  const handleQuickAction = (action) => {
    if (!selectedApp) return;
    alert(`${action} action triggered for ${selectedApp.id}`);
  };

  if (loading) {
    return <div className="admin-page">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="admin-page error-state">{error}</div>;
  }

  return (
    <div className="admin-page">
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Admin Dashboard</p>
            <h2>Welcome back, Admin</h2>
            <p className="subtitle">Monitor applications, manage users, and resolve pending service actions from one control center.</p>
          </div>

          <div className="header-actions">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="payment-verification-pending">Payment Pending</option>
            </select>
            <button className="secondary-btn">Export Report</button>
          </div>
        </header>

        <section className="kpi-grid">
          {kpis.map((item) => (
            <article key={item.label} className={`kpi-card ${item.tone}`}>
              <span>{item.label}</span>
              <h3>{item.value}</h3>
              <p>{item.delta}</p>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <article className="panel alerts-panel">
            <div className="panel-head">
              <h3>Alerts</h3>
              <span>Live issues</span>
            </div>
            <div className="alert-list">
              {alerts.map((item) => (
                <div key={item.text} className={`alert-item ${item.type.toLowerCase().replace(/\s/g, "-")}`}>
                  <strong>{item.type}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel activity-panel">
            <div className="panel-head">
              <h3>Recent Activity</h3>
              <span>Latest events</span>
            </div>
            <div className="activity-list">
              {activityData.length === 0 ? (
                <div className="empty-state">No recent activity.</div>
              ) : (
                activityData.map((item) => (
                  <div key={item.text} className="activity-item">
                    <span>{item.time}</span>
                    <p>{item.text}</p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="panel review-panel">
          <div className="panel-head">
            <h3>Application Review</h3>
            <span>{filteredApplications.length} records</span>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <h4>No applications found</h4>
              <p>Change the filter to view matching applications.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Applicant</th>
                    <th>Service Type</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className={selectedId === app.id ? "selected-row" : ""}
                    >
                      <td>{app.id}</td>
                      <td>{app.userName || app.userEmail || "N/A"}</td>
                      <td>{serviceDisplay[app.type] || app.type}</td>
                      <td>
                        <span className={statusClass[app.status] || "status"}>
                          {statusDisplay[app.status] || app.status}
                        </span>
                      </td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="row-actions">
                          <button onClick={() => setSelectedId(app.id)}>View</button>
                          <button onClick={() => handleQuickAction("Review Document")}>Docs</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bottom-grid">
          <article className="panel quick-panel">
            <div className="panel-head">
              <h3>Quick Actions</h3>
              <span>{selectedApp?.id || "N/A"}</span>
            </div>
            <div className="quick-buttons">
              <button className="primary-btn" onClick={() => handleQuickAction("Approve")}>Approve</button>
              <button className="danger-btn" onClick={() => handleQuickAction("Reject")}>Reject</button>
              <button className="secondary-btn" onClick={() => handleQuickAction("Review Document")}>Review Document</button>
              <button className="secondary-btn" onClick={() => handleQuickAction("Send Reminder")}>Send Reminder</button>
            </div>
            <div className="mini-summary">
              <p><strong>Selected:</strong> {selectedApp?.userName || "N/A"}</p>
              <p><strong>Service:</strong> {selectedApp ? serviceDisplay[selectedApp.type] || selectedApp.type : "N/A"}</p>
              <p><strong>Status:</strong> {selectedApp ? statusDisplay[selectedApp.status] || selectedApp.status : "N/A"}</p>
            </div>
          </article>

          <article className="panel report-panel">
            <div className="panel-head">
              <h3>Report Summary</h3>
              <span>Placeholder</span>
            </div>
            <div className="chart-placeholder">
              <div />
              <div />
              <div />
              <div />
            </div>
            <p className="chart-note">Chart area ready for Axios or API-based analytics integration later.</p>
          </article>
        </section>
      </main>
    </div>
  );
}