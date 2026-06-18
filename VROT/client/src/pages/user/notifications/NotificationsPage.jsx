import React, { useMemo, useState } from 'react';
import notificationsBg from '../../../assets/notification/notifications.jpg';
import './NotificationsPage.css';

const initialNotifications = [
  {
    id: 1,
    title: 'Payment successful',
    message: 'Your vehicle registration payment has been received successfully.',
    timestamp: 'Today • 10:45 AM',
    type: 'Payment',
    priority: 'success',
    isRead: false,
    actionLabel: 'Download Receipt',
  },
  {
    id: 2,
    title: 'Document rejected',
    message: 'Insurance document was unclear. Please re-upload a sharper copy.',
    timestamp: 'Today • 09:20 AM',
    type: 'Documents',
    priority: 'high',
    isRead: false,
    actionLabel: 'Re-upload Documents',
  },
  {
    id: 3,
    title: 'NOC submitted',
    message: 'Your NOC request has been submitted and is now under verification.',
    timestamp: 'Yesterday • 06:10 PM',
    type: 'Status Updates',
    priority: 'info',
    isRead: true,
    actionLabel: 'View Status',
  },
  {
    id: 4,
    title: 'Ownership transfer under review',
    message: 'Your ownership transfer request is currently being reviewed by the department.',
    timestamp: 'Yesterday • 03:35 PM',
    type: 'Status Updates',
    priority: 'warning',
    isRead: false,
    actionLabel: 'View Status',
  },
  {
    id: 5,
    title: 'RC ready for download',
    message: 'Your updated RC is approved and ready for download.',
    timestamp: 'May 31 • 11:00 AM',
    type: 'Documents',
    priority: 'success',
    isRead: true,
    actionLabel: 'Download RC',
  },
  {
    id: 6,
    title: 'System maintenance notice',
    message: 'VROT services may be briefly unavailable tonight from 11:30 PM to 12:30 AM.',
    timestamp: 'May 30 • 08:15 PM',
    type: 'System Alerts',
    priority: 'system',
    isRead: false,
    actionLabel: 'View Details',
  },
  {
    id: 7,
    title: 'Document verification completed',
    message: 'Your uploaded address proof has been verified successfully.',
    timestamp: 'May 30 • 01:40 PM',
    type: 'Documents',
    priority: 'success',
    isRead: true,
    actionLabel: 'View Status',
  },
  {
    id: 8,
    title: 'Action required',
    message: 'Please complete the pending ownership transfer fee to continue processing.',
    timestamp: 'May 29 • 05:25 PM',
    type: 'Payment',
    priority: 'high',
    isRead: false,
    actionLabel: 'Pay Now',
  },
];

const filterOptions = ['All', 'Unread', 'Payment', 'Documents', 'Status Updates', 'System Alerts'];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState('All');

  const summaryStats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((item) => !item.isRead).length;
    const actionRequired = notifications.filter(
      (item) => !item.isRead && (item.priority === 'high' || item.priority === 'warning')
    ).length;
    const completed = notifications.filter(
      (item) => item.priority === 'success' || item.title.toLowerCase().includes('ready')
    ).length;

    return { total, unread, actionRequired, completed };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'All') return notifications;
    if (activeFilter === 'Unread') return notifications.filter((item) => !item.isRead);
    return notifications.filter((item) => item.type === activeFilter);
  }, [activeFilter, notifications]);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'warning':
        return 'Attention';
      case 'success':
        return 'Completed';
      case 'system':
        return 'System';
      default:
        return 'Update';
    }
  };

  return (
    <div
      className="notifications-page"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${notificationsBg})`,
      }}
    >
      <div className="notifications-container">
        <header className="notifications-header">
          <div>
            <span className="notifications-eyebrow">VROT Notification Centre</span>
            <h1>Notifications</h1>
            <p>
              Track approvals, payment updates, document issues, reminders, and important system notices in one place.
            </p>
          </div>

          <button type="button" className="mark-all-btn" onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        </header>

        <section className="notifications-summary">
          <article className="summary-card">
            <span className="summary-label">Total</span>
            <h3>{summaryStats.total}</h3>
            <p>All notifications received.</p>
          </article>

          <article className="summary-card">
            <span className="summary-label">Unread</span>
            <h3>{summaryStats.unread}</h3>
            <p>Messages waiting for your attention.</p>
          </article>

          <article className="summary-card">
            <span className="summary-label">Action Required</span>
            <h3>{summaryStats.actionRequired}</h3>
            <p>Items that may need a next step.</p>
          </article>

          <article className="summary-card">
            <span className="summary-label">Completed</span>
            <h3>{summaryStats.completed}</h3>
            <p>Approved or successfully finished updates.</p>
          </article>
        </section>

        <section className="notifications-filters">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </section>

        <section className="notifications-list-section">
          {filteredNotifications.length > 0 ? (
            <div className="notifications-list">
              {filteredNotifications.map((item) => (
                <article
                  key={item.id}
                  className={`notification-card ${item.isRead ? 'read' : 'unread'} priority-${item.priority}`}
                >
                  <div className="notification-top">
                    <div className="notification-title-wrap">
                      <div className="notification-title-row">
                        <h3>{item.title}</h3>
                        {!item.isRead && <span className="unread-dot" />}
                      </div>

                      <div className="notification-meta">
                        <span className={`type-badge type-${item.type.toLowerCase().replace(/\s+/g, '-')}`}>
                          {item.type}
                        </span>
                        <span className={`priority-badge priority-badge-${item.priority}`}>
                          {getPriorityLabel(item.priority)}
                        </span>
                        <span className="notification-time">{item.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <p className="notification-message">{item.message}</p>

                  <div className="notification-actions">
                    <button type="button" className="action-btn primary-action">
                      {item.actionLabel}
                    </button>

                    {!item.isRead && (
                      <button
                        type="button"
                        className="action-btn secondary-action"
                        onClick={() => handleMarkAsRead(item.id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3>No notifications found</h3>
              <p>
                There are no messages in this category right now. Try switching filters to view other updates.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default NotificationsPage;