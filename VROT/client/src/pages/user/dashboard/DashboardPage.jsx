import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import dashboardBg from "../../../assets/dashboard/dashboard.jpg";
import "./DashboardPage.css";

const quickActions = [
  {
    title: "Register Vehicle",
    path: "/vehicle",
    text: "Start a new vehicle registration application.",
  },
  {
    title: "Upload Documents",
    path: "/document-upload",
    text: "Submit required files for verification.",
  },
  {
    title: "Pay Fees",
    path: "/payment",
    text: "Complete the payment step for your request.",
  },
  {
    title: "Track Status",
    path: "/status",
    text: "Check your current application progress.",
  },
  {
    title: "Request NOC",
    path: "/noc",
    text: "Apply for a No Objection Certificate.",
  },
  {
    title: "Ownership Transfer",
    path: "/transfer",
    text: "Continue transfer-related processing.",
  },
];

// Helper: format relative time
const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day ago`;
  return past.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

// Helper: get service display name
const getServiceName = (type) => {
  const map = {
    registration: "Vehicle Registration",
    transfer: "Ownership Transfer",
    noc: "NOC Application",
  };
  return map[type] || type;
};

// Helper: get status display
const getStatusDisplay = (status) => {
  const map = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    "under-review": "Under Review",
    "send-back": "Send Back",
    "payment-verification-pending": "Payment Verification Pending",
  };
  return map[status] || status;
};

const DashboardPage = () => {
  const { user, getApplications } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setError("Please log in to view your dashboard.");
        setLoading(false);
        return;
      }
      try {
        const apps = await getApplications(false); // user's own apps
        setApplications(apps);
        setError("");
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, getApplications]);

  // Compute stats
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(
      app => app.status === "pending" || app.status === "under-review" || app.status === "payment-verification-pending"
    ).length;
    const approved = applications.filter(app => app.status === "approved").length;
    const rejected = applications.filter(app => app.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [applications]);

  // Recent activities: last 3 applications sorted by createdAt descending
  const recentActivities = useMemo(() => {
    return applications
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(app => ({
        id: app.id,
        service: getServiceName(app.type),
        status: getStatusDisplay(app.status),
        time: timeAgo(app.createdAt),
      }));
  }, [applications]);

  // Generate alerts based on application statuses
  const alerts = useMemo(() => {
    const alertList = [];
    const hasPendingDocs = applications.some(
      app => app.status === "pending" && (!app.documents || app.documents.length === 0)
    );
    const hasPaymentPending = applications.some(
      app => app.status === "payment-verification-pending"
    );
    const hasUnderReview = applications.some(
      app => app.status === "under-review"
    );
    const hasApproved = applications.some(
      app => app.status === "approved"
    );

    if (hasPendingDocs) {
      alertList.push("You have applications that require document upload. Please submit the required files.");
    }
    if (hasPaymentPending) {
      alertList.push("Your payment is under verification. Check status after 24 hours.");
    }
    if (hasUnderReview) {
      alertList.push("Your application is being reviewed by the admin. Stay tuned for updates.");
    }
    if (hasApproved && !alertList.length) {
      alertList.push("Congratulations! You have approved applications. Download your receipts.");
    }
    if (alertList.length === 0) {
      alertList.push("No pending actions. Start a new application from the quick actions.");
    }
    return alertList;
  }, [applications]);

  // User avatar initial
  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  if (loading) {
    return <div className="dashboard-page">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/login">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="dashboard-page"
      style={{ backgroundImage: `url(${dashboardBg})` }}
    >
      <div className="dashboard-layout">
        <div className="dashboard-content-area">
          <header className="dashboard-topbar">
            <div className="dashboard-branding">
              <p className="dashboard-brand-kicker">
                Vehicle Registration & Ownership Transfer
              </p>
              <h1>Dashboard</h1>
            </div>

            <div className="dashboard-profile-block">
              <div className="dashboard-profile-avatar">{userInitial}</div>
              <div className="dashboard-profile-text">
                <strong>{user?.name || "Citizen"}</strong>
                <span>Citizen Portal Access</span>
              </div>
            </div>
          </header>

          <main className="dashboard-main">
            <section className="dashboard-welcome-card">
              <div>
                <span className="dashboard-section-tag">
                  Citizen Services
                </span>
                <h2>Manage your VROT workflow from one place</h2>
                <p>
                  Start vehicle registration, upload documents, pay fees,
                  track status, request NOC, and complete ownership transfer
                  in a single streamlined portal.
                </p>
              </div>

              <div className="dashboard-welcome-stats">
                <div className="dashboard-mini-stat">
                  <span>Total Applications</span>
                  <strong>{stats.total}</strong>
                </div>
                <div className="dashboard-mini-stat">
                  <span>Pending Review</span>
                  <strong>{stats.pending}</strong>
                </div>
                <div className="dashboard-mini-stat">
                  <span>Approved</span>
                  <strong>{stats.approved}</strong>
                </div>
                <div className="dashboard-mini-stat">
                  <span>Rejected</span>
                  <strong>{stats.rejected}</strong>
                </div>
              </div>
            </section>

            <section className="dashboard-content-grid">
              <div className="dashboard-left-column">
                <article className="dashboard-panel">
                  <div className="dashboard-panel-head">
                    <div>
                      <span className="dashboard-section-tag">
                        Quick Access
                      </span>
                      <h3>Main Actions</h3>
                    </div>
                  </div>

                  <div className="dashboard-actions-grid">
                    {quickActions.map((action) => (
                      <Link
                        key={action.path}
                        to={action.path}
                        className="dashboard-action-card"
                      >
                        <h4>{action.title}</h4>
                        <p>{action.text}</p>
                        <span>Open Module</span>
                      </Link>
                    ))}
                  </div>
                </article>

                <article className="dashboard-panel">
                  <div className="dashboard-panel-head">
                    <div>
                      <span className="dashboard-section-tag">
                        Applications
                      </span>
                      <h3>Recent Activity</h3>
                    </div>
                  </div>

                  <div className="dashboard-activity-list">
                    {recentActivities.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)' }}>No recent applications.</p>
                    ) : (
                      recentActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="dashboard-activity-item"
                        >
                          <div>
                            <h4>{activity.service}</h4>
                            <p>{activity.id}</p>
                          </div>

                          <div className="dashboard-activity-meta">
                            <span className="dashboard-status-pill">
                              {activity.status}
                            </span>
                            <small>{activity.time}</small>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              </div>

              <aside className="dashboard-right-column">
                <article className="dashboard-panel">
                  <div className="dashboard-panel-head">
                    <div>
                      <span className="dashboard-section-tag">
                        Alerts
                      </span>
                      <h3>Important Updates</h3>
                    </div>
                  </div>

                  <div className="dashboard-alert-list">
                    {alerts.map((alert, index) => (
                      <div
                        key={index}
                        className="dashboard-alert-item"
                      >
                        <span className="dashboard-alert-dot" />
                        <p>{alert}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="dashboard-panel dashboard-info-card">
                  <span className="dashboard-section-tag">
                    Portal Info
                  </span>
                  <h3>Service Flow</h3>
                  <p>
                    Complete the workflow in order: registration,
                    upload, payment, receipt, tracking, NOC, and
                    transfer.
                  </p>
                </article>
              </aside>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;