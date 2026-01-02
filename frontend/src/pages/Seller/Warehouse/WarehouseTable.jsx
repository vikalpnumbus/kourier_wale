import React, { useEffect, useState } from "react";
import { mdiDelete, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";
import Pagination from "../../../Component/Pagination";

function WarehouseTable() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();
  const [totalCount, setTotalCount] = useState(0);

  const handleFetchData = async () => {
    try {
      setLoading(true);

      const search = searchParams.get("search");
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (search) {
        params.append("search", search);
      }
      const url = `${warehouseConfig.warehouseApi}?${params.toString()}`;

      const response = await api.get(url);

      setDataList(response?.data?.data?.result || []);
      setTotalCount(response?.data?.data?.total || 0)
    } catch (error) {
      console.error("Fetch Warehouse Data Error:", error);
      setDataList([]);
      navigate("add");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, actionType, status) => {
    try {
      const url = `${warehouseConfig.warehouseApi}/${id}`;

      if (actionType === "delete") {
        await api.delete(url);
      } else if (actionType === "makePrimary") {
        await api.patch(url, { isPrimary: !status });
      } else if (actionType === "toggleStatus") {
        await api.patch(url, { isActive: !status });
      }

      showSuccess("Warehouse details updated successfully!");
      handleFetchData(); // refresh the list
    } catch (error) {
      console.error("Warehouse Action Error:", error);
      showError("Something went wrong!");
    }
  };

  useEffect(() => {
    handleFetchData();
  }, [searchParams]);

  useEffect(() => {
    if (totalCount === 1) {
      const [item] = dataList;
      if (item && !item.isPrimary) {
        handleAction(item.id, "makePrimary", item.isPrimary);
      }
    }
  }, [totalCount]);

  return (
    <>
      <div className="table-responsive h-100" style={{ minHeight: "250px" }}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Warehouse Name</th>
              <th>Contact Details</th>
              <th>City</th>
              <th>State</th>
              <th>Pincode</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">
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
                  <td className="py-2">{data.name || ""}</td>
                  <td className="py-2">{data.contactName || ""}</td>
                  <td className="py-2">{data.city || ""}</td>
                  <td className="py-2">{data.state || ""}</td>
                  <td className="py-2">{data.pincode || ""}</td>
                  <td className="py-2">
                    {data.isPrimary ? (
                      <label className="badge badge-success">Primary</label>
                    ) : data.isActive ? (
                      <label className="badge badge-primary">Active</label>
                    ) : (
                      <label className="badge badge-danger">Inactive</label>
                    )}
                  </td>
                  <td className="py-2">
                    <div className="btn-group">
                      <Link
                        to={`edit/${data.id}`}
                        className="btn btn-outline-primary btn-md py-2 px-3"
                      >
                        <Icon path={mdiPencil} size={0.6} />
                      </Link>
                      {!data.isPrimary && (
                        <>
                          <button
                            className="btn btn-outline-primary btn-md py-2 px-3"
                            onClick={() => handleAction(data.id, "delete")}
                          >
                            <Icon path={mdiDelete} size={0.6} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-md py-2 px-3 dropdown-toggle"
                            data-bs-toggle="dropdown"
                          >
                            More
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  handleAction(
                                    data.id,
                                    "toggleStatus",
                                    data.isActive
                                  )
                                }
                              >
                                {data.isActive ? "Set Inactive" : "Set Active"}
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  handleAction(
                                    data.id,
                                    "makePrimary",
                                    data.isPrimary
                                  )
                                }
                              >
                                Make Primary
                              </button>
                            </li>
                          </ul>
                        </>
                      )}
                    </div>
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

export default WarehouseTable;
