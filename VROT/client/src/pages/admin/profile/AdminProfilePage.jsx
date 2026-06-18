import React, { useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";   // ✅ fixed path
import "./AdminProfilePage.css";

const initialProfile = {
  fullName: "Ravi Kumar",
  email: "admin@vrot.gov.in",
  phone: "+91 98765 43210",
  adminId: "VROT-ADM-001",
  department: "Transport Department",
  role: "Super Admin",
  location: "Hyderabad, Telangana",
  joinedDate: "12 Jan 2025",
  lastLogin: "08 Jun 2026, 08:45 AM",
  avatarUrl: "",
};

export default function AdminProfilePage() {
  const { user, requestPasswordResetOtp, changePasswordWithOtp } = useAuth();
  const [profile] = useState(initialProfile);
  const [formData, setFormData] = useState(initialProfile);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  // const [loading, setLoading] = useState(false); // removed

  // Password & OTP states
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStep, setPasswordStep] = useState(1);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  const [avatarPreview, setAvatarPreview] = useState("");

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(profile) !== JSON.stringify(formData) ||
      passwords.currentPassword ||
      passwords.newPassword ||
      passwords.confirmPassword ||
      avatarPreview
    );
  }, [profile, formData, passwords, avatarPreview]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setOtpError("");
    setOtpSuccess("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const validatePasswordForm = () => {
    if (!passwords.currentPassword.trim()) return "Current password is required.";
    if (passwords.newPassword.length < 6) return "New password must be at least 6 characters.";
    if (passwords.newPassword !== passwords.confirmPassword) return "Passwords do not match.";
    return "";
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const validation = validatePasswordForm();
    if (validation) {
      setOtpError(validation);
      return;
    }

    const email = user?.email;
    if (!email) {
      setOtpError("Admin email not found.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    setOtpSuccess("");

    const result = await requestPasswordResetOtp(email);
    setOtpLoading(false);

    if (result.success) {
      setOtpSuccess("OTP sent to your admin email.");
      setPasswordStep(2);
    } else {
      setOtpError(result.message || "Failed to send OTP.");
    }
  };

  // Step 2: Verify OTP & change password
  const handleVerifyOtpAndChange = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setOtpError("Please enter a valid OTP.");
      return;
    }

    const email = user?.email;
    if (!email) {
      setOtpError("Admin email not found.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    setOtpSuccess("");

    const result = await changePasswordWithOtp(
      email,
      otpCode,
      passwords.currentPassword,
      passwords.newPassword
    );

    setOtpLoading(false);

    if (result.success) {
      setOtpSuccess("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setOtpCode("");
      setPasswordStep(1);
      setMessage("Password updated successfully.");
      setMessageType("success");
    } else {
      setOtpError(result.message || "Failed to change password.");
    }
  };

  const handleReset = () => {
    setFormData(profile);
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setAvatarPreview("");
    setOtpError("");
    setOtpSuccess("");
    setPasswordStep(1);
    setMessage("");
  };

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-shell">
        <div className="profile-header">
          <div>
            <p className="profile-eyebrow">Admin Access</p>
            <h1>Admin Profile</h1>
            <p className="profile-subtitle">
              Manage your official VROT admin identity, contact details, and password in one secure place.
            </p>
          </div>
          <div className="profile-status-card">
            <span className="status-label">Role</span>
            <strong>{formData.role}</strong>
            <span className="status-meta">{formData.department}</span>
          </div>
        </div>

        {message && (
          <div className={`profile-message ${messageType}`}>{message}</div>
        )}

        <form className="profile-grid" onSubmit={handleSendOtp}>
          <section className="profile-card avatar-card">
            <div className="section-title">
              <h2>Profile Image</h2>
              <p>Upload an official admin photo.</p>
            </div>

            <div className="avatar-wrap">
              <div className="avatar-circle">
                {avatarPreview || formData.avatarUrl ? (
                  <img
                    src={avatarPreview || formData.avatarUrl}
                    alt="Admin avatar"
                    className="avatar-image"
                  />
                ) : (
                  <span className="avatar-placeholder">
                    {formData.fullName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="avatar-actions">
                <label className="upload-btn">
                  Upload Image
                  <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                </label>
                <p className="helper-text">PNG, JPG, or JPEG. Keep it professional.</p>
              </div>
            </div>

            <div className="meta-list">
              <div>
                <span>Admin ID</span>
                <strong>{formData.adminId}</strong>
              </div>
              <div>
                <span>Joined</span>
                <strong>{formData.joinedDate}</strong>
              </div>
              <div>
                <span>Last Login</span>
                <strong>{formData.lastLogin}</strong>
              </div>
            </div>
          </section>

          <section className="profile-card form-card">
            <div className="section-title">
              <h2>Admin Details</h2>
              <p>Update your official profile information.</p>
            </div>

            <div className="form-grid-two">
              <div className="field-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleProfileChange}
                  placeholder="Enter full name"
                />
              </div>

              <div className="field-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  placeholder="Enter email"
                />
              </div>

              <div className="field-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="field-group">
                <label>Admin ID</label>
                <input
                  type="text"
                  name="adminId"
                  value={formData.adminId}
                  onChange={handleProfileChange}
                  placeholder="Enter admin ID"
                />
              </div>

              <div className="field-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleProfileChange}
                  placeholder="Enter department"
                />
              </div>

              <div className="field-group">
                <label>Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleProfileChange}
                  placeholder="Enter role"
                />
              </div>

              <div className="field-group full-width">
                <label>Office / Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleProfileChange}
                  placeholder="Enter office location"
                />
              </div>
            </div>
          </section>

          <section className="profile-card password-card">
            <div className="section-title">
              <h2>Password Change</h2>
              <p>Use a strong password for admin access.</p>
            </div>

            {passwordStep === 1 ? (
              <div className="form-grid-two">
                <div className="field-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="field-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="field-group full-width">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                </div>

                {otpError && <div className="alert error">{otpError}</div>}
                {otpSuccess && <div className="alert success">{otpSuccess}</div>}

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={otpLoading}
                  onClick={handleSendOtp}
                >
                  {otpLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            ) : (
              <div className="form-grid-two">
                <div className="field-group full-width">
                  <label>OTP Code</label>
                  <input
                    type="text"
                    placeholder="Enter OTP sent to your admin email"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>

                {otpError && <div className="alert error">{otpError}</div>}
                {otpSuccess && <div className="alert success">{otpSuccess}</div>}

                <div className="otp-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      setPasswordStep(1);
                      setOtpCode("");
                      setOtpError("");
                      setOtpSuccess("");
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleVerifyOtpAndChange}
                    disabled={otpLoading}
                  >
                    {otpLoading ? "Verifying..." : "Verify & Change Password"}
                  </button>
                </div>
              </div>
            )}
          </section>

          <div className="action-bar">
            <button type="button" className="secondary-btn" onClick={handleReset} disabled={!hasChanges}>
              Cancel / Reset
            </button>
            <button
              type="submit"
              className="primary-btn"
              disabled={!hasChanges || passwordStep === 2}
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}