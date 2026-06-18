// src/components/admin/ArchiveStats.jsx

import React from "react";

const StatCard = ({ label, value, accent }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="mt-2 text-2xl font-semibold text-gray-900">{value}</h3>
      </div>
      <div className={`h-12 w-12 rounded-xl ${accent} flex items-center justify-center`}>
        <span className="h-3 w-3 rounded-full bg-white" />
      </div>
    </div>
  </div>
);

export default function ArchiveStats({ stats = {} }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total archived records"
        value={stats.total || 0}
        accent="bg-blue-600"
      />
      <StatCard
        label="Archived applications"
        value={stats.applications || 0}
        accent="bg-green-600"
      />
      <StatCard
        label="Archived users/documents"
        value={stats.usersDocuments || 0}
        accent="bg-orange-500"
      />
      <StatCard
        label="Pending permanent deletion"
        value={stats.pendingDelete || 0}
        accent="bg-red-600"
      />
    </div>
  );
}