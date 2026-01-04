import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../../../Component/Pagination";
import api from "../../../utils/api";
import { encrypt } from "../../../middleware/Encryption";
import usersConfig from "../../../config/AdminConfig/Users/Users";
import { formatDateTime, getLastNDaysRange } from "../../../middleware/CommonFunctions";
import ApproveRejectModal from "./ApproveRejectModal";
import { useAlert } from "../../../middleware/AlertContext";

function UsersTable() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [totalCount, setTotalCount] = useState(0);
  const [modalData, setModalData] = useState(null);
  const [defaultStart, defaultEnd] = useMemo(() => getLastNDaysRange(7), []);
  const { showSuccess, showError } = useAlert();

  const handleFetchData = async () => {
    setLoading(true);
    try {

      const params = {
        page: parseInt(searchParams.get("page") || "1", 10),
        limit: parseInt(searchParams.get("limit") || "10", 10),
        start_date: searchParams.get("start_date") || defaultStart,
        end_date: searchParams.get("end_date") || defaultEnd,
      };
      const optionalKeys = [
        "name",
        "email",
        "phone",
        "isVerified",
        "isActive",
        "userId"
      ];
      optionalKeys.forEach((key) => {
        const value = searchParams.get(key)?.trim();
        if (value) params[key] = value;
      });

      const query = Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .join("&");

      const url = `${usersConfig.userList}?${query}`;

      const { data } = await api.get(url);

      setDataList(data?.data?.result || []);
      setTotalCount(data?.data?.total || 0);
    } catch (err) {
      setDataList([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await api.patch(
        `${usersConfig.userApi}/${userId}`,
        { isActive: !currentStatus }
      );

      setDataList((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isActive: !currentStatus } : u
        )
      );
      showSuccess("User status updated successfully");
    } catch (error) {
      console.error('error: ', error);
      showError("Failed to update user status");
    }
  };


  useEffect(() => {
    handleFetchData();
  }, [searchParams]);

  return (
    <>
      {/* Modal */}
      {modalData && (
        <ApproveRejectModal
          userId={modalData.id}
          action={modalData.action}
          onClose={(refresh) => {
            setModalData(null);
            if (refresh) handleFetchData();
          }}
        />
      )}

      <div className="tab-content tab-content-vertical">
        <div className="tab-pane fade show active">
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
                  <th>Active</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8">
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
                      <td><Link to={`view/${data.id}`}>{data?.fname}</Link></td>
                      <td>{data?.email}</td>
                      <td>{data?.companyName}</td>
                      <td>
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

                      <td>
                        {data?.createdAt ? formatDateTime(data.createdAt) : ""}
                      </td>

                      <td>
                        {data?.isVerified ? (
                          <span className="text-success">Verified</span>
                        ) : (
                          <div className="btn-group">
                            <button
                              className="btn btn-outline-primary btn-md px-3"
                              onClick={() =>
                                setModalData({ id: data.id, action: "approve" })
                              }
                            >
                              Approve
                            </button>

                            <button
                              className="btn btn-outline-danger btn-md px-3"
                              onClick={() =>
                                setModalData({ id: data.id, action: "reject" })
                              }
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className=" form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={!!data?.isActive}
                            onChange={() =>
                              handleToggleActive(data.id, data.isActive)
                            }
                          />
                        </div>
                      </td>


                      <td>
                        <Link
                          to="/dashboard"
                          target="_blank"
                          className="btn btn-outline-primary px-3"
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
                    <td colSpan="8" className="text-center">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {dataList.length > 0 && !loading && (
            <Pagination totalCount={totalCount} />
          )}
        </div>
      </div>
    </>
  );
}

export default UsersTable;
