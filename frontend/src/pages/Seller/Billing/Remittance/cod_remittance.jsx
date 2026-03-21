import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../../../../Component/Pagination";
import RemittanceConfig from "../../../../config/RemittanceDetails/RemittanceConfig";
import api from "../../../../utils/api";

function CodRemittance() {
  const [codDataList, setCodDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || 1;
  useEffect(() => {
    fetchRemittance();
  }, [page]);

  const fetchRemittance = async () => {
    try {
      setLoading(true);
      const res = await api.get(RemittanceConfig.remittance_list, {
        params: { page },
      });

      // ✅ CORRECT PATH
      setCodDataList(res.data.data.result || []);
      setTotalCount(res.data.data.total || 0);
    } catch (error) {
      console.error("Remittance fetch error", error);
      setCodDataList([]);
    } finally {
      setLoading(false);
    }
  };
  return (
  <>
    <div className="table-card">
      <div className="table-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <span className="table-title">Remittance Ledger</span>
          <span className="table-count">
            {codDataList.length} entries
          </span>
        </div>
        <div className="table-actions">
          <button className="tbl-icon-btn" title="Refresh">
            🔄
          </button>
          <button className="tbl-icon-btn" title="Download">
            ⬇️
          </button>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Date / Time</th>
            <th>Transaction ID</th>
            <th className="right">Amount (₹)</th>
            <th className="center">Status</th>
            <th>Remitted Date</th>
            <th>Batch</th>
            <th className="center">Action</th>
          </tr>
        </thead>
        <tbody>
          {codDataList.map((item, index) => (
            <tr key={item.id} style={{ animationDelay: `${index * 0.04}s` }}>
              <td className="date-cell">
                <div className="date-part">
                  {item.createdAt?.split(" ")[0]}
                </div>
                <div className="time-part">
                  {item.createdAt?.split(" ")[1]}
                </div>
              </td>
              <td>
                {item.utr_number ? (
                  <span className="tid-cell">{item.utr_number}</span>
                ) : (
                  <span className="tid-dash">—</span>
                )}
              </td>
              <td className="right">
                <span className="amount-val">
                  ₹{item.remittance_amount}
                </span>
              </td>
              <td className="center">
                <span
                  className={`status-pill ${
                    item.remittance_status === "paid"
                      ? "status-paid"
                      : item.remittance_status === "processing"
                      ? "status-processing"
                      : item.remittance_status === "failed"
                      ? "status-failed"
                      : "status-pending"
                  }`}
                >
                  {item.remittance_status}
                </span>
              </td>
              <td>
                {item.remittance_paid_date ? (
                  <>
                    <div className="date-part">
                      {item.remittance_paid_date.split(" ")[0]}
                    </div>
                    <div className="time-part">
                      {item.remittance_paid_date.split(" ")[1]}
                    </div>
                  </>
                ) : (
                  <span className="remit-dash">—</span>
                )}
              </td>
              <td>
                <span className="batch-tag">
                  {item.batch || "—"}
                </span>
              </td>
              <td className="center">
                <div
                  style={{
                    display: "flex",
                    gap: "0.4rem",
                    justifyContent: "center",
                  }}
                >
                  <button className="action-btn">View</button>

                  {item.remittance_status === "pending" && (
                    <button className="action-btn early">
                      Early
                    </button>
                  )}

                  {item.remittance_status === "failed" && (
                    <button
                      className="action-btn"
                      style={{
                        borderColor: "var(--error)",
                        color: "var(--error)",
                        background: "var(--error-soft)",
                      }}
                    >
                      Retry
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-footer">
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <span className="pagination-info">
            SHOWING {codDataList.length} ENTRIES
          </span>
          <select className="per-page-select">
            <option>10 / page</option>
            <option>25 / page</option>
            <option>50 / page</option>
          </select>
        </div>
        <div className="pagination-controls">
          <button className="page-btn" disabled>{"<"}</button>
          <button className="page-btn active">1</button>
          <button className="page-btn" disabled>{">"}</button>
        </div>
      </div>
    </div>
    <Pagination totalCount={totalCount} />
  </>
);
}

export default CodRemittance;