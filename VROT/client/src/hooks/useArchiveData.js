// src/hooks/useArchiveData.js

import { useEffect, useMemo, useState } from "react";
import {
  getArchivedRecords,
  restoreArchivedRecord,
  deleteArchivedRecord,
  bulkRestoreArchivedRecords,
  bulkDeleteArchivedRecords,
} from "../services/archiveService";
import { filterArchiveRecords, paginateRecords } from "../utils/archiveHelpers";

export default function useArchiveData() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    archivedBy: "all",
    sort: "newest",
  });

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getArchivedRecords();
      setRecords(data);
    } catch (err) {
      setError("Failed to load archived records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    return filterArchiveRecords(records, filters);
  }, [records, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));

  const paginatedRecords = useMemo(() => {
    return paginateRecords(filteredRecords, page, pageSize);
  }, [filteredRecords, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const updateFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? paginatedRecords.map((item) => item.id) : []);
  };

  const clearSelection = () => setSelectedIds([]);

  const handleRestore = async (id) => {
    await restoreArchivedRecord(id);
    await loadRecords();
    clearSelection();
  };

  const handleDelete = async (id) => {
    await deleteArchivedRecord(id);
    await loadRecords();
    clearSelection();
  };

  const handleBulkRestore = async () => {
    if (!selectedIds.length) return;
    await bulkRestoreArchivedRecords(selectedIds);
    await loadRecords();
    clearSelection();
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    await bulkDeleteArchivedRecords(selectedIds);
    await loadRecords();
    clearSelection();
  };

  return {
    records,
    loading,
    error,
    filters,
    updateFilter,
    filteredRecords,
    paginatedRecords,
    page,
    setPage,
    pageSize,
    totalPages,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleRestore,
    handleDelete,
    handleBulkRestore,
    handleBulkDelete,
    reload: loadRecords,
  };
}