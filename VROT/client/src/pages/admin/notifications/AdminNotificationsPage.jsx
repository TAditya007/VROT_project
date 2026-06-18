import React, { useMemo, useState } from 'react';
import './AdminNotificationsPage.css';

const initialNotifications = [
  {
    id: 1,
    title: 'Ownership transfer approved',
    message: 'Application #VROT-2048 was approved after document verification.',
    type: 'application',
    priority: 'urgent',
    read: false,
    archived: false,
    time: '2 min ago',
    actionLabel: 'View application',
  },
  {
    id: 2,
    title: 'New user registered',
    message: 'A new citizen account was created from Hyderabad, Telangana.',
    type: 'user',
    priority: 'medium',
    read: false,
    archived: false,
    time: '18 min ago',
    actionLabel: 'Review user',
  },
  {
    id: 3,
    title: 'Server latency detected',
    message: 'API response time increased above threshold for 4 minutes.',
    type: 'system',
    priority: 'urgent',
    read: true,
    archived: false,
    time: '1 hour ago',
    actionLabel: 'Inspect system',
  },
  {
    id: 4,
    title: 'Suspicious login attempt',
    message: 'Multiple failed login attempts were blocked for admin account.',
    type: 'security',
    priority: 'high',
    read: false,
    archived: false,
    time: '3 hours ago',
    actionLabel: 'Check security',
  },
  {
    id: 5,
    title: 'Fitness certificate uploaded',
    message: 'Applicant uploaded a new fitness certificate for verification.',
    type: 'application',
    priority: 'low',
    read: true,
    archived: false,
    time: 'Yesterday',
    actionLabel: 'Open document',
  },
  {
    id: 6,
    title: 'Payment confirmation received',
    message: 'Fee payment for registration request was completed successfully.',
    type: 'system',
    priority: 'medium',
    read: true,
    archived: false,
    time: 'Yesterday',
    actionLabel: 'View receipt',
  },
];

const typeOptions = ['all', 'application', 'user', 'system', 'security'];
const statusOptions = ['all', 'unread', 'read'];
const priorityOptions = ['all', 'urgent', 'high', 'medium', 'low'];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedId, setSelectedId] = useState(initialNotifications[0]?.id || null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const visibleNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'read' && item.read) ||
        (statusFilter === 'unread' && !item.read);
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
      const matchesSearch =
        searchTerm.trim() === '' ||
        `${item.title} ${item.message}`.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesStatus && matchesPriority && matchesSearch && !item.archived;
    });
  }, [notifications, typeFilter, statusFilter, priorityFilter, searchTerm]);

  const selectedNotification = visibleNotifications.find((item) => item.id === selectedId) || visibleNotifications[0] || null;

  const summary = useMemo(() => {
    const active = notifications.filter((item) => !item.archived);
    return {
      total: active.length,
      unread: active.filter((item) => !item.read).length,
      read: active.filter((item) => item.read).length,
      urgent: active.filter((item) => item.priority === 'urgent').length,
    };
  }, [notifications]);

  const updateNotification = (id, updater) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
  };

  const markAsRead = (id) => {
    updateNotification(id, (item) => ({ ...item, read: true }));
  };

  const toggleReadState = (id) => {
    updateNotification(id, (item) => ({ ...item, read: !item.read }));
  };

  const archiveNotification = (id) => {
    updateNotification(id, (item) => ({ ...item, archived: true }));
    if (selectedId === id) setSelectedId(null);
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <div className="admin-notifications-page">
      <div className="admin-notifications-shell">
        <div className="page-header">
          <div>
            <p className="eyebrow">Admin only</p>
            <h1>Notifications Center</h1>
            <p className="page-description">
              Review application updates, user actions, system alerts, and important security messages in one place.
            </p>
          </div>
          <button className="primary-action" onClick={markAllAsRead} type="button">
            Mark all as read
          </button>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <span>Total</span>
            <strong>{summary.total}</strong>
          </div>
          <div className="summary-card unread">
            <span>Unread</span>
            <strong>{summary.unread}</strong>
          </div>
          <div className="summary-card">
            <span>Read</span>
            <strong>{summary.read}</strong>
          </div>
          <div className="summary-card urgent">
            <span>Urgent</span>
            <strong>{summary.urgent}</strong>
          </div>
        </div>

        <div className="filters-row">
          <input
            className="search-input"
            type="search"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All types' : option}
              </option>
            ))}
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            {priorityOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All priorities' : option}
              </option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All status' : option}
              </option>
            ))}
          </select>
        </div>

        <div className="content-grid">
          <div className="notification-list-panel">
            <div className="panel-header">
              <h2>Inbox</h2>
              <span>{visibleNotifications.length} items</span>
            </div>

            {visibleNotifications.length === 0 ? (
              <div className="empty-state">
                <h3>No notifications found</h3>
                <p>Try changing the filters or search term to view more results.</p>
              </div>
            ) : (
              <div className="notification-list">
                {visibleNotifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`notification-item ${selectedNotification?.id === item.id ? 'active' : ''} ${item.read ? 'read' : 'unread'}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="notification-topline">
                      <span className={`badge ${item.type}`}>{item.type}</span>
                      <span className={`priority ${item.priority}`}>{item.priority}</span>
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.message}</p>

                    <div className="notification-meta">
                      <span>{item.time}</span>
                      <span>{item.read ? 'Read' : 'Unread'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="detail-panel">
            <div className="panel-header">
              <h2>Notification details</h2>
              <span>{selectedNotification ? selectedNotification.time : 'No selection'}</span>
            </div>

            {selectedNotification ? (
              <div className="detail-card">
                <div className="detail-tags">
                  <span className={`badge ${selectedNotification.type}`}>{selectedNotification.type}</span>
                  <span className={`priority ${selectedNotification.priority}`}>{selectedNotification.priority}</span>
                  <span className={`read-state ${selectedNotification.read ? 'read' : 'unread'}`}>
                    {selectedNotification.read ? 'Read' : 'Unread'}
                  </span>
                </div>

                <h3>{selectedNotification.title}</h3>
                <p>{selectedNotification.message}</p>

                <div className="detail-actions">
                  <button type="button" onClick={() => markAsRead(selectedNotification.id)}>
                    Mark as read
                  </button>
                  <button type="button" onClick={() => toggleReadState(selectedNotification.id)}>
                    Toggle read/unread
                  </button>
                  <button type="button" onClick={() => archiveNotification(selectedNotification.id)}>
                    Archive
                  </button>
                  <button type="button" className="danger" onClick={() => deleteNotification(selectedNotification.id)}>
                    Delete
                  </button>
                </div>

                <div className="detail-note">
                  <strong>Category:</strong> {selectedNotification.type}
                  <br />
                  <strong>Priority:</strong> {selectedNotification.priority}
                  <br />
                  <strong>Action:</strong> {selectedNotification.actionLabel}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <h3>Select a notification</h3>
                <p>Choose an item from the inbox to preview full details and quick actions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}