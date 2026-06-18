import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./VehicleFormPage.css";

const initialFormData = {
  fullName: "",
  email: "",
  mobile: "",
  address: "",
  idType: "",
  idNumber: "",
  vehicleType: "",
  manufacturer: "",
  model: "",
  fuelType: "",
  registrationCategory: "",
  chassisNumber: "",
  engineNumber: "",
  manufacturingYear: "",
  color: "",
  state: "TELANGANA",
  rtoOffice: "",
  registrationDate: "",
  insuranceProvider: "",
  policyNumber: "",
  declaration: false,
};

const limits = {
  fullName: 60,
  mobile: 10,
  address: 180,
  idNumber: 20,
  manufacturer: 30,
  model: 30,
  chassisNumber: 17,
  engineNumber: 21,
  color: 20,
  state: 20,
  rtoOffice: 40,
  insuranceProvider: 40,
  policyNumber: 30,
};

const VehicleFormPage = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const { user, logout, submitApplication } = useAuth();

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const userName = useMemo(() => {
    if (user?.name && user.name.trim()) return user.name;
    return "Citizen User";
  }, [user]);

  const userInitial = userName.charAt(0).toUpperCase();

  const yearOptions = useMemo(() => {
    const years = [];
    for (let year = currentYear; year >= 1990; year -= 1) years.push(year);
    return years;
  }, [currentYear]);

  const isFilled = (value) => {
    if (typeof value === "boolean") return value;
    return String(value).trim() !== "";
  };

  const getFieldClass = (fieldName) => {
    const hasError = touched[fieldName] && errors[fieldName];
    const filled = isFilled(formData[fieldName]);
    if (hasError) return "is-error";
    if (filled) return "is-filled";
    return "";
  };

  const sanitizeUpperText = (value, maxLength) =>
    value.toUpperCase().replace(/[^A-Z\s]/g, "").replace(/\s{2,}/g, " ").slice(0, maxLength);

  const sanitizeUpperAlphaNum = (value, maxLength) =>
    value.toUpperCase().replace(/[^A-Z0-9\s/-]/g, "").slice(0, maxLength);

  const sanitizeEmail = (value) =>
    value.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, "").slice(0, 60);

  const sanitizeMobile = (value) => value.replace(/\D/g, "").slice(0, 10);

  const sanitizeByField = (name, value) => {
    switch (name) {
      case "fullName":
        return sanitizeUpperText(value, limits.fullName);
      case "address":
        return value.toUpperCase().slice(0, limits.address);
      case "email":
        return sanitizeEmail(value);
      case "mobile":
        return sanitizeMobile(value);
      case "idNumber":
        return sanitizeUpperAlphaNum(value, limits.idNumber);
      case "manufacturer":
        return sanitizeUpperText(value, limits.manufacturer);
      case "model":
        return sanitizeUpperAlphaNum(value, limits.model);
      case "chassisNumber":
        return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, limits.chassisNumber);
      case "engineNumber":
        return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, limits.engineNumber);
      case "color":
        return sanitizeUpperText(value, limits.color);
      case "state":
        return sanitizeUpperText(value, limits.state);
      case "rtoOffice":
        return sanitizeUpperAlphaNum(value, limits.rtoOffice);
      case "insuranceProvider":
        return sanitizeUpperText(value, limits.insuranceProvider);
      case "policyNumber":
        return sanitizeUpperAlphaNum(value, limits.policyNumber);
      default:
        return value;
    }
  };

  const validateFormData = (data) => {
    const newErrors = {};

    if (!data.fullName.trim()) newErrors.fullName = "Full name is required.";
    else if (data.fullName.trim().length < 3) newErrors.fullName = "Full name must be at least 3 letters.";

    if (!data.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) newErrors.email = "Enter a valid email with @ and domain.";

    if (!data.mobile.trim()) newErrors.mobile = "Mobile number is required.";
    else if (!/^[6-9]\d{9}$/.test(data.mobile)) newErrors.mobile = "Enter a valid 10-digit Indian mobile number.";

    if (!data.address.trim()) newErrors.address = "Address is required.";
    else if (data.address.trim().length < 10) newErrors.address = "Address must be at least 10 characters.";

    if (!data.idType) newErrors.idType = "Please select an ID type.";

    if (!data.idNumber.trim()) newErrors.idNumber = "ID number is required.";
    else if (data.idNumber.trim().length < 5) newErrors.idNumber = "ID number is too short.";

    if (!data.vehicleType) newErrors.vehicleType = "Please select vehicle type.";
    if (!data.manufacturer.trim()) newErrors.manufacturer = "Manufacturer is required.";
    if (!data.model.trim()) newErrors.model = "Model is required.";
    if (!data.fuelType) newErrors.fuelType = "Please select fuel type.";
    if (!data.registrationCategory) newErrors.registrationCategory = "Please select registration category.";

    if (!data.chassisNumber.trim()) newErrors.chassisNumber = "Chassis number is required.";
    else if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(data.chassisNumber)) newErrors.chassisNumber = "Chassis number must be 17 uppercase letters/numbers.";

    if (!data.engineNumber.trim()) newErrors.engineNumber = "Engine number is required.";
    else if (data.engineNumber.length < 6 || data.engineNumber.length > 21) newErrors.engineNumber = "Engine number must be 6 to 21 characters.";

    if (!data.manufacturingYear) newErrors.manufacturingYear = "Please select manufacturing year.";

    if (!data.color.trim()) newErrors.color = "Vehicle color is required.";
    if (!data.state.trim()) newErrors.state = "State is required.";
    if (!data.rtoOffice.trim()) newErrors.rtoOffice = "RTO office is required.";
    if (!data.registrationDate) newErrors.registrationDate = "Registration date is required.";
    if (!data.insuranceProvider.trim()) newErrors.insuranceProvider = "Insurance provider is required.";
    if (!data.policyNumber.trim()) newErrors.policyNumber = "Policy number is required.";
    else if (data.policyNumber.length < 6) newErrors.policyNumber = "Policy number is too short.";

    if (!data.declaration) newErrors.declaration = "You must confirm the entered details.";

    return newErrors;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const finalValue = type === "checkbox" ? checked : sanitizeByField(name, value);

    const updatedData = {
      ...formData,
      [name]: finalValue,
    };

    setFormData(updatedData);

    if (touched[name]) {
      const liveErrors = validateFormData(updatedData);
      setErrors((prev) => ({
        ...prev,
        [name]: liveErrors[name] || "",
      }));
    }
    setSubmitError("");
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    const validationErrors = validateFormData(formData);
    setErrors((prev) => ({
      ...prev,
      [name]: validationErrors[name] || "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const validationErrors = validateFormData(formData);
    const allTouched = Object.keys(initialFormData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});

    setTouched(allTouched);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!user) {
      setSubmitError("You must be logged in to submit an application.");
      return;
    }

    setSubmitting(true);

    // Prepare data (remove declaration field)
    const { declaration, ...dataToSubmit } = formData;
    dataToSubmit.declaration = declaration ? "accepted" : "not accepted";

    try {
      const result = await submitApplication("registration", dataToSubmit, []);

      if (result.success) {
        const appId = result.application.id;
        sessionStorage.setItem("currentApplicationId", appId);
        sessionStorage.setItem("currentApplicationType", "registration");

        // Redirect to document upload page
        navigate("/document-upload", { replace: true });
      } else {
        setSubmitError(result.message || "Failed to submit registration application.");
      }
    } catch (error) {
      console.error("Registration submission error:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setSubmitError("");
  };

  const handleLogout = () => {
    if (typeof logout === "function") logout();
    navigate("/login", { replace: true });
  };

  // Helper function to render field with hint and error
  const renderField = (name, label, type, options = null, placeholder = "", extraProps = {}) => {
    const hintExamples = {
      fullName: "e.g., RAJESH KUMAR",
      email: "e.g., rajesh@example.com",
      mobile: "e.g., 9876543210",
      address: "e.g., 123, MAIN STREET, HYDERABAD",
      idNumber: "e.g., 1234 5678 9012",
      manufacturer: "e.g., MARUTI SUZUKI",
      model: "e.g., SWIFT",
      chassisNumber: "e.g., MA3EWD51S00321789",
      engineNumber: "e.g., D13A1234567",
      color: "e.g., WHITE",
      state: "e.g., TELANGANA",
      rtoOffice: "e.g., HYDERABAD CENTRAL RTO",
      insuranceProvider: "e.g., NEW INDIA ASSURANCE",
      policyNumber: "e.g., 1234ABC5678DEF",
    };
    const hint = hintExamples[name] || "";
    return (
      <div className="form-field">
        <label htmlFor={name}>{label}</label>
        {type === "select" ? (
          <select
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${getFieldClass(name)} vehicle-select`}
            {...extraProps}
          >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getFieldClass(name)}
            {...extraProps}
          />
        )}
        {hint && <span className="field-hint">{hint}</span>}
        {touched[name] && errors[name] && <span className="error-text">{errors[name]}</span>}
      </div>
    );
  };

  return (
    <div className="vehicle-page">
      <div className="vehicle-page__background"></div>
      <div className="vehicle-page__overlay"></div>

      <div className="vehicle-page__content">
        <header className="vehicle-topbar">
          <div className="vehicle-branding">
            <p className="vehicle-brand-kicker">Vehicle Registration & Ownership Transfer</p>
            <h1>Vehicle Registration</h1>
          </div>

          <div className="vehicle-profile-block">
            <div className="vehicle-profile-avatar">{userInitial}</div>
            <div className="vehicle-profile-text">
              <strong>{userName}</strong>
              <span>Citizen Portal Access</span>
            </div>
            <button type="button" className="vehicle-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="vehicle-progress-strip">
          <div className="vehicle-progress-strip__line"></div>
          <div className="vehicle-progress-strip__steps">
            <span className="active">Enter Details</span>
            <span>Upload Documents</span>
            <span>Confirm</span>
          </div>
        </section>

        <section className="vehicle-form-section">
          <form className="vehicle-form-shell" onSubmit={handleSubmit} noValidate>
            {submitError && (
              <div className="vehicle-form__error-banner">{submitError}</div>
            )}

            <div className="vehicle-form-intro">
              <div>
                <p className="vehicle-hero__tag">Registration Workflow</p>
                <h2>Vehicle registration application</h2>
                <p className="vehicle-hero__text">
                  Telangana-ready vehicle registration form with uppercase formatting and cleaner field-level constraints.
                </p>
              </div>
            </div>

            <div className="vehicle-form-grid">
              {/* Owner Details */}
              <fieldset className="form-group">
                <legend>Owner Details</legend>
                <div className="form-grid">
                  {renderField("fullName", "Full Name", "text", null, "ENTER OWNER FULL NAME", { maxLength: limits.fullName })}
                  {renderField("email", "Email", "email", null, "example@mail.com", { maxLength: 60 })}
                  {renderField("mobile", "Mobile Number", "tel", null, "10 DIGIT MOBILE NUMBER", { maxLength: 10 })}
                  <div className="form-field">
                    <label htmlFor="idType">ID Type</label>
                    <select
                      id="idType"
                      name="idType"
                      value={formData.idType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${getFieldClass("idType")} vehicle-select`}
                    >
                      <option value="">Select ID type</option>
                      <option value="Aadhaar">AADHAAR</option>
                      <option value="PAN">PAN</option>
                      <option value="Driving License">DRIVING LICENSE</option>
                      <option value="Passport">PASSPORT</option>
                      <option value="Voter ID">VOTER ID</option>
                    </select>
                    <span className="field-hint">e.g., AADHAAR, PAN, etc.</span>
                    {touched.idType && errors.idType && <span className="error-text">{errors.idType}</span>}
                  </div>
                  {renderField("idNumber", "ID Number", "text", null, "ENTER ID NUMBER", { maxLength: limits.idNumber })}
                  <div className="form-field full-width">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      rows="4"
                      placeholder="ENTER COMPLETE ADDRESS"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getFieldClass("address")}
                      maxLength={limits.address}
                    />
                    <span className="field-hint">e.g., 123, MAIN STREET, HYDERABAD - 500001</span>
                    {touched.address && errors.address && <span className="error-text">{errors.address}</span>}
                  </div>
                </div>
              </fieldset>

              {/* Vehicle Details */}
              <fieldset className="form-group">
                <legend>Vehicle Details</legend>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="vehicleType">Vehicle Type</label>
                    <select
                      id="vehicleType"
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${getFieldClass("vehicleType")} vehicle-select`}
                    >
                      <option value="">Select vehicle type</option>
                      <option value="Two Wheeler">TWO WHEELER</option>
                      <option value="Car">CAR</option>
                      <option value="SUV">SUV</option>
                      <option value="Commercial Vehicle">COMMERCIAL VEHICLE</option>
                      <option value="Electric Vehicle">ELECTRIC VEHICLE</option>
                    </select>
                    <span className="field-hint">e.g., CAR, TWO WHEELER</span>
                    {touched.vehicleType && errors.vehicleType && <span className="error-text">{errors.vehicleType}</span>}
                  </div>
                  {renderField("manufacturer", "Manufacturer", "text", null, "ENTER MANUFACTURER", { maxLength: limits.manufacturer })}
                  {renderField("model", "Model", "text", null, "ENTER MODEL", { maxLength: limits.model })}
                  <div className="form-field">
                    <label htmlFor="fuelType">Fuel Type</label>
                    <select
                      id="fuelType"
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${getFieldClass("fuelType")} vehicle-select`}
                    >
                      <option value="">Select fuel type</option>
                      <option value="Petrol">PETROL</option>
                      <option value="Diesel">DIESEL</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">ELECTRIC</option>
                      <option value="Hybrid">HYBRID</option>
                    </select>
                    <span className="field-hint">e.g., PETROL, DIESEL</span>
                    {touched.fuelType && errors.fuelType && <span className="error-text">{errors.fuelType}</span>}
                  </div>
                  <div className="form-field">
                    <label htmlFor="registrationCategory">Registration Category</label>
                    <select
                      id="registrationCategory"
                      name="registrationCategory"
                      value={formData.registrationCategory}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${getFieldClass("registrationCategory")} vehicle-select`}
                    >
                      <option value="">Select category</option>
                      <option value="Private">PRIVATE</option>
                      <option value="Commercial">COMMERCIAL</option>
                      <option value="Transport">TRANSPORT</option>
                      <option value="Government">GOVERNMENT</option>
                    </select>
                    <span className="field-hint">e.g., PRIVATE, COMMERCIAL</span>
                    {touched.registrationCategory && errors.registrationCategory && <span className="error-text">{errors.registrationCategory}</span>}
                  </div>
                  {renderField("chassisNumber", "Chassis Number", "text", null, "17 CHARACTER VIN", { maxLength: 17 })}
                  {renderField("engineNumber", "Engine Number", "text", null, "6 TO 21 CHARACTERS", { maxLength: limits.engineNumber })}
                  <div className="form-field">
                    <label htmlFor="manufacturingYear">Manufacturing Year</label>
                    <select
                      id="manufacturingYear"
                      name="manufacturingYear"
                      value={formData.manufacturingYear}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${getFieldClass("manufacturingYear")} vehicle-select`}
                    >
                      <option value="">Select year</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <span className="field-hint">e.g., 2023</span>
                    {touched.manufacturingYear && errors.manufacturingYear && <span className="error-text">{errors.manufacturingYear}</span>}
                  </div>
                  {renderField("color", "Color", "text", null, "ENTER VEHICLE COLOR", { maxLength: limits.color })}
                </div>
              </fieldset>

              {/* Registration Details */}
              <fieldset className="form-group">
                <legend>Registration Details</legend>
                <div className="form-grid">
                  {renderField("state", "State", "text", null, "ENTER STATE", { maxLength: limits.state })}
                  {renderField("rtoOffice", "RTO Office", "text", null, "ENTER RTO OFFICE", { maxLength: limits.rtoOffice })}
                  <div className="form-field">
                    <label htmlFor="registrationDate">Registration Date</label>
                    <input
                      id="registrationDate"
                      name="registrationDate"
                      type="date"
                      value={formData.registrationDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getFieldClass("registrationDate")}
                    />
                    <span className="field-hint">e.g., 2025-03-15</span>
                    {touched.registrationDate && errors.registrationDate && <span className="error-text">{errors.registrationDate}</span>}
                  </div>
                  {renderField("insuranceProvider", "Insurance Provider", "text", null, "ENTER INSURANCE PROVIDER", { maxLength: limits.insuranceProvider })}
                  {renderField("policyNumber", "Policy Number", "text", null, "ENTER POLICY NUMBER", { maxLength: limits.policyNumber })}
                </div>
              </fieldset>
            </div>

            {/* Declaration Checkbox */}
            <div className="declaration-wrapper">
              <label
                className={`checkbox-row ${touched.declaration && errors.declaration ? "checkbox-error" : formData.declaration ? "checkbox-filled" : ""}`}
                htmlFor="declaration"
              >
                <input
                  id="declaration"
                  name="declaration"
                  type="checkbox"
                  checked={formData.declaration}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <span>
                  I confirm that all entered owner, vehicle, and registration details are correct to the best of my knowledge.
                </span>
              </label>
              {touched.declaration && errors.declaration && <span className="error-text">{errors.declaration}</span>}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Registration"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={submitting}>
                Reset Form
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default VehicleFormPage;