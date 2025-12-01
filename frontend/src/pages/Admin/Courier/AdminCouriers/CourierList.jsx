import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../../../utils/api";
import Pagination from "../../../../Component/Pagination";
import courierConfig from "../../../../config/Courier/CourierConfig";
import { useAlert } from "../../../../middleware/AlertContext";

function CourierList() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [totalCount, setTotalCount] = useState(0);
  const { showError, showSuccess } = useAlert();

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      const url = `${courierConfig.courierApi}?${params.toString()}`;

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

  // PATCH Update Status
  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "1" ? "0" : "1";

    try {
      await api.patch(`${courierConfig.courierApi}/${id}`, {
        status: newStatus,
      });

      setDataList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
      showSuccess("Courier status updated successfully");
    } catch (error) {
      console.error("Status update failed:", error);
      showError("Failed to update courier status");
    }
  };

  useEffect(() => {
    handleFetchData();
  }, [searchParams]);

  return (
    <div className="tab-content tab-content-vertical">
      <div className="tab-pane fade show active" role="tabpanel">
        <div className="table-responsive h-100">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Courier Id</th>
                <th>Code</th>
                <th>Courier Type</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">
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
                    <td className="py-3">{data?.name || ""}</td>
                    <td className="py-3">{data?.id || ""}</td>
                    <td className="py-3">{data?.code || ""}</td>
                    <td className="py-3">{data?.courier_type || ""}</td>

                    {/* Toggle Button */}
                    <td className="py-3">
                      <div className=" form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={data?.status === "1"}
                          onChange={() =>
                            handleStatusToggle(data.id, data.status)
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
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
  );
}

export default CourierList;
