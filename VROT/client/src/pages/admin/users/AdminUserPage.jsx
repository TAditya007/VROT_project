import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import "./AdminUsersPage.css";

const roles = ["All Roles", "citizen", "admin"];
const statuses = ["All Status", "Verified", "Pending"];

export default function AdminUsersPage() {
  const { user, getAllUsers, verifyUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load users from backend
  const loadUsers = async () => {
    if (!user) {
      setError("You must be logged in as admin.");
      setLoading(false);
      return;
    }
    try {
      const data = await getAllUsers();
      setUsers(data);
      if (data.length > 0) setSelectedUserId(data[0].id);
      setError("");
    } catch (err) {
      console.error("Load users error:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user]);

  // Helper to get display status
  const getDisplayStatus = (user) => {
    if (user.isVerified) return "Verified";
    return "Pending";
  };

  // Helper to get status badge class
  const getStatusClass = (status) => {
    const map = {
      "Verified": "active",
      "Pending": "inactive",
      "Suspended": "suspended"
    };
    return `status-${map[status] || "inactive"}`;
  };

  const selectedUser = users.find((u) => u.id === selectedUserId) || null;

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users.filter((u) => {
      const matchesSearch =
        !query ||
        [u.name, u.email, u.phone, u.profile?.address, u.role, u.isVerified ? "verified" : "pending"]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const displayStatus = getDisplayStatus(u);
      const matchesRole = roleFilter === "All Roles" || u.role === roleFilter;
      const matchesStatus = statusFilter === "All Status" || displayStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleVerifyUser = async (userId) => {
    try {
      const result = await verifyUser(userId);
      if (result.success) {
        // Refresh user list
        await loadUsers();
      } else {
        alert(result.message || "Failed to verify user.");
      }
    } catch (err) {
      console.error("Verify error:", err);
      alert("An error occurred while verifying.");
    }
  };

  const handleViewDetails = (id) => {
    setSelectedUserId(id);
  };

  const handleAddUser = () => {
    alert("New user registration must be done via the signup page.");
  };

  if (loading) {
    return <div className="admin-users-page">Loading users...</div>;
  }

  if (error) {
    return <div className="admin-users-page error-state">{error}</div>;
  }

  return (
    <div className="admin-users-page">
      <section className="admin-users-header">
        <div className="header-overlay">
          <p className="admin-users-kicker">Admin Access Only</p>
          <h1>Admin User Management</h1>
          <p className="admin-users-subtitle">
            Search users, review account details, manage roles, and control access for the VROT platform.
          </p>
        </div>
        <button type="button" className="primary-button" onClick={handleAddUser}>
          + Add User
        </button>
      </section>

      <section className="admin-users-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, phone, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role === "All Roles" ? "All Roles" : role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="admin-users-grid">
        <div className="user-table-card">
          <div className="card-title-row">
            <h2>User Accounts</h2>
            <span>{filteredUsers.length} record(s)</span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <h3>No users found</h3>
              <p>Try adjusting search or filters to view matching accounts.</p>
            </div>
          ) : (
            <div className="user-table-wrap">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const displayStatus = getDisplayStatus(u);
                    const statusClass = getStatusClass(displayStatus);
                    return (
                      <tr
                        key={u.id}
                        className={selectedUserId === u.id ? "is-selected" : ""}
                        onClick={() => handleViewDetails(u.id)}
                      >
                        <td>
                          <strong>{u.name}</strong>
                          <div className="muted-text">{u.profile?.address || "No address"}</div>
                        </td>
                        <td>
                          {u.email}
                          <div className="muted-text">{u.phone}</div>
                        </td>
                        <td>
                          <span className={`role-badge role-${u.role}`}>
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${statusClass}`}>{displayStatus}</span>
                        </td>
                        <td>{u.isVerified ? "✅" : "⏳"}</td>
                        <td>
                          <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                            {!u.isVerified && (
                              <button type="button" onClick={() => handleVerifyUser(u.id)}>
                                Verify
                              </button>
                            )}
                            {u.isVerified && (
                              <button type="button" disabled style={{ opacity: 0.6 }}>
                                Verified
                              </button>
                            )}
                            <button type="button" onClick={() => alert(`Reset password for ${u.email}`)}>
                              Reset Password
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="detail-panel-card">
          <div className="card-title-row">
            <h2>Account Details</h2>
            <span>Selected user</span>
          </div>

          {selectedUser ? (
            <div className="detail-panel">
              <div className="detail-identity">
                <div className="avatar">{selectedUser.name.charAt(0)}</div>
                <div>
                  <h3>{selectedUser.name}</h3>
                  <p>{selectedUser.email}</p>
                </div>
              </div>

              <div className="detail-list">
                <div>
                  <span>Phone</span>
                  <strong>{selectedUser.phone}</strong>
                </div>
                <div>
                  <span>Role</span>
                  <strong>{selectedUser.role}</strong>
                </div>
                <div>
                  <span>Verification</span>
                  <strong>{selectedUser.isVerified ? "Verified" : "Pending"}</strong>
                </div>
                <div>
                  <span>Address</span>
                  <strong>{selectedUser.profile?.address || "Not provided"}</strong>
                </div>
                <div>
                  <span>Age</span>
                  <strong>{selectedUser.profile?.age || "N/A"}</strong>
                </div>
                <div>
                  <span>Sex</span>
                  <strong>{selectedUser.profile?.sex || "N/A"}</strong>
                </div>
              </div>

              <div className="detail-actions">
                {!selectedUser.isVerified && (
                  <button type="button" onClick={() => handleVerifyUser(selectedUser.id)}>
                    Verify User
                  </button>
                )}
                {selectedUser.isVerified && (
                  <button type="button" disabled style={{ opacity: 0.6 }}>
                    Verified
                  </button>
                )}
                <button type="button" onClick={() => alert(`Reset password for ${selectedUser.email}`)}>
                  Reset Password
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No account selected</h3>
              <p>Select a user from the list to view account details.</p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}