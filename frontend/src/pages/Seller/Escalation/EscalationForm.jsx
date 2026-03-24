import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../../middleware/AlertContext";
import api from "../../../utils/api";
import escalationConfig from "../../../config/Escalation/EscalationConfig";
import "../../../assets/escalation/escalation.css";

const defaultForm = {
  type: "",
  subject: "",
  query: "",
  awb_numbers: "",
  attachments: [],
};

function EscalationForm() {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [priority, setPriority] = useState("Normal");
  const fileInputRef = useRef(null);

  const { showError, showSuccess } = useAlert();
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));

    setPreviews(urls);
    setForm((prev) => ({ ...prev, attachments: files }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.type) newErrors.type = "Type is required";
    if (!form.subject) newErrors.subject = "Subject is required";
    if (!form.query) newErrors.query = "Query is required";
    if (form.type === "Shipment Query" && !form.awb_numbers) {
      newErrors.awb_numbers = "AWB required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", form.type);
      formData.append("subject", form.subject);
      formData.append("query", form.query);
      formData.append("awb_numbers", form.awb_numbers);

      form.attachments.forEach((file) =>
        formData.append("attachment", file)
      );

      const res = await api.post(
        escalationConfig.escalationApi,
        formData
      );

      if (res?.data?.status === 201) {
        showSuccess("Escalation created");
        navigate("/support");
      }
    } catch (err) {
      showError("Error creating escalation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="escalation-layout">
        <div>
          <div className="form-card">
            <div className="card-hdr">
              <div className="card-hdr-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5C8 4.2 8.7 3.5 9.5 3.5S11 4.2 11 5C11 6 8 6.3 8 8M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div className="card-hdr-title">Escalation Details</div>
                <div className="card-hdr-sub">Fill in all required fields to raise a support ticket</div>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
            <div className="card-body">
              <div className="field-row">
                <div>
                  <div className="f-label">Type <span className="f-req">*</span></div>
                  <div className="f-select-wrap">
                    <select name="type" value={form.type} onChange={handleChange} className="f-select placeholder">
                      <option value="" disabled>Select issue type</option>
                      <option>Shipment Query</option>
                      <option>Tech Query</option>
                      <option>Billing Query</option>
                      <option>Other</option>
                    </select>
                    <svg className="f-select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {errors.type && <small className="text-danger">{errors.type}</small>}
                </div>
                <div>
                  <div className="f-label">Subject <span className="f-req">*</span></div>
                  <div className="f-select-wrap">
                    <select name="subject" value={form.subject} onChange={handleChange} className="f-select placeholder">
                      <option value="" disabled>Choose one</option>
                      <option>Shipment Out of SLA</option>
                      <option>Weight Dispute</option>
                      <option>COD Remittance Pending</option>
                      <option>Delivery Not Attempted</option>
                      <option>Wrong Delivery</option>
                      <option>Shipment Lost in Transit</option>
                      <option>Damaged Package</option>
                      <option>RTO Not Initiated</option>
                      <option>Billing Discrepancy</option>
                      <option>Technical Issue</option>
                    </select>
                    <svg className="f-select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {errors.subject && <small className="text-danger">{errors.subject}</small>}
                </div>
              </div>
              <div className="field">
                <div className="f-label">
                  AWB / Order IDs
                  <span className="f-hint">(press Enter or comma to add multiple)</span>
                </div>
                <div className="awb-input-wrap" id="awbWrap" onClick={() => document.getElementById('awbInp')?.focus()}>
                  <div className="awb-tag">80035236201 <div className="awb-tag-x" onclick="removeTag(this)">✕</div></div>
                  <div className="awb-tag">90109156663 <div className="awb-tag-x" onclick="removeTag(this)">✕</div></div>
                  <input id="awbInp" name="awb_numbers" value={form.awb_numbers} onChange={handleChange} className="awb-input-inner" type="text" placeholder="Add AWB or Order ID…"/>
                </div>
              </div>
              <div className="field">
                <div className="f-label">Priority <span className="f-req">*</span></div>
                <div className="priority-chips">
                <div
                  className={`p-chip ${priority === "Normal" ? "selected" : ""}`}
                  onClick={() => setPriority("Normal")}
                >
                  <div className="p-chip-dot dot-normal"></div>
                  Normal
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: ".58rem",
                    color: "#8B93B0",
                    marginLeft: ".2rem"
                  }}>
                    · 4 hrs
                  </span>
                </div>
                <div
                  className={`p-chip p-high ${priority === "High" ? "selected" : ""}`}
                  onClick={() => setPriority("High")}
                >
                  <div className="p-chip-dot dot-high"></div>
                  High
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: ".58rem",
                    color: "#8B93B0",
                    marginLeft: ".2rem"
                  }}>
                    · 2 hrs
                  </span>
                </div>
                <div
                  className={`p-chip p-critical ${priority === "Critical" ? "selected" : ""}`}
                  onClick={() => setPriority("Critical")}
                >
                  <div className="p-chip-dot dot-critical"></div>
                  Critical
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: ".58rem",
                    color: "#8B93B0",
                    marginLeft: ".2rem"
                  }}>
                    · 1 hr
                  </span>
                </div>
              </div>
              </div>
              <div className="field">
                <div className="f-label">Query <span className="f-req">*</span></div>
                <textarea name="query" value={form.query} onChange={handleChange} className="f-ta" placeholder="Describe the issue in detail — what happened, when it happened, what you've already tried, and the impact on your orders…" rows="5"></textarea>
              </div>
              <div className="f-divider"></div>
              <div className="field">
                <div className="f-label">
                  Attachments
                  <span className="f-hint">(multiple files allowed)</span>
                </div>
                <div className="file-upload" onClick={() => fileInputRef.current.click()}>
                  <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} className="f-inp" accept=".jpg,.jpeg,.png,.pdf,.xlsx,.csv"/>
                  <div className="fu-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v9M4.5 5.5L8 2l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </div>
                  <div className="fu-title">Drop files here or click to upload</div>
                  <div className="fu-sub">Screenshots, weight slips, invoices, or any relevant documents</div>
                  <div className="fu-types">
                    <span className="fu-type">JPG</span><span className="fu-type">PNG</span>
                    <span className="fu-type">PDF</span><span className="fu-type">XLSX</span>
                    <span className="fu-type">CSV</span>
                  </div>
                </div>
                <div className="attached-files" id="fileList">
                  <div className="af-item">
                    <div className="af-icon">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="2" y="1" width="8" height="10" rx="1.2" stroke="currentColor" strokeWidth="1.1"/><path d="M4 4h4M4 6h4M4 8h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                    </div>
                    <div className="af-name">weight_discrepancy_proof.pdf</div>
                    <div className="af-size">842 KB</div>
                    <div className="af-remove" onclick="this.closest('.af-item').remove()">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    </div>
                  </div>
                </div>
              </div>
              {previews.length > 0 && (
                <div className="attached-files">
                  {previews.map((src, i) => (
                    <img key={i} src={src} height={80} />
                  ))}
                </div>
              )}
              <button className="btn-submit" disabled={loading}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 7.5h11M8.5 3l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {loading ? "Submitting..." : "Submit Escalation"}
              </button>

            </div>
            </form>
          </div>
        </div>
        <div>
          <div className="info-card">
            <div className="ic-hdr">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4.5V7M7 9v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Tips for Faster Resolution
            </div>
            <div className="ic-body">
              <div className="ic-item">
                <div className="ic-item-icon ii-b">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5h8M5.5 1.5v8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div className="ic-item-title">Add AWB numbers</div>
                  <div className="ic-item-desc">Include all related AWB or Order IDs so our team can pull the data instantly.</div>
                </div>
              </div>
              <div className="ic-item">
                <div className="ic-item-icon ii-g">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div className="ic-item-title">Upload proof</div>
                  <div className="ic-item-desc">Weight slips, screenshots, or delivery proof significantly speed up resolution.</div>
                </div>
              </div>
              <div className="ic-item">
                <div className="ic-item-icon ii-o">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 3v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div className="ic-item-title">Set correct priority</div>
                  <div className="ic-item-desc">Mark Critical only when there's active financial impact or urgent delivery SLA breach.</div>
                </div>
              </div>
              <div className="ic-item">
                <div className="ic-item-icon ii-r">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1C3.3 1 1.5 2.8 1.5 5s4 6 4 6 4-3.8 4-6C9.5 2.8 7.7 1 5.5 1z" stroke="currentColor" strokeWidth="1.2"/><circle cx="5.5" cy="5" r="1.3" stroke="currentColor" strokeWidth="1.2"/></svg>
                </div>
                <div>
                  <div className="ic-item-title">Describe clearly</div>
                  <div className="ic-item-desc">Mention what happened, when, and the exact shipment status at that time.</div>
                </div>
              </div>
            </div>
          </div>

          {/* SLA */}
          <div className="sla-card">
            <div className="sla-title">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              Response SLAs
            </div>
            <div className="sla-rows">
              <div className="sla-row">
                <div className="sla-priority">
                  <div className="sla-dot sd-normal"></div>
                  <div className="sla-name">Normal</div>
                </div>
                <div className="sla-time">Within 4 hours</div>
              </div>
              <div className="sla-row">
                <div className="sla-priority">
                  <div className="sla-dot sd-high"></div>
                  <div className="sla-name">High</div>
                </div>
                <div className="sla-time">Within 2 hours</div>
              </div>
              <div className="sla-row">
                <div className="sla-priority">
                  <div className="sla-dot sd-critical"></div>
                  <div className="sla-name">Critical</div>
                </div>
                <div className="sla-time">Within 1 hour</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

export default EscalationForm;