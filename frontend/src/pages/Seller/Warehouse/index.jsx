import React, { useState } from "react";
import {useLocation,useNavigate,useSearchParams} from "react-router-dom";
import ImportModal from "../../../Component/ImportModal";
import Icon from "@mdi/react";
import { mdiCloudDownloadOutline } from "@mdi/js";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";
import WarehouseTable from "./WarehouseTable";
import "../../../assets/warehouse/warehouse.css"
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
function Warehouse() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [showImportModal, setShowImportModal] = useState(false);
  const [stateFilter, setStateFilter] = useState("");
const [statusFilter, setStatusFilter] = useState("");

  const handleSearch = () => {
    if (search.trim()) {
      setSearchParams({ search: search.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleClear = () => {
    setSearch("");
    setSearchParams({});
  };

  return (
    <div className="layout">
      <main>
        <div className="page-header">
          <div className="col-md-8">
            <div className="page-eyebrow">Logistics Network</div>
            <div className="page-title">Warehouses</div>
            <div className="page-subtitle">
              Manage pickup locations and shipping origins.
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 d-flex gap-2">
              {!location.pathname.includes("/warehouse/edit") && 
              !location.pathname.includes("/warehouse/add") && (
                <button
                  onClick={() => { setShowImportModal(true); }}
                  type="button"
                  className="btn btn-dark btn-md py-2 px-4"
                >
                  <Icon path={mdiCloudDownloadOutline} size={0.7} />{" "}
                  Import
                </button>
              )}
              <Link to="add" className="btn btn-primary btn-md py-2 px-4">
                + Add Warehouse
              </Link>
            </div>
          </div>
        </div>
        <div className="filters-bar">
          <div className="search-wrap">
            <input
              type="text"
              className="search-input"
              placeholder="Search warehouse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* <select
            className="filter-sel"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="">All States</option>
            <option>Delhi</option>
            <option>Haryana</option>
            <option>Uttar Pradesh</option>
          </select> */}
          <select
            className="filter-sel"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="primary">Primary</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {!location.pathname.includes("add") &&
        !location.pathname.includes("edit") && (
          <WarehouseTable
            search={search}
            stateFilter={stateFilter}
            statusFilter={statusFilter}
          />
        )}

        <Outlet />
        {showImportModal && (
        <ImportModal
          title="Import Warehouse"
          onClose={() => setShowImportModal(false)}
          apiURL={warehouseConfig.warehouseBulkApi}
        />
      )}
      </main>
    </div>
  );
}

export default Warehouse;
