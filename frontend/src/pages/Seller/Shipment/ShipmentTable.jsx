import React, { useEffect, useMemo, useState } from "react";
import { mdiDelete, mdiPencil, mdiPrinter} from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../../utils/api";
import { formatDateTime, getLastNDaysRange } from "../../../middleware/CommonFunctions";
import Pagination from "../../../Component/Pagination";
import ShipmentsConfig from "../../../config/Shipments/ShipmentsConfig";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";
function ShipmentsTable() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [selectedShipments, setselectedShipments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [defaultStart, defaultEnd] = useMemo(() => getLastNDaysRange(7), []);
  const [warehouseList, setWarehouseList] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  
  const shipmentTabs = [
    "All",
    "booked",
    "new",
    "pending_pickup",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "ndr",
    "cancelled",
    "rto",
  ];

  const formatTabLabel = (tab) => {
    if (tab === "All") return "All";
    if (tab === "rto") return "RTO";
    return tab.replace(/_/g, " ");
  };

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

  const formatWeight = (weight) => {
    if (!weight) return "";
    return weight >= 1000
      ? `Wt: ${(weight / 1000).toFixed(2)} kg`
      : `Wt: ${weight} gm`;
  };
  
  const handleFetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: Number.parseInt(searchParams.get("page") || "1", 10),
        limit: Number.parseInt(searchParams.get("limit") || "10", 10),
        start_date: searchParams.get("start_date") || defaultStart,
        end_date: searchParams.get("end_date") || defaultEnd,
      };

      if (activeTab !== "All") {
        params.shipping_status = activeTab;
      }

      const query = new URLSearchParams(params).toString();
      const url = `${ShipmentsConfig.fetchshipmentlist}?${query}`;

      const { data } = await api.get(url);

      setDataList(data?.data?.result || []);
      setTotalCount(data?.data?.total || 0);
      setStatusCounts(data?.data?.counts || {});
    } catch (error) {
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleWarehouseData();
  }, []);

  useEffect(() => {
    handleFetchData();
  }, [searchParams, activeTab]);
  
  const findWarehouse = (warehouseId) => {
    const warehouse = warehouseList.find((w) => w.id == warehouseId);

    if (!warehouse) return "";

    return `${warehouse.city} (${warehouse.state} - ${warehouse.pincode})`;
  };
  useEffect(() => {
    handleWarehouseData();
  }, []);
  
  const handleSelect = (id) => {
  setselectedShipments((prev) =>
    prev.includes(id)
      ? prev.filter((item) => item !== id)
      : [...prev, id]
  );
};


  const handleSelectAll = () => {
    const bookedIds = dataList
      .filter((d) => d.shipping_status === "booked")
      .map((d) => d.id);
    if (selectedShipments.length === bookedIds.length) {
      setselectedShipments([]);
    } else {
      setselectedShipments(bookedIds);
    }
  };


  const handleBulkCancel = async () =>
  {
    alert(selectedShipments);
      if (!selectedShipments.length) {
        alert("No shipments selected");
        return;
      }

      try {
        await cancelShipments(selectedShipments);
        alert("Shipments cancelled successfully");
        setselectedShipments([]);
        handleFetchData();
      } catch (err) {
        alert("Failed to cancel shipments");
      }
  };

  const cancelShipments = async (shipmentIds) => {
      try {
        const url = ShipmentsConfig.cancelshipment;
        const res = await api.post(url, {
          shipment_ids: shipmentIds,
        });
        return res.data;
        } catch (error) {
        console.error(
          "Cancel failed:",
          error.response?.data || error.message
        );
        throw error;
      }
  };

  const formatStatus = (status) => {
    if (!status) return "";
    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const downloadLabels = async () =>
  {
        if (!selectedShipments.length) {
          alert("Please select at least one booked shipment");
          return;
        }
        try {
          const apiUrl = ShipmentsConfig.shipment_bulk_label;
          const response = await api.post(
            apiUrl,
            {
              shipping_db_ids: selectedShipments,
            },
            {
              responseType: "blob",
            }
          );
          const blob = new Blob([response.data], {
            type: "application/pdf",
          });
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = "shipment-labels.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
          console.error("Label download error:", error);
          alert("Failed to download labels");
        }
  };

  const getStatusClass = (status) => {
  switch (status) {
    case "new":
      return "btn-warning kw_button_ship";
    case "cancelled":
      return "btn-danger kw_button_cancel";
    case "booked":
      return "btn-success kw_button_booked";
    case "pending_pickup":
      return "btn-warning";
    case "in_transit":
      return "btn-primary";
    case "out_for_delivery":
      return "btn-info";
    case "delivered":
      return "btn-success";
    case "rto":
      return "btn-dark";
    default:
      return "btn-secondary";
  }
};

  return (
    <div className="tab-content tab-content-vertical">
      <div className="tab-pane fade show active" role="tabpanel">
        <div>
          {selectedShipments.length > 0 && (
            <>
              <div className="d-flex justify-content-start align-items-center mb-2 gap-2 border-bottom pb-2">
                <div
                  className="btn btn-light btn-md py-2 px-3 text-dark"
                  style={{ width: "fit-content" }}
                >
                  Selected: {selectedShipments?.length}
                </div>
                <div onClick = {downloadLabels} disabled={!selectedShipments.length} className="btn btn-dark btn-md py-2 px-3" style={{ width: "fit-content" }}>
                  <Icon path={mdiPrinter} size={0.7} /> Bulk Label
                </div>
                <div className="btn btn-dark btn-md py-2 px-3" style={{ width: "fit-content" }} onClick={handleBulkCancel}>
                  <Icon path={mdiDelete} size={0.7} /> Bulk Cancel
                </div>
              </div>
            </>
          )}
        </div>
        {/* 🔥 SHIPMENT STATUS TABS */}
        <div className="shipment-tabs-container">
        {shipmentTabs.map((tab, index) => (
          <div
            key={tab}
            className={`shipment-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="tab-label">
              {formatTabLabel(tab)}
            </span>

            <span className="tab-count">
              {tab === "All"
                ? statusCounts?.All || 0
                : statusCounts?.[tab] || 0}
            </span>

            {index !== shipmentTabs.length - 1 && (
              <span className="tab-divider"></span>
            )}
          </div>
        ))}
      </div>
        <div className="table-responsive h-100">
          <table className="table table-hover">
            <thead>
              <tr>
                
                <th>
                  <input type="checkbox" style={{ cursor: "pointer" }} onChange={handleSelectAll} checked={dataList.filter((d) => d.shipping_status === "booked").length > 0 && selectedShipments.length === dataList.filter((d) => d.shipping_status === "booked").map((d) => d.id).length}/>
                </th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Pickup & delivery Address</th>
                <th>Package Details</th>
                <th>Payment Details</th>
                <th>Courier Details</th>
                <th>Status</th>
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
                  <tr key={data?.id}>
                    <td className="py-2">
                      {data.shipping_status === "booked" && (
                      <input type="checkbox" checked={selectedShipments.includes(data.id)} style={{ cursor: "pointer" }} onChange={() => handleSelect(data.id)}/>)}
                    </td>
                    <td className="py-2">
                      <div className="d-flex flex-column gap-3 box-class">
                        <Link to={`view/${data?.id}`}>{data?.orderId || ""}</Link>
                        <span>
                          {data?.createdAt ? formatDateTime(data?.createdAt) : ""}
                        </span>
                      </div>
                    </td>

                    <td className="py-2">
                      <div className="d-flex flex-column gap-3 box-class">
                        <span>
                          {data?.shippingDetails.fname &&
                            data?.shippingDetails.lname
                            ? `${data?.shippingDetails.fname} ${data?.shippingDetails.lname}`
                            : ""}
                        </span>
                        <span>{data?.shippingDetails.phone || ""}</span>
                      </div>
                    </td>

                    <td className="py-2">
                      <div className="d-flex flex-column gap-3 org_des_box box-class">
                        <div className="mile-container">
                          <div className="mile-path"></div>
                        </div>
                        <div className="fromclass">
                          <span className="fw-bolder">From: </span>
                          <span>{findWarehouse(data?.warehouse_id) || ""}</span>
                        </div>
                        <div className="toclass">
                          <span className="fw-bolder">To: </span>
                          <span>
                            {`${data?.shippingDetails.city} ( ${data?.shippingDetails.state} - ${data?.shippingDetails.pincode} )`}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2">
                      <div className="d-flex flex-column gap-3 box-class">
                        {data?.packageDetails.weight && (
                          <span>
                            {formatWeight(data?.packageDetails.weight)}
                          </span>
                        )}

                        {data?.packageDetails["length"] &&
                          data?.packageDetails.breadth &&
                          data?.packageDetails.height && (
                            <span>
                              Dim: {data?.packageDetails.length} x{" "}
                              {data?.packageDetails.breadth} x{" "}
                              {data?.packageDetails.height} cm
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="d-flex flex-column gap-3 box-class">
                        <span>
                          {data?.orderAmount ? `₹ ${data?.orderAmount}` : ""}
                        </span>
                        <span>
                          {data?.paymentType
                            ? data?.paymentType.toUpperCase()
                            : ""}
                        </span>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="d-flex flex-column gap-3 box-class">
                        <span>
                          {data?.courier_name}
                        </span>
                        <span className="awb_design">
                          {data?.awb_number}
                        </span>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="btn-group">
                        <button
                          className={`btn btn-md py-2 px-3 ${getStatusClass(data?.shipping_status)}`}
                        >
                          {data?.shipping_status === "new"
                            ? "Processing"
                            : formatStatus(data?.shipping_status)}
                        </button>
                      </div>{" "}
                      {
                        data?.shipment_error && (
                          <div className="text-danger mt-2 response_error">
                            {data?.shipment_error}
                          </div>
                        )
                      }
                      &nbsp;
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
  )
}

export default ShipmentsTable