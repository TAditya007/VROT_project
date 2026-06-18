import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AdminArchivePage.css"; // Ensure you have this CSS file

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
    archived: "Archived",
  };
  return map[status] || status;
};

export default function AdminArchivePage() {
  const { user, getApplications, updateApplicationStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ search: "", type: "all", status: "all" });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const pageSize = 10;

  // Fetch archived applications (those with status 'archived' or rejected)
  const loadArchived = async () => {
    if (!user) {
      setError("You must be logged in as admin.");
      setLoading(false);
      return;
    }
    try {
      const apps = await getApplications(true);
      // For demo, we consider "archived" = status === 'rejected' or we can add 'archived' status
      // We'll treat 'rejected' as archived for now, but we can also filter by a custom flag
      // To demonstrate archive functionality, we'll allow admin to archive any application
      // For now, show all applications and we'll allow archiving via a button
      // But to show some as archived, we'll filter those with status 'rejected'
      // In a real system, you'd have an 'archived' field.
      // We'll store an 'archived' flag in the application object.
      // Since we don't have it yet, we'll just show all applications with status 'rejected' as archived.
      // The admin can then restore (change status) or delete (remove).
      const archivedApps = apps.filter(app => app.status === 'rejected');
      setRecords(archivedApps);
      setError("");
    } catch (err) {
      console.error("Load archived error:", err);
      setError("Failed to load archived records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchived();
  }, [user, getApplications]);

  // Filtering
  const filteredRecords = useMemo(() => {
    let result = records;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(r =>
        r.id.toLowerCase().includes(q) ||
        (r.userName && r.userName.toLowerCase().includes(q)) ||
        (r.userEmail && r.userEmail.toLowerCase().includes(q))
      );
    }
    if (filters.type !== "all") {
      result = result.filter(r => r.type === filters.type);
    }
    if (filters.status !== "all") {
      result = result.filter(r => r.status === filters.status);
    }
    return result;
  }, [records, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  // Stats
  const stats = useMemo(() => {
    const total = records.length;
    const applications = records.filter(r => r.type === 'registration' || r.type === 'transfer' || r.type === 'noc').length;
    const usersDocuments = records.filter(r => r.type === 'user' || r.type === 'document').length; // not implemented
    const pendingDelete = records.filter(r => r.status === 'rejected').length;
    return { total, applications, usersDocuments, pendingDelete };
  }, [records]);

  // Selection handlers
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedRecords.map(r => r.id));
    }
  };

  // Restore a single record: change status from rejected to pending (or under-review)
  const handleRestore = async (id) => {
    try {
      await updateApplicationStatus(id, 'pending');
      await loadArchived(); // refresh
      setSelectedRecord(null);
    } catch (err) {
      console.error("Restore error:", err);
      alert("Failed to restore record.");
    }
  };

  // Delete permanently: remove from records (we can either delete from server or just filter out)
  const handleDelete = async (id) => {
    // For demo, we just remove from local state since we don't have a delete endpoint
    // In a real system, you'd call an API to delete.
    // We'll use updateApplicationStatus to set status to 'deleted' (you can add this status)
    // For now, we'll just remove from local state and later sync with backend.
    // Let's call updateApplicationStatus with a custom status 'deleted'
    try {
      // We'll set status to 'deleted' (you need to add this in backend)
      // As fallback, we'll just remove from local state.
      setRecords(prev => prev.filter(r => r.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
      // Optionally, call backend to mark as deleted
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete record.");
    }
  };

  // Bulk actions
  const handleBulkRestore = async () => {
    for (const id of selectedIds) {
      await handleRestore(id);
    }
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await handleDelete(id);
    }
    setSelectedIds([]);
  };

  // Update filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (loading) {
    return <div className="admin-archive-page">Loading archived records...</div>;
  }

  if (error) {
    return <div className="admin-archive-page error-state">{error}</div>;
  }

  return (
    <div className="admin-archive-page">
      <div className="archive-header">
        <h1>Archive Management</h1>
        <p>Archived applications (rejected) can be restored or permanently deleted.</p>
      </div>

      {/* Stats */}
      <div className="archive-stats">
        <div className="stat-card">
          <span>Total Archived</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card">
          <span>Applications</span>
          <strong>{stats.applications}</strong>
        </div>
        <div className="stat-card">
          <span>Users / Documents</span>
          <strong>{stats.usersDocuments}</strong>
        </div>
        <div className="stat-card">
          <span>Pending Deletion</span>
          <strong>{stats.pendingDelete}</strong>
        </div>
      </div>

      {/* Filters */}
      <div className="archive-filters">
        <input
          type="text"
          placeholder="Search by ID or user name"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
        <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)}>
          <option value="all">All Types</option>
          <option value="registration">Registration</option>
          <option value="transfer">Transfer</option>
          <option value="noc">NOC</option>
        </select>
        <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
          <option value="all">All Status</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {/* Table */}
      <div className="archive-table-wrap">
        <table className="archive-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedIds.length === paginatedRecords.length && paginatedRecords.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>ID</th>
              <th>Applicant</th>
              <th>Service</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No archived records found.</td></tr>
            ) : (
              paginatedRecords.map(record => (
                <tr key={record.id} className={selectedRecord?.id === record.id ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(record.id)}
                      onChange={() => toggleSelect(record.id)}
                    />
                  </td>
                  <td><strong>{record.id}</strong></td>
                  <td>{record.userName || record.userEmail || 'N/A'}</td>
                  <td>{getServiceName(record.type)}</td>
                  <td><span className={`status-badge status-${record.status}`}>{getStatusDisplay(record.status)}</span></td>
                  <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleRestore(record.id)} className="btn-restore">Restore</button>
                    <button onClick={() => handleDelete(record.id)} className="btn-delete">Delete</button>
                    <button onClick={() => setSelectedRecord(record)} className="btn-view">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="archive-pagination">
        <span>Page {page} of {totalPages}</span>
        <div>
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))}>Previous</button>
          <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Next</button>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="archive-bulk-actions">
        <span>{selectedIds.length} selected</span>
        <button disabled={!selectedIds.length} onClick={handleBulkRestore}>Restore Selected</button>
        <button disabled={!selectedIds.length} onClick={handleBulkDelete}>Delete Selected</button>
      </div>

      {/* Details panel (simplified) */}
      {selectedRecord && (
        <div className="archive-detail-panel">
          <h2>Record Details</h2>
          <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
          <button onClick={() => setSelectedRecord(null)}>Close</button>
        </div>
      )}
    </div>
  );
}