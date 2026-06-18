// src/utils/archiveHelpers.js

export const archiveTypeOptions = [
  "all",
  "applications",
  "users",
  "documents",
  "payments",
  "ownership transfers",
];

export const archiveStatusOptions = [
  "all",
  "completed",
  "rejected",
  "cancelled",
  "deleted",
  "expired",
];

export const archiveSortOptions = ["newest", "oldest", "priority"];

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getStatusBadgeClass(status = "") {
  const key = String(status).toLowerCase();
  if (key === "completed") return "bg-green-100 text-green-700 border-green-200";
  if (key === "rejected") return "bg-red-100 text-red-700 border-red-200";
  if (key === "cancelled") return "bg-orange-100 text-orange-700 border-orange-200";
  if (key === "deleted") return "bg-gray-100 text-gray-700 border-gray-200";
  if (key === "expired") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
}

export function getArchiveTypeLabel(type = "") {
  const key = String(type).toLowerCase();
  if (key === "ownership transfers") return "Ownership Transfer";
  if (key === "applications") return "Application";
  if (key === "users") return "User Record";
  if (key === "documents") return "Document";
  if (key === "payments") return "Payment";
  return type || "-";
}

export function matchesSearch(record, query = "") {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const fields = [
    record.id,
    record.name,
    record.recordType,
    record.referenceNo,
    record.vehicleNo,
    record.userId,
    record.reason,
  ];

  return fields.some((field) => String(field || "").toLowerCase().includes(q));
}

export function filterArchiveRecords(records = [], filters = {}) {
  const {
    search = "",
    type = "all",
    status = "all",
    archivedBy = "all",
    sort = "newest",
  } = filters;

  let result = records.filter((record) => {
    const typeOk = type === "all" || record.archiveType === type;
    const statusOk = status === "all" || record.status === status;
    const archivedByOk =
      archivedBy === "all" ||
      String(record.archivedBy || "").toLowerCase() === String(archivedBy).toLowerCase() ||
      (archivedBy === "system" && String(record.archivedBy || "").toLowerCase().includes("system")) ||
      (archivedBy === "auto" && String(record.archivedBy || "").toLowerCase().includes("auto"));
    return typeOk && statusOk && archivedByOk && matchesSearch(record, search);
  });

  if (sort === "newest") {
    result = [...result].sort((a, b) => new Date(b.archivedDate) - new Date(a.archivedDate));
  } else if (sort === "oldest") {
    result = [...result].sort((a, b) => new Date(a.archivedDate) - new Date(b.archivedDate));
  } else if (sort === "priority") {
    const order = { high: 1, medium: 2, low: 3 };
    result = [...result].sort(
      (a, b) => (order[String(a.priority).toLowerCase()] || 99) - (order[String(b.priority).toLowerCase()] || 99)
    );
  }

  return result;
}

export function paginateRecords(records = [], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  return records.slice(start, start + pageSize);
}