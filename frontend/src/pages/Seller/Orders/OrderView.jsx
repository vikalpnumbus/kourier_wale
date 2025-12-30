import React, { useEffect, useState } from "react";
import Icon from "@mdi/react";
import {
  mdiCash,
  mdiContentCopy,
  mdiCubeScan,
  mdiMapMarkerRadiusOutline,
  mdiPackageVariantClosed,
  mdiPencil,
} from "@mdi/js";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/api";
import ordersConfig from "../../../config/Orders/OrdersConfig";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";
import shipmentsConfig from "../../../config/Shipments/ShipmentsConfig";
import ShipModal from "./ShipModal";

function OrderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState({});
  const [loading, setLoading] = useState(false);
  const isShipmentView = window.location.pathname.includes("shipments/view");
  const [shipOrderDetails, setShipOrderDetails] = useState("");
  const [showShipModal, setShowShipModal] = useState(false);

  const orderCanShip = (order) => {
    return (
      order.shipping_status === "new" &&
      order.warehouse_id &&
      order.rto_warehouse_id &&
      (order.paymentType == "cod" ? order.collectableAmount : true) &&
      order.paymentType &&
      order.packageDetails.weight &&
      order.packageDetails["length"] &&
      order.packageDetails.breadth &&
      order.packageDetails.height
    );
  };

  const handleFetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${ordersConfig.ordersApi}/${id}`);

      setOrderData(response?.data?.data?.result?.[0] || {});
    } catch (error) {
      console.error("Error fetching orders:", error);
      return {};
    } finally {
      setLoading(false);
    }
  };

  const handleFetchShippingData = async () => {
    setLoading(true);
    try {


      const url = `${shipmentsConfig.fetchshipmentlist}/${id}`;

      const { data } = await api.get(url);
      setOrderData(data?.data?.result?.[0] || {});
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
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
    if (isShipmentView) {
      handleFetchShippingData();
    } else {
      handleFetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="dot-opacity-loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
    );
  }

  const STATUS_MAP = {
    new: { class: "text-warning", label: "Not Shipped" },
    booked: { class: "text-success", label: "Booked" },
    cancelled: { class: "text-danger", label: "Cancelled" },
    damaged: { class: "text-danger", label: "Damaged" },
    delivered: { class: "text-success", label: "Delivered" },
    "in-transit": { class: "text-primary", label: "In Transit" },
    lost: { class: "text-danger", label: "Lost" },
    "pending-pickup": { class: "text-warning", label: "Pending Pickup" },
    "out-for-delivery": { class: "text-primary", label: "Out for Delivery" },
    rto: { class: "text-danger", label: "RTO" },
  };

  function ShippingStatus({ status }) {
    const { class: className, label } = STATUS_MAP[status] || {
      class: "",
      label: "",
    };

    return <span className={className}>{label}</span>;
  }

  return (
    <>
      <div className="px-4">
        <div className="row">
          <div className="col-12 col-md-3">
            <h5 className="card-title mb-1">Id: {orderData?.orderId || ""}</h5>
            <div className="d-flex gap-2  align-items-center">
              <span className="mb-0">
                Status: <ShippingStatus status={orderData?.shipping_status || ""} />
              </span>
            </div>
          </div>

          <div className="col-12 col-md-9 d-flex justify-content-end gap-2 ">
            {!isShipmentView && (
              <>
                <button
                  className="btn btn-dark btn-md py-2 px-3"
                  onClick={() => navigate(`/orders/edit/${id}`)}
                >
                  <Icon path={mdiPencil} size={0.7} /> Edit
                </button>
                <button
                  className="btn btn-dark btn-md py-2 px-3"
                  onClick={() => {
                    const warehouse = warehouseList.find(
                      (w) => w.id == orderData.warehouse_id
                    );
                    setShipOrderDetails({
                      id: orderData.id,
                      warehouse_id: orderData.warehouse_id,
                      rto_warehouse_id: orderData.rto_warehouse_id,
                      collectableAmount: orderData.collectableAmount,
                      paymentType: orderData.paymentType,
                      packageDetails: orderData.packageDetails,
                      shippingDetails: orderData.shippingDetails,
                      originpincode: warehouse?.pincode,
                    });
                    setShowShipModal(true);
                  }}
                  disabled={!orderCanShip(orderData)}
                >
                  <Icon path={mdiCubeScan} size={0.7} />Ship
                </button>
              </>
            )}

            <button
              className="btn btn-dark btn-md py-2 px-3"
              onClick={() => navigate(`/orders/clone/${isShipmentView ? orderData.order_db_id : id}`)}
            >
              <Icon path={mdiContentCopy} size={0.7} /> Clone
            </button>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12 col-md-8">
            <div className="card p-3 mb-3 border">
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className="item-icon">
                  <Icon path={mdiPackageVariantClosed} size={0.8} />
                </span>
                <h5 className="card-title mb-0">Package Details</h5>
              </div>
              <ul
                className="list-group mt-3"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {orderData?.products?.length > 0 ? (
                  orderData.products.map((item) => (
                    <li key={item.id} className="list-group-item">
                      <div className="row g-2 align-items-center">
                        {/* Product Image */}
                        <div className="col-12 col-md-2">
                          <img
                            src={`${import.meta.env.VITE_API_URL}${item.productImage[1]
                              }`}
                            className="img-fluid rounded border"
                            style={{ maxHeight: "80px", objectFit: "contain" }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="col-12 col-md-10">
                          <div className="fw-semibold">{item.name}</div>
                          <div className="text-muted small">{item.sku}</div>
                          <div className="text-muted small">
                            {item.warehouse}
                          </div>

                          <div className="d-flex justify-content-between mt-2">
                            <span className="fw-bold">₹{item.price}</span>
                            <span className="badge bg-light text-dark">
                              Qty: {item.qty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item text-muted">
                    No products selected
                  </li>
                )}
              </ul>
            </div>

            <div className="card p-3 mb-3 border">
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className="item-icon">
                  <Icon path={mdiCash} size={0.8} />
                </span>
                <h5 className="card-title mb-0">Payment Details</h5>
              </div>
              <div className="row my-3">
                <div className="col-md-5 col-sm-12 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="m-0">Payment Mode</h6>
                  </div>
                  <div className="badge badge-success">
                    {orderData?.paymentType?.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="row border-top pt-4">
                <div className="col-md-4 "></div>
                <div className="col-md-8 ">
                  <div className="d-flex align-items-center gap-3 mb-1 justify-content-end">
                    <div className="fw-500">Shipping Charges</div>
                    <div>
                      <input
                        type="text"
                        className="form-control px-2 py-0"
                        style={{ height: "2.3rem" }}
                        value={orderData?.charges?.shipping || 0}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-1 justify-content-end">
                    <div className="fw-500">COD Charges</div>
                    <div>
                      <input
                        type="text"
                        className="form-control px-2 py-0"
                        style={{ height: "2.3rem" }}
                        value={orderData?.charges?.cod || 0}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-1 justify-content-end">
                    <div className="fw-500">Tax Amount</div>
                    <div>
                      <input
                        type="text"
                        className="form-control px-2 py-0"
                        style={{ height: "2.3rem" }}
                        value={orderData?.charges?.tax_amount || 0}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-1 justify-content-end">
                    <div className="fw-500">Discount</div>
                    <div>
                      <input
                        type="text"
                        className="form-control px-2 py-0"
                        style={{ height: "2.3rem" }}
                        value={orderData?.charges?.discount || 0}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-1 justify-content-end">
                    <div className="fw-500">Order Amount</div>
                    <div>
                      <input
                        type="text"
                        className="form-control px-2 py-0"
                        style={{ height: "2.3rem" }}
                        value={orderData?.orderAmount || 0}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-1 justify-content-end">
                    <div className="fw-500">Collectable Amount</div>
                    <div>
                      <input
                        type="text"
                        className="form-control px-2 py-0"
                        style={{ height: "2.3rem" }}
                        value={orderData?.collectableAmount || 0}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card p-3 mb-3 border">
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className="item-icon">
                  <Icon path={mdiMapMarkerRadiusOutline} size={0.8} />
                </span>
                <h5 className="card-title mb-0">Delivery Details</h5>
              </div>

              <div className="delivery-timeline">
                <div className="timeline-item">
                  <div className="timeline-marker end"></div>
                  <div className="timeline-content">
                    {findWarehouse(orderData.warehouse_id) || ""}
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker start"></div>
                  <div className="timeline-content">
                    {`${orderData?.shippingDetails?.city} (${orderData?.shippingDetails?.state} - ${orderData?.shippingDetails?.pincode})`}
                  </div>
                </div>


              </div>
            </div>

            <div className="card p-3 mb-3 border">
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className="item-icon">
                  <Icon path={mdiCubeScan} size={0.8} />
                </span>
                <h5 className="card-title mb-0">Box Details</h5>
              </div>

              <div className="row">
                <div className="col-md-12 col-sm-12 d-flex justify-content-between align-items-center">
                  <h6 className="m-0">Size</h6>
                </div>
              </div>
              <div className="row my-3">
                <div className="col-md-3 pe-0">
                  <input
                    type="text"
                    className="form-control px-2 py-0 "
                    style={{ height: "2.3rem" }}
                    value={orderData?.packageDetails?.length || ""}
                    readOnly
                  />
                </div>
                <div className="col-md-3 pe-0">
                  <input
                    type="text"
                    className="form-control px-2 py-0 "
                    style={{ height: "2.3rem" }}
                    value={orderData?.packageDetails?.breadth || ""}
                    readOnly
                  />
                </div>
                <div className="col-md-3 pe-0">
                  <input
                    type="text"
                    className="form-control px-2 py-0 "
                    style={{ height: "2.3rem" }}
                    value={orderData?.packageDetails?.height || ""}
                    readOnly
                  />
                </div>

                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control px-2 py-0 "
                    style={{ height: "2.3rem" }}
                    value={"CM"}
                    disabled
                  />
                </div>
              </div>

              <div className="row mt-2">
                <div className="col-md-12 col-sm-12 d-flex justify-content-between align-items-center">
                  <h6 className="m-0">Package Weight</h6>
                </div>
              </div>

              <div className="row my-2">
                <div className="col-md-9 pe-0">
                  <input
                    type="text"
                    className="form-control px-2 py-0"
                    style={{ height: "2.3rem" }}
                    value={
                      orderData?.packageDetails?.weight
                        ? orderData?.packageDetails?.weight >= 1000
                          ? (orderData?.packageDetails?.weight / 1000).toFixed(
                            2
                          )
                          : orderData?.packageDetails?.weight
                        : ""
                    }
                    readOnly
                  />
                </div>

                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control px-2 py-0"
                    style={{ height: "2.3rem" }}
                    value={
                      orderData?.packageDetails?.weight
                        ? orderData?.packageDetails?.weight >= 1000
                          ? "KG"
                          : "GM"
                        : ""
                    }
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showShipModal && shipOrderDetails && (
        <ShipModal
          onClose={() => setShowShipModal(false)}
          orderData={shipOrderDetails}
        />
      )}
    </>
  );
}

export default OrderView;
