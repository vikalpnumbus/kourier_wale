import React, { useEffect, useState } from "react";
import { mdiEye } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../../utils/api";
import Pagination from "../../../Component/Pagination";
import { formatDateTime } from "../../../middleware/CommonFunctions";
import escalationConfig from "../../../config/Escalation/EscalationConfig";

function EscalationTable() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [totalCount, setTotalCount] = useState(0);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      const url = `${escalationConfig.escalationApi}?${params.toString()}`;
      const { data } = await api.get(url);
      setDataList(data?.data?.result || []);
      setTotalCount(data?.data?.total || 0);
    } catch (error) {
      console.error("Fetch escalation error:", error);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, [searchParams]);

  // 🎯 Status class mapping
  const getStatusClass = (status) => {
    switch (status) {
      case "open":
        return "status-open";
      case "in_progress":
        return "status-inprogress";
      case "resolved":
        return "status-resolved";
      case "closed":
        return "status-closed";
      default:
        return "status-pending";
    }
  };

  // 🎯 Type class mapping
  const getTypeClass = (type) => {
    switch (type) {
      case "tech":
        return "type-tech";
      case "billing":
        return "type-billing";
      case "shipment":
        return "type-shipment";
      case "cod":
        return "type-cod";
      default:
        return "type-other";
    }
  };

  console.log("db data",dataList);
  return (
    <div className="table-card">

      {/* HEADER */}
      <div className="table-header">
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className="table-title">Escalation Tickets</span>
          <span className="table-count">{totalCount} tickets</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Details</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Status</th>
              <th className="center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : dataList.length > 0 ? (
              dataList.map((item, index) => (
                <tr key={item.id}>

                  {/* Ticket ID */}
                  <td>
                    <span className="ticket-num">#{item.id}</span>
                  </td>

                  {/* TYPE */}
                  <td>
                    <span className={`type-badge ${getTypeClass(item.type)}`}>
                      {item.type || "Other"}
                    </span>
                  </td>

                  {/* DETAILS */}
                  <td className="details-cell">
                    <div className="details-title">
                      {item.subject || "No title"}
                    </div>
                    <div className="details-sub">
                      {item.query || "No description"}
                    </div>
                  </td>

                  {/* CREATED */}
                  <td className="date-cell">
                    {item.createdAt ? formatDateTime(item.createdAt) : ""}
                  </td>

                  {/* UPDATED */}
                  <td>
                    {item.updatedAt ? formatDateTime(item.updatedAt) : ""}
                  </td>

                  {/* STATUS */}
                  <td className="center">
                    <span
                      className={`status-pill ${getStatusClass(item.status)}`}
                    >
                      {item.status || "pending"}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td class="center">
                    <Link
                      to={`view/${item.id}`}
                      className="view-btn"
                    >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {dataList.length > 0 && !loading && (
        <div className="table-footer">
          <span className="pagination-info">
            Total {totalCount} entries
          </span>
          <Pagination totalCount={totalCount} />
        </div>
      )}
    </div>
  );
}

export default EscalationTable;