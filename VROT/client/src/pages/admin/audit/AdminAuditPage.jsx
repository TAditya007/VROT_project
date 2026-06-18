import React, { useMemo, useState } from "react";
import "./AdminAuditPage.css";
import auditBg from "../../../assets/admin/audit.png";

const MOCK_EVENTS = [
  {
    id: 1,
    timestamp: "2026-06-08 14:05",
    admin: "Aarav Sharma",
    role: "Super Admin",
    action: "approve",
    targetModule: "Ownership Transfer",
    target: "File #VROT-2048",
    result: "Approved",
    status: "success",
    ip: "192.168.1.18",
    device: "Chrome / Windows 11",
    changes: "Approved ownership transfer after document verification.",
    details: [
      "Applicant identity verified",
      "RC copy matched",
      "Fee status cleared",
      "Status changed to Approved",
    ],
  },
  {
    id: 2,
    timestamp: "2026-06-08 13:42",
    admin: "Priya Iyer",
    role: "Admin",
    action: "update",
    targetModule: "User Management",
    target: "User #USR-109",
    result: "Updated",
    status: "success",
    ip: "192.168.1.22",
    device: "Edge / Windows 11",
    changes: "Updated user mobile number and address proof flag.",
    details: [
      "Mobile number updated",
      "Address proof status set to verified",
      "Profile audit note added",
    ],
  },
  {
    id: 3,
    timestamp: "2026-06-08 12:15",
    admin: "System",
    role: "System",
    action: "login",
    targetModule: "Authentication",
    target: "Admin Login",
    result: "Successful",
    status: "info",
    ip: "10.0.0.5",
    device: "Server / API Gateway",
    changes: "Admin session created successfully.",
    details: ["Session token issued", "MFA passed", "Audit log recorded"],
  },
  {
    id: 4,
    timestamp: "2026-06-08 11:58",
    admin: "Nikhil Reddy",
    role: "Admin",
    action: "reject",
    targetModule: "RC Transfer",
    target: "File #VROT-2012",
    result: "Rejected",
    status: "danger",
    ip: "192.168.1.26",
    device: "Chrome / macOS",
    changes: "Rejected due to mismatched engine number document.",
    details: [
      "Document mismatch detected",
      "Applicant notified",
      "Case moved to review archive",
    ],
  },
  {
    id: 5,
    timestamp: "2026-06-08 10:34",
    admin: "Meera Rao",
    role: "Admin",
    action: "settings",
    targetModule: "System Settings",
    target: "Notification Rules",
    result: "Saved",
    status: "warning",
    ip: "192.168.1.31",
    device: "Firefox / Windows 10",
    changes: "Adjusted alert thresholds for pending applications.",
    details: ["Threshold changed from 24h to 12h", "Email alerts enabled"],
  },
  {
    id: 6,
    timestamp: "2026-06-07 18:20",
    admin: "Arjun Verma",
    role: "Admin",
    action: "delete",
    targetModule: "Documents",
    target: "Attachment #DOC-778",
    result: "Deleted",
    status: "danger",
    ip: "192.168.1.41",
    device: "Chrome / Linux",
    changes: "Removed duplicate document attachment.",
    details: ["Duplicate detected", "Attachment permanently removed"],
  },
];

const ACTION_OPTIONS = [
  "All",
  "login",
  "update",
  "approve",
  "reject",
  "delete",
  "settings",
];

const MODULE_OPTIONS = [
  "All",
  "Authentication",
  "Ownership Transfer",
  "RC Transfer",
  "User Management",
  "System Settings",
  "Documents",
];

export default function AdminAuditPage() {
  const [filters, setFilters] = useState({
    date: "",
    admin: "",
    action: "All",
    module: "All",
  });

  const [selectedId, setSelectedId] = useState(
    MOCK_EVENTS[0]?.id || null
  );

  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter((event) => {
      const matchesDate = filters.date
        ? event.timestamp.startsWith(filters.date)
        : true;

      const matchesAdmin = filters.admin
        ? event.admin
            .toLowerCase()
            .includes(filters.admin.toLowerCase())
        : true;

      const matchesAction =
        filters.action === "All"
          ? true
          : event.action === filters.action;

      const matchesModule =
        filters.module === "All"
          ? true
          : event.targetModule === filters.module;

      return (
        matchesDate &&
        matchesAdmin &&
        matchesAction &&
        matchesModule
      );
    });
  }, [filters]);

  const selectedEvent =
    filteredEvents.find((event) => event.id === selectedId) ||
    filteredEvents[0] ||
    null;

  const summary = useMemo(() => {
    const todayEvents = MOCK_EVENTS.filter((event) =>
      event.timestamp.startsWith("2026-06-08")
    ).length;

    const criticalActions = MOCK_EVENTS.filter((event) =>
      ["approve", "reject", "delete"].includes(event.action)
    ).length;

    const failedActions = MOCK_EVENTS.filter(
      (event) => event.status === "danger"
    ).length;

    return {
      totalEvents: MOCK_EVENTS.length,
      todayEvents,
      criticalActions,
      failedActions,
    };
  }, []);

  const exportLogs = () => {
    const rows = filteredEvents.map((event) => ({
      timestamp: event.timestamp,
      admin: event.admin,
      action: event.action,
      targetModule: event.targetModule,
      result: event.result,
      ip: event.ip,
      device: event.device,
    }));

    const blob = new Blob(
      [JSON.stringify(rows, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "vrot-admin-audit-logs.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="admin-audit-page"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${auditBg})`,
      }}
    >
      <div className="admin-audit-shell">
        <header className="audit-header">
          <div>
            <p className="audit-kicker">Admin only</p>
            <h1>Admin Audit</h1>
            <p className="audit-intro">
              Track approvals, rejections, profile edits,
              user changes, settings updates, login events,
              and system activity in one transparent log.
            </p>
          </div>

          <button
            className="audit-export-btn"
            onClick={exportLogs}
          >
            Export Logs
          </button>
        </header>

        <section className="summary-grid">
          <article className="summary-card">
            <span>Total Events</span>
            <strong>{summary.totalEvents}</strong>
          </article>

          <article className="summary-card">
            <span>Today's Events</span>
            <strong>{summary.todayEvents}</strong>
          </article>

          <article className="summary-card critical">
            <span>Critical Actions</span>
            <strong>{summary.criticalActions}</strong>
          </article>

          <article className="summary-card danger">
            <span>Failed Actions</span>
            <strong>{summary.failedActions}</strong>
          </article>
        </section>

        <section className="filters-card">
          <div className="filters-grid">
            <label>
              <span>Date</span>
              <input
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span>Admin Name</span>
              <input
                type="text"
                placeholder="Search admin"
                value={filters.admin}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    admin: e.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span>Action Type</span>
              <select
                value={filters.action}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    action: e.target.value,
                  }))
                }
              >
                {ACTION_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Module / Page</span>
              <select
                value={filters.module}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    module: e.target.value,
                  }))
                }
              >
                {MODULE_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="content-grid">
          <div className="audit-list-card">
            <div className="section-head">
              <h2>Activity Trail</h2>
              <span>{filteredEvents.length} records</span>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="empty-state">
                <h3>No audit logs found</h3>
                <p>
                  Try changing the filters to view matching
                  admin activity.
                </p>
              </div>
            ) : (
              <div className="audit-list">
                {filteredEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className={`audit-item ${
                      selectedEvent?.id === event.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedId(event.id)
                    }
                  >
                    <div className="audit-item-top">
                      <span
                        className={`badge ${event.action}`}
                      >
                        {event.action}
                      </span>
                      <small>{event.timestamp}</small>
                    </div>

                    <strong>{event.admin}</strong>
                    <p>{event.targetModule}</p>

                    <span
                      className={`result ${event.status}`}
                    >
                      {event.result}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="detail-panel">
            <div className="section-head">
              <h2>Event Details</h2>
              <span>Selected record</span>
            </div>

            {selectedEvent ? (
              <div className="detail-card">
                <div className="detail-row">
                  <span>Timestamp</span>
                  <strong>
                    {selectedEvent.timestamp}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Admin / User</span>
                  <strong>
                    {selectedEvent.admin}{" "}
                    <small>
                      ({selectedEvent.role})
                    </small>
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Action</span>
                  <strong
                    className={`badge inline ${selectedEvent.action}`}
                  >
                    {selectedEvent.action}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Target Module</span>
                  <strong>
                    {selectedEvent.targetModule}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Target</span>
                  <strong>
                    {selectedEvent.target}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Result</span>
                  <strong
                    className={`result ${selectedEvent.status}`}
                  >
                    {selectedEvent.result}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>IP / Device</span>
                  <strong>
                    {selectedEvent.ip}
                    <br />
                    <small>
                      {selectedEvent.device}
                    </small>
                  </strong>
                </div>

                <div className="detail-block">
                  <span>Change Summary</span>
                  <p>{selectedEvent.changes}</p>
                </div>

                <div className="detail-block">
                  <span>Details</span>
                  <ul>
                    {selectedEvent.details.map(
                      (item, index) => (
                        <li key={index}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <h3>No event selected</h3>
                <p>
                  Select a log entry to inspect the full
                  audit details.
                </p>
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
}