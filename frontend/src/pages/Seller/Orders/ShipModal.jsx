import React, { useEffect, useState } from "react";
import ShipModalWarehouse from "./ShipModalWarehouse";
import companyDetailsConfig from "../../../config/CompanyDetails/CompanyDetailsConfig";
import RateConfig from "../../../config/RateDetails/RateDetailsConfig";
import create_shipment from "../../../config/Shipments/ShipmentsConfig";
import api from "../../../utils/api";
import { useAlert } from '../../../middleware/AlertContext';
import { useSearchParams } from "react-router-dom";
import "../../../assets/ShipModal.css";
function ShipModal({ orderData, onClose, handleFetchData }) {
  const [shipData, setShipData] = useState({});
  const [loading, setLoading] = useState(false);
  const [ratePrice, setRatePrice] = useState([]);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [initialWarehouseData, setInitialWarehouseData] = useState({});
  const [selectedCourierId, setSelectedCourierId] = useState(null);
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

  const [planid, setPlanId] = useState("");
  const [sellerwallet, setSellerwallet] = useState("0");
  useEffect(() => {
    const fetchplanname = async () => {
      try {
        const response = await api.get(companyDetailsConfig.companyDetails);
        setPlanId(response?.data?.data?.companyDetails.pricingPlanId || "");
        setSellerwallet(response?.data?.data?.companyDetails.wallet_balance || "0");
      } catch {
        setPlanId("");
      }
    };
    fetchplanname();
  }, []);

  useEffect(() => {
    if (!form.warehouse_id || !orderData) return;

    const { paymentType, packageDetails, shippingDetails, collectableAmount } = orderData;

    if (!packageDetails || !shippingDetails) return;

    const formData = {
      paymentType,
      length: packageDetails.length,
      height: packageDetails.height,
      breadth: packageDetails.breadth,
      weight: packageDetails.weight,
      destination: shippingDetails?.pincode,
      origin: form.originpincode || orderData.originpincode,
      amount: collectableAmount,
    };

    const fetchRate = async () => {
      try {
        setLoading(true);
        const res = await api.post(RateConfig.RateCalculator, formData);
        setRatePrice(res?.data?.data?.rows || []);
        setSelectedCourierId(null);
      } catch {
        showError("Rate fetch failed");
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, [orderData, form.warehouse_id, form.rto_warehouse_id]);

  // ✅ SORT ADD KIYA
  const sortedRates = [...ratePrice].sort((a, b) => {
    const totalA =
      (Number(a.freight_charge) || 0) +
      (Number(a.cod_charge) || 0);

    const totalB =
      (Number(b.freight_charge) || 0) +
      (Number(b.cod_charge) || 0);

    return totalA - totalB;
  });

  // ✅ MIN PRICE
  const minPrice =
    sortedRates.length > 0
      ? (Number(sortedRates[0].freight_charge) || 0) +
        (Number(sortedRates[0].cod_charge) || 0)
      : 0;

  const handleCourierSelect = (rate) => {
    setSelectedCourierId(rate.courier_id);

    setShipData({
      order_db_ids: orderData?.id ? [orderData.id] : [],
      warehouse_id: form.warehouse_id,
      rto_warehouse_id: form.rto_warehouse_id,
      courier_id: rate.courier_id,
      freight_charge: Number(rate.freight_charge) || 0,
      cod_price: Number(rate.cod_charge) || 0,
      zone: rate.zone || "",
      plan_id: planid,
    });
  };

  const handleSubmit = async () => {
    const newErrors = validateForm(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!shipData.courier_id) {
      showError("Please select a courier");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(create_shipment.createshipments, shipData);

      if (res?.data?.status === 201) {
        showSuccess("Shipment Created Successfully");
        onClose();
        handleFetchData();
      } else {
        showError("Shipment failed");
      }
    } catch {
      showError("Something went wrong");
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
          <div className="lp-brand">
            <svg className="lp-logo" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="34" fill="rgba(61,107,255,0.15)"></circle>
              <path d="M25 18 Q25 10 36 10 Q47 10 47 18" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none" opacity="0.35"></path>
              <path d="M16 22 L36 54 L56 22" stroke="#fff" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
              <circle cx="36" cy="54" r="4.5" fill="#3D6BFF"></circle>
            </svg>
            <div className="lp-name">vey<span>go</span></div>
          </div>
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

          <div className="lp-wallet">
            <div className="lw-icon">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2.5" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.1"/><path d="M1 5h10" stroke="currentColor" stroke-width="1.1"/><circle cx="8.5" cy="7" r=".8" fill="currentColor"/></svg>
            </div>
            <div>
              <div className="lw-lbl">Wallet Balance</div>
              <div className="lw-val">₹ {sellerwallet}</div>
            </div>
          </div>
        </div>
        {/* ================= RIGHT PANEL ================= */}
        <div className="right">
          <div className="rp-hdr">
            <div>
              <div className="rp-title">Choose a Carrier</div>
              <div className="rp-count">
                {ratePrice.length} carriers available
              </div>
            </div>
            <div className="rp-steps">
              <div className="rs">
                <div className="rs-dot done">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4l2 2 3-3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span className="rs-lbl">Route</span></div>
              <div className="rs-sep"></div>
              <div className="rs"><div className="rs-dot act">2</div><span className="rs-lbl act">Carrier</span></div>
              <div className="rs-sep"></div>
              <div className="rs"><div className="rs-dot pend">3</div><span className="rs-lbl">Ship</span></div>
            </div>
            <div className="rp-close" onClick={onClose}>×</div>
          </div>

          <div className="carrier-list">

            {sortedRates.length > 0 ? (
              sortedRates.map((rate) => {
                const total =
                  (Number(rate.freight_charge) || 0) +
                  (Number(rate.cod_charge) || 0);

                const isCheap = total === minPrice;

                return (
                  <div
                    key={rate.courier_id}
                    className={`crow 
                      ${selectedCourierId === rate.courier_id ? "sel" : ""} 
                      ${isCheap ? "cheap" : ""}
                    `}
                    onClick={() => handleCourierSelect(rate)}
                    style={{ position: "relative" }}
                  >

                    {/* ✅ BADGE ADD */}
                    {isCheap && (
                      <div className="cr-badge cb-g">
                        ★ Best Value
                      </div>
                    )}

                    <div className="cr-id">
                      <div className="cr-dot">
                        {rate.courier_name?.slice(0, 2)}
                      </div>
                      <div>
                        <div className="cr-name">{rate.courier_name}</div>
                        <div className="cr-wt">
                          {orderData?.packageDetails?.weight || "--"} gm
                        </div>
                      </div>
                    </div>

                    <div className="cr-meta">
                      <div className="cr-zone">{rate.zone || "N/A"}</div>
                      <div className="cr-eta">
                        <div class="cr-eta-dot"></div>
                        <div className="cr-eta-txt">2–4 Days</div>
                      </div>
                    </div>

                    <div className="cr-charges">
                      <div className="cr-ch">
                        <div className="cr-ch-ico cci-m">
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                            <path d="M1.5 4.5h6M4.5 1.5v6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="cr-ch-lbl">Freight</div> 
                        <div className="cr-ch-val"> ₹ {rate.freight_charge || 0} </div> 
                      </div>
                      
                      <div className="cr-ch-sep"></div> 
                      <div className="cr-ch"> 
                        <div className="cr-ch-ico cci-o"> 
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none"> <rect x="1" y="2" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1" /> 
                          <path d="M1 4h7" stroke="currentColor" strokeWidth="1" /> </svg> 
                        </div> 
                        <div className="cr-ch-lbl">COD</div> 
                        <div className="cr-ch-val"> ₹ {rate.cod_charge || 0} </div> 
                      </div>
                    </div>

                    <div className="cr-total">
                      <div className="cr-rs">₹</div>
                      <div className="cr-price">{total}</div>
                    </div>

                  </div>
                );
              })
            ) : (
              <p>No Rate Data</p>
            )}

          </div>

          {/* ================= FOOTER ================= */}
          <div className="rp-foot">
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>

            <button
              className={`btn-ship ${selectedCourierId ? "rdy" : ""}`}
              disabled={!selectedCourierId || loading}
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