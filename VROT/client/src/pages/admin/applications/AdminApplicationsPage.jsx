import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import "./AdminApplicationsPage.css";

const statusOptions = [
  "All",
  "Under Review",
  "pending",
  "Send Back",
  "Approved",
  "Rejected",
  "Payment Verification Pending",
];
const serviceOptions = [
  "All",
  "registration",
  "transfer",
  "noc",
];

// Map service type to display name
const serviceDisplay = {
  registration: "Vehicle Registration",
  transfer: "Ownership Transfer",
  noc: "NOC Application",
};

const statusDisplay = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  "send-back": "Send Back",
  "under-review": "Under Review",
  "payment-verification-pending": "Payment Verification Pending",
};

const badgeClass = (value) => {
  const normalized = String(value || "").toLowerCase().replace(/\s+/g, "-");
  return `badge badge-${normalized}`;
};

export default function AdminApplicationsPage() {
  const { user, getApplications, updateApplicationStatus } = useAuth();
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // API base URL for document downloads
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Load applications from backend
  const loadApplications = async () => {
    if (!user) {
      setError("You must be logged in as admin.");
      setLoading(false);
      return;
    }
    try {
      const data = await getApplications(true);
      setApplications(data);
      if (data.length > 0) setSelectedId(data[0].id);
      setError("");
    } catch (err) {
      console.error("Load apps error:", err);
      setError("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [user]);

  // Save admin note locally (will be persisted via API when changed)
  const updateAdminNoteLocally = (newNote) => {
    setAdminNote(newNote);
    // Update local state immediately (backend sync is done on status updates)
    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApplication?.id ? { ...app, notes: newNote } : app
      )
    );
    // Note: we are not saving notes to backend yet; we can add an endpoint later.
    // For now, admin notes are only stored locally.
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === "All" || app.status === statusFilter;
      const matchesService = serviceFilter === "All" || app.type === serviceFilter;
      const matchesSearch =
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.userName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesService && matchesSearch;
    });
  }, [applications, statusFilter, serviceFilter, searchTerm]);

  const selectedApplication =
    filteredApplications.find((app) => app.id === selectedId) || filteredApplications[0] || null;

  // Update application status via API
  const updateStatus = async (newStatus) => {
    if (!selectedApplication) return;
    try {
      await updateApplicationStatus(selectedApplication.id, newStatus);
      // Refresh local list
      await loadApplications();
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  // Payment verification – for demo we can just update status
  const handleVerifyPayment = async () => {
    if (!selectedApplication) return;
    if (selectedApplication.paymentStatus !== "Paid") {
      alert("Payment is not marked as Paid. Cannot verify.");
      return;
    }
    // We'll use a custom status "Payment Verification Pending" or "Under Review"
    await updateStatus("Under Review");
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;
    if (selectedApplication.paymentStatus !== "Verified") {
      alert("Please verify payment first before approval.");
      return;
    }
    await updateStatus("Approved");
  };

  const handleReject = async () => await updateStatus("Rejected");
  const handleSendBack = async () => await updateStatus("Send Back");
  const handleMarkPending = async () => await updateStatus("pending");

  const handleSelect = (id) => {
    setSelectedId(id);
    const item = applications.find((app) => app.id === id);
    setAdminNote(item?.notes || "");
  };

  // Helper to get document download URL
  const getDocumentUrl = (doc) => {
    if (!doc || !doc.path) return "#";
    return `${API_URL}${doc.path}`;
  };

  if (loading) {
    return <div className="admin-app-page">Loading applications...</div>;
  }

  if (error) {
    return <div className="admin-app-page error-state">{error}</div>;
  }

  return (
    <div className="admin-app-page">
      <div className="admin-bg-overlay" />

      <section className="page-header">
        <div>
          <p className="eyebrow">Admin Workflow</p>
          <h1>Application Review</h1>
          <p className="subtitle">
            Review citizen submissions, verify payments, and approve applications.
          </p>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search application ID or applicant name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>{opt === "All" ? "All" : serviceDisplay[opt]}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="review-grid">
        <aside className="queue-panel glass-panel">
          <div className="panel-title">
            <h2>Application Queue</h2>
            <span>{filteredApplications.length} items</span>
          </div>

          <div className="queue-list">
            {filteredApplications.length === 0 ? (
              <div className="empty-state">
                <h3>No matching applications</h3>
                <p>Try a different filter or search term.</p>
              </div>
            ) : (
              filteredApplications.map((app) => (
                <button
                  key={app.id}
                  className={`queue-item ${selectedApplication?.id === app.id ? "active" : ""}`}
                  onClick={() => handleSelect(app.id)}
                >
                  <div className="queue-top">
                    <strong>{app.id}</strong>
                    <span className={badgeClass(app.status)}>{statusDisplay[app.status] || app.status}</span>
                  </div>
                  <p>{app.userName || "Unknown"}</p>
                  <span>{serviceDisplay[app.type] || app.type}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="review-panel glass-panel">
          {selectedApplication ? (
            <>
              <div className="panel-title">
                <h2>Review Details</h2>
                <span className={badgeClass(selectedApplication.priority || "Medium")}>
                  {selectedApplication.priority || "Medium"} Priority
                </span>
              </div>

              <div className="detail-card">
                <div className="detail-grid">
                  <div>
                    <label>Application ID</label>
                    <p>{selectedApplication.id}</p>
                  </div>
                  <div>
                    <label>Applicant Name</label>
                    <p>{selectedApplication.userName || "N/A"}</p>
                  </div>
                  <div>
                    <label>Service Type</label>
                    <p>{serviceDisplay[selectedApplication.type] || selectedApplication.type}</p>
                  </div>
                  <div>
                    <label>Submission Date</label>
                    <p>{selectedApplication.createdAt ? new Date(selectedApplication.createdAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <label>Current Status</label>
                    <p className={badgeClass(selectedApplication.status)}>{statusDisplay[selectedApplication.status] || selectedApplication.status}</p>
                  </div>
                  <div>
                    <label>Payment Status</label>
                    <p className={badgeClass(selectedApplication.paymentStatus || "Unpaid")}>
                      {selectedApplication.paymentStatus || "Unpaid"}
                    </p>
                  </div>
                  {selectedApplication.transactionId && (
                    <div>
                      <label>Transaction ID</label>
                      <p><strong>{selectedApplication.transactionId}</strong></p>
                    </div>
                  )}
                </div>
              </div>

              <div className="document-card">
                <div className="panel-title">
                  <h3>Uploaded Documents</h3>
                  <span>Verification checklist</span>
                </div>
                <div className="document-list">
                  {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                    selectedApplication.documents.map((doc, idx) => (
                      <div key={idx} className="document-row">
                        <span>{doc.originalname || doc.type || "Document"}</span>
                        {doc.path && (
                          <a href={getDocumentUrl(doc)} target="_blank" rel="noopener noreferrer" className="download-link">
                            Download
                          </a>
                        )}
                        <span className={badgeClass("uploaded")}>Uploaded</span>
                      </div>
                    ))
                  ) : (
                    <p>No documents uploaded yet.</p>
                  )}
                </div>
              </div>

              <div className="action-card">
                <div className="panel-title">
                  <h3>Action Buttons</h3>
                  <span>Workflow controls</span>
                </div>

                <div className="action-buttons">
                  {selectedApplication.paymentStatus === "Paid" && (
                    <button className="btn verify-payment" onClick={handleVerifyPayment}>
                      Verify Payment
                    </button>
                  )}
                  <button
                    className="btn approve"
                    onClick={handleApprove}
                    disabled={selectedApplication.paymentStatus !== "Verified"}
                  >
                    Approve
                  </button>
                  <button className="btn reject" onClick={handleReject}>Reject</button>
                  <button className="btn warning" onClick={handleSendBack}>Send for Correction</button>
                  <button className="btn neutral" onClick={handleMarkPending}>Mark Pending</button>
                </div>
              </div>

              <div className="notes-card">
                <div className="panel-title">
                  <h3>Admin Notes</h3>
                  <span>Internal remarks</span>
                </div>
                <textarea
                  value={adminNote}
                  onChange={(e) => updateAdminNoteLocally(e.target.value)}
                  placeholder="Add review notes, correction instructions, or approval remarks..."
                />
              </div>
            </>
          ) : (
            <div className="empty-state large">
              <h3>No application selected</h3>
              <p>Select a record from the queue to start reviewing.</p>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}