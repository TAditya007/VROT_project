import React, { useMemo, useState } from "react";
import "./AdminReportsPage.css";

const initialReports = [
  { id: "VROT-1001", applicant: "A. Kumar", serviceType: "Ownership Transfer", status: "Pending", date: "2026-06-02", amount: 450 },
  { id: "VROT-1002", applicant: "S. Reddy", serviceType: "New Registration", status: "Approved", date: "2026-06-03", amount: 800 },
  { id: "VROT-1003", applicant: "M. Khan", serviceType: "NOC Issuance", status: "Under Review", date: "2026-05-29", amount: 300 },
  { id: "VROT-1004", applicant: "P. Sharma", serviceType: "Fitness Certificate", status: "Rejected", date: "2026-05-26", amount: 250 },
  { id: "VROT-1005", applicant: "R. Devi", serviceType: "Ownership Transfer", status: "Approved", date: "2026-06-05", amount: 450 },
  { id: "VROT-1006", applicant: "N. Ali", serviceType: "Duplicate RC", status: "Pending", date: "2026-06-06", amount: 280 }
];

const statusOptions = ["All", "Pending", "Approved", "Rejected", "Under Review"];
const serviceOptions = ["All", "Ownership Transfer", "New Registration", "NOC Issuance", "Fitness Certificate", "Duplicate RC"];

const getMonthLabel = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", { month: "short" });
};

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState("7d");
  const [serviceType, setServiceType] = useState("All");
  const [status, setStatus] = useState("All");

  const filteredReports = useMemo(() => {
    const now = new Date("2026-06-08");
    const startDate = new Date(now);
    if (dateRange === "7d") startDate.setDate(now.getDate() - 7);
    if (dateRange === "30d") startDate.setDate(now.getDate() - 30);
    if (dateRange === "90d") startDate.setDate(now.getDate() - 90);

    return initialReports.filter((item) => {
      const itemDate = new Date(item.date);
      const dateOk = dateRange === "all" ? true : itemDate >= startDate;
      const serviceOk = serviceType === "All" ? true : item.serviceType === serviceType;
      const statusOk = status === "All" ? true : item.status === status;
      return dateOk && serviceOk && statusOk;
    });
  }, [dateRange, serviceType, status]);

  const stats = useMemo(() => {
    const total = filteredReports.length;
    const approved = filteredReports.filter((r) => r.status === "Approved").length;
    const rejected = filteredReports.filter((r) => r.status === "Rejected").length;
    const pending = filteredReports.filter((r) => r.status === "Pending").length;
    const review = filteredReports.filter((r) => r.status === "Under Review").length;
    return { total, approved, rejected, pending, review };
  }, [filteredReports]);

  const trendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month) => ({
      month,
      count: filteredReports.filter((r) => getMonthLabel(r.date) === month).length
    }));
  }, [filteredReports]);

  const serviceSummary = useMemo(() => {
    return serviceOptions
      .filter((s) => s !== "All")
      .map((service) => ({
        service,
        count: filteredReports.filter((r) => r.serviceType === service).length
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredReports]);

  const maxTrend = Math.max(...trendData.map((d) => d.count), 1);
  const maxService = Math.max(...serviceSummary.map((d) => d.count), 1);

  return (
    <div className="admin-reports-page">
      <div className="page-overlay" />
      <section className="reports-header glass-panel">
        <div>
          <p className="page-kicker">Admin only</p>
          <h1>Admin Reports</h1>
          <p className="page-intro">
            Monitor VROT request flow, approval performance, and service activity from a transparent analytics dashboard.
          </p>
        </div>
        <button className="export-btn primary-btn" type="button">Export Report</button>
      </section>

      <section className="summary-cards">
        <div className="stat-card glass-panel">
          <span>Total Applications</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card glass-panel approved">
          <span>Approved</span>
          <strong>{stats.approved}</strong>
        </div>
        <div className="stat-card glass-panel rejected">
          <span>Rejected</span>
          <strong>{stats.rejected}</strong>
        </div>
        <div className="stat-card glass-panel pending">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="stat-card glass-panel review">
          <span>Under Review</span>
          <strong>{stats.review}</strong>
        </div>
      </section>

      <section className="filters-panel glass-panel">
        <div className="filter-group">
          <label>Date Range</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Service Type</label>
          <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
            {serviceOptions.map((service) => <option key={service} value={service}>{service}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </section>

      <section className="charts-area">
        <div className="chart-card glass-panel">
          <div className="section-title">
            <h2>Processing Trend</h2>
            <span>Monthly request volume</span>
          </div>
          <div className="bar-chart">
            {trendData.map((item) => (
              <div className="bar-item" key={item.month}>
                <div className="bar-value" style={{ height: `${(item.count / maxTrend) * 180}px` }} />
                <p>{item.month}</p>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card glass-panel">
          <div className="section-title">
            <h2>Top Service Categories</h2>
            <span>Filtered distribution</span>
          </div>
          <div className="service-list">
            {serviceSummary.map((item) => (
              <div className="service-row" key={item.service}>
                <div className="service-meta">
                  <strong>{item.service}</strong>
                  <span>{item.count} requests</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${(item.count / maxService) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="report-table-card glass-panel">
        <div className="section-title">
          <h2>Report Table</h2>
          <span>Mock analytics records</span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="empty-state">
            <h3>No results found</h3>
            <p>Try changing the date range, service type, or status filter.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Applicant</th>
                  <th>Service Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Fee</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.applicant}</td>
                    <td>{row.serviceType}</td>
                    <td><span className={`status-pill ${row.status.toLowerCase().replace(/\s/g, "-")}`}>{row.status}</span></td>
                    <td>{row.date}</td>
                    <td>₹{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}