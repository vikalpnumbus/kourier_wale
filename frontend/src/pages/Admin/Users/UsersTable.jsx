import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAlert } from "../../../middleware/AlertContext";
import Pagination from "../../../Component/Pagination";
import api from "../../../utils/api";
import { encrypt } from "../../../middleware/Encryption";

function UsersTable() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      const url = `http://localhost:3001/api/v1/users/list?${params.toString()}`;

      const { data } = await api.get(url);

      setDataList(data?.data?.result || []);
      setTotalCount(data?.data?.total || 0);
    } catch (error) {
      console.error("Fetch error:", error);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, [searchParams]);

  return (
    <>
      <div className="tab-content tab-content-vertical">
        <div className="tab-pane fade show active" role="tabpanel">
          <div className="table-responsive h-100">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>E-mail</th>
                  <th>Company Name</th>
                  <th>Pricing Plan</th>
                  <th>Created At</th>
                  <th>Verified</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7">
                      <div className="dot-opacity-loader">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </td>
                  </tr>
                ) : dataList.length > 0 ? (
                  dataList.map((data) => (
                    <tr key={data.id}>
                      <td className="py-2">{data?.fname || ""}</td>
                      <td className="py-2">{data?.email || ""}</td>
                      <td className="py-2">{data?.company_name || ""}</td>
                      <td className="py-2">
                        {data?.pricingPlanId === 1
                          ? "Bronze"
                          : data?.pricingPlanId === 2
                          ? "Silver"
                          : data?.pricingPlanId === 3
                          ? "Gold"
                          : data?.pricingPlanId === 4
                          ? "Platinum"
                          : ""}
                      </td>
                      <td className="py-2">
                        date
                      </td>
                      <td className="py-2">
                        {data?.isVerified ? (
                          <span className="text-success">Verified</span>
                        ) : (
                          <div className="btn-group">
                            <button className="btn btn-outline-primary btn-md py-2 px-3">
                              Approve
                            </button>
                            <button className="btn btn-outline-primary btn-md py-2 px-3">
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-2">
                        <Link
                          to="/dashboard"
                          target="_blank"
                          className="btn btn-outline-primary py-2 px-3"
                          onClick={() => {
                            localStorage.clear();
                            localStorage.setItem("token", data.token);
                            localStorage.setItem("role", encrypt("user"));
                          }}
                        >
                          Login
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
          <Pagination totalCount={totalCount} />
        </div>
      </div>
    </>
  );
}

export default UsersTable;
