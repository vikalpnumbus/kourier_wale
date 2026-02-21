import React, { useEffect, useState } from "react";
import WarehouseDropdown from "./WarehouseDropdown";
import ShipModalWarehouse from "./ShipModalWarehouse";
import companyDetailsConfig from "../../../config/CompanyDetails/CompanyDetailsConfig";
import RateConfig from "../../../config/RateDetails/RateDetailsConfig";
import create_shipment from "../../../config/Shipments/ShipmentsConfig";
import api from "../../../utils/api";
import { useAlert } from '../../../middleware/AlertContext';
import { useSearchParams } from "react-router-dom";

function BulkShipModal({ orderData, onClose, handleFetchData }) {
  const [shipData, setShipData] = useState({
    order_db_ids: "",
    courier_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [CourierList, setCourierList] = useState([]);
  const [showForwardReverse, setShowForwardReverse] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [initialWarehouseData, setInitialWarehouseData] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const { showError, showSuccess } = useAlert();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setInitialWarehouseData({
      warehouse_id: orderData?.warehouse_id || "",
      rto_warehouse_id: orderData?.rto_warehouse_id || "",
    });
  }, [orderData]);

  const validateForm = (form) => {
    const errors = {};
    if (!form.warehouse_id) errors.warehouse_id = "Warehouse Is Required";
    if (!form.rto_warehouse_id)
      errors.rto_warehouse_id = "RTO Warehouse Is Required";
    return errors;
  };

  // Fetch Seller Plan Id Because It's Store in User Table
  const [planid, setPlanId] = useState({});
  const fetchplanname = async () => {
    try {
      const response = await api.get(companyDetailsConfig.companyDetails);
      setPlanId(response?.data?.data?.companyDetails.pricingPlanId || {});
    } catch (error) {
      console.error("Company Details Fetch Error:", error);
      setPlanId({});
    }
  };
  useEffect(() => {
    fetchplanname();
  }, []);

    useEffect(() => {
    if (!form.warehouse_id) return;
    if (!orderData) return;
    const origin = form.originpincode || orderData.originpincode;
    if (!origin) return;
    const fetchCourier = async () => {
        try {
        setLoading(true);
        const res = await api.get(RateConfig.Plan_chart);
        const rows = res?.data?.data?.result || [];
        const uniqueCouriers = [
            ...new Map(
            rows.map(item => [
                item.courier_id,
                {
                courier_id: item.courier_id,
                courier_name: item.courier_name
                }
            ])
            ).values()
        ];
        setCourierList(uniqueCouriers);
        setShowForwardReverse(true);
        } catch (error) {
        console.error("❌ Courier API Error:", error);
        } finally {
        setLoading(false);
        }
    };
    fetchCourier();
    }, [
    orderData,
    form.warehouse_id,
    form.rto_warehouse_id
    ]);

  const handleCourierSelect = (rate, index) => {
    setSelectedIndex(index);
    setShipData({
      order_db_ids: orderData?.order_ids || [],
      courier_id: rate.courier_id || "",
    });
  };

    const handleSubmit = async () => 
    {
        console.log("orders payload", orderData);
        if (!shipData.courier_id) {
            showError("Please select a courier before shipping.");
            return;
        }
        if (!form.warehouse_id || !form.rto_warehouse_id) {
            showError("Please select warehouse and RTO warehouse.");
            return;
        }
        const finalPayload = {
            order_db_ids: Array.isArray(orderData?.order_ids)
            ? orderData.order_ids
            : [orderData?.order_ids],
            courier_id: shipData.courier_id,
            warehouse_id: form.warehouse_id,
            rto_warehouse_id: form.rto_warehouse_id,
            plan_id: planid,
            zone: orderData?.zone || "A" // ⚠ adjust according to your backend logic
        };
        console.log("🚀 Final Payload:", finalPayload);
        try {
            setLoading(true);
            const res = await api.post(
            create_shipment.createshipments,
            finalPayload
            );
            if (res?.data?.status === 200)
            {
                showSuccess(res?.data?.message || "Shipment Created Successfully");
                setSearchParams({});
                onClose();
                handleFetchData();
            }
            else
            {
                showError(res?.data?.message || "Something went wrong while creating shipment");
            }
        } catch (error) {
            showError(
            error?.response?.data?.message ||
            "Something went wrong while creating shipment"
            );
        } finally {
            setLoading(false);
        }
    };


  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-dialog cmp_modal-lg"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header py-1">
            <h5 className="modal-title">Bulk Ship Your Package Now</h5>
            <button
              type="button"
              className="close"
              onClick={onClose}
              aria-label="Close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="modal-body text-center">
            <div className="row">
              <div className="col-md-6">
                <ShipModalWarehouse
                  setForm={setForm}
                  setErrors={setErrors}
                  initialWarehouseData={initialWarehouseData.warehouse_id}
                  warehouseType={"normal"}
                />
                {errors.warehouse_id && (
                  <small className="text-danger text-start mb-4">
                    {errors.warehouse_id}
                  </small>
                )}
              </div>
              <div className="col-md-6">
                <ShipModalWarehouse
                  setForm={setForm}
                  setErrors={setErrors}
                  initialWarehouseData={initialWarehouseData.rto_warehouse_id}
                  warehouseType={"rto"}
                />
                {errors.rto_warehouse_id && (
                  <small className="text-danger text-start mb-4">
                    {errors.rto_warehouse_id}
                  </small>
                )}
              </div>
            </div>

            {/* ✅ Courier Rate Cards */}
            <div className="row mt-3">
              <div className="col-md-12 mb-2">
                {CourierList.length > 0 ? (
                  <div className="row">
                    {CourierList.map((rate, index) => (

                      <div
                        key={index}
                        className="col-md-6 mb-3"
                        onClick={() => handleCourierSelect(rate, index)}
                      >
                        <div
                          className={`volume_price p-3 rounded ${selectedIndex === index ? "selected-rate" : ""
                            }`}
                          style={{
                            cursor: "pointer",
                            border:
                              selectedIndex === index
                                ? "2px solid #007bff"
                                : "1px solid #ddd",
                            backgroundColor:
                              selectedIndex === index ? "#e7f1ff" : "#fff",
                            transition: "all 0.3s ease",
                          }}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="courier-title-heading">
                                {rate.courier_name}
                                </span>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted">No Rate Data Found</p>
                )}
              </div>
            </div>

            <div className="modal-footer py-1">
              <button
                type="button"
                className="btn btn-dark btn-md py-2 px-3"
                onClick={handleSubmit}
              >
                Ship
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkShipModal;
