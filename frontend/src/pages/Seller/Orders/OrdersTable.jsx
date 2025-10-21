import { useEffect, useMemo, useState } from "react";
import Icon from "@mdi/react";
import { mdiCubeSend, mdiPencil } from "@mdi/js";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../../../Component/Pagination";
import ordersConfig from "../../../config/Orders/OrdersConfig";
import api from "../../../utils/api";
import {
  formatDateTime,
  getLastNDaysRange,
} from "../../../middleware/CommonFunctions";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";
// import ShipModal from "./ShipModal";
function OrdersTable() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  // const { showError, showSuccess } = useAlert();
  const [totalCount, setTotalCount] = useState(0);
  const [defaultStart, defaultEnd] = useMemo(() => getLastNDaysRange(7), []);
  const [showShipModal, setShowShipModal] = useState(false);
  const [shipOrderDetails, setShipOrderDetails] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const orderCanShip = (order) => {
    return (
      order.shipping_status === "new" &&
      order.warehouse_id &&
      order.rto_warehouse_id &&
      order.collectableAmount &&
      order.paymentType &&
      order.packageDetails.weight &&
      order.packageDetails["length"] &&
      order.packageDetails.breadth &&
      order.packageDetails.height
    );
  };

  const toggleOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const shipEligibleIds = useMemo(
    () => dataList.filter(orderCanShip).map((o) => o.id),
    [dataList]
  );

  const toggleSelectAll = () => {
    if (selectedOrders.length === shipEligibleIds.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(shipEligibleIds);
    }
  };

  const allSelected =
    shipEligibleIds.length > 0 &&
    selectedOrders.length === shipEligibleIds.length;

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
        "orderId",
        "shippingName",
        "warehouse_id",
        "paymentType",
        "category",
      ];
      optionalKeys.forEach((key) => {
        const value = searchParams.get(key)?.trim();
        if (value) params[key] = value;
      });

      const query = Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .join("&");

      const url = `${ordersConfig.ordersApi}?${query}`;

      const { data } = await api.get(url);

      setDataList(data?.data?.result || []);
      setTotalCount(data?.data?.total || 0);
    } catch (error) {
      console.error("Fetch orders error:", error);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  const formatWeight = (weight) => {
    if (!weight) return "";
    return weight >= 1000
      ? `Wt: ${(weight / 1000).toFixed(2)} kg`
      : `Wt: ${weight} gm`;
  };

  const [warehouseList, setWarehouseList] = useState([]);
  const handleWarehouseData = async () => {
    try {
      const url = warehouseConfig.warehouseApi;

      const { data } = await api.get(url);
      const results = data?.data?.result || [];
      setWarehouseList(results);
    } catch (error) {
      console.error("Fetch warehouses error:", error);
      setWarehouseList([]);
    }
  };

  useEffect(() => {
    handleWarehouseData();
  }, []);

  const findWarehouse = (warehouseId) => {
    const warehouse = warehouseList.find((w) => w.id == warehouseId);

    if (!warehouse) return "";

    return `${warehouse.city} (${warehouse.state} - ${warehouse.pincode})`;
  };

  useEffect(() => {
    handleFetchData();
  }, [searchParams]);

  return (
    <>
      <div className="tab-content tab-content-vertical">
        <div className="tab-pane fade show active" role="tabpanel">
          <div>
            {selectedOrders.length > 0 && (
              <>
                <div className="d-flex justify-content-start align-items-center mb-2 gap-2 border-bottom pb-2">
                  <div
                    className="btn btn-light btn-md py-2 px-3 text-dark"
                    style={{ width: "fit-content" }}
                  >
                    Selected: {selectedOrders?.length}
                  </div>
                  <div
                    className="btn btn-dark btn-md py-2 px-3"
                    style={{ width: "fit-content" }}
                  >
                    <Icon path={mdiCubeSend} size={0.7} /> Bulk Ship
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="table-responsive h-100">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Pickup & delivery Address</th>
                  <th>Package Details</th>
                  <th>Payment Details</th>
                  <th>Status / Action</th>
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
                      <td className="py-2">
                        {orderCanShip(data) ? (
                          <>
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(data.id)}
                              onChange={() => toggleOrder(data.id)}
                              style={{ cursor: "pointer" }}
                            />
                          </>
                        ) : (
                          <></>
                        )}
                      </td>
                      <td className="py-2">
                        <div className="d-flex flex-column gap-3 box-class">
                          <Link to={`view/${data.id}`}>
                            {data.orderId || ""}
                          </Link>
                          <span>
                            {data.createdAt
                              ? formatDateTime(data.createdAt)
                              : ""}
                          </span>
                        </div>
                      </td>

                      <td className="py-2">
                        <div className="d-flex flex-column gap-3 box-class">
                          <span>
                            {data.shippingDetails.fname &&
                            data.shippingDetails.lname
                              ? `${data.shippingDetails.fname} ${data.shippingDetails.lname}`
                              : ""}
                          </span>
                          <span>{data.shippingDetails.phone || ""}</span>
                        </div>
                      </td>

                      <td className="py-2">
                        <div className="d-flex flex-column gap-3 org_des_box box-class">
                          <div className="mile-container"><div className="mile-path"></div></div>
                            <div className="fromclass">
                              <span className="fw-bolder">From: </span>
                              <span>{findWarehouse(data.warehouse_id) || ""}</span>
                            </div>
                            <div className="toclass">
                              <span className="fw-bolder">To: </span>
                              <span>
                                {`${data.shippingDetails.city} ( ${data.shippingDetails.state} - ${data.shippingDetails.pincode} )`}
                              </span>                            
                          </div>
                        </div>
                      </td>

                      <td className="py-2">
                        <div className="d-flex flex-column gap-3 box-class">
                          {data.packageDetails.weight && (
                            <span>
                              {formatWeight(data.packageDetails.weight)}
                            </span>
                          )}

                          {data.packageDetails["length"] &&
                            data.packageDetails.breadth &&
                            data.packageDetails.height && (
                              <span>
                                Dim: {data.packageDetails.length} x{" "}
                                {data.packageDetails.breadth} x{" "}
                                {data.packageDetails.height} cm
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="d-flex flex-column gap-3 box-class">
                          <span>
                            {data.orderAmount
                              ? `₹ ${data.orderAmount}`
                              : ""}
                          </span>
                          <span>
                            {data.paymentType
                              ? data.paymentType.toUpperCase()
                              : ""}
                          </span>
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="btn-group">
                          <button
                            className="btn btn-primary btn-md py-2 px-3"
                            onClick={() => {
                              const warehouse = warehouseList.find((w) => w.id == data.warehouse_id);
                              setShipOrderDetails({
                                id: data.id,
                                warehouse_id: data.warehouse_id,
                                rto_warehouse_id: data.rto_warehouse_id,
                                collectableAmount: data.collectableAmount,
                                paymentType: data.paymentType,
                                packageDetails: data.packageDetails,
                                shippingDetails: data.shippingDetails,
                                originpincode: warehouse?.pincode,
                              });
                              setShowShipModal(true);
                            }}
                            disabled={!orderCanShip(data)}
                          >
                            {data.shipping_status === "new"
                              ? "Ship"
                              : "Not Shipped"}
                          </button>
                        </div> &nbsp;
                        <div className="btn-group">
                          <Link
                            to={`edit/${data.id}`}
                            className="btn btn-outline-primary btn-md py-2 px-3"
                          >
                            <Icon path={mdiPencil} size={0.6} />
                          </Link>
                        </div>
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
          <Pagination totalCount={totalCount} />
          {/* {showShipModal && shipOrderDetails && (
            <ShipModal
              onClose={() => setShowShipModal(false)}
              orderData={shipOrderDetails}
            />
          )} */}
        </div>
      </div>
    </>
  );
}

export default OrdersTable;
