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
      <div className="table-responsive h-100">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Date / Time</th>
              <th>Particulars</th>
              <th>Transaction</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">Loading...</td>
              </tr>
            ) : codDataList.length > 0 ? (
              codDataList.map((item) => (
                <tr key={item.id}>
                  <td>{item.createdAt}</td>
                  <td>{item.user?.companyName}</td>
                  <td>{item.awb_numbers}</td>
                  <td>₹ {item.remittance_amount}</td>
                  <td>
                    <span
                      className={`badge ${
                        item.remittance_status === "paid"
                          ? "bg-success"
                          : "bg-warning"
                      }`}
                    >
                      {item.remittance_status}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`view/${item.id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination totalCount={totalCount} />
    </>
  );
}

export default CodRemittance;