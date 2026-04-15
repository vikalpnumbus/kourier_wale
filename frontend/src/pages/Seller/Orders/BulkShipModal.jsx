import React, { useEffect, useState } from "react";
import WarehouseDropdown from "./WarehouseDropdown";
import ShipModalWarehouse from "./ShipModalWarehouse";
import companyDetailsConfig from "../../../config/CompanyDetails/CompanyDetailsConfig";
import RateConfig from "../../../config/RateDetails/RateDetailsConfig";
import create_shipment from "../../../config/Shipments/ShipmentsConfig";
import api from "../../../utils/api";
import { useAlert } from '../../../middleware/AlertContext';
import { useSearchParams } from "react-router-dom";
import "../../../assets/ShipModal.css";
import { useWallet } from "../../../context/WalletContext";
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
  const { Wallet } = useWallet();
  const [ratePrice, setRatePrice] = useState([]);
  const [selectedCourierId, setSelectedCourierId] = useState(null);
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
        setRatePrice(res?.data?.data?.rows || []);
        setSelectedCourierId(null);
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
    <>
    <div className="modal fade show"  style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-dialog cmp_modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
        <div className="ov" onClick={(e) => e.stopPropagation()}>
          <div className="dlg">
            <div className="left">
              <div className="lp-brand">
                <svg className="lp-logo" viewBox="0 0 72 72" fill="none">
                  <circle cx="36" cy="36" r="34" fill="rgba(61,107,255,0.15)"></circle>
                  <path d="M25 18 Q25 10 36 10 Q47 10 47 18" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.35"></path>
                  <path d="M16 22 L36 54 L56 22" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
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
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.1"/><path d="M1 5h10" stroke="currentColor" strokeWidth="1.1"/><circle cx="8.5" cy="7" r=".8" fill="currentColor"/></svg>
                </div>
                <div>
                  <div className="lw-lbl">Wallet Balance</div>
                  <div className="lw-val">₹ {Wallet}</div>
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
                        <path d="M1.5 4l2 2 3-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
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
                {CourierList.length > 0 ? (
                  CourierList.map((rate, index) => {

                    const isCheap = index === 0;
                    const isFastest = index === 1;

                    return (
                      <div
                        key={rate.courier_id}
                        className={`crow ${selectedIndex === index ? "sel" : ""}`}
                        onClick={() => handleCourierSelect(rate, index)}
                      >

                        {/* BADGES */}
                        {isCheap && <div className="cr-badge cb-g">★ Best Value</div>}
                        {isFastest && <div className="cr-badge cb-o">Fastest</div>}

                        {/* LEFT */}
                        <div className="cr-id">
                          <div className="cr-dot">
                            {rate.courier_name?.slice(0, 2)}
                          </div>
                          <div>
                            <div className="cr-name">{rate.courier_name}</div>
                          </div>
                        </div>

                        {/* MIDDLE */}
                        <div className="cr-meta">
                          <div>Estimated</div>
                          <div className="fw-bold">2–4 Days</div>
                        </div>

                        {/* RIGHT */}
                        <div className="cr-action">
                          <div className={`radio ${selectedIndex === index ? "active" : ""}`} />
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="no-data">
                    <p>No Couriers Available</p>
                  </div>
                )}

                <small className="cr-note">
                  *Courier selection is based on your plan configuration
                </small>

              </div>
              {/* ================= FOOTER ================= */}
              <div className="rp-foot">
                <button className="btn-cancel" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className={`btn-ship ${shipData.courier_id ? "rdy" : ""}`}
                  disabled={!shipData.courier_id || loading}
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
    </>
  );
}

export default BulkShipModal;
