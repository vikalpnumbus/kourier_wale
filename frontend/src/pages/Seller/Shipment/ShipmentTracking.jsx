import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import ShipmentsConfig from "../../../config/Shipments/ShipmentsConfig";
import "./shipmentTrackingPopup.css";

const ShipmentTracking = ({ isOpen, onClose, data }) => {
    const [trackingData, setTrackingData] = useState([]);
    if (!isOpen) return null;
    const Shipmentstracking = async () => {
        try {
            const url = `${ShipmentsConfig.shipmenttracking}/${data.id}?t=${Date.now()}`;
            const res = await api.get(url, {
                headers: {
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache",
                    "Expires": "0",
                },
            });
            console.log("TRACKING DATA:", res.data.data.result);
            setTrackingData(res.data.data.result || []);
        } catch (error) {
            console.error("Tracking failed:", error);
        }
    };
    useEffect(() => {
        if (isOpen) Shipmentstracking();
    }, [isOpen]);
    const sortedTracking = [...trackingData].sort(
        (a, b) => new Date(b.datetime) - new Date(a.datetime)
    );
    const getStatusUI = (status) => {
        switch (status) {
            case "shipped":
            case "manifested":
                return { label: "Order Placed", class: "done" };

            case "pickup_scheduled":
            case "picked_up":
                return { label: "Picked Up by Courier", class: "done" };

            case "in_transit":
                return { label: "In Transit", class: "done" };

            case "out_for_delivery":
            case "ofd":
                return { label: "Out for Delivery", class: "active" };

            case "delivered":
                return { label: "Delivered", class: "done" };
            
            case "cancelled":
                return { label: "Cancelled", class: "cancelled" };
            default:
                return { label: "Pending", class: "pending" };
        }
    };

    return (
        <div className="tracking-popup-overlay">
            <div className="tracking-popup-container">
                <div className="backdrop">
                    <div className="popup">
                        <div className="popup-header">
                            <div className="ph-top">
                                <div className="ph-badge">
                                    <span className="dot-pulse"></span>
                                    {data?.shipping_status || "In Transit"}
                                </div>
                                <div className="close-btn" onClick={onClose}>
                                    <i className="fa-solid fa-xmark"></i>
                                </div>
                            </div>
                            <div className="ph-order">
                                <div>
                                    <div className="ph-order-id">Order No- {data?.orderId}</div>
                                    <div className="ph-order-sub">
                                        {data?.shippingDetails?.fname} {data?.shippingDetails?.lname} - {data?.shippingDetails?.city} - {data?.shippingDetails?.state}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="courier-strip">
                            <div className="cs-left">
                                <div className="cs-icon">
                                    <i className="fa-solid fa-truck-fast"></i>
                                </div>
                                <div>
                                    <div className="cs-name">{data?.courier_name}</div>
                                    <div className="cs-awb">AWB: {data?.awb_number}</div>
                                </div>
                            </div>
                            <div className="cs-chips">
                                <span className="chip chip-cod">
                                    ₹{data?.orderAmount}
                                </span>
                                <span className="chip chip-weight">
                                    {data?.packageDetails?.volumetricWeight} kg
                                </span>
                            </div>
                        </div>
                        <div className="timeline-section">
                            <div className="ts-header">
                                <span className="ts-title">Shipment Timeline</span>
                            </div>
                            <div className="timeline">
                                {sortedTracking.length > 0 &&
                                    sortedTracking.map((item, index) => {
                                        const ui = getStatusUI(item.status);
                                        const isLatest = index === 0;
                                        return (
                                            <div className="tl-item-tracking" key={item.id}>
                                                <div className={`tl-dot ${isLatest ? "active" : ui.class}`}>
                                                    <i className="fa-solid fa-check" style={{ fontSize: "9px" }}></i>
                                                </div>
                                                <div className="tl-content">
                                                    <div className="tl-top">
                                                        <div className="tl-label">{ui.label}</div>
                                                        <div className="tl-time">
                                                            {new Date(item.datetime).toLocaleString("en-IN", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="tl-desc">
                                                        {item.description || "No description available"}
                                                    </div>

                                                    {item.location && (
                                                        <span className="tl-badge transit">
                                                            <i className="fa-solid fa-location-dot" style={{ fontSize: "9px" }}></i>
                                                            {item.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipmentTracking;