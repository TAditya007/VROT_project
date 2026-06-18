// src/components/admin/ArchiveTable.jsx

import React from "react";
import { formatDate, getStatusBadgeClass, getArchiveTypeLabel } from "../../utils/archiveHelpers";

export default function ArchiveTable({
  records = [],
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onRestore,
  onDelete,
}) {
  const allSelected = records.length > 0 && selectedIds.length === records.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Archive ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                User / Application
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Record Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Vehicle / Ref No
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Original Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Archived Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Archived By
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Reason
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {records.map((record) => {
              const selected = selectedIds.includes(record.id);
              return (
                <tr key={record.id} className={selected ? "bg-blue-50/50" : ""}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleSelect(record.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{record.id}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{record.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{getArchiveTypeLabel(record.archiveType)}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{record.referenceNo || "-"}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                        record.status
                      )}`}
                    >
                      {record.originalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{formatDate(record.archivedDate)}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{record.archivedBy}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{record.reason}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onView(record)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onRestore(record.id)}
                        className="rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => onDelete(record.id)}
                        className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}