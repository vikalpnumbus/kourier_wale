import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../../../Component/Pagination";
import RemittanceConfig from "../../../config/RemittanceDetails/RemittanceConfig";
import api from "../../../utils/api";

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

  console.log("Remittance List", codDataList);

  return (
    <>
    <div className="remittance-header">
      <div>
        <h4 className="remittance-title">Remittance</h4>
        <p className="remittance-subtitle">
          View your COD remittance history and settlement status
        </p>
      </div>
    </div>
      <div className="table-responsive remittance-table-wrapper">
        <table className="table remittance-table">
          <thead>
            <tr>
              <th>Date / Time</th>
              <th>Transaction ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Remitted Date</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>

          <tbody>
            {codDataList.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="date-text">{item.createdAt}</div>
                </td>

                <td className="text-muted">
                  {item.utr_number || "—"}
                </td>

                <td className="amount-text">
                  ₹ {item.remittance_amount}
                </td>

                <td>
                  <span
                    className={`status-pill ${
                      item.remittance_status === "paid"
                        ? "paid"
                        : "pending"
                    }`}
                  >
                    {item.remittance_status}
                  </span>
                </td>

                <td className="text-muted">
                  {item.remittance_paid_date || "—"}
                </td>

                <td className="text-end">
                  <button className="btn btn-outline-primary btn-sm px-3">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination totalCount={totalCount} />
    </>
  );
}

export default CodRemittance;