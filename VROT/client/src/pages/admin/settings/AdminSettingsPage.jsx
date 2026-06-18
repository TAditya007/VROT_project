import React, { useMemo, useState } from "react";
import "./AdminSettingsPage.css";

const initialSettings = {
  profile: {
    fullName: "Admin Officer",
    email: "admin@vrot.gov.in",
    phone: "+91 90000 00000",
    department: "Transport Services",
    accountType: "Admin",
    lastUpdated: "08 Jun 2026, 2:15 PM",
  },
  security: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: true,
    sessionTimeout: "30",
    loginAlerts: true,
  },
  notifications: {
    emailAlerts: true,
    smsAlerts: true,
    applicationUpdates: true,
    ownershipAlerts: false,
    systemAnnouncements: true,
  },
  appearance: {
    theme: "transparent-dark",
    density: "comfortable",
    accent: "cyan",
  },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState("");

  const canSave = useMemo(
    () => settings.profile.fullName.trim().length > 0 && settings.profile.email.trim().length > 0,
    [settings.profile.fullName, settings.profile.email]
  );

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, [name]: value },
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [name]: checked },
    }));
  };

  const handleAppearanceChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, [name]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Settings saved successfully.");
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setMessage("Changes reset to default values.");
  };

  return (
    <div className="admin-settings-page">
      <div className="admin-settings-overlay" />
      <div className="admin-settings-shell">
        <section className="admin-settings-header">
          <div className="admin-settings-title-block">
            <p className="admin-settings-eyebrow">VROT Admin Panel</p>
            <h1>Admin Settings</h1>
            <p className="admin-settings-subtitle">
              Manage profile preferences, security settings, notifications, and appearance in a transparent government-style dashboard.
            </p>
          </div>

          <div className="admin-settings-meta">
            <div className="meta-card">
              <span>Account Type</span>
              <strong>{settings.profile.accountType}</strong>
            </div>
            <div className="meta-card">
              <span>Last Updated</span>
              <strong>{settings.profile.lastUpdated}</strong>
            </div>
          </div>
        </section>

        <form className="admin-settings-grid" onSubmit={handleSubmit}>
          <section className="settings-card">
            <div className="section-badge cyan-badge">Active Module</div>
            <div className="card-header">
              <h2>Account Settings</h2>
              <p>Update the profile information used across admin operations.</p>
            </div>

            <div className="form-grid">
              <label>
                Full Name
                <input type="text" name="fullName" value={settings.profile.fullName} onChange={handleProfileChange} />
              </label>

              <label>
                Email Address
                <input type="email" name="email" value={settings.profile.email} onChange={handleProfileChange} />
              </label>

              <label>
                Phone Number
                <input type="text" name="phone" value={settings.profile.phone} onChange={handleProfileChange} />
              </label>

              <label>
                Department
                <input type="text" name="department" value={settings.profile.department} onChange={handleProfileChange} />
              </label>
            </div>
          </section>

          <section className="settings-card">
            <div className="section-badge purple-badge">System Defaults</div>
            <div className="card-header">
              <h2>Security Settings</h2>
              <p>Control password access, session timeout, and login protection.</p>
            </div>

            <div className="form-grid">
              <label>
                Current Password
                <input
                  type="password"
                  name="currentPassword"
                  value={settings.security.currentPassword}
                  onChange={handleSecurityChange}
                  placeholder="Enter current password"
                />
              </label>

              <label>
                New Password
                <input
                  type="password"
                  name="newPassword"
                  value={settings.security.newPassword}
                  onChange={handleSecurityChange}
                  placeholder="Enter new password"
                />
              </label>

              <label>
                Confirm Password
                <input
                  type="password"
                  name="confirmPassword"
                  value={settings.security.confirmPassword}
                  onChange={handleSecurityChange}
                  placeholder="Confirm new password"
                />
              </label>

              <label>
                Session Timeout
                <select name="sessionTimeout" value={settings.security.sessionTimeout} onChange={handleSecurityChange}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="120">2 hours</option>
                </select>
              </label>
            </div>

            <div className="toggle-list">
              <label className="toggle-row">
                <span>
                  <strong>Two-Factor Authentication</strong>
                  <small>Add an extra verification step at sign-in.</small>
                </span>
                <input
                  type="checkbox"
                  name="twoFactorEnabled"
                  checked={settings.security.twoFactorEnabled}
                  onChange={handleSecurityChange}
                />
                <span className="toggle-switch" />
              </label>

              <label className="toggle-row">
                <span>
                  <strong>Login Alerts</strong>
                  <small>Receive alerts for new device or unusual login activity.</small>
                </span>
                <input
                  type="checkbox"
                  name="loginAlerts"
                  checked={settings.security.loginAlerts}
                  onChange={handleSecurityChange}
                />
                <span className="toggle-switch" />
              </label>
            </div>
          </section>

          <section className="settings-card">
            <div className="section-badge amber-badge">Disabled Module</div>
            <div className="card-header">
              <h2>Notification Settings</h2>
              <p>Choose how the system should notify you about application activity.</p>
            </div>

            <div className="toggle-list">
              <label className="toggle-row">
                <span>
                  <strong>Email Alerts</strong>
                  <small>Receive important updates through email.</small>
                </span>
                <input
                  type="checkbox"
                  name="emailAlerts"
                  checked={settings.notifications.emailAlerts}
                  onChange={handleNotificationChange}
                />
                <span className="toggle-switch" />
              </label>

              <label className="toggle-row">
                <span>
                  <strong>SMS Alerts</strong>
                  <small>Get critical notifications on mobile.</small>
                </span>
                <input
                  type="checkbox"
                  name="smsAlerts"
                  checked={settings.notifications.smsAlerts}
                  onChange={handleNotificationChange}
                />
                <span className="toggle-switch" />
              </label>

              <label className="toggle-row">
                <span>
                  <strong>Application Updates</strong>
                  <small>Track new submissions and status changes.</small>
                </span>
                <input
                  type="checkbox"
                  name="applicationUpdates"
                  checked={settings.notifications.applicationUpdates}
                  onChange={handleNotificationChange}
                />
                <span className="toggle-switch" />
              </label>

              <label className="toggle-row">
                <span>
                  <strong>Ownership Transfer Alerts</strong>
                  <small>Monitor transfer requests and approvals.</small>
                </span>
                <input
                  type="checkbox"
                  name="ownershipAlerts"
                  checked={settings.notifications.ownershipAlerts}
                  onChange={handleNotificationChange}
                />
                <span className="toggle-switch" />
              </label>

              <label className="toggle-row">
                <span>
                  <strong>System Announcements</strong>
                  <small>Stay informed about maintenance or policy changes.</small>
                </span>
                <input
                  type="checkbox"
                  name="systemAnnouncements"
                  checked={settings.notifications.systemAnnouncements}
                  onChange={handleNotificationChange}
                />
                <span className="toggle-switch" />
              </label>
            </div>
          </section>

          <section className="settings-card">
            <div className="section-badge emerald-badge">Custom Configuration</div>
            <div className="card-header">
              <h2>Appearance Settings</h2>
              <p>Adjust the interface to match your preferred dashboard style.</p>
            </div>

            <div className="form-grid">
              <label>
                Theme
                <select name="theme" value={settings.appearance.theme} onChange={handleAppearanceChange}>
                  <option value="transparent-dark">Transparent Dark</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </label>

              <label>
                Density
                <select name="density" value={settings.appearance.density} onChange={handleAppearanceChange}>
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </label>

              <label>
                Accent Color
                <select name="accent" value={settings.appearance.accent} onChange={handleAppearanceChange}>
                  <option value="cyan">Cyan</option>
                  <option value="purple">Purple</option>
                  <option value="emerald">Emerald</option>
                </select>
              </label>
            </div>
          </section>

          <section className="settings-card action-card">
            {message && <div className="status-message">{message}</div>}

            <div className="action-buttons">
              <button type="button" className="secondary-btn" onClick={handleReset}>
                Reset
              </button>
              <button type="submit" className="primary-btn" disabled={!canSave}>
                Save Settings
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}