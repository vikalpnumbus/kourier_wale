import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { useAlert } from "../../../middleware/AlertContext";
import companyDetailsConfig from "../../../config/CompanyDetails/CompanyDetailsConfig";
import a4Image from "../../../assets/image/size-a4.png";
import thermalImage from "../../../assets/image/thermal-label.png";
import "../../../assets/label/label.css"

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
    <>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Settings · Print Configuration</div>
          <h1 className="page-title">Label Settings</h1>
          <p className="page-subtitle">Configure your shipping label format and choose what information to print</p>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <div className="section-header">
                <div className="section-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h4v4H7zM13 7h4v4h-4zM7 13h4v4H7zM13 13h4v4h-4z"/></svg>
                </div>
                <div>
                  <div className="section-title">Label Format</div>
                  <div className="section-sub">Select the printer type that matches your hardware setup</div>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                {/* ===== LABEL SIZE ===== */}
                <div className="section-block py-2">
                  <div className="format-grid">
                    <div class={`format-card ${labelSettings.paper_size === "standard" ? "selected" : ""}`} onClick={() =>
                        setLabelSettings((prev) => ({
                          ...prev,
                          paper_size: "standard",
                        }))
                      }
                      >
                      <div class="selected-badge">Active</div>
                      <div class="format-card-header">
                        <div class="radio-circle"><div class="radio-dot"></div></div>
                        <div>
                          <div class="format-card-title">Standard Desktop Printer</div>
                          <div class="format-card-desc">A4 (8" × 11") · Four labels per sheet</div>
                        </div>
                      </div>
                      <div class="label-preview">
                        <div class="a4-preview" style={{paddingtop:"28px",paddingLeft:"28px"}}>
                          <div class="dim-label-h">8" (inches)</div>
                          <div class="dim-label-v">11" (inches)</div>
                          <div class="a4-sheet">
                            <div class="a4-label-slot"></div>
                            <div class="a4-label-slot"></div>
                            <div class="a4-label-slot"></div>
                            <div class="a4-label-slot"></div>
                          </div>
                          <div class="a4-caption">4 labels per sheet</div>
                        </div>
                      </div>
                      <div class="dim-row">
                        <div class="dim-tag">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                          A4 Paper
                        </div>
                        <div class="dim-tag">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/></svg>
                          Desktop Printer
                        </div>
                      </div>
                    </div>
                    <div className={`format-card ${labelSettings.paper_size === "thermal" ? "selected" : ""}`}
                      onClick={() =>
                        setLabelSettings((prev) => ({
                          ...prev,
                          paper_size: "thermal",
                        }))
                      }>
                      <div class="selected-badge">Active</div>
                      <div class="format-card-header">
                        <div class="radio-circle"><div class="radio-dot"></div></div>
                        <div>
                          <div class="format-card-title">Thermal Label Printer</div>
                          <div class="format-card-desc">4" × 6" · Single label per print</div>
                        </div>
                      </div>

                      <div class="label-preview">
                        <div class="thermal-preview" style={{paddingTop:"28px",paddingLeft:"28px"}}>
                          <div class="dim-label-h">4" (inches)</div>
                          <div class="dim-label-v">6" (inches)</div>
                          <div class="thermal-sheet">
                            <div class="thermal-barcode">
                              <div class="tc-bar" style={{height:"100"}}></div>
                              <div class="tc-bar" style={{height:"80"}}></div>
                              <div class="tc-bar" style={{height:"100"}}></div>
                              <div class="tc-bar" style={{height:"60"}}></div>
                              <div class="tc-bar" style={{height:"100"}}></div>
                              <div class="tc-bar" style={{height:"80"}}></div>
                              <div class="tc-bar" style={{height:"100"}}></div>
                              <div class="tc-bar" style={{height:"70"}}></div>
                              <div class="tc-bar" style={{height:"100"}}></div>
                              <div class="tc-bar" style={{height:"90"}}></div>
                              <div class="tc-bar" style={{height:"60"}}></div>
                              <div class="tc-bar" style={{height:"100"}}></div>
                              <div class="tc-bar" style={{height:"75"}}></div>
                              <div class="tc-bar" style={{height:"100"}}></div>
                            </div>
                            <div style={{height:"1px",background:"var(--border-soft)",margin:"2px 0"}}></div>
                            <div class="thermal-addr-line full"></div>
                            <div class="thermal-addr-line mid"></div>
                            <div class="thermal-addr-line short"></div>
                            <div style={{height:"4px"}}></div>
                            <div class="thermal-addr-line full"></div>
                            <div class="thermal-addr-line mid"></div>
                            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginTop:"auto"}}>
                              <div style={{display:"flex",flexDirection:"column", gap:"3px",flex:"1"}}>
                                <div class="thermal-addr-line short"></div>
                                <div class="thermal-addr-line mid"></div>
                              </div>
                              <div class="thermal-qr">
                                <div class="qr-dot"></div><div></div><div class="qr-dot"></div>
                                <div></div><div class="qr-dot"></div><div></div>
                                <div class="qr-dot"></div><div></div><div class="qr-dot"></div>
                              </div>
                            </div>
                          </div>
                          <div class="thermal-caption">1 label per print</div>
                        </div>
                      </div>

                      <div class="dim-row">
                        <div class="dim-tag">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                          4×6" Label
                        </div>
                        <div class="dim-tag">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                          Thermal Printer
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* ===== CHECKBOX SETTINGS ===== */}
                <div className="section-block">
                    <hr className="my-4" />
                    <h5 className="fw-bold mb-1">Hide Information on Label</h5>
                    <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                      Choose which details should not appear on your shipping label
                    </p>
                    <div className="toggle-grid">
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
                    ].map((item) => {
                      const active = labelSettings[item.name];

                      return (
                        <div
                          key={item.name}
                          className={`toggle-row ${active ? "active" : ""}`}
                          onClick={() =>
                            setLabelSettings((prev) => ({
                              ...prev,
                              [item.name]: !prev[item.name],
                            }))
                          }
                        >
                          <div className="toggle-icon">📦</div>

                          <div className="toggle-info">
                            <div className="toggle-label">{item.label}</div>
                            <div className="toggle-desc">{item.desc}</div>
                          </div>

                          <div className="toggle-switch">
                            <div className={`switch-track ${active ? "on" : ""}`}>
                              <div className="switch-knob"></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              {/* ===== SUBMIT ===== */}
                <div className="section-block">
                  <div className="save-bar">
                    <div className="save-bar-info">
                      <div className="save-bar-dot"></div>
                      <div className="save-bar-text">
                        <strong>Unsaved changes</strong>
                      </div>
                    </div>

                    <div className="save-bar-actions">
                      <button className="btn btn-ghost">Discard</button>

                      <button type="submit" className="btn btn-primary">
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LabelSettings;
