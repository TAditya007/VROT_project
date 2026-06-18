import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // ✅ fixed path
import axios from "axios";
import "./DocumentUploadPage.css";

const DOCUMENT_CONFIG = [
  {
    key: "aadhaar",
    title: "Aadhaar / ID Proof",
    description: "Upload Aadhaar card, PAN card, voter ID, or another valid government ID.",
    acceptedTypes: ".pdf,.jpg,.jpeg,.png,.webp",
    required: true,
  },
  {
    key: "addressProof",
    title: "Address Proof",
    description: "Upload electricity bill, ration card, bank statement, or valid address proof.",
    acceptedTypes: ".pdf,.jpg,.jpeg,.png,.webp",
    required: true,
  },
  {
    key: "vehicleInvoice",
    title: "Vehicle Invoice",
    description: "Upload purchase invoice or sale receipt issued for the vehicle.",
    acceptedTypes: ".pdf,.jpg,.jpeg,.png",
    required: true,
  },
  {
    key: "insurance",
    title: "Insurance Certificate",
    description: "Upload active vehicle insurance document.",
    acceptedTypes: ".pdf,.jpg,.jpeg,.png",
    required: true,
  },
  {
    key: "pollution",
    title: "Pollution Certificate",
    description: "Upload valid pollution under control certificate if available.",
    acceptedTypes: ".pdf,.jpg,.jpeg,.png",
    required: false,
  },
  {
    key: "photo",
    title: "Passport-size Photo",
    description: "Upload a recent passport-size photograph.",
    acceptedTypes: ".jpg,.jpeg,.png,.webp",
    required: true,
  },
];

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const createInitialState = () =>
  DOCUMENT_CONFIG.reduce((acc, doc) => {
    acc[doc.key] = {
      file: null,
      error: "",
      status: "Not uploaded",
    };
    return acc;
  }, {});

const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const DocumentUploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState(createInitialState);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRefs = useRef({});

  useEffect(() => {
    // Retrieve application ID from sessionStorage
    const appId = sessionStorage.getItem("currentApplicationId");
    if (!appId) {
      setSubmitMessage({ type: "error", text: "No application found. Please start a new application." });
      setTimeout(() => navigate("/dashboard", { replace: true }), 3000);
      return;
    }
    setApplicationId(appId);
  }, [navigate]);

  const uploadedCount = useMemo(
    () => Object.values(documents).filter((item) => item.file).length,
    [documents]
  );

  const requiredCount = useMemo(
    () => DOCUMENT_CONFIG.filter((doc) => doc.required).length,
    []
  );

  const readyRequiredCount = useMemo(
    () =>
      DOCUMENT_CONFIG.filter((doc) => doc.required && documents[doc.key]?.file)
        .length,
    [documents]
  );

  const handleChooseFile = (key) => {
    fileInputRefs.current[key]?.click();
  };

  const resetNativeInput = (key) => {
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key].value = "";
    }
  };

  const removeDocument = (key) => {
    setDocuments((prev) => {
      const currentItem = prev[key];
      if (currentItem?.previewUrl) {
        URL.revokeObjectURL(currentItem.previewUrl);
      }
      return {
        ...prev,
        [key]: {
          file: null,
          error: "",
          status: "Not uploaded",
        },
      };
    });
    resetNativeInput(key);
    setSubmitMessage({ type: "", text: "" });
  };

  const validateFile = (file, acceptedTypes) => {
    const acceptedExtensions = acceptedTypes
      .split(",")
      .map((type) => type.trim().toLowerCase());
    const fileName = file.name.toLowerCase();
    const isValidType = acceptedExtensions.some((ext) => fileName.endsWith(ext));
    if (!isValidType) {
      return `Invalid file type. Allowed: ${acceptedTypes}`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`;
    }
    return "";
  };

  const handleFileChange = (key, event) => {
    const selectedFile = event.target.files?.[0];
    const docConfig = DOCUMENT_CONFIG.find((doc) => doc.key === key);
    if (!selectedFile || !docConfig) return;

    const validationError = validateFile(selectedFile, docConfig.acceptedTypes);

    setDocuments((prev) => {
      if (validationError) {
        return {
          ...prev,
          [key]: {
            file: null,
            error: validationError,
            status: "Not uploaded",
          },
        };
      }
      return {
        ...prev,
        [key]: {
          file: selectedFile,
          error: "",
          status: "Ready",
        },
      };
    });
    setSubmitMessage({ type: "", text: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitMessage({ type: "", text: "" });

    // Validate required files
    const missingRequired = [];
    DOCUMENT_CONFIG.forEach((doc) => {
      if (doc.required && !documents[doc.key].file) {
        missingRequired.push(doc.title);
      }
    });

    if (missingRequired.length > 0) {
      setSubmitMessage({
        type: "warning",
        text: "Please upload all required documents before continuing.",
      });
      return;
    }

    if (!applicationId) {
      setSubmitMessage({ type: "error", text: "No application ID found. Please start a new application." });
      return;
    }

    if (!user) {
      setSubmitMessage({ type: "error", text: "You must be logged in to upload documents." });
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    DOCUMENT_CONFIG.forEach((doc) => {
      const file = documents[doc.key]?.file;
      if (file) {
        formData.append(doc.key, file);
      }
    });

    setUploading(true);

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await axios.post(
        `${API_URL}/api/users/application/${applicationId}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSubmitMessage({ type: "success", text: "Documents uploaded successfully!" });
        sessionStorage.removeItem("currentApplicationId");
        sessionStorage.removeItem("currentApplicationType");
        setTimeout(() => navigate("/payment", { replace: true }), 1500);
      } else {
        setSubmitMessage({ type: "error", text: "Upload failed. Please try again." });
      }
    } catch (error) {
      console.error("Document upload error:", error);
      setSubmitMessage({
        type: "error",
        text: error.response?.data?.message || "An error occurred while uploading documents.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="document-upload-page">
      <div className="document-upload-page__background" />
      <div className="document-upload-page__overlay" />

      <div className="document-upload-page__content">
        <div className="document-upload-topbar-row">
          <div className="document-upload-menu-wrap">
            <button
              type="button"
              className={`document-upload-menu-toggle ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div className={`document-upload-dropdown-nav ${menuOpen ? "open" : ""}`}>
              <div className="document-upload-dropdown-header">
                <span className="document-upload-dropdown-kicker">VROT Portal</span>
                <h3>Quick Navigation</h3>
              </div>
              <div className="document-upload-dropdown-links">
                <a href="/dashboard" className="document-upload-dropdown-link">Dashboard</a>
                <a href="/vehicle" className="document-upload-dropdown-link">Vehicle Registration</a>
                <a href="/document-upload" className="document-upload-dropdown-link active">Document Upload</a>
                <a href="/status" className="document-upload-dropdown-link">Application Status</a>
              </div>
              <button type="button" className="document-upload-dropdown-logout">Logout</button>
            </div>
          </div>

          <header className="document-upload-topbar">
            <div className="document-upload-branding">
              <p className="document-upload-brand-kicker">Vehicle Ownership Workflow</p>
              <h1>Document Upload</h1>
            </div>
            <div className="document-upload-profile-block">
              <div className="document-upload-profile-avatar">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="document-upload-profile-text">
                <strong>{user?.name || "Citizen User"}</strong>
                <span>Document Verification Step</span>
              </div>
            </div>
          </header>
        </div>

        {/* Progress Strip */}
        <div className="document-upload-progress-strip">
          <div className="document-upload-progress-strip__steps">
            <div className="document-upload-progress-strip__step completed">
              <div className="step-circle">✓</div>
              <span className="step-label">Vehicle Details</span>
            </div>
            <div className="document-upload-progress-strip__step active">
              <div className="step-circle">2</div>
              <span className="step-label">Upload Documents</span>
            </div>
            <div className="document-upload-progress-strip__step">
              <div className="step-circle">3</div>
              <span className="step-label">Payment</span>
            </div>
            <div className="document-upload-progress-strip__step">
              <div className="step-circle">4</div>
              <span className="step-label">Confirmation</span>
            </div>
          </div>
        </div>

        <section className="document-upload-form-section">
          <div className="document-upload-form-shell">
            <div className="document-upload-form-intro">
              <span className="document-upload-hero__tag">Secure Upload Panel</span>
              <h2>Upload Required Documents</h2>
              <p className="document-upload-hero__text">
                Submit identity and vehicle-related documents. Required items must be uploaded before proceeding to payment.
              </p>
            </div>

            <div className="document-upload-overview">
              <div className="document-upload-overview-card">
                <span className="document-upload-overview-label">Uploaded</span>
                <strong>{uploadedCount}/{DOCUMENT_CONFIG.length}</strong>
                <p>Files uploaded</p>
              </div>
              <div className="document-upload-overview-card">
                <span className="document-upload-overview-label">Required Ready</span>
                <strong>{readyRequiredCount}/{requiredCount}</strong>
                <p>Required documents completed</p>
              </div>
              <div className="document-upload-overview-card">
                <span className="document-upload-overview-label">File Limit</span>
                <strong>{MAX_FILE_SIZE_MB} MB</strong>
                <p>Max size per file</p>
              </div>
            </div>

            {submitMessage.text && (
              <div className={`document-upload-form-message document-upload-form-message--${submitMessage.type}`}>
                {submitMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="document-upload-grid">
                {DOCUMENT_CONFIG.map((doc) => {
                  const current = documents[doc.key];
                  const hasFile = Boolean(current.file);
                  return (
                    <article className="document-upload-card" key={doc.key}>
                      <div className="document-upload-card-header">
                        <div>
                          <h3>{doc.title}</h3>
                          <p>{doc.description}</p>
                        </div>
                        {doc.required && <span className="required-badge">Required</span>}
                      </div>
                      <div className="document-upload-meta">
                        <span>Accepted: {doc.acceptedTypes}</span>
                        <span>Max {MAX_FILE_SIZE_MB} MB</span>
                      </div>

                      <input
                        ref={(el) => (fileInputRefs.current[doc.key] = el)}
                        type="file"
                        accept={doc.acceptedTypes}
                        className="hidden-file-input"
                        onChange={(e) => handleFileChange(doc.key, e)}
                      />

                      <div className="document-upload-actions">
                        <button type="button" className="btn-choose" onClick={() => handleChooseFile(doc.key)}>
                          {hasFile ? "Replace File" : "Choose File"}
                        </button>
                        <button type="button" className="btn-remove" onClick={() => removeDocument(doc.key)} disabled={!hasFile}>
                          Remove
                        </button>
                      </div>

                      {hasFile && (
                        <div className="file-info">
                          <div><span>File:</span> {current.file.name}</div>
                          <div><span>Size:</span> {formatFileSize(current.file.size)}</div>
                          <div className="status-pill ready">✓ Uploaded</div>
                        </div>
                      )}

                      {!hasFile && !current.error && (
                        <div className="file-placeholder">No file selected</div>
                      )}

                      {current.error && <div className="error-message">{current.error}</div>}
                    </article>
                  );
                })}
              </div>

              <div className="document-upload-footer">
                <button type="submit" className="continue-payment-btn" disabled={uploading}>
                  {uploading ? "Uploading..." : "Continue to Payment"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DocumentUploadPage;