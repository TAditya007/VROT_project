import React, { useMemo, useState, useEffect } from 'react';
import './StatusPage.css';

// Helper: format date
const formatDate = (isoString) => {
  if (!isoString) return 'Pending';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper: get status display based on application progress
const getApplicationStatus = (appData) => {
  if (appData.paymentComplete && appData.paymentInfo?.status === 'pending_verification') {
    return { text: 'Payment Verification Pending', className: 'pending' };
  }
  if (appData.paymentComplete && appData.adminApproved) {
    return { text: 'Approved', className: 'approved' };
  }
  if (appData.uploadComplete && !appData.paymentComplete) {
    return { text: 'Awaiting Payment', className: 'pending' };
  }
  if (appData.submittedAt && !appData.uploadComplete) {
    return { text: 'Document Upload Pending', className: 'pending' };
  }
  return { text: 'Under Process', className: 'review' };
};

// Helper: build timeline from application data
const buildTimeline = (appData, serviceType) => {
  const timeline = [];
  const submittedDate = formatDate(appData.submittedAt);
  const uploadDate = formatDate(appData.uploadTimestamp);
  const paymentDate = appData.paymentInfo?.dateTime ? formatDate(appData.paymentInfo.dateTime) : 'Pending';
  const approvalDate = appData.adminApproved ? formatDate(appData.approvedAt) : 'Pending';

  timeline.push({ title: 'Application Submitted', date: submittedDate, status: 'completed' });

  if (appData.uploadComplete) {
    timeline.push({ title: 'Documents Uploaded', date: uploadDate, status: 'completed' });
  } else {
    timeline.push({ title: 'Documents Uploaded', date: 'Pending', status: 'current' });
  }

  if (appData.paymentComplete) {
    timeline.push({ title: 'Payment Confirmed', date: paymentDate, status: 'completed' });
  } else if (appData.uploadComplete) {
    timeline.push({ title: 'Payment Confirmed', date: 'Pending', status: 'current' });
  } else {
    timeline.push({ title: 'Payment Confirmed', date: 'Pending', status: 'upcoming' });
  }

  if (appData.adminApproved) {
    timeline.push({ title: 'Admin Approval', date: approvalDate, status: 'completed' });
  } else if (appData.paymentComplete) {
    timeline.push({ title: 'Admin Approval', date: 'Pending', status: 'current' });
  } else {
    timeline.push({ title: 'Admin Approval', date: 'Pending', status: 'upcoming' });
  }

  return timeline;
};

// Mock search data (for manual lookups)
const mockApplications = {
  VROT2026001: {
    applicantName: 'Rahul Varma',
    applicationId: 'VROT2026001',
    serviceType: 'Ownership Transfer',
    submissionDate: '18 May 2026',
    currentStatus: 'Under Review',
    lastUpdated: '29 May 2026, 4:30 PM',
    remarks: 'All submitted documents were verified successfully. Application is currently under officer review for final approval.',
    pendingActions: ['Keep original RC and Aadhaar ready.', 'Monitor status for approval.'],
    timeline: [
      { title: 'Submitted', date: '18 May 2026', status: 'completed' },
      { title: 'Documents Verified', date: '20 May 2026', status: 'completed' },
      { title: 'Payment Confirmed', date: '20 May 2026', status: 'completed' },
      { title: 'Under Review', date: '29 May 2026', status: 'current' },
      { title: 'Approved', date: 'Pending', status: 'upcoming' },
    ],
  },
  VROT2026002: {
    applicantName: 'Sneha Reddy',
    applicationId: 'VROT2026002',
    serviceType: 'Vehicle Registration',
    submissionDate: '12 May 2026',
    currentStatus: 'Approved',
    lastUpdated: '27 May 2026, 11:15 AM',
    remarks: 'Vehicle registration approved. RC available for download.',
    pendingActions: ['Download RC from receipt page.'],
    timeline: [
      { title: 'Submitted', date: '12 May 2026', status: 'completed' },
      { title: 'Documents Verified', date: '14 May 2026', status: 'completed' },
      { title: 'Payment Confirmed', date: '14 May 2026', status: 'completed' },
      { title: 'Under Review', date: '22 May 2026', status: 'completed' },
      { title: 'Approved', date: '27 May 2026', status: 'completed' },
    ],
  },
  VROT2026003: {
    applicantName: 'Arjun Kumar',
    applicationId: 'VROT2026003',
    serviceType: 'Duplicate RC Request',
    submissionDate: '10 May 2026',
    currentStatus: 'Rejected',
    lastUpdated: '24 May 2026, 2:05 PM',
    remarks: 'Rejected due to unclear address proof.',
    pendingActions: ['Upload clearer document.'],
    timeline: [
      { title: 'Submitted', date: '10 May 2026', status: 'completed' },
      { title: 'Documents Verified', date: '13 May 2026', status: 'completed' },
      { title: 'Payment Confirmed', date: '13 May 2026', status: 'completed' },
      { title: 'Under Review', date: '20 May 2026', status: 'completed' },
      { title: 'Rejected', date: '24 May 2026', status: 'rejected' },
    ],
  },
};

const StatusPage = () => {
  const [applicationId, setApplicationId] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const statusMeta = useMemo(
    () => ({
      Approved: { className: 'approved', label: 'Approved' },
      Pending: { className: 'pending', label: 'Pending' },
      Rejected: { className: 'rejected', label: 'Rejected' },
      'Under Review': { className: 'review', label: 'Under Review' },
      'Awaiting Payment': { className: 'pending', label: 'Awaiting Payment' },
      'Payment Verification Pending': { className: 'pending', label: 'Payment Verification Pending' },
      'Document Upload Pending': { className: 'pending', label: 'Document Upload Pending' },
    }),
    []
  );

  // On mount, check sessionStorage for any active application
  useEffect(() => {
    const serviceKeys = ['vehicleRegistration', 'ownershipTransfer', 'nocApplication'];
    let found = null;

    for (const key of serviceKeys) {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          // Consider active if payment submitted or upload complete but not yet approved
          if (data.uploadComplete || data.paymentComplete) {
            found = { key, data };
            break;
          }
        } catch (err) {
          console.error(`Error parsing ${key}`, err);
        }
      }
    }

    if (found) {
      // Convert real application data into status display format
      const appData = found.data;
      let serviceType = '';
      if (found.key === 'vehicleRegistration') serviceType = 'Vehicle Registration';
      else if (found.key === 'ownershipTransfer') serviceType = 'Ownership Transfer';
      else if (found.key === 'nocApplication') serviceType = 'NOC Application';

      const statusObj = getApplicationStatus(appData);
      const lastUpdated = appData.paymentInfo?.dateTime || appData.uploadTimestamp || appData.submittedAt;
      const remarks = appData.paymentComplete && appData.paymentInfo?.status === 'pending_verification'
        ? 'Your payment transaction ID has been submitted. Admin will verify and update the status shortly.'
        : (appData.uploadComplete && !appData.paymentComplete)
        ? 'Please complete the payment to proceed. Scan the QR code on the payment page.'
        : 'Your application has been submitted. Upload required documents to continue.';

      const pendingActions = appData.paymentComplete && appData.paymentInfo?.status === 'pending_verification'
        ? ['Wait for admin verification.', 'Check status after 24 hours.', 'Keep transaction ID for reference.']
        : (appData.uploadComplete && !appData.paymentComplete)
        ? ['Complete payment via QR code.', 'Enter transaction ID after payment.', 'Upload any missing documents if required.']
        : ['Upload all required documents.', 'Proceed to payment after upload.'];

      const timeline = buildTimeline(appData, serviceType);

      setResult({
        applicantName: appData.fullName || appData.sellerName || appData.ownerName || 'Applicant',
        applicationId: `${found.key.toUpperCase()}-${Date.now()}`.slice(0, 12),
        serviceType: serviceType,
        submissionDate: formatDate(appData.submittedAt),
        currentStatus: statusObj.text,
        lastUpdated: formatDate(lastUpdated) + (lastUpdated ? '' : ''),
        remarks: remarks,
        pendingActions: pendingActions,
        timeline: timeline,
      });
    }
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    const trimmedId = applicationId.trim().toUpperCase();
    if (!trimmedId) {
      setError('Please enter an Application ID.');
      setResult(null);
      return;
    }
    const foundApplication = mockApplications[trimmedId];
    if (!foundApplication) {
      setError('No application found for this ID.');
      setResult(null);
      return;
    }
    setError('');
    setResult({
      ...foundApplication,
      contact: contactValue.trim(),
    });
  };

  const currentStatusConfig = result
    ? statusMeta[result.currentStatus] || { className: 'pending', label: result.currentStatus }
    : null;

  return (
    <div className="status-page">
      <div className="status-page__glow status-page__glow--one"></div>
      <div className="status-page__glow status-page__glow--two"></div>

      <div className="status-page__container">
        <header className="status-page__hero">
          <span className="status-page__eyebrow">VROT Status Tracking</span>
          <h1>Track your application progress</h1>
          <p>
            Monitor every stage of your vehicle registration or ownership transfer request
            with a clear, secure, and government-tech style tracking view.
          </p>
        </header>

        {/* Search section – always visible but optional */}
        <section className="status-card status-form-card">
          <div className="status-card__header">
            <h2>Search by Application ID</h2>
            <p>Enter an existing Application ID to view its status (historical applications).</p>
          </div>

          <form className="status-form" onSubmit={handleTrack}>
            <div className="status-form__grid">
              <div className="status-form__field">
                <label htmlFor="applicationId">Application ID</label>
                <input
                  id="applicationId"
                  type="text"
                  placeholder="e.g. VROT2026001"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                />
              </div>
              <div className="status-form__field">
                <label htmlFor="contactValue">Mobile or Email (Optional)</label>
                <input
                  id="contactValue"
                  type="text"
                  placeholder="Enter mobile number or email"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                />
              </div>
            </div>
            <div className="status-form__actions">
              <button type="submit" className="status-form__button">Track Status</button>
            </div>
            {error && <div className="status-form__message status-form__message--error">{error}</div>}
          </form>
        </section>

        {!result && !error && (
          <section className="status-card status-empty-state">
            <h3>No active application</h3>
            <p>
              You don't have any pending application. Start a new vehicle registration, ownership transfer, or NOC request from the dashboard.
            </p>
          </section>
        )}

        {result && (
          <>
            <section className="status-card status-summary-card">
              <div className="status-card__header status-summary-card__header">
                <div>
                  <h2>Application summary</h2>
                  <p>Latest status snapshot for the submitted request.</p>
                </div>
                <span className={`status-badge status-badge--${currentStatusConfig.className}`}>
                  {currentStatusConfig.label}
                </span>
              </div>

              <div className="status-summary-grid">
                <div className="status-summary-item">
                  <span className="status-summary-item__label">Applicant Name</span>
                  <strong>{result.applicantName}</strong>
                </div>
                <div className="status-summary-item">
                  <span className="status-summary-item__label">Application ID</span>
                  <strong>{result.applicationId}</strong>
                </div>
                <div className="status-summary-item">
                  <span className="status-summary-item__label">Service Type</span>
                  <strong>{result.serviceType}</strong>
                </div>
                <div className="status-summary-item">
                  <span className="status-summary-item__label">Submission Date</span>
                  <strong>{result.submissionDate}</strong>
                </div>
                <div className="status-summary-item">
                  <span className="status-summary-item__label">Current Status</span>
                  <strong>{result.currentStatus}</strong>
                </div>
                <div className="status-summary-item">
                  <span className="status-summary-item__label">Last Updated</span>
                  <strong>{result.lastUpdated}</strong>
                </div>
              </div>
            </section>

            <section className="status-card">
              <div className="status-card__header">
                <h2>Application timeline</h2>
                <p>Track the current stage and completed milestones.</p>
              </div>
              <div className="timeline">
                {result.timeline.map((item, index) => (
                  <div
                    className={`timeline-item timeline-item--${item.status}`}
                    key={`${item.title}-${index}`}
                  >
                    <div className="timeline-item__marker">
                      <span></span>
                    </div>
                    <div className="timeline-item__content">
                      <div className="timeline-item__top">
                        <h3>{item.title}</h3>
                        <span>{item.date}</span>
                      </div>
                      <p>
                        {item.status === 'completed' && 'Stage completed successfully.'}
                        {item.status === 'current' && 'This is the active stage being processed.'}
                        {item.status === 'upcoming' && 'This stage will begin after previous steps.'}
                        {item.status === 'rejected' && 'Stage ended with rejection.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="status-info-grid">
              <section className="status-card">
                <div className="status-card__header">
                  <h2>Remarks & updates</h2>
                  <p>Officer comments and latest notes.</p>
                </div>
                <div className="status-note">
                  <p>{result.remarks}</p>
                </div>
              </section>

              <section className="status-card">
                <div className="status-card__header">
                  <h2>Pending actions</h2>
                  <p>Recommended next steps for the applicant.</p>
                </div>
                <ul className="status-action-list">
                  {result.pendingActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusPage;