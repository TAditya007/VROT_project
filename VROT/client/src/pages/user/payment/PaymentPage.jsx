import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./PaymentPage.css";

// Fee configuration per service
const serviceFeeConfigs = {
  vehicle: {
    serviceName: "Vehicle Registration",
    registrationFee: 2200,
    serviceCharge: 180,
    convenienceFee: 120,
    sessionKey: "vehicleRegistration",
    getSummaryItems: (data) => [
      { label: "Applicant Name", value: data.fullName },
      { label: "Vehicle", value: `${data.manufacturer} ${data.model}` },
      { label: "RTO Office", value: data.rtoOffice },
    ],
  },
  transfer: {
    serviceName: "Ownership Transfer",
    registrationFee: 1500,
    serviceCharge: 150,
    convenienceFee: 100,
    sessionKey: "ownershipTransfer",
    getSummaryItems: (data) => [
      { label: "Seller Name", value: data.sellerName },
      { label: "Buyer Name", value: data.buyerName },
      { label: "Vehicle", value: `${data.manufacturer} ${data.model}` },
      { label: "Registration No.", value: data.registrationNumber },
    ],
  },
  noc: {
    serviceName: "NOC Application",
    registrationFee: 800,
    serviceCharge: 100,
    convenienceFee: 60,
    sessionKey: "nocApplication",
    getSummaryItems: (data) => [
      { label: "Owner Name", value: data.ownerName },
      { label: "Registration No.", value: data.registrationNumber },
      { label: "From RTO", value: data.fromRto },
      { label: "To RTO", value: data.toRto },
    ],
  },
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user, recordPayment } = useAuth();
  const [activeService, setActiveService] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [feeConfig, setFeeConfig] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState(null);

  const totalAmount = feeConfig
    ? feeConfig.registrationFee + feeConfig.serviceCharge + feeConfig.convenienceFee
    : 0;

  // QR code data – real text that will be scanned
  const qrData = "VROT Services Ltd - Government Payment Gateway";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  // Check sessionStorage on mount
  useEffect(() => {
    // Get application ID from sessionStorage (set by document upload)
    const appId = sessionStorage.getItem("currentApplicationId");
    const appType = sessionStorage.getItem("currentApplicationType");
    if (!appId || !appType) {
      navigate("/dashboard", { replace: true });
      return;
    }
    setApplicationId(appId);

    // Get service data from sessionStorage
    const serviceKeys = {
      registration: "vehicleRegistration",
      transfer: "ownershipTransfer",
      noc: "nocApplication",
    };
    const key = serviceKeys[appType];
    if (!key) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const stored = sessionStorage.getItem(key);
    if (!stored) {
      navigate("/dashboard", { replace: true });
      return;
    }

    try {
      const data = JSON.parse(stored);
      if (!data.uploadComplete) {
        navigate("/document-upload", { replace: true });
        return;
      }
      if (data.paymentComplete) {
        navigate("/status", { replace: true });
        return;
      }

      setRegistrationData(data);
      const config = serviceFeeConfigs[appType];
      if (!config) {
        navigate("/dashboard", { replace: true });
        return;
      }
      setFeeConfig(config);
      setActiveService(appType);
    } catch (err) {
      console.error("Payment page init error:", err);
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleTransactionIdChange = (e) => {
    setTransactionId(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      setError("Please enter the transaction ID from your payment.");
      return;
    }

    if (!applicationId) {
      setError("No application found. Please start a new application.");
      return;
    }

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await recordPayment(applicationId, transactionId.trim(), totalAmount);
      if (result.success) {
        // Clear sessionStorage items
        sessionStorage.removeItem("currentApplicationId");
        sessionStorage.removeItem("currentApplicationType");
        // Update session storage for the service to mark payment complete
        if (feeConfig && feeConfig.sessionKey) {
          const updatedData = {
            ...registrationData,
            paymentComplete: true,
            paymentInfo: {
              transactionId: transactionId.trim(),
              amount: totalAmount,
              method: "QR / UPI",
              dateTime: new Date().toISOString(),
              status: "pending_verification",
            },
          };
          sessionStorage.setItem(feeConfig.sessionKey, JSON.stringify(updatedData));
        }
        navigate("/status", { replace: true });
      } else {
        setError(result.message || "Payment recording failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment submission error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeService || !registrationData || !feeConfig) {
    return <div className="payment-page">Loading...</div>;
  }

  const summaryItems = feeConfig.getSummaryItems(registrationData);

  return (
    <section className="payment-page">
      <div className="payment-page__bg"></div>

      <div className="payment-page__container">
        <div className="payment-page__header">
          <span className="payment-badge">VROT Payment Gateway</span>
          <h1>Complete Your Payment</h1>
          <p>
            Scan the QR code below using any UPI app (Google Pay, PhonePe, Paytm, etc.)
            and make the payment of {formatCurrency(totalAmount)} to <strong>VROT Services Ltd</strong>.
          </p>
        </div>

        <div className="payment-progress">
          <div className="payment-progress__step completed">
            <span className="payment-progress__dot"></span>
            <span>Application Details</span>
          </div>
          <div className="payment-progress__line completed"></div>
          <div className="payment-progress__step active">
            <span className="payment-progress__dot"></span>
            <span>Make Payment</span>
          </div>
          <div className="payment-progress__line"></div>
          <div className="payment-progress__step">
            <span className="payment-progress__dot"></span>
            <span>Verification</span>
          </div>
        </div>

        <div className="payment-layout">
          <div className="payment-card payment-summary-card">
            <div className="card-head">
              <h2>Payment Summary</h2>
              <span className="status-pill">UPI / QR Payment</span>
            </div>

            <div className="summary-service">
              <p className="summary-label">Service</p>
              <h3>{feeConfig.serviceName}</h3>
            </div>

            <div className="summary-list">
              {summaryItems.map((item, idx) => (
                <div className="summary-row" key={idx}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="summary-list">
              <div className="summary-row">
                <span>Registration Fee</span>
                <strong>{formatCurrency(feeConfig.registrationFee)}</strong>
              </div>
              <div className="summary-row">
                <span>Service Charge</span>
                <strong>{formatCurrency(feeConfig.serviceCharge)}</strong>
              </div>
              <div className="summary-row">
                <span>Convenience Fee</span>
                <strong>{formatCurrency(feeConfig.convenienceFee)}</strong>
              </div>
              <div className="summary-row total">
                <span>Total Amount</span>
                <strong>{formatCurrency(totalAmount)}</strong>
              </div>
            </div>

            <div className="payment-note">
              Payment will be verified by admin after submission. Your application will be processed within 24 hours.
            </div>
          </div>

          <div className="payment-card payment-qr-card">
            <div className="card-head">
              <h2>Scan QR Code & Pay</h2>
              <span className="status-pill alt">UPI / Any App</span>
            </div>

            <div className="qr-container">
              <img src={qrCodeUrl} alt="QR Code for VROT Payment" className="qr-code" />
              <p className="qr-label">Pay to: <strong>VROT Services Ltd</strong></p>
              <p className="qr-amount">Amount: {formatCurrency(totalAmount)}</p>
            </div>

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="transaction-field">
                <label htmlFor="transactionId">Transaction ID / UPI Reference ID</label>
                <input
                  id="transactionId"
                  type="text"
                  placeholder="Enter transaction ID from your payment app"
                  value={transactionId}
                  onChange={handleTransactionIdChange}
                  className="transaction-input"
                />
                {error && <span className="field-error">{error}</span>}
              </div>

              <button type="submit" className="submit-payment-btn" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Payment Details"}
              </button>

              <p className="payment-disclaimer">
                After payment, enter the transaction ID. Admin will verify and approve your application.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentPage;