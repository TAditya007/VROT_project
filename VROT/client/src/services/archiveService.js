// src/services/archiveService.js

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const mockArchiveData = [
  {
    id: "ARC-1001",
    name: "Ravi Kumar",
    recordType: "Ownership Transfer",
    referenceNo: "TS09AB1234",
    originalStatus: "Completed",
    archivedDate: "2026-06-01",
    archivedBy: "System",
    archiveType: "ownership transfers",
    reason: "Case finalized",
    retentionPeriod: "5 Years",
    priority: "High",
    isReviewed: false,
    notes: "Final transfer completed successfully.",
    vehicleNo: "TS09AB1234",
    userId: "USR-001",
    status: "completed",
    documents: ["RC Copy", "Form 29", "Form 30"],
    timeline: [
      { label: "Submitted", date: "2026-05-20" },
      { label: "Verified", date: "2026-05-23" },
      { label: "Completed", date: "2026-05-31" },
    ],
  },
  {
    id: "ARC-1002",
    name: "Anjali Sharma",
    recordType: "Application",
    referenceNo: "APP-2048",
    originalStatus: "Rejected",
    archivedDate: "2026-05-28",
    archivedBy: "Admin: Priya",
    archiveType: "applications",
    reason: "Incomplete documents",
    retentionPeriod: "2 Years",
    priority: "Medium",
    isReviewed: true,
    notes: "Applicant informed about missing insurance document.",
    vehicleNo: "TS08CD7788",
    userId: "USR-014",
    status: "rejected",
    documents: ["Application Form", "ID Proof"],
    timeline: [
      { label: "Submitted", date: "2026-05-18" },
      { label: "Rejected", date: "2026-05-27" },
    ],
  },
  {
    id: "ARC-1003",
    name: "Suresh Reddy",
    recordType: "User Record",
    referenceNo: "USR-019",
    originalStatus: "Deleted",
    archivedDate: "2026-05-20",
    archivedBy: "Auto-Archived",
    archiveType: "users",
    reason: "Inactive user cleanup",
    retentionPeriod: "7 Years",
    priority: "Low",
    isReviewed: false,
    notes: "",
    vehicleNo: "-",
    userId: "USR-019",
    status: "deleted",
    documents: ["Profile Data"],
    timeline: [
      { label: "Account inactive", date: "2026-04-10" },
      { label: "Archived", date: "2026-05-20" },
    ],
  },
];

export async function getArchivedRecords() {
  await delay();
  return mockArchiveData;
}

export async function getArchivedRecordById(id) {
  await delay(300);
  return mockArchiveData.find((item) => item.id === id) || null;
}

export async function restoreArchivedRecord(id) {
  await delay(500);
  return { success: true, id };
}

export async function deleteArchivedRecord(id) {
  await delay(500);
  return { success: true, id };
}

export async function bulkRestoreArchivedRecords(ids = []) {
  await delay(700);
  return { success: true, ids };
}

export async function bulkDeleteArchivedRecords(ids = []) {
  await delay(700);
  return { success: true, ids };
}