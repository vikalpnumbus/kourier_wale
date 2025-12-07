import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import companyDetailsConfig from "../config/CompanyDetails/CompanyDetailsConfig";
import api from "../utils/api";

function AdminNavbar({ setSideNavActive, sideNavActive }) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleToggleSidebar = () => {
    document.body.classList.toggle("sidebar-icon-only");
  };
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const [companyData, setCompanyData] = useState({});
  const handleFetchData = async () => {
    try {
      const response = await api.get(companyDetailsConfig.companyDetails);
      setCompanyData(response?.data?.data?.companyDetails || {});
    } catch (error) {
      console.error("Company Details Fetch Error:", error);
      setCompanyData({});
    }
  };
  useEffect(() => {
    handleFetchData();
  }, []);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <nav
      className={`navbar default-layout col-lg-12 col-12 p-0 d-flex align-items-top flex-row fixed-top ${
        scrolled ? "headerLight" : ""
      }`}
    >
      {/* Brand Section */}
      <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-start py-0">
        <div className="me-3">
          <button
            className="navbar-toggler navbar-toggler align-self-center"
            type="button"
            data-bs-toggle="minimize"
            onClick={() => handleToggleSidebar()}
          >
            <span className="icon-menu"></span>
          </button>
        </div>
        <div className="me-3">
          <button
            className="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
            type="button"
            data-bs-toggle="offcanvas"
            onClick={() => setSideNavActive(!sideNavActive)}
          >
            <span
              className="mdi mdi-menu"
              style={{ fontSize: "1.25rem" }}
            ></span>
          </button>
        </div>
        <div>
          <a className="navbar-brand brand-logo" >
            {/* <img src="../assets/images/logo.svg" alt="logo" /> */}
            Admin Panel
          </a>
          <a className="navbar-brand brand-logo-mini">
            {/* <img src="../assets/images/logo-mini.svg" alt="logo" /> */}
            AP
          </a>
        </div>
      </div>

      {/* Navbar Menu */}
      <div className="navbar-menu-wrapper d-flex align-items-top">
        {(location.pathname === "/admin" || location.pathname === "/admin/dashboard") && (
          <ul className="navbar-nav">
            <li className="nav-item fw-semibold d-none d-lg-block ms-0">
              <h1 className="welcome-text">
                {getGreeting()},{" "}
                <span className="text-black fw-bold">{companyData?.fname}</span>
              </h1>
            </li>
          </ul>
        )}

        <ul className="navbar-nav ms-auto">
          <li className="nav-item dropdown d-none d-lg-block user-dropdown">
            <div
              id="UserDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ cursor: "pointer", fontSize: "2rem", lineHeight: "0" }}
            >
              <i className="mdi mdi-account-circle"></i>
              {/* <img
                className="img-xs rounded-circle"
                src="../assets/images/faces/face8.jpg"
                alt="Profile"
              /> */}
            </div>
            <div
              className="dropdown-menu dropdown-menu-right navbar-dropdown p-0"
              aria-labelledby="UserDropdown"
            >
              <Link to={"/admin/profile"} className="dropdown-item">
                <i className="dropdown-item-icon mdi mdi-account-outline text-primary me-2"></i>{" "}
                My Profile{" "}
              </Link>
              <div
                className="dropdown-item border-0 rounded-bottom-2"
                onClick={() => {
                  localStorage.clear();
                  navigate("/login", { replace: true });
                }}
              >
                <i className="dropdown-item-icon mdi mdi-power text-primary me-2"></i>
                Sign Out
              </div>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default AdminNavbar;
