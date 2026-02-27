import React, { useEffect, useState } from "react";
import { mdiDelete, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../../../Component/Pagination";
import RemittanceConfig from "../../../config/RemittanceDetails/RemittanceConfig";
import api from "../../../utils/api";
function cod_remittance() {
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

        setCodDataList(res?.data?.data || []);
        setTotalCount(res?.data?.total || 0);
      } catch (error) {
        console.error("Remittance fetch error", error);
        setCodDataList([]);
      } finally {
        setLoading(false);
      }
    };
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
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    <div className="dot-opacity-loader">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </td>
                </tr>
              ) : codDataList.length ? (
                codDataList.map((item) => (
                  <tr key={item.id}>
                    <td>{item.created_at || "-"}</td>
                    <td>{item.particulars || "-"}</td>
                    <td>{item.transaction_id || "-"}</td>
                    <td>₹ {item.amount || 0}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.type === "credit"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {item.type}
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

export default cod_remittance