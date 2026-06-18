import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./TransferPage.css";

const initialForm = {
  sellerName: "",
  sellerMobile: "",
  sellerEmail: "",
  sellerAddress: "",
  sellerIdProof: "",
  buyerName: "",
  buyerMobile: "",
  buyerEmail: "",
  buyerAge: "",
  buyerAddress: "",
  buyerIdProof: "",
  registrationNumber: "",
  manufacturer: "",
  model: "",
  chassisNumber: "",
  engineNumber: "",
  fuelType: "",
  registrationState: "",
  transferDate: "",
  transferReason: "",
  saleAmount: "",
  nocAvailable: "",
  hypothecationExists: "",
  financerName: "",
  sellerConfirmed: false,
  buyerConfirmed: false,
};

const TransferPage = () => {
  const navigate = useNavigate();
  const { user, submitApplication } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const documentChecklist = useMemo(
    () => [
      "Seller address proof",
      "Buyer address proof",
      "Seller and buyer ID proof",
      "Registration Certificate (RC)",
      "Valid insurance copy",
      "Vehicle photos / chassis imprint proof",
      "NOC if applicable",
      "Financier consent if vehicle is under loan",
    ],
    []
  );

  const processSteps = useMemo(
    () => [
      "Form 29 submission to notify transfer to the RTO",
      "Form 30 submission for ownership transfer request",
      "Document verification and consent checks",
      "Payment, review, and transfer status confirmation",
    ],
    []
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sellerName.trim()) newErrors.sellerName = "Seller full name is required.";
    if (!formData.sellerMobile.trim()) newErrors.sellerMobile = "Seller mobile number is required.";
    if (!/^\d{10}$/.test(formData.sellerMobile.trim())) {
      newErrors.sellerMobile = "Enter a valid 10-digit seller mobile number.";
    }
    if (!formData.sellerEmail.trim()) newErrors.sellerEmail = "Seller email is required.";
    if (!/\S+@\S+\.\S+/.test(formData.sellerEmail.trim())) {
      newErrors.sellerEmail = "Enter a valid seller email address.";
    }
    if (!formData.sellerAddress.trim()) newErrors.sellerAddress = "Seller address is required.";
    if (!formData.sellerIdProof.trim()) newErrors.sellerIdProof = "Seller ID proof number is required.";

    if (!formData.buyerName.trim()) newErrors.buyerName = "Buyer full name is required.";
    if (!formData.buyerMobile.trim()) newErrors.buyerMobile = "Buyer mobile number is required.";
    if (!/^\d{10}$/.test(formData.buyerMobile.trim())) {
      newErrors.buyerMobile = "Enter a valid 10-digit buyer mobile number.";
    }
    if (!formData.buyerEmail.trim()) newErrors.buyerEmail = "Buyer email is required.";
    if (!/\S+@\S+\.\S+/.test(formData.buyerEmail.trim())) {
      newErrors.buyerEmail = "Enter a valid buyer email address.";
    }
    if (!formData.buyerAge.trim()) newErrors.buyerAge = "Buyer age is required.";
    if (Number(formData.buyerAge) < 18) newErrors.buyerAge = "Buyer age must be 18 or above.";
    if (!formData.buyerAddress.trim()) newErrors.buyerAddress = "Buyer address is required.";
    if (!formData.buyerIdProof.trim()) newErrors.buyerIdProof = "Buyer ID proof number is required.";

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required.";
    }
    if (!formData.manufacturer.trim()) newErrors.manufacturer = "Vehicle manufacturer is required.";
    if (!formData.model.trim()) newErrors.model = "Vehicle model is required.";
    if (!formData.chassisNumber.trim()) newErrors.chassisNumber = "Chassis number is required.";
    if (!formData.engineNumber.trim()) newErrors.engineNumber = "Engine number is required.";
    if (!formData.fuelType.trim()) newErrors.fuelType = "Fuel type is required.";
    if (!formData.registrationState.trim()) {
      newErrors.registrationState = "Registration state / RTO is required.";
    }

    if (!formData.transferDate) newErrors.transferDate = "Transfer date is required.";
    if (!formData.transferReason) newErrors.transferReason = "Please select a transfer reason.";
    if (!formData.saleAmount.trim()) newErrors.saleAmount = "Sale amount is required.";
    if (!formData.nocAvailable) newErrors.nocAvailable = "Please select NOC availability.";
    if (!formData.hypothecationExists) {
      newErrors.hypothecationExists = "Please select hypothecation / loan status.";
    }

    if (formData.hypothecationExists === "yes" && !formData.financerName.trim()) {
      newErrors.financerName = "Financier name is required when loan exists.";
    }

    if (!formData.sellerConfirmed) {
      newErrors.sellerConfirmed = "Seller confirmation is required.";
    }
    if (!formData.buyerConfirmed) {
      newErrors.buyerConfirmed = "Buyer confirmation is required.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!user) {
      setSubmitError("You must be logged in to submit an application.");
      return;
    }

    setSubmitting(true);

    // Prepare data (remove checkbox flags)
    const { sellerConfirmed, buyerConfirmed, ...dataToSubmit } = formData;
    dataToSubmit.sellerConfirmed = sellerConfirmed ? "yes" : "no";
    dataToSubmit.buyerConfirmed = buyerConfirmed ? "yes" : "no";

    try {
      const result = await submitApplication("transfer", dataToSubmit, []);

      if (result.success) {
        const appId = result.application.id;
        sessionStorage.setItem("currentApplicationId", appId);
        sessionStorage.setItem("currentApplicationType", "transfer");

        navigate("/document-upload", { replace: true });
      } else {
        setSubmitError(result.message || "Failed to submit transfer request.");
      }
    } catch (error) {
      console.error("Transfer submission error:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialForm);
    setErrors({});
    setSubmitError("");
  };

  return (
    <div className="transfer-page">
      <div className="transfer-page__glow transfer-page__glow--one"></div>
      <div className="transfer-page__glow transfer-page__glow--two"></div>

      <div className="transfer-page__container">
        <header className="transfer-hero">
          <div className="transfer-hero__badge">VROT Ownership Transfer</div>
          <h1>Ownership Transfer</h1>
          <p>
            Submit seller, buyer, vehicle, and transfer details through a clean
            Form 29 / Form 30 style workflow for your VROT semester project.
          </p>
        </header>

        <section className="transfer-top-grid">
          <div className="transfer-info-card">
            <h2>Form 29 & Form 30</h2>
            <p>
              Form 29 is generally used to notify the RTO about transfer of
              ownership, while Form 30 supports the final transfer request flow.
            </p>
          </div>

          <div className="transfer-steps-card">
            <h2>Transfer Process</h2>
            <ul>
              {processSteps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="transfer-content-grid">
          <main className="transfer-main-card">
            <form className="transfer-form" onSubmit={handleSubmit} noValidate>
              {submitError && (
                <div className="transfer-form__error-banner">{submitError}</div>
              )}

              <section className="form-section">
                <div className="section-heading">
                  <h2>Seller / Transferor Details</h2>
                  <p>Enter the current registered owner details.</p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="sellerName">Full Name</label>
                    <input
                      type="text"
                      id="sellerName"
                      name="sellerName"
                      value={formData.sellerName}
                      onChange={handleChange}
                      placeholder="Enter seller full name"
                    />
                    {errors.sellerName && <span className="error-text">{errors.sellerName}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="sellerMobile">Mobile Number</label>
                    <input
                      type="tel"
                      id="sellerMobile"
                      name="sellerMobile"
                      value={formData.sellerMobile}
                      onChange={handleChange}
                      placeholder="Enter 10-digit mobile number"
                    />
                    {errors.sellerMobile && <span className="error-text">{errors.sellerMobile}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="sellerEmail">Email</label>
                    <input
                      type="email"
                      id="sellerEmail"
                      name="sellerEmail"
                      value={formData.sellerEmail}
                      onChange={handleChange}
                      placeholder="Enter seller email"
                    />
                    {errors.sellerEmail && <span className="error-text">{errors.sellerEmail}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="sellerIdProof">ID Proof Number</label>
                    <input
                      type="text"
                      id="sellerIdProof"
                      name="sellerIdProof"
                      value={formData.sellerIdProof}
                      onChange={handleChange}
                      placeholder="Enter seller ID proof number"
                    />
                    {errors.sellerIdProof && <span className="error-text">{errors.sellerIdProof}</span>}
                  </div>

                  <div className="form-group form-group--full">
                    <label htmlFor="sellerAddress">Full Address</label>
                    <textarea
                      id="sellerAddress"
                      name="sellerAddress"
                      rows="4"
                      value={formData.sellerAddress}
                      onChange={handleChange}
                      placeholder="Enter seller full address"
                    ></textarea>
                    {errors.sellerAddress && <span className="error-text">{errors.sellerAddress}</span>}
                  </div>
                </div>
              </section>

              <section className="form-section">
                <div className="section-heading">
                  <h2>Buyer / Transferee Details</h2>
                  <p>Enter the new owner details for transfer processing.</p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="buyerName">Full Name</label>
                    <input
                      type="text"
                      id="buyerName"
                      name="buyerName"
                      value={formData.buyerName}
                      onChange={handleChange}
                      placeholder="Enter buyer full name"
                    />
                    {errors.buyerName && <span className="error-text">{errors.buyerName}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="buyerMobile">Mobile Number</label>
                    <input
                      type="tel"
                      id="buyerMobile"
                      name="buyerMobile"
                      value={formData.buyerMobile}
                      onChange={handleChange}
                      placeholder="Enter 10-digit mobile number"
                    />
                    {errors.buyerMobile && <span className="error-text">{errors.buyerMobile}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="buyerEmail">Email</label>
                    <input
                      type="email"
                      id="buyerEmail"
                      name="buyerEmail"
                      value={formData.buyerEmail}
                      onChange={handleChange}
                      placeholder="Enter buyer email"
                    />
                    {errors.buyerEmail && <span className="error-text">{errors.buyerEmail}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="buyerAge">Age</label>
                    <input
                      type="number"
                      id="buyerAge"
                      name="buyerAge"
                      value={formData.buyerAge}
                      onChange={handleChange}
                      placeholder="Enter buyer age"
                    />
                    {errors.buyerAge && <span className="error-text">{errors.buyerAge}</span>}
                  </div>

                  <div className="form-group form-group--full">
                    <label htmlFor="buyerAddress">Full Address</label>
                    <textarea
                      id="buyerAddress"
                      name="buyerAddress"
                      rows="4"
                      value={formData.buyerAddress}
                      onChange={handleChange}
                      placeholder="Enter buyer full address"
                    ></textarea>
                    {errors.buyerAddress && <span className="error-text">{errors.buyerAddress}</span>}
                  </div>

                  <div className="form-group form-group--full">
                    <label htmlFor="buyerIdProof">ID Proof Number</label>
                    <input
                      type="text"
                      id="buyerIdProof"
                      name="buyerIdProof"
                      value={formData.buyerIdProof}
                      onChange={handleChange}
                      placeholder="Enter buyer ID proof number"
                    />
                    {errors.buyerIdProof && <span className="error-text">{errors.buyerIdProof}</span>}
                  </div>
                </div>
              </section>

              <section className="form-section">
                <div className="section-heading">
                  <h2>Vehicle Details</h2>
                  <p>Provide the vehicle identity and registration details.</p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="registrationNumber">Registration Number</label>
                    <input
                      type="text"
                      id="registrationNumber"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="TS09AB1234"
                    />
                    {errors.registrationNumber && (
                      <span className="error-text">{errors.registrationNumber}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="manufacturer">Vehicle Make / Manufacturer</label>
                    <input
                      type="text"
                      id="manufacturer"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      placeholder="Enter manufacturer"
                    />
                    {errors.manufacturer && <span className="error-text">{errors.manufacturer}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="model">Model</label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="Enter vehicle model"
                    />
                    {errors.model && <span className="error-text">{errors.model}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="fuelType">Fuel Type</label>
                    <select
                      id="fuelType"
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      className="transfer-select"
                    >
                      <option value="">Select fuel type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="CNG">CNG</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                    {errors.fuelType && <span className="error-text">{errors.fuelType}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="chassisNumber">Chassis Number</label>
                    <input
                      type="text"
                      id="chassisNumber"
                      name="chassisNumber"
                      value={formData.chassisNumber}
                      onChange={handleChange}
                      placeholder="Enter chassis number"
                    />
                    {errors.chassisNumber && <span className="error-text">{errors.chassisNumber}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="engineNumber">Engine Number</label>
                    <input
                      type="text"
                      id="engineNumber"
                      name="engineNumber"
                      value={formData.engineNumber}
                      onChange={handleChange}
                      placeholder="Enter engine number"
                    />
                    {errors.engineNumber && <span className="error-text">{errors.engineNumber}</span>}
                  </div>

                  <div className="form-group form-group--full">
                    <label htmlFor="registrationState">Registration State / RTO</label>
                    <input
                      type="text"
                      id="registrationState"
                      name="registrationState"
                      value={formData.registrationState}
                      onChange={handleChange}
                      placeholder="Example: Telangana / Hyderabad RTO"
                    />
                    {errors.registrationState && (
                      <span className="error-text">{errors.registrationState}</span>
                    )}
                  </div>
                </div>
              </section>

              <section className="form-section">
                <div className="section-heading">
                  <h2>Transfer Details</h2>
                  <p>Fill transfer reason, NOC, loan, and sale information.</p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="transferDate">Transfer Date</label>
                    <input
                      type="date"
                      id="transferDate"
                      name="transferDate"
                      value={formData.transferDate}
                      onChange={handleChange}
                    />
                    {errors.transferDate && <span className="error-text">{errors.transferDate}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="transferReason">Transfer Reason</label>
                    <select
                      id="transferReason"
                      name="transferReason"
                      value={formData.transferReason}
                      onChange={handleChange}
                      className="transfer-select"
                    >
                      <option value="">Select reason</option>
                      <option value="Sale">Sale</option>
                      <option value="Auction">Auction</option>
                      <option value="Succession">Succession</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.transferReason && (
                      <span className="error-text">{errors.transferReason}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="saleAmount">Sale Amount</label>
                    <input
                      type="number"
                      id="saleAmount"
                      name="saleAmount"
                      value={formData.saleAmount}
                      onChange={handleChange}
                      placeholder="Enter sale amount"
                    />
                    {errors.saleAmount && <span className="error-text">{errors.saleAmount}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="nocAvailable">NOC Available</label>
                    <select
                      id="nocAvailable"
                      name="nocAvailable"
                      value={formData.nocAvailable}
                      onChange={handleChange}
                      className="transfer-select"
                    >
                      <option value="">Select option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    {errors.nocAvailable && <span className="error-text">{errors.nocAvailable}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="hypothecationExists">Hypothecation / Loan Exists</label>
                    <select
                      id="hypothecationExists"
                      name="hypothecationExists"
                      value={formData.hypothecationExists}
                      onChange={handleChange}
                      className="transfer-select"
                    >
                      <option value="">Select option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    {errors.hypothecationExists && (
                      <span className="error-text">{errors.hypothecationExists}</span>
                    )}
                  </div>

                  {formData.hypothecationExists === "yes" && (
                    <div className="form-group form-group--full">
                      <label htmlFor="financerName">Financier Name</label>
                      <input
                        type="text"
                        id="financerName"
                        name="financerName"
                        value={formData.financerName}
                        onChange={handleChange}
                        placeholder="Enter financer / bank name"
                      />
                      {errors.financerName && (
                        <span className="error-text">{errors.financerName}</span>
                      )}
                    </div>
                  )}
                </div>
              </section>

              <section className="form-section">
                <div className="section-heading">
                  <h2>Declaration</h2>
                  <p>Both parties must confirm the correctness of submitted details.</p>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-item" htmlFor="sellerConfirmed">
                    <input
                      type="checkbox"
                      id="sellerConfirmed"
                      name="sellerConfirmed"
                      checked={formData.sellerConfirmed}
                      onChange={handleChange}
                    />
                    <span>
                      I am the seller / transferor and I confirm that the above details are correct.
                    </span>
                  </label>
                  {errors.sellerConfirmed && (
                    <span className="error-text">{errors.sellerConfirmed}</span>
                  )}

                  <label className="checkbox-item" htmlFor="buyerConfirmed">
                    <input
                      type="checkbox"
                      id="buyerConfirmed"
                      name="buyerConfirmed"
                      checked={formData.buyerConfirmed}
                      onChange={handleChange}
                    />
                    <span>
                      I am the buyer / transferee and I confirm that the above details are correct.
                    </span>
                  </label>
                  {errors.buyerConfirmed && (
                    <span className="error-text">{errors.buyerConfirmed}</span>
                  )}
                </div>
              </section>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Transfer Request"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={submitting}>
                  Reset Form
                </button>
              </div>
            </form>
          </main>

          <aside className="transfer-sidebar">
            <div className="sidebar-card">
              <h3>Required Documents</h3>
              <ul className="checklist">
                {documentChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="sidebar-card sidebar-card--highlight">
              <h3>Helpful Note</h3>
              <p>
                Same-state transfer may be simpler, but inter-state transfer commonly needs
                NOC and supporting verification before final approval.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TransferPage;