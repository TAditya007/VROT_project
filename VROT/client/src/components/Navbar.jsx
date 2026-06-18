import React, {useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const citizenLinks = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Notifications", path: "/notifications" },
  { label: "Vehicle Registration", path: "/vehicle" },
  { label: "Ownership Transfer", path: "/transfer" },
  { label: "NOC Request", path: "/noc" },
  { label: "Receipt", path: "/receipt" },
  { label: "Status Tracking", path: "/status" },
  { label: "Profile", path: "/profile" },
];

const adminLinks = [
  { label: "Admin Dashboard", path: "/admin" },
  { label: "Applications", path: "/admin/applications" },
  { label: "Users", path: "/admin/users" },
  { label: "Notifications", path: "/admin/notifications" },
  { label: "Reports", path: "/admin/reports" },
  { label: "Settings", path: "/admin/settings" },
  { label: "Profile", path: "/admin/profile" },
  { label: "Archive", path: "/admin/archive" },
];

const hiddenRoutes = ["/", "/login", "/signup", "/forgot-password"];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const shouldHide = hiddenRoutes.includes(location.pathname);

  const navLinks = user?.role === "admin" ? adminLinks : citizenLinks;

 


  const handleLogout = () => {
    if (typeof logout === "function") logout();
    navigate("/login", { replace: true });
    setOpen(false);
  };

  if (shouldHide) return null;

  return (
    <>
      <button
        type="button"
        className={`dashboard-menu-toggle ${open ? "active" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`dashboard-dropdown-nav ${open ? "open" : ""}`}>
        <div className="dashboard-dropdown-header">
          <h3>Portal Menu</h3>
        </div>

        <nav className="dashboard-dropdown-links">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`dashboard-dropdown-link ${isActive ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="dashboard-dropdown-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default Navbar;