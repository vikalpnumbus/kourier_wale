import { useEffect, useMemo, useState } from "react";
import Pagination from "../../../Component/Pagination";
import { Link, useSearchParams } from "react-router-dom";
import { formatDateTime, getLastNDaysRange } from "../../../middleware/CommonFunctions";
import warehouseConfig from "../../../config/Warehouse/WarehouseConfig";
import api from "../../../utils/api";
import ShipmentConfig from "../../../config/AdminConfig/Shipment/ShipmentConfig";

function ShipmentTable() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [totalCount, setTotalCount] = useState(0);
  const [defaultStart, defaultEnd] = useMemo(() => getLastNDaysRange(7), []);
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

      const url = `${ShipmentConfig.shippingListApi}?${query}`;

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
  const findWarehouse = (warehouseId) => {
    const warehouse = warehouseList.find((w) => w.id == warehouseId);

    if (!warehouse) return "";

    return `${warehouse.city} (${warehouse.state} - ${warehouse.pincode})`;
  };
  useEffect(() => {
    handleWarehouseData();
  }, []);
  useEffect(() => {
    handleFetchData();
  }, [searchParams]);
  return (
    <div className="tab-content tab-content-vertical">
      <div className="tab-pane fade show active" role="tabpanel">
        <div>
          {/* {selectedOrders.length > 0 && (
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
          )} */}
        </div>
        <div className="table-responsive h-100">
          <table className="table table-hover">
            <thead>
              <tr>

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
                  <tr key={data?.id}>

                    <td className="py-2">
                      <div className="d-flex flex-column gap-3 box-class">
                        <Link to={`/admin/orders/view/${data?.id}`}>{data?.orderId || ""}</Link>
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
                      <div className="btn-group">
                        <button
                          className={`btn btn-md py-2 px-3 ${data?.shipping_status === "new"
                            ? "btn-warning kw_button_ship"
                            : data?.shipping_status === "cancel"
                              ? "btn-danger kw_button_cancel"
                              : data?.shipping_status === "booked"
                                ? "btn-success kw_button_booked"
                                : "btn-secondary kw_button_booked"
                            }`}
                        // onClick={() => {
                        //   const warehouse = warehouseList.find(
                        //     (w) => w.id == data?.warehouse_id
                        //   );
                        //   setShipOrderDetails({
                        //     id: data?.id,
                        //     warehouse_id: data?.warehouse_id,
                        //     rto_warehouse_id: data?.rto_warehouse_id,
                        //     collectableAmount: data?.collectableAmount,
                        //     paymentType: data?.paymentType,
                        //     packageDetails: data?.packageDetails,
                        //     shippingDetails: data?.shippingDetails,
                        //     originpincode: warehouse?.pincode,
                        //   });
                        //   setShowShipModal(true);
                        // }}
                        // disabled={!orderCanShip(data)}
                        >
                          {data?.shipping_status === "new" ? "Processing" : data?.shipping_status}
                        </button>

                      </div>{" "}
                      {
                        data?.shipment_error && (
                          <div className="text-danger mt-2">
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
  );
}

export default ShipmentTable;
