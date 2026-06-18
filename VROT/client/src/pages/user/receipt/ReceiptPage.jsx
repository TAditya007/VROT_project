import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import jsPDF from "jspdf";
import "./ReceiptPage.css";

const ReceiptPage = () => {
  const { user, getApplications, getApplicationById } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [application, setApplication] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Auto-load the user's latest application with payment
  useEffect(() => {
    const loadLatest = async () => {
      if (!user) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }

      try {
        const apps = await getApplications(false);
        const completedApp = apps
          .filter(app => app.payment)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        if (completedApp) {
          setApplication(completedApp);
          setError("");
        } else {
          setError("No completed application found. You can search by application ID below.");
        }
      } catch (err) {
        console.error("Load error:", err);
        setError("Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };
    loadLatest();
  }, [user, getApplications]);

  // Handle manual search by application ID
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      setSearchError("Please enter an application ID.");
      return;
    }
    if (!user) {
      setSearchError("You must be logged in.");
      return;
    }

    setSearching(true);
    setSearchError("");
    try {
      const app = await getApplicationById(searchId.trim());
      if (app) {
        setApplication(app);
        setError("");
        setSearchError("");
      } else {
        setSearchError("No application found with that ID.");
        setApplication(null);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchError("Failed to fetch application.");
    } finally {
      setSearching(false);
    }
  };

  // Build receipt data from application
  const receiptData = useMemo(() => {
    if (!application) return null;

    const appData = application.data || {};
    const payment = application.payment || {};
    const serviceMap = {
      registration: "Vehicle Registration",
      transfer: "Ownership Transfer",
      noc: "NOC Application",
    };

    let applicantName = appData.fullName || appData.sellerName || appData.ownerName || user?.name || "N/A";
    let officeInfo = "";

    if (application.type === 'registration') {
      officeInfo = appData.rtoOffice || appData.state || 'N/A';
    } else if (application.type === 'transfer') {
      officeInfo = appData.registrationState || 'N/A';
    } else if (application.type === 'noc') {
      officeInfo = appData.toRto || appData.fromRto || 'N/A';
    }

    const amount = payment.amount || 0;
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

    const dateTime = payment.paidAt ? new Date(payment.paidAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : new Date(application.createdAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      applicantName,
      applicationId: application.id,
      transactionRef: payment.transactionId || `TXN-${application.id.slice(0, 8)}`,
      serviceName: serviceMap[application.type] || application.type,
      dateTime,
      paymentMethod: "UPI / QR",
      amount: formattedAmount,
      status: payment.status === 'pending_verification' ? 'Pending Verification' : 'Paid',
      rcStatus: application.status === 'approved' ? 'Generated' : 'Processing',
      vehicleNumber: appData.registrationNumber || appData.vehicleNumber || 'N/A',
      chassisSuffix: appData.chassisNumber ? appData.chassisNumber.slice(-4) : 'N/A',
      office: officeInfo,
    };
  }, [application, user]);

  // PDF generation functions (same as before)
  const generateReceiptPDF = () => {
    if (!receiptData) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 30;

    doc.setFontSize(22);
    doc.setTextColor(40, 40, 80);
    doc.text("VROT Services", pageWidth/2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Payment Receipt", pageWidth/2, y, { align: 'center' });
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    const fields = [
      ["Applicant Name", receiptData.applicantName],
      ["Application ID", receiptData.applicationId],
      ["Transaction Ref", receiptData.transactionRef],
      ["Service Name", receiptData.serviceName],
      ["Date & Time", receiptData.dateTime],
      ["Payment Method", receiptData.paymentMethod],
      ["Paid Amount", receiptData.amount],
      ["Status", receiptData.status],
    ];

    fields.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label + ":", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, margin + 50, y);
      y += 8;
    });

    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a system-generated receipt for VROT services.", margin, y);
    y += 5;
    doc.text("Verification Ref: " + receiptData.transactionRef, margin, y);

    doc.save(`VROT_Receipt_${receiptData.applicationId}.pdf`);
  };

  const generateRCPDF = () => {
    if (!receiptData) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 30;

    doc.setFontSize(22);
    doc.setTextColor(40, 40, 80);
    doc.text("VROT Services", pageWidth/2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("RC Acknowledgement", pageWidth/2, y, { align: 'center' });
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    const fields = [
      ["Applicant Name", receiptData.applicantName],
      ["Application ID", receiptData.applicationId],
      ["Vehicle Number", receiptData.vehicleNumber],
      ["Service Name", receiptData.serviceName],
      ["RC Status", receiptData.rcStatus],
      ["RTA Office", receiptData.office],
      ["Chassis Suffix", receiptData.chassisSuffix],
      ["Generated On", receiptData.dateTime],
    ];

    fields.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label + ":", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, margin + 50, y);
      y += 8;
    });

    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a system-generated RC acknowledgement for VROT services.", margin, y);
    y += 5;
    doc.text("Verification Ref: " + receiptData.transactionRef, margin, y);

    doc.save(`VROT_RC_${receiptData.applicationId}.pdf`);
  };

  // Loading state
  if (loading) {
    return <div className="receipt-page">Loading receipt data...</div>;
  }

  // Empty state with search bar
  if (!receiptData) {
    return (
      <section className="receipt-page">
        <div className="receipt-page__container">
          <div className="receipt-empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>Find Your Receipt</h2>
            <p style={{ marginBottom: '24px', color: '#aaa' }}>
              {error || "Enter your application ID to view the receipt and download PDFs."}
            </p>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', maxWidth: '500px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                type="text"
                placeholder="e.g. VROT-2026-001284"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: '1px solid #444',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  fontSize: '1rem',
                  minWidth: '200px'
                }}
              />
              <button
                type="submit"
                disabled={searching}
                style={{
                  padding: '14px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6c63ff, #4a3fbf)',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </form>

            {searchError && <p style={{ color: '#ff6b6b', marginTop: '16px' }}>{searchError}</p>}

            <div style={{ marginTop: '24px' }}>
              <Link to="/dashboard" className="receipt-btn receipt-btn--ghost">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Receipt view (same as before)
  return (
    <section className="receipt-page">
      <div className="receipt-page__glow receipt-page__glow--one"></div>
      <div className="receipt-page__glow receipt-page__glow--two"></div>

      <div className="receipt-page__container">
        <header className="receipt-page__header">
          <span className="receipt-page__eyebrow">VROT / Payment Confirmation</span>
          <h1>Receipt & RC Download</h1>
          <p>
            Your payment has been recorded successfully. Review the transaction
            details and download the receipt or RC acknowledgement below.
          </p>
        </header>

        <div className="receipt-card">
          <div className="receipt-card__top">
            <div>
              <p className="receipt-card__label">Transaction Completed</p>
              <h2>{receiptData.serviceName}</h2>
            </div>

            <div className="receipt-card__badges">
              <span className={`status-badge status-badge--${receiptData.status === 'Paid' ? 'paid' : 'pending'}`}>
                {receiptData.status}
              </span>
              <span className={`status-badge status-badge--${receiptData.rcStatus === 'Generated' ? 'generated' : 'pending'}`}>
                {receiptData.rcStatus}
              </span>
            </div>
          </div>

          <div className="receipt-card__summary">
            <div className="summary-box">
              <span className="summary-box__label">Paid Amount</span>
              <strong>{receiptData.amount}</strong>
            </div>
            <div className="summary-box">
              <span className="summary-box__label">Payment Method</span>
              <strong>{receiptData.paymentMethod}</strong>
            </div>
            <div className="summary-box">
              <span className="summary-box__label">Date & Time</span>
              <strong>{receiptData.dateTime}</strong>
            </div>
          </div>

          <div className="receipt-card__grid">
            <div className="detail-item">
              <span>Applicant Name</span>
              <strong>{receiptData.applicantName}</strong>
            </div>
            <div className="detail-item">
              <span>Application ID</span>
              <strong>{receiptData.applicationId}</strong>
            </div>
            <div className="detail-item">
              <span>Transaction Reference</span>
              <strong>{receiptData.transactionRef}</strong>
            </div>
            <div className="detail-item">
              <span>Service Name</span>
              <strong>{receiptData.serviceName}</strong>
            </div>
          </div>

          <div className="rc-block">
            <div className="rc-block__header">
              <div>
                <p className="receipt-card__label">RC Acknowledgement</p>
                <h3>Registration Record Preview</h3>
              </div>
              <span className="rc-block__chip">Official Copy</span>
            </div>

            <div className="rc-block__content">
              <div className="detail-item">
                <span>Vehicle Number</span>
                <strong>{receiptData.vehicleNumber}</strong>
              </div>
              <div className="detail-item">
                <span>RTA Office</span>
                <strong>{receiptData.office}</strong>
              </div>
              <div className="detail-item">
                <span>Chassis Suffix</span>
                <strong>{receiptData.chassisSuffix}</strong>
              </div>
              <div className="detail-item">
                <span>Document Status</span>
                <strong>{receiptData.rcStatus}</strong>
              </div>
            </div>
          </div>

          <div className="receipt-card__actions">
            <button
              type="button"
              className="receipt-btn receipt-btn--primary"
              onClick={generateReceiptPDF}
            >
              Download Receipt PDF
            </button>

            <button
              type="button"
              className="receipt-btn receipt-btn--secondary"
              onClick={generateRCPDF}
            >
              Download RC PDF
            </button>

            <Link to="/status" className="receipt-btn receipt-btn--ghost">
              Go to Status Tracking
            </Link>
          </div>

          <div className="receipt-card__footer">
            <p>
              This receipt and RC acknowledgement are generated from your
              application data and are for reference purposes only.
            </p>
            <p>Verification Ref: {receiptData.transactionRef}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReceiptPage;