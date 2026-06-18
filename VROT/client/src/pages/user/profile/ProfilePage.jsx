import React, { useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";  // ✅ fixed path
import "./ProfilePage.css";

const initialProfile = {
  fullName: "Aarav Kumar",
  email: "aarav.kumar@example.com",
  phone: "+91 98765 43210",
  address: "LB Nagar, Hyderabad, Telangana",
  userId: "VROT-USER-2048",
  role: "Citizen",
  aadhaarId: "XXXX-XXXX-4821",
  drivingLicense: "TS09 2024 918273",
  voterId: "TS/VR/129387",
  avatar: "",
};

export default function ProfilePage() {
  const { user, requestPasswordResetOtp, changePasswordWithOtp } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // OTP password change states
  const [passwordStep, setPasswordStep] = useState(1); // 1: fill, 2: verify OTP
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  const hasChanges = useMemo(() => {
    return JSON.stringify(profile) !== JSON.stringify(draft) || Object.values(passwords).some(Boolean);
  }, [profile, draft, passwords]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMessage("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMessage("");
    setOtpError("");
    setOtpSuccess("");
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setDraft((prev) => ({ ...prev, avatar: previewUrl }));
    setEditing(true);
  };

  const validatePasswordForm = () => {
    if (!passwords.currentPassword.trim()) return "Current password is required.";
    if (passwords.newPassword.length < 6) return "New password must be at least 6 characters.";
    if (passwords.newPassword !== passwords.confirmPassword) return "Passwords do not match.";
    return "";
  };

  // ----- Step 1: Send OTP -----
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const validation = validatePasswordForm();
    if (validation) {
      setOtpError(validation);
      return;
    }

    const email = user?.email || draft.email;
    if (!email) {
      setOtpError("User email not found. Please update your profile first.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    setOtpSuccess("");

    const result = await requestPasswordResetOtp(email);
    setOtpLoading(false);

    if (result.success) {
      setOtpSuccess("OTP sent to your email. Please check your inbox.");
      setPasswordStep(2);
    } else {
      setOtpError(result.message || "Failed to send OTP. Please try again.");
    }
  };

  // ----- Step 2: Verify OTP & change password -----
  const handleVerifyOtpAndChange = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setOtpError("Please enter a valid OTP.");
      return;
    }

    const email = user?.email || draft.email;
    if (!email) {
      setOtpError("User email not found.");
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
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setOtpCode("");
      setPasswordStep(1);
      setMessage("Password updated successfully.");
    } else {
      setOtpError(result.message || "Failed to change password.");
    }
  };

  const handleCancel = () => {
    setDraft(profile);
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setEditing(false);
    setAvatarPreview(profile.avatar);
    setError("");
    setMessage("Changes discarded.");
    setPasswordStep(1);
    setOtpCode("");
    setOtpError("");
    setOtpSuccess("");
  };

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <section className="profile-header">
          <div>
            <p className="profile-kicker">VROT Account Center</p>
            <h1>Profile</h1>
            <p className="profile-subtitle">
              View and update your account details, ID records, and password in one secure place.
            </p>
          </div>
          <div className="profile-status">
            <span className="status-dot" />
            Active user session
          </div>
        </section>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <form className="profile-grid" onSubmit={handleSendOtp}>
          <aside className="profile-card avatar-card">
            <div className="avatar-wrap">
              <img
                src={avatarPreview || profile.avatar || "https://via.placeholder.com/160x160?text=User"}
                alt="Profile avatar"
                className="avatar"
              />
              <label className="avatar-upload">
                Change Photo
                <input type="file" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>

            <div className="basic-info">
              <h2>{draft.fullName || "Your Name"}</h2>
              <p>{draft.role}</p>
              <span>{draft.userId}</span>
            </div>

            <div className="id-stack">
              <div>
                <small>User ID</small>
                <strong>{draft.userId}</strong>
              </div>
              <div>
                <small>Government ID</small>
                <strong>{draft.aadhaarId}</strong>
              </div>
            </div>
          </aside>

          <section className="profile-card form-card">
            <div className="section-head">
              <h2>Personal Information</h2>
              <button
                type="button"
                className="edit-toggle"
                onClick={() => setEditing((prev) => !prev)}
              >
                {editing ? "Editing Enabled" : "Enable Edit"}
              </button>
            </div>

            <div className="form-grid">
              <label>
                Full Name
                <input
                  type="text"
                  name="fullName"
                  value={draft.fullName}
                  onChange={handleProfileChange}
                  disabled={!editing}
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={draft.email}
                  onChange={handleProfileChange}
                  disabled={!editing}
                />
              </label>

              <label>
                Phone Number
                <input
                  type="text"
                  name="phone"
                  value={draft.phone}
                  onChange={handleProfileChange}
                  disabled={!editing}
                />
              </label>

              <label>
                Role
                <input type="text" name="role" value={draft.role} readOnly />
              </label>

              <label className="full-width">
                Address
                <textarea
                  name="address"
                  value={draft.address}
                  onChange={handleProfileChange}
                  disabled={!editing}
                  rows="3"
                />
              </label>

              <div className="readonly-grid full-width">
                <div>
                  <small>Aadhaar ID</small>
                  <strong>{draft.aadhaarId}</strong>
                </div>
                <div>
                  <small>Driving License</small>
                  <strong>{draft.drivingLicense}</strong>
                </div>
                <div>
                  <small>Voter ID</small>
                  <strong>{draft.voterId}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-card password-card">
            <h2>Password Change</h2>
            <p>Update your password for better account security.</p>

            {passwordStep === 1 ? (
              // Step 1: Fill passwords and send OTP
              <div className="form-grid">
                <label>
                  Current Password
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                </label>

                <label>
                  New Password
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                </label>

                <label className="full-width">
                  Confirm Password
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Re-enter new password"
                  />
                </label>

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
              // Step 2: Enter OTP
              <div className="form-grid">
                <label className="full-width">
                  OTP Code
                  <input
                    type="text"
                    placeholder="Enter OTP sent to your email"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </label>

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

          <section className="action-row full-width">
            <button type="button" className="secondary-btn" onClick={handleCancel} disabled={!hasChanges}>
              Cancel / Reset
            </button>
            <button type="submit" className="primary-btn" style={{ display: passwordStep === 2 ? 'none' : 'inline-block' }}>
              Save Profile
            </button>
          </section>
        </form>
      </div>
    </div>
  );
}