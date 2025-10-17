import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function AdminSidebar({ setSideNavActive, sideNavActive }) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

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
            ${
              location.pathname.includes("/admin/dashboard") ||
              location.pathname === "/admin"
                ? "active"
                : ""
            }
            ${hoveredItem === "dashboard" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("dashboard")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/admin/dashboard">
            <i className="mdi mdi-grid-large menu-icon"></i>
            <span className="menu-title">Dashboard</span>
          </Link>
        </li>

        <li
          className={`nav-item 
            ${
              location.pathname.includes("/admin/shipment")
                ? "active"
                : ""
            }
            ${hoveredItem === "shipment" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("shipment")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/admin/shipment">
            <i className="mdi mdi-truck-fast-outline menu-icon"></i>
            <span className="menu-title">Shipment</span>
          </Link>
        </li>

        <li
          className={`nav-item 
            ${
              location.pathname.includes("/admin/users")
                ? "active"
                : ""
            }
            ${hoveredItem === "users" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("users")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/admin/users">
            <i className="mdi mdi-account-multiple-outline menu-icon"></i>
            <span className="menu-title">Users</span>
          </Link>
        </li>

        <li
          className={`nav-item 
            ${
              location.pathname.includes("/admin/awb_list")
                ? "active"
                : ""
            }
            ${hoveredItem === "awb_list" ? "hover-open" : ""}`}
          onMouseEnter={() => setHoveredItem("awb_list")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link className="nav-link" to="/admin/awb_list">
            <i className="mdi mdi-human-dolly menu-icon"></i>
            <span className="menu-title">Awb List</span>
          </Link>
        </li>
        
      </ul>
    </nav>
  );
}

export default AdminSidebar;
