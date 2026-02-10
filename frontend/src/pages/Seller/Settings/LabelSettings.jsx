import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { useAlert } from "../../../middleware/AlertContext";
import companyDetailsConfig from "../../../config/CompanyDetails/CompanyDetailsConfig";
import a4Image from "../../../assets/image/size-a4.png";
import thermalImage from "../../../assets/image/thermal-label.png";

function LabelSettings() {
  const { showError, showSuccess } = useAlert();

  // 🔥 Single source of truth
  const [labelSettings, setLabelSettings] = useState({
    paper_size: "thermal",
    hide_product_details: false,
    hide_seller_gst_number: false,
    hide_warehouse_address: false,
    hide_warehouse_mobile_number: false,
    hide_end_customer_contact_number: false,
  });

  /* =======================
     FETCH COMPANY DETAILS
  ======================== */
  const handleFetchData = async () => {
    try {
      const response = await api.get(companyDetailsConfig.companyDetails);
      const settings =
        response?.data?.data?.companyDetails?.label_settings;

      if (settings) {
        setLabelSettings(settings);
      }
    } catch (error) {
      console.error("Company Details Fetch Error:", error);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  /* =======================
     HANDLERS
  ======================== */
  const handleRadioChange = (e) => {
    setLabelSettings((prev) => ({
      ...prev,
      paper_size: e.target.value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setLabelSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await api.post(
      companyDetailsConfig.labelSettingConfig,
      labelSettings
    );
    showSuccess("Label settings updated successfully!");
  } catch (err) {
    console.error("ERROR RESPONSE ❌", err.response || err);
  }
};

  /* =======================
     UI
  ======================== */
  return (
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Label Setting</h4>
            <p className="card-description">
              Set your shipping label format
            </p>
            <hr />

            <form onSubmit={handleSubmit}>
              {/* ===== LABEL SIZE ===== */}
              <div className="row">
                <div className="col-md-6 border-end">
                  <label className="card cursor-pointer">
                    <div className="card-header border-bottom">
                      <div className="d-flex align-items-center">
                        <input
                          type="radio"
                          className="mx-2 form-check-input mt-0"
                          value="standard"
                          checked={labelSettings.paper_size === "standard"}
                          onChange={handleRadioChange}
                        />
                        <p className="mb-0">
                          Standard Desktop Printers - Size A4 (8"X11")
                          <br />
                          <small>(Four Label Printed on one Sheet)</small>
                        </p>
                      </div>
                    </div>
                    <div
                      className="card-body"
                      style={{ backgroundColor: "#1f1f1f08" }}
                    >
                      <div className="d-flex justify-content-center mt-4">
                        <img src={a4Image} width={200} alt="A4 Label" />
                      </div>
                    </div>
                  </label>
                </div>

                <div className="col-md-6">
                  <label className="card cursor-pointer">
                    <div className="card-header border-bottom">
                      <div className="d-flex align-items-center">
                        <input
                          type="radio"
                          className="mx-2 form-check-input mt-0"
                          value="thermal"
                          checked={labelSettings.paper_size === "thermal"}
                          onChange={handleRadioChange}
                        />
                        <p className="mb-0">
                          Thermal Label Printers - Size (4"X6")
                          <br />
                          <small>(Single Label on one Sheet)</small>
                        </p>
                      </div>
                    </div>
                    <div
                      className="card-body"
                      style={{ backgroundColor: "#1f1f1f08" }}
                    >
                      <div className="d-flex justify-content-center mt-4">
                        <img
                          src={thermalImage}
                          width={200}
                          alt="Thermal Label"
                        />
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* ===== CHECKBOX SETTINGS ===== */}
              <hr className="my-4" />
              <h5 className="fw-bold mb-1">Hide Information on Label</h5>
              <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                Choose which details should not appear on your shipping label
              </p>

              <div className="row">
              {[
                {
                  name: "hide_product_details",
                  label: "Hide Product Details",
                  desc: "Product name and SKU will not be printed",
                },
                {
                  name: "hide_seller_gst_number",
                  label: "Hide Seller GST Number",
                  desc: "GST number will be hidden from label",
                },
                {
                  name: "hide_warehouse_address",
                  label: "Hide Warehouse Address",
                  desc: "Pickup address will not be shown",
                },
                {
                  name: "hide_warehouse_mobile_number",
                  label: "Hide Warehouse Mobile Number",
                  desc: "Warehouse contact number will be hidden",
                },
                {
                  name: "hide_end_customer_contact_number",
                  label: "Hide End Customer Contact Number",
                  desc: "Customer phone number will not appear",
                },
              ].map((item) => (
                <div className="col-md-6 mb-3" key={item.name}>
                  <div
                    className={`border rounded-3 p-3 h-100 ${
                      labelSettings[item.name] ? "border-dark bg-light" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setLabelSettings((prev) => ({
                        ...prev,
                        [item.name]: !prev[item.name],
                      }))
                    }
                  >
                    <div className="d-flex align-items-start gap-3">
                      <input
                        type="checkbox"
                        className="form-check-input mt-1"
                        checked={labelSettings[item.name]}
                        readOnly
                      />

                      <div>
                        <div className="fw-semibold">{item.label}</div>
                        <small className="text-muted">{item.desc}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

              {/* ===== SUBMIT ===== */}
              <div className="row justify-content-center mt-4">
                <button
                  type="submit"
                  className="btn btn-dark py-3 px-4 col-md-2"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabelSettings;
