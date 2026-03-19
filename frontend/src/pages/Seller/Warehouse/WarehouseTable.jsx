import React, { useEffect, useState } from "react";
import { mdiDelete, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";
import Pagination from "../../../Component/Pagination";
function WarehouseTable({ search, stateFilter, statusFilter }) {
  const [dataList, setDataList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();

  const handleFetchData = async () => {
    try {
      setLoading(true);

      const response = await api.get(warehouseConfig.warehouseApi);

      const result = response?.data?.data?.result || [];
      setDataList(result);
      setFilteredList(result);
    } catch (error) {
      showError("Error fetching warehouses");
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

      showSuccess("Updated successfully");
      handleFetchData();
    } catch (err) {
      showError("Something went wrong");
    }
  };
  useEffect(() => {
    let list = [...dataList];

    if (search) {
      list = list.filter(
        (w) =>
          w.name?.toLowerCase().includes(search.toLowerCase()) ||
          w.city?.toLowerCase().includes(search.toLowerCase()) ||
          w.pincode?.includes(search)
      );
    }

    if (stateFilter) {
      list = list.filter((w) => w.state === stateFilter);
    }

    if (statusFilter) {
      list = list.filter((w) => {
        if (statusFilter === "primary") return w.isPrimary;
        if (statusFilter === "active") return w.isActive;
        if (statusFilter === "inactive") return !w.isActive;
      });
    }

    setFilteredList(list);
  }, [search, stateFilter, statusFilter, dataList]);

  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <div className="table-card">
      <div className="table-hdr">
        <div className="table-hdr-title">
          Warehouse Directory
          <span className="tbl-count">
            {filteredList.length} locations
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="wh-table">
          <thead>
            <tr>
              <th>Warehouse</th>
              <th>Contact</th>
              <th>City</th>
              <th>State</th>
              <th>PIN</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Loading...</td>
              </tr>
            ) : filteredList.length > 0 ? (
              filteredList.map((data) => {

                const isPrimary = data.isPrimary;

                const iconClass = isPrimary
                  ? "wh-icon-wrap primary-wh"
                  : data.isActive
                  ? "wh-icon-wrap active-wh"
                  : "wh-icon-wrap inactive-wh";

                return (
                  <tr key={data.id}>
                    <td>
                      <div className="wh-name-cell">
                        <div className={iconClass}>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <path d="M2 13.5V7l5.5-5 5.5 5v6.5H2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="5.5" y="9.5" width="4" height="4" stroke="currentColor" strokeWidth="1.3"/>
                          </svg>
                        </div>

                        <div>
                          <div className="wh-name">{data.name}</div>
                          <div className="wh-id">{data.id}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="contact-cell">
                        <div className="contact-name">{data.contactName}</div>
                        <div className="contact-phone">
                          {data.contactPhone !== "—"
                            ? "+91 " + data.contactPhone
                            : "—"}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="loc-cell">
                        <div className="loc-city">{data.city}</div>
                      </div>
                    </td>

                    <td>
                      <div className="loc-cell">
                        <div className="loc-state">{data.state}</div>
                      </div>
                    </td>

                    <td>
                      <div className="pin-cell">{data.pincode}</div>
                    </td>

                    <td>
                      {isPrimary ? (
                        <span className="status-badge sb-primary">Primary</span>
                      ) : data.isActive ? (
                        <span className="status-badge sb-active">Active</span>
                      ) : (
                        <span className="status-badge sb-inactive">Inactive</span>
                      )}
                    </td>

                    <td>
                      <div className="act-cell">

                        {isPrimary && (
                          <span className="act-primary-tag">★ Primary</span>
                        )}

                        <Link
                          to={`edit/${data.id}`}
                          className="act-btn act-edit"
                        >
                          <Icon path={mdiPencil} size={0.7} />
                        </Link>

                        {!isPrimary && (
                          <>
                            <button
                              className="act-btn act-del"
                              onClick={() => handleAction(data.id, "delete")}
                            >
                              <Icon path={mdiDelete} size={0.7} />
                            </button>

                            <div className="dropdown">
                              <button
                                className="act-btn act-more"
                                data-bs-toggle="dropdown"
                              >
                                ⋮
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
                                    {data.isActive ? "Deactivate" : "Activate"}
                                  </button>
                                </li>

                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      handleAction(data.id, "makePrimary")
                                    }
                                  >
                                    Make Primary
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination totalCount={filteredList.length} />
    </div>
  );
}

export default WarehouseTable;