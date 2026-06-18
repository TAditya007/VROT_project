import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bgImage from "../../assets/authentication/background.png";
import AuthTopBar from "../auth/AuthTopBar";
import { useAuth } from "../../context/AuthContext";
import "./ForgotPasswordPage.css";

const ForgotPasswordPage = () => {
  const { requestPasswordResetOtp, verifyOtp, resetPasswordWithOtp } = useAuth();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Resend timer
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const startTimer = () => {
    setTimer(60);
    setCanResend(false);
  };

  // Step 1: Send OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    const result = await requestPasswordResetOtp(email);
    setLoading(false);
    if (result.success) {
      setSuccessMessage("OTP sent to your email. Please check your inbox.");
      setStep(2);
      startTimer();
    } else {
      setError(result.message || "Failed to send OTP. Please try again.");
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP.");
      setLoading(false);
      return;
    }

    const result = await verifyOtp(email, otp);
    setLoading(false);
    if (result.success) {
      setSuccessMessage("OTP verified successfully. Set your new password.");
      setStep(3);
    } else {
      setError(result.message || "Invalid OTP or OTP expired.");
    }
  };

  // Step 3: Reset Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!newPassword || !confirmPassword) {
      setError("Please fill both password fields.");
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const result = await resetPasswordWithOtp(email, otp, newPassword);
    setLoading(false);
    if (result.success) {
      setSuccessMessage("Password reset successfully! You can now log in.");
      setStep(4);
    } else {
      setError(result.message || "Failed to reset password. Please try again.");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setError("");
    setSuccessMessage("");
    setLoading(true);
    const result = await requestPasswordResetOtp(email);
    setLoading(false);
    if (result.success) {
      setSuccessMessage("New OTP sent to your email.");
      startTimer();
    } else {
      setError(result.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="forgot-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="forgot-page__overlay" />
      <div className="forgot-page__glow forgot-page__glow--purple" />
      <div className="forgot-page__glow forgot-page__glow--gold" />
      <AuthTopBar />
      <div className="forgot-page__shell">
        <main className="forgot-page__content">
          <section className="forgot-page__hero">
            <p className="forgot-page__eyebrow">VROT Account Recovery</p>
            <h1>Recover your account securely</h1>
            <p className="forgot-page__text">
              Verify your email, confirm the OTP, and create a new password to
              restore secure access to the VROT portal.
            </p>
          </section>

          <section className="forgot-card-section">
            <div className="forgot-card">
              {step === 1 && (
                <>
                  <div className="forgot-card__header">
                    <p className="forgot-card__tag">Step 1</p>
                    <h2>Enter your email</h2>
                    <p>
                      We will send a one-time verification code to your
                      registered email address.
                    </p>
                  </div>

                  <form className="forgot-form" onSubmit={handleEmailSubmit}>
                    <div className="forgot-form__group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={email ? "filled" : ""}
                        required
                      />
                    </div>

                    {error && <p className="forgot-form__error">{error}</p>}
                    {successMessage && <p className="forgot-form__success">{successMessage}</p>}
                    {loading && <p className="forgot-form__info">Sending OTP...</p>}

                    <button
                      type="submit"
                      className="forgot-form__submit"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </form>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="forgot-card__header">
                    <p className="forgot-card__tag">Step 2</p>
                    <h2>Verify OTP</h2>
                    <p>
                      Enter the OTP sent to <span>{email}</span>.
                    </p>
                  </div>

                  <form className="forgot-form" onSubmit={handleOtpSubmit}>
                    <div className="forgot-form__group">
                      <label htmlFor="otp">OTP</label>
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        placeholder="Enter verification code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className={otp ? "filled" : ""}
                        required
                      />
                    </div>

                    {error && <p className="forgot-form__error">{error}</p>}
                    {successMessage && <p className="forgot-form__success">{successMessage}</p>}
                    {loading && <p className="forgot-form__info">Verifying OTP...</p>}

                    <button
                      type="submit"
                      className="forgot-form__submit"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <div className="forgot-form__resend">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={!canResend || loading}
                        className="forgot-form__resend-btn"
                      >
                        {canResend ? "Resend OTP" : `Resend in ${timer}s`}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="forgot-card__header">
                    <p className="forgot-card__tag">Step 3</p>
                    <h2>Set new password</h2>
                    <p>
                      Create a strong new password and confirm it before
                      submitting.
                    </p>
                  </div>

                  <form className="forgot-form" onSubmit={handlePasswordSubmit}>
                    <div className="forgot-form__group">
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={newPassword ? "filled" : ""}
                        required
                      />
                    </div>

                    <div className="forgot-form__group">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={confirmPassword ? "filled" : ""}
                        required
                      />
                    </div>

                    {error && <p className="forgot-form__error">{error}</p>}
                    {successMessage && <p className="forgot-form__success">{successMessage}</p>}
                    {loading && <p className="forgot-form__info">Resetting password...</p>}

                    <button
                      type="submit"
                      className="forgot-form__submit"
                      disabled={loading}
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                </>
              )}

              {step === 4 && (
                <div className="forgot-success">
                  <div className="forgot-success__tick">
                    <svg viewBox="0 0 120 120" aria-hidden="true">
                      <circle cx="60" cy="60" r="54" />
                      <path d="M34 62l17 17 35-37" />
                    </svg>
                  </div>

                  <h2>Password Reset Successful</h2>
                  <p>
                    Your password has been updated successfully. You can now log
                    in with your new credentials.
                  </p>

                  <Link to="/login" className="forgot-success__button">
                    Back to Login
                  </Link>
                </div>
              )}

              {step !== 4 && (
                <div className="forgot-card__footer">
                  <Link to="/login" className="forgot-card__link">
                    Back to Login
                  </Link>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;