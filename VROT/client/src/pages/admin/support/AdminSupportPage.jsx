import React, { useMemo, useState } from "react";
import "./AdminSupportPage.css";

const mockTickets = [
  {
    id: "TKT-1001",
    citizen: "Ravi Kumar",
    contact: "ravi@gmail.com",
    category: "Ownership Transfer",
    priority: "High",
    status: "Open",
    date: "2026-06-01",
    subject: "Transfer request stuck",
    conversation: [
      { sender: "Citizen", text: "My ownership transfer is stuck for 5 days." },
      { sender: "Support", text: "We are reviewing your request." }
    ]
  },
  {
    id: "TKT-1002",
    citizen: "Anjali Devi",
    contact: "9876543210",
    category: "Technical Issue",
    priority: "Medium",
    status: "Pending",
    date: "2026-06-03",
    subject: "Document upload failed",
    conversation: [
      { sender: "Citizen", text: "Upload keeps failing." }
    ]
  },
  {
    id: "TKT-1003",
    citizen: "Suresh Reddy",
    contact: "suresh@gmail.com",
    category: "Registration",
    priority: "Low",
    status: "Resolved",
    date: "2026-06-05",
    subject: "RC download issue",
    conversation: [
      { sender: "Citizen", text: "Unable to download RC." },
      { sender: "Support", text: "Issue resolved. Please try again." }
    ]
  }
];

const AdminSupportPage = () => {
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState(mockTickets[0]);
  const [reply, setReply] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: ""
  });

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      return (
        (!filters.status || ticket.status === filters.status) &&
        (!filters.priority || ticket.priority === filters.priority) &&
        (!filters.category || ticket.category === filters.category)
      );
    });
  }, [tickets, filters]);

  const updateStatus = (status) => {
    if (!selectedTicket) return;

    const updated = tickets.map((ticket) =>
      ticket.id === selectedTicket.id ? { ...ticket, status } : ticket
    );

    setTickets(updated);
    setSelectedTicket({ ...selectedTicket, status });
  };

  const sendReply = () => {
    if (!reply.trim() || !selectedTicket) return;

    const updatedTicket = {
      ...selectedTicket,
      conversation: [
        ...selectedTicket.conversation,
        { sender: "Admin", text: reply }
      ]
    };

    const updatedTickets = tickets.map((ticket) =>
      ticket.id === selectedTicket.id ? updatedTicket : ticket
    );

    setTickets(updatedTickets);
    setSelectedTicket(updatedTicket);
    setReply("");
  };

  const summary = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "Open").length,
    pending: tickets.filter((t) => t.status === "Pending").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
    closed: tickets.filter((t) => t.status === "Closed").length
  };

  return (
    <div className="admin-support-page">
      <div className="support-header">
        <h1>Admin Support Center</h1>
        <p>
          Manage citizen complaints, technical issues, service queries and
          support requests for VROT.
        </p>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <h3>{summary.total}</h3>
          <span>Total Tickets</span>
        </div>

        <div className="summary-card">
          <h3>{summary.open}</h3>
          <span>Open</span>
        </div>

        <div className="summary-card">
          <h3>{summary.pending}</h3>
          <span>Pending</span>
        </div>

        <div className="summary-card">
          <h3>{summary.resolved}</h3>
          <span>Resolved</span>
        </div>

        <div className="summary-card">
          <h3>{summary.closed}</h3>
          <span>Closed</span>
        </div>
      </div>

      <div className="filter-row">
        <select
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
        >
          <option value="">All Status</option>
          <option>Open</option>
          <option>Pending</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>

        <select
          onChange={(e) =>
            setFilters({ ...filters, priority: e.target.value })
          }
        >
          <option value="">All Priority</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value })
          }
        >
          <option value="">All Categories</option>
          <option>Ownership Transfer</option>
          <option>Technical Issue</option>
          <option>Registration</option>
        </select>
      </div>

      <div className="support-content">
        <div className="ticket-list">
          <h3>Support Tickets</h3>

          {filteredTickets.length === 0 ? (
            <div className="empty-state">
              No support tickets found.
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`ticket-item ${
                  selectedTicket?.id === ticket.id ? "active" : ""
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <h4>{ticket.id}</h4>
                <p>{ticket.subject}</p>
                <span className={`status-badge ${ticket.status.toLowerCase()}`}>
                  {ticket.status}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="ticket-detail">
          {selectedTicket ? (
            <>
              <div className="ticket-meta">
                <h2>{selectedTicket.subject}</h2>

                <p><strong>Ticket ID:</strong> {selectedTicket.id}</p>
                <p><strong>Citizen:</strong> {selectedTicket.citizen}</p>
                <p><strong>Contact:</strong> {selectedTicket.contact}</p>
                <p><strong>Category:</strong> {selectedTicket.category}</p>
                <p><strong>Priority:</strong> {selectedTicket.priority}</p>
                <p><strong>Status:</strong> {selectedTicket.status}</p>
                <p><strong>Date:</strong> {selectedTicket.date}</p>
              </div>

              <div className="conversation-box">
                {selectedTicket.conversation.map((msg, index) => (
                  <div key={index} className="message">
                    <strong>{msg.sender}:</strong> {msg.text}
                  </div>
                ))}
              </div>

              <div className="reply-box">
                <textarea
                  placeholder="Type a reply or canned response..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />

                <div className="action-buttons">
                  <button onClick={sendReply}>Reply</button>
                  <button onClick={() => updateStatus("Pending")}>
                    Mark Pending
                  </button>
                  <button onClick={() => updateStatus("Resolved")}>
                    Mark Resolved
                  </button>
                  <button onClick={() => updateStatus("Closed")}>
                    Close Ticket
                  </button>
                  <button onClick={() => updateStatus("Escalated")}>
                    Escalate
                  </button>
                </div>
              </div>

              <div className="notes-box">
                <h4>Internal Notes</h4>
                <textarea placeholder="Add internal admin notes..." />
              </div>
            </>
          ) : (
            <div className="empty-state">
              Select a ticket to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportPage;