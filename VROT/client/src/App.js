import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import SignupPage from "./pages/auth/SignupPage";

import DashboardPage from "./pages/user/dashboard/DashboardPage";
import VehicleFormPage from "./pages/user/vehicle/VehicleFormPage";
import DocumentUploadPage from "./pages/user/upload/DocumentUploadPage";
import PaymentPage from "./pages/user/payment/PaymentPage";
import ReceiptPage from "./pages/user/receipt/ReceiptPage";
import NocPage from "./pages/user/noc/NocPage";
import TransferPage from "./pages/user/transfer/TransferPage";
import StatusPage from "./pages/user/status/StatusPage";
import NotificationsPage from "./pages/user/notifications/NotificationsPage";
import ProfilePage from "./pages/user/profile/ProfilePage";

import AdminDashboardPage from "./pages/admin/dashboard/AdminDashboardPage";
import AdminProfilePage from "./pages/admin/profile/AdminProfilePage";
import AdminArchivePage from "./pages/admin/AdminArchivePage";
import AdminApplicationsPage from "./pages/admin/applications/AdminApplicationsPage";
import AdminUserPage from "./pages/admin/users/AdminUserPage";
import AdminNotificationsPage from "./pages/admin/notifications/AdminNotificationsPage";
import AdminReportsPage from "./pages/admin/reports/AdminReportsPage";
import AdminSettingsPage from "./pages/admin/settings/AdminSettingsPage";

const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<MainLayout />}>
          <Route element={<ProtectedRoute allowedRoles={["citizen"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vehicle" element={<VehicleFormPage />} />
            <Route path="/document-upload" element={<DocumentUploadPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/receipt" element={<ReceiptPage />} />
            <Route path="/noc" element={<NocPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/applications" element={<AdminApplicationsPage />} />
            <Route path="/admin/users" element={<AdminUserPage />} />
            <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            <Route path="/admin/archive" element={<AdminArchivePage />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;