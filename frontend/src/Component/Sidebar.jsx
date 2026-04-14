import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../assets/sidebar/sidebar.css";

function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-nav">
        <Link to="/dashboard" data-label="Dashboard" className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
          </svg>
          Dashboard
        </Link>
        <Link to="/orders" data-label="Orders" className={`nav-item ${isActive("/orders") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg> Orders
          {/* <span className="nav-badge">4</span> */}
        </Link>
        <Link to="/shipments" data-label="Shipments" className={`nav-item ${isActive("/shipments") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="5" width="14" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M5 5V4a3 3 0 016 0v1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg> Shipments
        </Link>
        <Link to="/pickup" data-label="Pickup Request" className={`nav-item ${isActive("/pickup") ? "active" : ""}`}>
              <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M3 4h6M3 12h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg> Pickup Request
        </Link>
        <Link to="/products" data-label="Products" className={`nav-item ${isActive("/products") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L10.5 6H15L11 9.5L12.5 14.5L8 11.5L3.5 14.5L5 9.5L1 6H5.5L8 1Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
          </svg> Products
        </Link>
        <Link to="/warehouse" data-label="Warehouse" className={`nav-item ${isActive("/warehouse") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
            <path d="M2 13V6l6-4 6 4v7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="6" y="9" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.3"/>
          </svg> Warehouse
        </Link>
        <div className="nav-section-label">Billing</div>
        <Link to="/shippingcharges" data-label="Shipping Charges" className={`nav-item ${isActive("/shippingcharges") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M8 5v1.5M8 9.5V11M6.5 7.5h2a1 1 0 010 2h-1a1 1 0 000 2H9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg> Shipping Charges
        </Link>
        <Link to="/cod_remittance" data-label="COD Remittance" className={`nav-item ${isActive("/cod_remittance") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
            <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M1.5 6.5h13" stroke="currentColor" stroke-width="1.4"/>
            <path d="M5 10h2M10 10h1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg> COD Remittance
        </Link>
        <Link to="/wallet_history" data-label="Wallet History" className={`nav-item ${isActive("/wallet_history") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" stroke="currentColor" stroke-width="1.4"/>
            <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" stroke-width="1.4"/>
          </svg> Wallet History
        </Link>
        <div className="nav-section-label">Tools</div>
        {/* <Link to="/after_ship" data-label="After Ship" className={`nav-item ${isActive("/after_ship") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
            <path d="M8 1l1.5 3.5L13 5l-2.5 2.5.5 3.5L8 9.5 5 11l.5-3.5L3 5l3.5-.5L8 1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
          </svg> After Ship
        </Link> */}
        <Link to="/rate_calculator" data-label="Rate Calculator" className={`nav-item ${isActive("/rate_calculator") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/>
            <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/>
            <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/>
            <path d="M9 11.5h5M11.5 9v5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg> Rate Calculator
        </Link>
        {/* <Link to="/order_allocation" data-label="Order Allocation" className={`nav-item ${isActive("/order_allocation") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="6" r="3" stroke="currentColor" stroke-width="1.4"/>
            <path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg> Order Alloc. Eng.
        </Link> */}
        <Link to="/channel" data-label="Channel" className={`nav-item ${isActive("/channel") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M3 4h6M3 12h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg> Channel
        </Link>
        <Link to="/support" data-label="Support" className={`nav-item ${isActive("/support") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
            <path d="M4 12a8 8 0 0116 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="3" y="12" width="3" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="18" y="12" width="3" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 20a4 4 0 004-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg> Support
        </Link>
        <Link to="/warehouse" data-label="Warehouse" className={`nav-item ${isActive("/warehouse") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
            <path d="M3 10L12 4L21 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
            <rect x="10" y="14" width="4" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <path d="M7 13h2M7 16h2M15 13h2M15 16h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg> Warehouse
        </Link>
        <Link to="/label_setting" data-label="Support" className={`nav-item ${isActive("/label_setting") ? "active" : ""}`}>
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
            <path d="M3 12L12 3H18V9L9 18L3 12Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="16" cy="7" r="1" fill="currentColor"/>
            <path d="M19.4 15a1.65 1.65 0 000-3l-.3-.1a6 6 0 00-.5-1.2l.2-.3a1.65 1.65 0 10-2.3-2.3l-.3.2a6 6 0 00-1.2-.5l-.1-.3a1.65 1.65 0 00-3 0l-.1.3a6 6 0 00-1.2.5l-.3-.2a1.65 1.65 0 10-2.3 2.3l.2.3a6 6 0 00-.5 1.2l-.3.1a1.65 1.65 0 000 3l.3.1a6 6 0 00.5 1.2l-.2.3a1.65 1.65 0 102.3 2.3l.3-.2a6 6 0 001.2.5l.1.3a1.65 1.65 0 003 0l.1-.3a6 6 0 001.2-.5l.3.2a1.65 1.65 0 102.3-2.3l-.2-.3a6 6 0 00.5-1.2l.3-.1Z"
                  stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="15" r="2" stroke="currentColor" stroke-width="1.2"/>
          </svg> Label Setting
        </Link>
      </div>
    </nav>
  );
}
export default Sidebar;