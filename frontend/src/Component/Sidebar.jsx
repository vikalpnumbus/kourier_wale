import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../assets/sidebar/sidebar.css";

function Sidebar({ sideNavActive }) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const isActive = (path) => location.pathname === path;
  const getClass = (path, key) =>`nav-item ${isActive(path) ? "active" : ""} ${hoveredItem === key ? "hover-open" : ""}`;
  const hoverProps = (key) => ({
    onMouseEnter: () => setHoveredItem(key),
    onMouseLeave: () => setHoveredItem(null),
  });
console.log(sideNavActive)
  return (
    <nav className={`sidebar sidebar-offcanvas ${sideNavActive ? "active" : ""}`} id="sidebar">
      <ul className="nav">
        <li className={getClass("/dashboard", "dashboard")} {...hoverProps("dashboard")}>
          <Link className="nav-link" to="/dashboard" data-label="Dashboard">
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
            </svg>
            <span className="menu-title">Dashboard</span>
          </Link>
        </li>
        <li className={getClass("/orders", "orders")} {...hoverProps("orders")}>
          <Link className="nav-link" to="/orders" data-label="Orders">
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span className="menu-title">Orders</span>
          </Link>
        </li>
        <li className={getClass("/shipments", "shipments")} {...hoverProps("shipments")}>
          <Link className="nav-link" to="/shipments" data-label="Shipments">
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="5" width="14" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
              <path d="M5 5V4a3 3 0 016 0v1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            <span className="menu-title">Shipments</span>
          </Link>
        </li>
        <li className={getClass("/pickup", "pickup")} {...hoverProps("pickup")}>
          <Link className="nav-link" to="/pickup" data-label="Pickup Request">
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M3 4h6M3 12h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
            <span className="menu-title">Pickup Request</span>
          </Link>
        </li>
        <li className={getClass("/products", "products")} {...hoverProps("products")}>
          <Link className="nav-link" to="/products" data-label="Products">
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L10.5 6H15L11 9.5L12.5 14.5L8 11.5L3.5 14.5L5 9.5L1 6H5.5L8 1Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
            </svg>
            <span className="menu-title">Products</span>
          </Link>
        </li>
        <li className={getClass("/warehouse", "warehouse")} {...hoverProps("warehouse")}>
          <Link className="nav-link" to="/warehouse" data-label="Warehouse">
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none">
              <path d="M2 13V6l6-4 6 4v7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="6" y="9" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.3"/>
            </svg>
            <span className="menu-title">Warehouse</span>
          </Link>
        </li>
        <li className="nav-section-label">Billing</li>
        <li className={getClass("/shippingcharges", "shipping")} {...hoverProps("shipping")}>
          <Link className="nav-link" to="/shippingcharges" data-label="Shipping Charges">
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/>
              <path d="M8 5v1.5M8 9.5V11M6.5 7.5h2a1 1 0 010 2h-1a1 1 0 000 2H9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            <span className="menu-title">Shipping Charges</span>
          </Link>
        </li>
        <li className={getClass("/cod_remittance", "cod")} {...hoverProps("cod")}>
          <Link className="nav-link" to="/cod_remittance" data-label="COD Remittance">
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
              <path d="M1.5 6.5h13" stroke="currentColor" stroke-width="1.4"/>
              <path d="M5 10h2M10 10h1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            <span className="menu-title">COD Remittance</span>
          </Link>
        </li>
        <li className={getClass("/wallet_history", "wallet")} {...hoverProps("wallet")}>
          <Link className="nav-link" to="/wallet_history" data-label="Wallet History">
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" stroke="currentColor" stroke-width="1.4"/>
              <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" stroke-width="1.4"/>
            </svg>
            <span className="menu-title">Wallet History</span>
          </Link>
        </li>
        <li className="nav-section-label">Tools</li>
        <li className={getClass("/rate_calculator", "rate")} {...hoverProps("rate")}>
          <Link className="nav-link" to="/rate_calculator" data-label="rate calculator">
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/>
              <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/>
              <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/>
              <path d="M9 11.5h5M11.5 9v5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            <span className="menu-title">Rate Calculator</span>
          </Link>
        </li>
        <li className={getClass("/channel", "channel")} {...hoverProps("channel")}>
          <Link className="nav-link" to="/channel" data-label="channel">
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M3 4h6M3 12h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
            <span className="menu-title">Channel</span>
          </Link>
        </li>
        <li className={getClass("/support", "support")} {...hoverProps("support")}>
          <Link className="nav-link" to="/support" data-label="support">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
              <path d="M4 12a8 8 0 0116 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <rect x="3" y="12" width="3" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <rect x="18" y="12" width="3" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M12 20a4 4 0 004-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span className="menu-title">Support</span>
          </Link>
        </li>
        <li className={getClass("/label_setting", "label")} {...hoverProps("label")}>
          <Link className="nav-link" to="/label_setting" data-label="Label Setting">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
            <path d="M3 12L12 3H18V9L9 18L3 12Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="16" cy="7" r="1" fill="currentColor"/>
            <path d="M19.4 15a1.65 1.65 0 000-3l-.3-.1a6 6 0 00-.5-1.2l.2-.3a1.65 1.65 0 10-2.3-2.3l-.3.2a6 6 0 00-1.2-.5l-.1-.3a1.65 1.65 0 00-3 0l-.1.3a6 6 0 00-1.2.5l-.3-.2a1.65 1.65 0 10-2.3 2.3l.2.3a6 6 0 00-.5 1.2l-.3.1a1.65 1.65 0 000 3l.3.1a6 6 0 00.5 1.2l-.2.3a1.65 1.65 0 102.3 2.3l.3-.2a6 6 0 001.2.5l.1.3a1.65 1.65 0 003 0l.1-.3a6 6 0 001.2-.5l.3.2a1.65 1.65 0 102.3-2.3l-.2-.3a6 6 0 00.5-1.2l.3-.1Z"
                  stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="15" r="2" stroke="currentColor" stroke-width="1.2"/>
          </svg>
            <span className="menu-title">Label Setting</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;