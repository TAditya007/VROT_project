import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bgImage from "../../assets/authentication/background.png";
import AuthTopBar from "../auth/AuthTopBar";
import { useAuth } from "../../context/AuthContext";
import "./SignupPage.css";

const SignupPage = () => {
  const { sendSignupOtp, verifySignupOtp, register } = useAuth();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  // Resend timer
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const startTimer = () => {
    setTimer(60);
    setCanResend(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ----- Step 1: Send OTP -----
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    const { fullName, email, phone, password, confirmPassword } = formData;

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError("Please fill all fields.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Send OTP
    const result = await sendSignupOtp(email);
    setLoading(false);

    if (result.success) {
      setSuccessMessage(result.message || "OTP sent to your email.");
      setStep(2);
      startTimer();
    } else {
      setError(result.message || "Failed to send OTP.");
    }
  };

  // ----- Step 2: Verify OTP & Register -----
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    const { email, otp, fullName, phone, password } = formData;

    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP.");
      setLoading(false);
      return;
    }

    // 1. Verify OTP
    const verifyResult = await verifySignupOtp(email, otp);
    if (!verifyResult.success) {
      setError(verifyResult.message || "Invalid OTP.");
      setLoading(false);
      return;
    }

    // 2. Register user (calls server)
    try {
      const registerResult = await register(fullName, email, phone, password, "citizen");
      setLoading(false);
      if (registerResult.success) {
        setSuccessMessage(registerResult.message || "Account created! Please wait for admin approval.");
        // Show pending message instead of success (step 4)
        setStep(4);
      } else {
        setError(registerResult.message || "Registration failed.");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "Registration failed.");
    }
  };

  // ----- Resend OTP -----
  const handleResendOtp = async () => {
    if (!canResend) return;
    setError("");
    setSuccessMessage("");
    setLoading(true);

    const result = await sendSignupOtp(formData.email);
    setLoading(false);
    if (result.success) {
      setSuccessMessage("New OTP sent to your email.");
      startTimer();
    } else {
      setError(result.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="signup-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="signup-page__overlay" />
      <div className="signup-page__glow signup-page__glow--purple" />
      <div className="signup-page__glow signup-page__glow--gold" />
      <AuthTopBar />
      <div className="signup-page__shell">
        <main className="signup-page__content">
          <section className="signup-page__hero">
            <p className="signup-page__eyebrow">VROT Registration</p>
            <h1>Create your secure portal account</h1>
            <p className="signup-page__text">
              Register once to access vehicle registration, ownership transfer,
              NOC requests, tracking, and other citizen services inside VROT.
            </p>
            <div className="signup-page__meta">
              <span>Citizen access</span>
              <span>Secure onboarding</span>
              <span>Government-tech portal</span>
            </div>
          </section>

          <section className="signup-card-section">
            <div className="signup-card">
              {step === 1 && (
                <>
                  <div className="signup-card__header">
                    <p className="signup-card__tag">Step 1</p>
                    <h2>Create Account</h2>
                    <p>Enter your details to begin account registration.</p>
                  </div>
                  <form className="signup-form" onSubmit={handleDetailsSubmit}>
                    <div className="signup-form__group">
                      <label htmlFor="fullName">Full Name</label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={formData.fullName ? "filled" : ""}
                        required
                      />
                    </div>
                    <div className="signup-form__group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className={formData.email ? "filled" : ""}
                        required
                      />
                    </div>
                    <div className="signup-form__group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        className={formData.phone ? "filled" : ""}
                        required
                      />
                    </div>
                    <div className="signup-form__group">
                      <label htmlFor="password">Password</label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        className={formData.password ? "filled" : ""}
                        required
                      />
                    </div>
                    <div className="signup-form__group">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={formData.confirmPassword ? "filled" : ""}
                        required
                      />
                    </div>
                    {error && <p className="signup-form__error">{error}</p>}
                    {successMessage && <p className="signup-form__success">{successMessage}</p>}
                    {loading && <p className="signup-form__info">Sending OTP...</p>}
                    <button type="submit" className="signup-form__submit" disabled={loading}>
                      {loading ? "Sending..." : "Create Account"}
                    </button>
                  </form>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="signup-card__header">
                    <p className="signup-card__tag">Step 2</p>
                    <h2>Verify OTP</h2>
                    <p>
                      Enter the OTP sent to <span>{formData.email}</span>.
                    </p>
                  </div>
                  <form className="signup-form" onSubmit={handleOtpSubmit}>
                    <div className="signup-form__group">
                      <label htmlFor="otp">OTP</label>
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        placeholder="Enter verification code"
                        value={formData.otp}
                        onChange={handleChange}
                        className={formData.otp ? "filled" : ""}
                        required
                      />
                    </div>
                    {error && <p className="signup-form__error">{error}</p>}
                    {successMessage && <p className="signup-form__success">{successMessage}</p>}
                    {loading && <p className="signup-form__info">Verifying & creating account...</p>}
                    <button type="submit" className="signup-form__submit" disabled={loading}>
                      {loading ? "Processing..." : "Verify & Register"}
                    </button>
                    <div className="signup-form__resend">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={!canResend || loading}
                        className="signup-form__resend-btn"
                      >
                        {canResend ? "Resend OTP" : `Resend in ${timer}s`}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {step === 3 && (
                <div className="signup-success">
                  <div className="signup-success__tick">
                    <svg viewBox="0 0 120 120" aria-hidden="true">
                      <circle cx="60" cy="60" r="54" />
                      <path d="M34 62l17 17 35-37" />
                    </svg>
                  </div>
                  <h2>Account Created</h2>
                  <p>
                    Your VROT account has been created successfully. You can now
                    log in and continue with portal services.
                  </p>
                  <Link to="/login" className="signup-success__button">
                    Return to Login
                  </Link>
                </div>
              )}

              {step === 4 && (
                <div className="signup-success">
                  <div className="signup-success__tick" style={{ borderColor: '#f39c12' }}>
                    <svg viewBox="0 0 120 120" aria-hidden="true">
                      <circle cx="60" cy="60" r="54" stroke="#f39c12" />
                      <path d="M34 62l17 17 35-37" stroke="#f39c12" />
                    </svg>
                  </div>
                  <h2>Pending Approval</h2>
                  <p>
                    {successMessage || "Your account has been created and is pending admin verification. You will be notified once approved."}
                  </p>
                  <Link to="/login" className="signup-success__button" style={{ background: '#f39c12' }}>
                    Back to Login
                  </Link>
                </div>
              )}

              {step !== 3 && step !== 4 && (
                <div className="signup-card__footer">
                  <p>
                    Already have an account?{" "}
                    <Link to="/login" className="signup-card__link">
                      Login
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SignupPage;