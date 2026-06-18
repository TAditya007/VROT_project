import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./NocPage.css";

const initialFormData = {
  ownerName: "",
  mobileNumber: "",
  email: "",
  address: "",
  registrationNumber: "",
  vehicleClass: "",
  chassisNumber: "",
  engineNumber: "",
  fuelType: "",
  reasonForNoc: "",
  fromRto: "",
  toRto: "",
  transferPurpose: "",
  requestDate: "",
  hypothecationStatus: "",
  financierName: "",
  legalStatus: "",
  declarationAccepted: false,
};

const NocPage = () => {
  const navigate = useNavigate();
  const { user, submitApplication } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const supportingDocuments = [
    "Registration Certificate (RC)",
    "Valid Insurance Copy",
    "Pollution Under Control (PUC) Certificate",
    "Road Tax Proof / Clearance",
    "Chassis and Engine Number Details",
    "Financier Consent Letter (if under loan/hypothecation)",
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required.";
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required.";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required.";
    }

    if (!formData.vehicleClass.trim()) newErrors.vehicleClass = "Vehicle class/type is required.";
    if (!formData.chassisNumber.trim()) newErrors.chassisNumber = "Chassis number is required.";
    if (!formData.engineNumber.trim()) newErrors.engineNumber = "Engine number is required.";
    if (!formData.fuelType.trim()) newErrors.fuelType = "Fuel type is required.";
    if (!formData.reasonForNoc.trim()) newErrors.reasonForNoc = "Reason for NOC is required.";
    if (!formData.fromRto.trim()) newErrors.fromRto = "Current RTO is required.";
    if (!formData.toRto.trim()) newErrors.toRto = "Destination RTO is required.";
    if (!formData.transferPurpose.trim()) newErrors.transferPurpose = "Transfer purpose is required.";
    if (!formData.requestDate.trim()) newErrors.requestDate = "Request date is required.";
    if (!formData.hypothecationStatus.trim()) {
      newErrors.hypothecationStatus = "Please select hypothecation / loan status.";
    }
    if (
      formData.hypothecationStatus === "Yes" &&
      !formData.financierName.trim()
    ) {
      newErrors.financierName = "Financier name is required when loan status is yes.";
    }
    if (!formData.legalStatus.trim()) {
      newErrors.legalStatus = "Please select challan / tax / legal action status.";
    }
    if (!formData.declarationAccepted) {
      newErrors.declarationAccepted = "Please accept the declaration to continue.";
    }

    return newErrors;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setSubmitError("");
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check if user is logged in
    if (!user) {
      setSubmitError("You must be logged in to submit an application.");
      return;
    }

    setSubmitting(true);

    // Prepare the data object (without the declaration checkbox)
    const { declarationAccepted, ...dataToSubmit } = formData;
    dataToSubmit.declaration = declarationAccepted ? "accepted" : "not accepted";

    try {
      // Submit application using AuthContext
      const result = await submitApplication("noc", dataToSubmit, []);

      if (result.success) {
        // Store the application ID in sessionStorage for document upload
        const appId = result.application.id;
        sessionStorage.setItem("currentApplicationId", appId);
        sessionStorage.setItem("currentApplicationType", "noc");

        // Navigate to document upload page
        navigate("/document-upload", { replace: true });
      } else {
        setSubmitError(result.message || "Failed to submit NOC application.");
      }
    } catch (error) {
      console.error("NOC submission error:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="noc-page">
      <div className="noc-page__glow noc-page__glow--one"></div>
      <div className="noc-page__glow noc-page__glow--two"></div>

      <div className="noc-page__container">
        <header className="noc-page__header">
          <div className="noc-page__badge">VROT • NOC Service</div>
          <h1>No Objection Certificate Request</h1>
          <p>
            Apply for a vehicle NOC for inter-state movement, jurisdiction change,
            or transfer-related processing. Fill in the owner, vehicle, destination
            authority, and finance details carefully before submission.
          </p>
        </header>

        <div className="noc-page__banner">
          <h2>NOC Information</h2>
          <p>
            NOC is generally used when a vehicle needs clearance for movement or
            transfer to another registering authority. Keep your RC, insurance,
            PUC, tax proof, and financier consent ready before applying.
          </p>
        </div>

        <div className="noc-page__content">
          <main className="noc-main-card">
            <form className="noc-form" onSubmit={handleSubmit} noValidate>
              {submitError && (
                <div className="noc-form__error-banner">{submitError}</div>
              )}

              <section className="noc-form__section">
                <div className="noc-form__section-title">
                  <h2>Owner Details</h2>
                  <p>Provide the registered owner information.</p>
                </div>

                <div className="noc-form__grid">
                  <div className="noc-form__group">
                    <label htmlFor="ownerName">Owner Name</label>
                    <input
                      type="text"
                      id="ownerName"
                      name="ownerName"
                      placeholder="Enter registered owner name"
                      value={formData.ownerName}
                      onChange={handleChange}
                    />
                    {errors.ownerName && <span className="error-text">{errors.ownerName}</span>}
                  </div>

                  <div className="noc-form__group">
                    <label htmlFor="mobileNumber">Mobile Number</label>
                    <input
                      type="tel"
                      id="mobileNumber"
                      name="mobileNumber"
                      placeholder="Enter 10-digit mobile number"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                    />
                    {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
                  </div>

                  <div className="noc-form__group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>

                  <div className="noc-form__group noc-form__group--full">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      rows="4"
                      placeholder="Enter full communication address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                    {errors.address && <span className="error-text">{errors.address}</span>}
                  </div>
                </div>
              </section>

              <section className="noc-form__section">
                <div className="noc-form__section-title">
                  <h2>Vehicle Details</h2>
                  <p>Match the vehicle information exactly with records.</p>
                </div>

                <div className="noc-form__grid">
                  <div className="noc-form__group">
                    <label htmlFor="registrationNumber">Registration Number</label>
                    <input
                      type="text"
                      id="registrationNumber"
                      name="registrationNumber"
                      placeholder="TS09AB1234"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                    />
                    {errors.registrationNumber && (
                      <span className="error-text">{errors.registrationNumber}</span>
                    )}
                  </div>

                  <div className="noc-form__group">
                    <label htmlFor="vehicleClass">Vehicle Class / Type</label>
                    <input
                      type="text"
                      id="vehicleClass"
                      name="vehicleClass"
                      placeholder="Car, Bike, Transport Vehicle"
                      value={formData.vehicleClass}
                      onChange={handleChange}
                    />
                    {errors.vehicleClass && <span className="error-text">{errors.vehicleClass}</span>}
                  </div>

                  <div className="noc-form__group">
                    <label htmlFor="chassisNumber">Chassis Number</label>
                    <input
                      type="text"
                      id="chassisNumber"
                      name="chassisNumber"
                      placeholder="Enter chassis number"
                      value={formData.chassisNumber}
                      onChange={handleChange}
                    />
                    {errors.chassisNumber && <span className="error-text">{errors.chassisNumber}</span>}
                  </div>

                  <div className="noc-form__group">
                    <label htmlFor="engineNumber">Engine Number</label>
                    <input
                      type="text"
                      id="engineNumber"
                      name="engineNumber"
                      placeholder="Enter engine number"
                      value={formData.engineNumber}
                      onChange={handleChange}
                    />
                    {errors.engineNumber && <span className="error-text">{errors.engineNumber}</span>}
                  </div>

                  <div className="noc-form__group">
                    <label htmlFor="fuelType">Fuel Type</label>
                    <select
                      id="fuelType"
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      className="noc-select"
                    >
                      <option value="">Select fuel type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                    {errors.fuelType && <span className="error-text">{errors.fuelType}</span>}
                  </div>
                </div>
              </section>

              <section className="noc-form__section">
                <div className="noc-form__section-title">
                  <h2>NOC Details</h2>
                  <p>Share the destination authority and application reason.</p>
                </div>

                <div className="noc-form__grid">
                  <div className="noc-form__group">
                    <label htmlFor="reasonForNoc">Reason for NOC</label>
                    <select
                      id="reasonForNoc"
                      name="reasonForNoc"
                      value={formData.reasonForNoc}
                      onChange={handleChange}
                      className="noc-select"
                    >
                      <option value="">Select reason</option>
                      <option value="Inter-State Transfer">Inter-State Transfer</option>
                      <option value="Sale / Ownership Transfer">Sale / Ownership Transfer</option>
                      <option value="Relocation">Owner Relocation</option>
                      <option value="Re-registration">Re-registration</option>
                    </select>
                    {errors.reasonForNoc && <span className="error-text">{errors.reasonForNoc}</span>}
                  </div>

                  <div className="noc-form__group">
                    <label htmlFor="fromRto">From State / Current RTO</label>
                    <input
                      type="text"
                      id="fromRto"
                      name="fromRto"
                      placeholder="e.g. Telangana - RTA Hyderabad"
                      value={formData.fromRto}
                      onChange={handleChange}
                    />
                    {errors.fromRto && <span className="error-text">{errors.fromRto}</span>}
                  </div>

                  <div className="noc-form__group">
                    <label htmlFor="toRto">To State / Destination RTO</label>
                    <input
                      type="text"
                      id="toRto"
                      name="toRto"
                      placeholder="e.g. Karnataka - RTO Bengaluru"
                      value={formData.toRto}
                      onChange={handleChange}
                    />
                    {errors.toRto && <span className="error-text">{errors.toRto}</span>}
                  </div>

                  <div className="noc-form__group">
                    <label htmlFor="transferPurpose">Intended Transfer Purpose</label>
                    <input
                      type="text"
                      id="transferPurpose"
                      name="transferPurpose"
                      placeholder="Mention transfer or movement purpose"
                      value={formData.transferPurpose}
                      onChange={handleChange}
                    />
                    {errors.transferPurpose && (
                      <span className="error-text">{errors.transferPurpose}</span>
                    )}
                  </div>

                  <div className="noc-form__group">
                    <label htmlFor="requestDate">Date of Request</label>
                    <input
                      type="date"
                      id="requestDate"
                      name="requestDate"
                      max={today}
                      value={formData.requestDate}
                      onChange={handleChange}
                    />
                    {errors.requestDate && <span className="error-text">{errors.requestDate}</span>}
                  </div>
                </div>
              </section>

              <section className="noc-form__section">
                <div className="noc-form__section-title">
                  <h2>Finance / Legal Details</h2>
                  <p>Declare loan, hypothecation, and clearance status.</p>
                </div>

                <div className="noc-form__grid">
                  <div className="noc-form__group">
                    <label htmlFor="hypothecationStatus">Hypothecation / Loan Status</label>
                    <select
                      id="hypothecationStatus"
                      name="hypothecationStatus"
                      value={formData.hypothecationStatus}
                      onChange={handleChange}
                      className="noc-select"
                    >
                      <option value="">Select status</option>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                    {errors.hypothecationStatus && (
                      <span className="error-text">{errors.hypothecationStatus}</span>
                    )}
                  </div>

                  <div className="noc-form__group">
                    <label htmlFor="financierName">Financier Name</label>
                    <input
                      type="text"
                      id="financierName"
                      name="financierName"
                      placeholder="Enter financier / bank name"
                      value={formData.financierName}
                      onChange={handleChange}
                      disabled={formData.hypothecationStatus !== "Yes"}
                    />
                    {errors.financierName && <span className="error-text">{errors.financierName}</span>}
                  </div>

                  <div className="noc-form__group noc-form__group--full">
                    <label htmlFor="legalStatus">Pending Challan / Tax / Legal Action Status</label>
                    <select
                      id="legalStatus"
                      name="legalStatus"
                      value={formData.legalStatus}
                      onChange={handleChange}
                      className="noc-select"
                    >
                      <option value="">Select current status</option>
                      <option value="No Pending Dues or Legal Issues">
                        No Pending Dues or Legal Issues
                      </option>
                      <option value="Pending Tax">Pending Tax</option>
                      <option value="Pending Challan">Pending Challan</option>
                      <option value="Under Legal Review">Under Legal Review</option>
                    </select>
                    {errors.legalStatus && <span className="error-text">{errors.legalStatus}</span>}
                  </div>
                </div>
              </section>

              <section className="noc-form__section">
                <div className="noc-form__section-title">
                  <h2>Declaration</h2>
                  <p>Confirm that the information submitted is correct.</p>
                </div>

                <div className="noc-declaration">
                  <label className="noc-checkbox" htmlFor="declarationAccepted">
                    <input
                      type="checkbox"
                      id="declarationAccepted"
                      name="declarationAccepted"
                      checked={formData.declarationAccepted}
                      onChange={handleChange}
                    />
                    <span>
                      I confirm that all owner, vehicle, and finance details are true to the best
                      of my knowledge and the submitted NOC request is genuine.
                    </span>
                  </label>
                  {errors.declarationAccepted && (
                    <span className="error-text">{errors.declarationAccepted}</span>
                  )}
                </div>
              </section>

              <div className="noc-form__actions">
                <button
                  type="submit"
                  className="noc-btn noc-btn--primary"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit NOC Request"}
                </button>
                <button
                  type="button"
                  className="noc-btn noc-btn--secondary"
                  onClick={handleReset}
                  disabled={submitting}
                >
                  Reset Form
                </button>
              </div>
            </form>
          </main>

          <aside className="noc-side-panel">
            <div className="noc-side-card">
              <h3>Required Documents</h3>
              <ul>
                {supportingDocuments.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="noc-side-card">
              <h3>Quick Notes</h3>
              <ul>
                <li>NOC is commonly processed as a separate transport service request.</li>
                <li>Check all vehicle identifiers before final submission.</li>
                <li>Loan-linked vehicles may require financier approval.</li>
                <li>Your data will be saved securely and reviewed by the admin.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default NocPage;