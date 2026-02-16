import { useEffect, useRef, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Icon from "@mdi/react";
import {
  mdiChevronLeft,
  mdiClose,
  mdiCloudDownload,
  mdiFilterOutline,
  mdiPlus,
  mdiCloudUpload,
} from "@mdi/js";
import OrdersFilter from "./OrdersFilter";
import ordersConfig from "../../../config/Orders/OrdersConfig";
import ImportModal from "../../../Component/ImportModal";

function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();

  // 🔥 export handler ref
  const exportHandlerRef = useRef(null);

  useEffect(() => {
    setShowFilters(searchParams.toString().length > 0);
  }, [searchParams]);

  return (
    <div className="row">
      <div className="col-md-12 grid-margin stretch-card d-md-flex">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <h4 className="card-title">
                  {location.pathname.includes("/orders/view") && (
                    <button
                      className="btn btn-light btn-md py-1 px-1 me-2"
                      onClick={() => navigate(-1)}
                    >
                      <Icon path={mdiChevronLeft} size={0.7} />
                    </button>
                  )}
                  Orders{" "}
                  {location.pathname.includes("/orders/view") && "Details"}
                </h4>
              </div>

              <div className="col-md-8 d-flex justify-content-end gap-2">
                {!location.pathname.includes("/orders/view") && (
                  <>
                    <button
                      className="btn btn-dark btn-md py-2 px-4"
                      onClick={() => exportHandlerRef.current?.()}
                    >
                      <Icon path={mdiCloudDownload} size={0.7} /> Export
                    </button>

                    <button
                      className="btn btn-dark btn-md py-2 px-4"
                      onClick={() => setShowImportModal(true)}
                    >
                      <Icon path={mdiCloudUpload} size={0.7} /> Import
                    </button>

                    <button
                      className="btn btn-dark btn-md py-2 px-4"
                      onClick={() => navigate("add")}
                    >
                      <Icon path={mdiPlus} size={0.7} /> Add Order
                    </button>

                    <button
                      className="btn btn-dark btn-md py-2 px-4"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      {showFilters ? (
                        <>
                          <Icon path={mdiClose} size={0.7} /> Close
                        </>
                      ) : (
                        <>
                          <Icon path={mdiFilterOutline} size={0.7} /> Filter
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {showFilters && <OrdersFilter setShowFilters={setShowFilters} />}
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <Outlet
                  context={{
                    setExportHandler: (fn) =>
                      (exportHandlerRef.current = fn),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImportModal && (
        <ImportModal
          title="Import Orders"
          onClose={() => setShowImportModal(false)}
          apiURL={ordersConfig.ordersBulkImportApi}
        />
      )}
    </div>
  );
}

export default Orders;
