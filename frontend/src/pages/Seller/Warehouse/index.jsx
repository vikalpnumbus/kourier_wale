import React, { useState } from "react";
import Icon from "@mdi/react";
import { mdiPlus, mdiClose, mdiCloudDownloadOutline } from "@mdi/js"; // mdiClose for cross icon
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import ImportModal from "../../../Component/ImportModal";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";

function Warehouse() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [showImportModal, setShowImportModal] = useState(false);

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
    <div className="row">
      <div className="col-md-12 grid-margin stretch-card d-md-flex">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <h4 className="card-title">Warehouse</h4>
              </div>
              <div className="col-md-8 col-sm-12 d-flex justify-content-end gap-2">
                {!location.pathname.includes("/warehouse/add") &&
                  !location.pathname.includes("/warehouse/edit") && (
                    <>
                      <div className="form-group d-flex m-0 position-relative">
                        <input
                          className="form-control py-2 px-4 pe-5"
                          placeholder="Search Warehouse"
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />

                        {search && (
                          <button
                            type="button"
                            className="btn position-absolute top-50 translate-middle-y border-0 bg-transparent"
                            onClick={handleClear}
                            style={{ right: "25%" }}
                          >
                            <Icon path={mdiClose} size={0.7} />
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn btn-dark btn-md py-2 px-4 ms-2"
                          onClick={handleSearch}
                        >
                          Search
                        </button>
                      </div>
                      {!location.pathname.includes("/warehouse/edit") &&
                        !location.pathname.includes("/warehouse/add") && (
                          <button
                            // onClick={() => navigate("add")}
                            onClick={() => {
                              setShowImportModal(true);
                            }}
                            type="button"
                            className="btn btn-dark btn-md py-2 px-4"
                          >
                            <Icon path={mdiCloudDownloadOutline} size={0.7} />{" "}
                            Import
                          </button>
                        )}
                      {!location.pathname.includes("/warehouse/edit") &&
                        !location.pathname.includes("/warehouse/add") && (
                          <button
                            onClick={() => navigate("add")}
                            type="button"
                            className="btn btn-dark btn-md py-2 px-4"
                          >
                            <Icon path={mdiPlus} size={0.7} /> Add Warehouse
                          </button>
                        )}
                    </>
                  )}

                {/* {!location.pathname.includes("/warehouse/edit") && (
                  <button
                    onClick={() => navigate("add")}
                    type="button"
                    className="btn btn-dark btn-md py-2 px-4"
                  >
                    <Icon path={mdiPlus} size={0.7} /> Add Warehouse
                  </button>
                )} */}
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <div className="tab-content tab-content-vertical">
                  <div className="tab-pane fade show active" role="tabpanel">
                    <Outlet />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showImportModal && (
        <ImportModal
          title="Import Warehouse"
          onClose={() => setShowImportModal(false)}
          apiURL={warehouseConfig.warehouseBulkApi}
        />
      )}
    </div>
  );
}

export default Warehouse;
