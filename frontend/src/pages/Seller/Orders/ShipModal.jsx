import React, { useEffect, useState } from "react";
import WarehouseDropdown from "./WarehouseDropdown";
import ShipModalWarehouse from "./ShipModalWarehouse";
import companyDetailsConfig from "../../../config/CompanyDetails/CompanyDetailsConfig";
import RateConfig from "../../../config/RateDetails/RateDetailsConfig";
import create_shipment from "../../../config/Shipments/ShipmentsConfig";
import api from "../../../utils/api";
import { useAlert } from '../../../middleware/AlertContext';
import { useSearchParams } from "react-router-dom";
import "../../../assets/ShipModal.css"
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
    <div className="ov" onClick={onClose}>
      <div className="dlg" onClick={(e) => e.stopPropagation()}>

        {/* ================= LEFT PANEL ================= */}
        <div className="left">

          {/* Heading */}
          <div className="lp-heading">
            <div className="lp-h">
              SHIP <br /> <span className="acc">NOW</span>
            </div>
            <div className="lp-sub">Pick carrier · Confirm · Done</div>
          </div>

          {/* Warehouse Selection */}
          <div className="pkg-meta">
            <div className="pm-lbl">Select Warehouses</div>

            <ShipModalWarehouse
              setForm={setForm}
              setErrors={setErrors}
              initialWarehouseData={initialWarehouseData.warehouse_id}
              warehouseType={"normal"}
            />
            {errors.warehouse_id && (
              <small className="text-danger">{errors.warehouse_id}</small>
            )}

            <ShipModalWarehouse
              setForm={setForm}
              setErrors={setErrors}
              initialWarehouseData={initialWarehouseData.rto_warehouse_id}
              warehouseType={"rto"}
            />
            {errors.rto_warehouse_id && (
              <small className="text-danger">{errors.rto_warehouse_id}</small>
            )}
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="right">

          {/* Header */}
          <div className="rp-hdr">
            <div>
              <div className="rp-title">Choose a Carrier</div>
              <div className="rp-count">
                {ratePrice.length} carriers available
              </div>
            </div>
            <div ClassName="rp-steps">
              <div ClassName="rs"><div ClassName="rs-dot done"><svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span ClassName="rs-lbl">Route</span></div>
              <div ClassName="rs-sep"></div>
              <div ClassName="rs"><div ClassName="rs-dot act">2</div><span ClassName="rs-lbl act">Carrier</span></div>
              <div ClassName="rs-sep"></div>
              <div ClassName="rs"><div ClassName="rs-dot pend">3</div><span ClassName="rs-lbl">Ship</span></div>
            </div>
            <div className="rp-close" onClick={onClose}>×</div>
          </div>

          {/* ================= CARRIER LIST ================= */}
          <div className="carrier-list">

            {ratePrice.length > 0 ? (
              ratePrice.map((rate, index) => {
                const total =
                  (Number(rate.freight_charge) || 0) +
                  (Number(rate.cod_charge) || 0);

                return (
                  <div
                    key={index}
                    className={`crow ${selectedIndex === index ? "sel" : ""}`}
                    onClick={() => handleCourierSelect(rate, index)}
                  >
                    {/* Courier Info */}
                    <div className="cr-id">
                      <div className="cr-dot">
                        {rate.courier_name?.slice(0, 2)}
                      </div>
                      <div>
                        <div className="cr-name">
                          {rate.courier_name}
                        </div>
                        <div className="cr-wt">
                          {orderData?.packageDetails?.weight || "--"} gm
                        </div>
                      </div>
                    </div>

                    {/* Zone + ETA */}
                    <div className="cr-meta">
                      <div className="cr-zone">
                        {rate.zone || "N/A"}
                      </div>
                      <div className="cr-eta">
                        <div className="cr-eta-dot"></div>
                        <div className="cr-eta-txt">2–4 Days</div>
                      </div>
                    </div>

                    {/* Charges */}
                    <div className="cr-charges">
                      <div className="cr-ch">
                        <div className="cr-ch-lbl">Freight</div>
                        <div className="cr-ch-val">
                          ₹ {rate.freight_charge || 0}
                        </div>
                      </div>

                      <div className="cr-ch-sep"></div>

                      <div className="cr-ch">
                        <div className="cr-ch-lbl">COD</div>
                        <div className="cr-ch-val">
                          ₹ {rate.cod_charge || 0}
                        </div>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="cr-total">
                      <div className="cr-rs">₹</div>
                      <div className="cr-price">{total}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-muted">
                No Rate Data Found
              </p>
            )}
          </div>

          {/* ================= FOOTER ================= */}
          <div className="rp-foot">
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>

            <button
              className={`btn-ship ${selectedIndex !== null ? "rdy" : ""}`}
              disabled={selectedIndex === null || loading}
              onClick={handleSubmit}
            >
              {loading ? "Processing..." : "Confirm & Ship"}
            </button>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}

export default ShipModal;
