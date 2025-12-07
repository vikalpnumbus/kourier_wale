import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar({ setSideNavActive, sideNavActive }) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null); // track which li is hovered

  useEffect(() => {
    setSideNavActive(false);
  }, [location.pathname]);

  return (
    <nav
      className={`sidebar sidebar-offcanvas ${sideNavActive ? "active" : ""}`}
      id="sidebar"
    >
      <ul className="nav">
        <li
          className={`nav-item 
            ${location.pathname.includes("/dashboard") || location.pathname === "/" ? "active" : ""}
            ${hoveredItem === "dashboard" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("dashboard")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/dashboard">
            <i className="mdi mdi-grid-large menu-icon"></i>
            <span className="menu-title">Dashboard</span>
          </Link>
        </li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/orders") ? "active" : ""}
            ${hoveredItem === "orders" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("orders")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/orders">
            <i className="mdi mdi-cube-outline menu-icon"></i>
            <span className="menu-title">Orders</span>
          </Link>
        </li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/shipments") ? "active" : ""}
            ${hoveredItem === "shipments" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("shipments")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/shipments">
            <i className="mdi mdi-truck-outline menu-icon"></i>
            <span className="menu-title">Shipments</span>
          </Link>
        </li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/products") ? "active" : ""}
            ${hoveredItem === "products" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("products")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/products">
            <i className="mdi mdi-package menu-icon"></i>
            <span className="menu-title">Products</span>
          </Link>
        </li>
        
        <li
          className={`nav-item 
            ${location.pathname.includes("/warehouse") ? "active" : ""}
            ${hoveredItem === "warehouse" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("warehouse")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/warehouse">
            <i className="mdi mdi-warehouse menu-icon"></i>
            <span className="menu-title">Warehouse</span>
          </Link>
        </li>
        <li className="nav-item nav-category">Billing</li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/shippingcharges") ? "active" : ""}
            ${hoveredItem === "shippingcharges" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("shippingcharges")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/shippingcharges">
            <i className="mdi mdi-book-open-page-variant menu-icon"></i>
            <span className="menu-title">Shipping Charges</span>
          </Link>
        </li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/cod_remittance") ? "active" : ""}
            ${hoveredItem === "cod_remittance" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("cod_remittance")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/cod_remittance">
            <i className="mdi mdi-currency-inr menu-icon"></i>
            <span className="menu-title">COD Remittance</span>
          </Link>
        </li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/wallet_history") ? "active" : ""}
            ${hoveredItem === "wallet_history" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("wallet_history")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/wallet_history">
            <i className="mdi mdi-wallet menu-icon"></i>
            <span className="menu-title">Wallet History</span>
          </Link>
        </li>
        <li className="nav-item nav-category">Tools</li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/after_ship") ? "active" : ""}
            ${hoveredItem === "after_ship" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("after_ship")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/after_ship">
            <i className="mdi mdi-wallet menu-icon"></i>
            <span className="menu-title">After Ship</span>
          </Link>
        </li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/rate_calculator") ? "active" : ""}
            ${hoveredItem === "rate_calculator" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("rate_calculator")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/rate_calculator">
            <i className="mdi mdi-calculator menu-icon"></i>
            <span className="menu-title">Rate Calculator</span>
          </Link>
        </li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/order_allocation") ? "active" : ""}
            ${hoveredItem === "order_allocation" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("order_allocation")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/order_allocation">
            <i className="mdi mdi-wallet menu-icon"></i>
            <span className="menu-title">Order Alloc. Eng.</span>
          </Link>
        </li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/pickup") ? "active" : ""}
            ${hoveredItem === "pickup" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("pickup")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/pickup">
            <i className="mdi mdi-wallet menu-icon"></i>
            <span className="menu-title">Pickup Request</span>
          </Link>
        </li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/channel") ? "active" : ""}
            ${hoveredItem === "channel_integration" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("channel_integration")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/channel">
            <i className="mdi mdi-webhook menu-icon"></i>
            <span className="menu-title">Channel Integration</span>
          </Link>
        </li>
        <li className="nav-item nav-category">Others</li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/support") ? "active" : ""}
            ${hoveredItem === "support" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("support")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/support">
            <i className="mdi mdi-ticket-account menu-icon"></i>
            <span className="menu-title">Support</span>
          </Link>
        </li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/staff") ? "active" : ""}
            ${hoveredItem === "staff" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("staff")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/staff">
            <i className="mdi mdi-account-multiple-plus menu-icon"></i>
            <span className="menu-title">Staff Managment</span>
          </Link>
        </li>
        <li className="nav-item nav-category">Setting</li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/profile") ? "active" : ""}
            ${hoveredItem === "profile" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("profile")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/profile">
            <i className="mdi mdi-account-settings menu-icon"></i>
            <span className="menu-title">Profile</span>
          </Link>
        </li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/label_setting") ? "active" : ""}
            ${hoveredItem === "label_setting" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("label_setting")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/label_setting">
            <i className="mdi mdi-label menu-icon"></i>
            <span className="menu-title">Label Setting</span>
          </Link>
        </li>
        <li
          className={`nav-item 
            ${location.pathname.includes("/notification") ? "active" : ""}
            ${hoveredItem === "notification" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("notification")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/notification">
            <i className="mdi mdi-bell-ring menu-icon"></i>
            <span className="menu-title">Notification</span>
          </Link>
        </li>
        
      </ul>
    </nav>
  );
}

export default Sidebar;
