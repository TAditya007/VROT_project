// src/components/admin/ArchiveDetailsPanel.jsx

import React from "react";
import { formatDate, getStatusBadgeClass, getArchiveTypeLabel } from "../../utils/archiveHelpers";

export default function ArchiveDetailsPanel({ record, onClose }) {
  if (!record) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Select an archived record to view full details.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Archive Details</p>
          <h3 className="text-xl font-semibold text-gray-900">{record.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{record.id}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>

      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Record Type</p>
            <p className="font-medium text-gray-900">{getArchiveTypeLabel(record.archiveType)}</p>
          </div>
          <div>
            <p className="text-gray-500">Original Status</p>
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                record.status
              )}`}
            >
              {record.originalStatus}
            </span>
          </div>
          <div>
            <p className="text-gray-500">Reference Number</p>
            <p className="font-medium text-gray-900">{record.referenceNo || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">Archived Date</p>
            <p className="font-medium text-gray-900">{formatDate(record.archivedDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">Archived By</p>
            <p className="font-medium text-gray-900">{record.archivedBy}</p>
          </div>
          <div>
            <p className="text-gray-500">Retention Period</p>
            <p className="font-medium text-gray-900">{record.retentionPeriod}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-500">Reason for Archive</p>
          <p className="font-medium text-gray-900">{record.reason || "-"}</p>
        </div>

        <div>
          <p className="text-gray-500">Admin Notes</p>
          <p className="font-medium text-gray-900">{record.notes || "No notes added."}</p>
        </div>

        <div>
          <p className="text-gray-500">Uploaded Documents</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-900">
            {(record.documents || []).map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-gray-500">Timeline</p>
          <div className="mt-2 space-y-2">
            {(record.timeline || []).map((item, index) => (
              <div key={index} className="rounded-xl bg-gray-50 px-3 py-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-blue-800">
          Restore Eligibility: Eligible for restore if retention policy is not expired.
        </div>
      </div>
    </div>
  );
}