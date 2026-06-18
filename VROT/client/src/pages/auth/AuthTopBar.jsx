import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AuthTopBar.css";

const AuthTopBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAuthPage =
    ["/login", "/signup", "/forgot-password", "/"].includes(
      window.location.pathname
    );

  const showLogout = !!user && !isAuthPage;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="auth-topbar">
      <div className="section-inner auth-header-inner">
        <div className="header-main-row">
          <Link to="/" className="hero-brand auth-brand-link">
            VROT
          </Link>

          <div className="header-main-actions">
            {showLogout ? (
              <button type="button" className="top-login-btn" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <Link to="/" className="top-link">
                Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthTopBar;