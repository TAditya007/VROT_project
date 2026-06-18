import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthTopBar from "../auth/AuthTopBar";
import bgImage from "../../assets/authentication/background.png";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, logout } = useAuth();

  const fromPath = location.state?.from?.pathname;
  const isLoggedIn = !!user;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "citizen",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
  
    try {
      const response = await login(formData.email, formData.password);
  
      if (!response?.success || !response?.user) {
        throw new Error("Incorrect email or password.");
      }
  
      const redirectTo =
        fromPath || (response.user.role === "admin" ? "/admin" : "/dashboard");
  
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed. Please check your credentials.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <AuthTopBar isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <div className="login-page__overlay" />
      <div className="login-page__glow login-page__glow--purple" />
      <div className="login-page__glow login-page__glow--gold" />

      <div className="login-page__shell">
        <main className="login-page__content">
          <section className="login-page__hero">
            <p className="login-page__eyebrow">VROT Secure Access</p>
            <h1>Login to continue your vehicle service workflow</h1>
            <p className="login-page__text">
              Access registration, ownership transfer, NOC requests, application tracking, and citizen service tools in one secure portal.
            </p>

            <div className="login-page__meta">
              <span>Government-tech portal</span>
              <span>Secure sign-in</span>
              <span>Responsive UI</span>
            </div>
          </section>

          <section className="login-card-section">
            <div className="login-card-wrap">
              <div className="login-card">
                <div className="login-card__header">
                  <p className="login-card__tag">Account Login</p>
                  <h2>Welcome back</h2>
                  <p>
                    Use your registered email and password to access the VROT portal.
                  </p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                  <div className="login-form__group">
                    <label htmlFor="role">Login as</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="citizen">Citizen</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="login-form__group">
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

                  <div className="login-form__group">
                    <label htmlFor="password">Password</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className={formData.password ? "filled" : ""}
                      required
                    />
                  </div>

                  <div className="login-form__utility">
                    <Link to="/forgot-password" className="login-form__forgot">
                      Forgot Password?
                    </Link>
                  </div>

                  {error && <p className="login-form__error">{error}</p>}

                  <button type="submit" className="login-form__submit">
                    Login
                  </button>
                </form>
              </div>

              <Link to="/signup" className="login-form__signup-btn">
                Sign Up
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;