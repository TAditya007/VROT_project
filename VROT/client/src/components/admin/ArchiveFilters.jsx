// src/components/admin/ArchiveFilters.jsx

import React from "react";
import {
  archiveTypeOptions,
  archiveStatusOptions,
  archiveSortOptions,
} from "../../utils/archiveHelpers";

export default function ArchiveFilters({ filters, onChange }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
            placeholder="Search by application ID, RC number, user name, vehicle number, or document name"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Archive Type</label>
          <select
            value={filters.type}
            onChange={(e) => onChange("type", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            {archiveTypeOptions.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All Types" : item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onChange("status", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            {archiveStatusOptions.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All Statuses" : item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => onChange("sort", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            {archiveSortOptions.map((item) => (
              <option key={item} value={item}>
                {item === "newest" ? "Newest" : item === "oldest" ? "Oldest" : "Priority"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Archived By</label>
          <select
            value={filters.archivedBy}
            onChange={(e) => onChange("archivedBy", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="system">System</option>
            <option value="admin">Admin Name</option>
            <option value="auto">Auto-Archived</option>
          </select>
        </div>
      </div>
    </div>
  );
}