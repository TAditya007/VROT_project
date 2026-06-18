import React from "react";
import { Link } from "react-router-dom";
import AuthTopBar from "../auth/AuthTopBar";

export default function Register() {
  return (
    <div style={{ padding: 24 }}>
      <AuthTopBar />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Register</h2>
        <Link to="/" style={{ textDecoration: "none" }}>Home</Link>
      </div>

      <p>Registration page coming soon.</p>
    </div>
  );
}