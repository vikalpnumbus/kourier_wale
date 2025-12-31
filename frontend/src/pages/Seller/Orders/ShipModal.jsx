import React, { useEffect, useState } from "react";
import WarehouseDropdown from "./WarehouseDropdown";
import ShipModalWarehouse from "./ShipModalWarehouse";
import companyDetailsConfig from "../../../config/CompanyDetails/CompanyDetailsConfig";
import RateConfig from "../../../config/RateDetails/RateDetailsConfig";
import create_shipment from "../../../config/Shipments/ShipmentsConfig";
import api from "../../../utils/api";
import { useAlert } from '../../../middleware/AlertContext';
import { useSearchParams } from "react-router-dom";

function ShipModal({ orderData, onClose, handleFetchData }) {
  const [shipData, setShipData] = useState({
    order_db_ids: "",
    warehouse_id: "",
    rto_warehouse_id: "",
    courier_id: "",
    freight_charge: "",
    cod_price: "",
    zone: "",
    plan_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [ratePrice, setRatePrice] = useState([]);
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
    if (!form.warehouse_id || !orderData) return;

    const {
      paymentType,
      packageDetails,
      shippingDetails,
      collectableAmount,
    } = orderData;

    if (!packageDetails || !shippingDetails) return;

    const { length, height, breadth, weight } = packageDetails;
    const destination = shippingDetails?.pincode;
    const origin = form.originpincode || orderData.originpincode; // optional if you store origin in warehouse
    const amount = collectableAmount;

    const formData = {
      paymentType,
      length,
      height,
      breadth,
      weight,
      destination,
      origin,
      amount,
    };

    const fetchRate = async () => {
      try {
        setLoading(true);
        const url = `${RateConfig.RateCalculator}`;
        const res = await api.post(url, formData);
        setRatePrice(res?.data?.data?.rows || []);
        setShowForwardReverse(true);
        setSelectedIndex(null); // reset selected courier when warehouse changes
      } catch (error) {
        console.error("API Error:", error);
        alert("Something went wrong while updating rates");
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, [orderData, form.warehouse_id, form.rto_warehouse_id]);

  const handleCourierSelect = (rate, index) => {
    setSelectedIndex(index);
    setShipData({
      order_db_ids: orderData?.id ? [orderData.id] : [],
      warehouse_id: form.warehouse_id || orderData?.warehouse_id || "",
      rto_warehouse_id: form.rto_warehouse_id || orderData?.rto_warehouse_id || "",
      courier_id: rate.courier_id || "",
      freight_charge: Number(rate.freight_charge) || 0,
      cod_price: Number(rate.cod_charge) || 0,
      zone: rate.zone || "",
      plan_id: planid || "",
    });
  };

  const handleSubmit = async () => {
    const newErrors = validateForm(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (!shipData.courier_id) {
      showError("Please select a courier before shipping.");
      return;
    }
    const finalPayload = {
      ...shipData,
      warehouse_id: form.warehouse_id,
      rto_warehouse_id: form.rto_warehouse_id,
      plan_id: planid,
    };
    try {
      setLoading(true);
      const url = `${create_shipment.createshipments}`;
      const res = await api.post(url, finalPayload);
      if (res?.data?.status === 201) {
        showSuccess(res?.data?.message || "Shipment Created Successfully")
        setSearchParams({});
        onClose();
        handleFetchData();
      } else {
        showError(res?.data?.message || "Something went wrong while creating shipment")
      }
    } catch (error) {
      showError(error?.response?.data?.message || "Something went wrong while creating shipment")
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
            <h5 className="modal-title">Ship Your Package Now</h5>
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
                {ratePrice.length > 0 ? (
                  <div className="row">
                    {ratePrice.map((rate, index) => (

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
                            <div className="courier-box text-center">
                              <div className="courier-box-rs">
                                <sup>₹</sup>
                                <span className="price">{(Number(rate.freight_charge) || 0) + (Number(rate.cod_charge) || 0)}</span>
                              </div>
                              <small className="text-muted d-block mt-1">
                                {rate.zone || "N/A"}
                              </small>
                            </div>
                          </div>
                          <div className="form-text mt-2">
                            <i className="ti ti-info-circle menu-icon"></i>
                            Freight Charges: ₹ {rate.freight_charge || 0} + COD
                            Charges: ₹ {rate.cod_charge || 0}
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

export default ShipModal;
