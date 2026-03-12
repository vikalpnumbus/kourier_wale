import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import companyDetailsConfig from "../config/CompanyDetails/CompanyDetailsConfig";
import company_logo from "../../public/themes/assets/company_image/veygo-logo.svg";
import api from "../utils/api";
import RechargeModal from "./RechargeModal";
import { mdiCurrencyInr } from "@mdi/js";
function Navbar({ setSideNavActive, sideNavActive }) {
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
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const [searchAWb, setSearchAWB] = useState("");

  const handleSearchAwb = (e) => {
    e.preventDefault();
    if (searchAWb.trim()) {
      navigate(`/shipment?awb_no=${searchAWb}`)
    }
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
            style={{color: "#fff"}}
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
          <a className="navbar-brand brand-logo">
            <img src={company_logo} alt="Veygo" />
          </a>
        </div>
      </div>

      <div className="navbar-menu-wrapper d-flex align-items-top">
        {(location.pathname === "/" || location.pathname === "/dashboard") && (
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
          <li className="nav-item dropdown d-lg-block user-dropdown">
            <div className="nav-link dropdown-bordered  dropdown-toggle-split" id="messageDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.3"></circle>
              <path d="M6 3.5v2.5l1.5 1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path>
            </svg>
              {" "}
              Quick Action{" "}
            </div>
            <div className="dropdown-menu dropdown-menu-right navbar-dropdown p-0" aria-labelledby="messageDropdown">
              <Link to="/orders/add" className="dropdown-item ">
                <p className="mb-0 fw-medium float-start">Create Order</p>
              </Link>
              <Link to="/pickup" className="dropdown-item ">
                <p className="mb-0 fw-medium float-start">
                  Create Pickup Request
                </p>
              </Link>
              <a className="dropdown-item ">
                <p className="mb-0 fw-medium float-start">
                  Pincode Serviceability
                </p>
              </a>
              <Link to="/rate_calculator" className="dropdown-item ">
                <p className="mb-0 fw-medium float-start">Rate Calculator</p>
              </Link>
            </div>
          </li>
          
          <li className="nav-item custom_width">
            <div
              className="nav-link dropdown-bordered  dropdown-toggle-split "
              id="rechargebutton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ cursor: "pointer" }}
              onClick={()=>setShowRechargeModal(true)}
            >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1.5v9M1.5 6h9" stroke="white" stroke-width="1.6" stroke-linecap="round"></path>
            </svg>
              Recharge
            </div>
          </li>
          
          <li className="nav-item">
            <div
              className="nav-link dropdown-bordered  dropdown-toggle-split"
              id="balancechip"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <Icon path={mdiCurrencyInr} size={1} />
              {companyData?.wallet_balance}
            </div>
          </li>
          <li className="nav-item">
            <form className="search-form" onSubmit={handleSearchAwb}>
              <i className="icon-search"></i>
              <input
                type="search"
                className="form-control"
                placeholder="Search AWB's"
                title="Search here"
                value={searchAWb}
                onChange={(e) => setSearchAWB(e.target.value)}
              />
            </form>
          </li>

          <li className="nav-item dropdown  d-lg-block user-dropdown">
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
              <Link to={"/profile"} className="dropdown-item">
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
      {showRechargeModal && <RechargeModal handleFetchData={handleFetchData} onClose={() => setShowRechargeModal(false)} />}
    </nav>
  );
}

export default Navbar;
