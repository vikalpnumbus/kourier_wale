import React, {
  useState,
  useEffect,
} from "react";
import RateConfig from "../../../config/RateDetails/RateDetailsConfig";
import companyDetailsConfig from "../../../config/CompanyDetails/CompanyDetailsConfig";
import api from "../../../utils/api";
import '../../../../public/themes/assets/css/custom/custom.css';
import "../../../assets/ratecalculator/ratecalculator.css";
function index() {
    const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    weight: "",
    length: "",
    breadth: "",
    height: "",
    paymentType: "",
    amount: ""
  });
  const planNames = {
    1: "Bronze",
    2: "Silver",
    3: "Gold",
    4: "Platinum",
  };
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForwardReverse, setShowForwardReverse] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const validate = () => {
    const newErrors = {};
    if (!formData.origin.trim()) {
    newErrors.origin = "Origin is required";
    } else if (formData.origin.trim().length !== 6) {
    newErrors.origin = "Origin must be exactly 6 characters";
    }
    if (!formData.destination.trim()) {
        newErrors.destination = "Destination is required";
    } else if (formData.destination.trim().length !== 6) {
        newErrors.destination = "Destination must be exactly 6 characters";
    }
    if (!formData.weight.trim()) newErrors.weight = "Weight is required";
    if (!formData.length.trim()) newErrors.length = "Length is required";
    if (!formData.breadth.trim()) newErrors.breadth = "Breadth is required";
    if (!formData.height.trim()) newErrors.height = "Height is required";
    return newErrors;
  };
  const [ratePrice, setRatePrice] = useState([]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0)
    {
      try {
        setLoading(true);
        const url = `${RateConfig.RateCalculator}`;
        const res = await api.post(url, formData);
        setShowForwardReverse(true);
        const rows = res?.data?.data?.rows || [];
        const message = res?.data?.data?.message || "";
        setRatePrice(rows);
        setApiMessage(message);
      } catch (error) {
        console.error("API Error:", error);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  };

  const [planData, setPlanData] = useState({});
  const fetchplanname = async () => {
    try {
      const response = await api.get(companyDetailsConfig.companyDetails);
      setPlanData(response?.data?.data?.companyDetails || {});
    } catch (error) {
      console.error("Company Details Fetch Error:", error);
      setPlanData({});
    }
  };

  console.log("plandata", planData);
  const [planChartData, setPlanChartData] = useState([]);
  const fetchplanchart = async () => {
    try {
        const response = await api.get(RateConfig.Plan_chart);
        const chartData = response?.data?.data?.result || response?.data?.result || [];
        console.log("Fetched Plan Chart:", chartData);
        const grouped = chartData.reduce((acc, row) => {
        const key = `${row.courier_name} ${row.weight}`;
        if (!acc[key]) acc[key] = { courier: row.courier_name, weight: row.weight, data: {} };
        acc[key].data[row.type.toLowerCase()] = row; // forward, weight, rto
        return acc;
        }, {});
        setPlanChartData(Object.values(grouped));
        } catch (error) {
        console.error("Plan Details Fetch Error:", error);
        setPlanChartData([]);
        }
    };
    useEffect(() => {
      fetchplanname();
    }, []);
    useEffect(() => {
    fetchplanchart();
    }, []);

  return (
    <div className="layout">
        <main>
            <div className="page-header">
                <div>
                    <div className="page-eyebrow">Tools · Pricing Engine</div>
                    <h1 className="page-title">Rate Calculator</h1>
                    <p className="page-subtitle">
                    Compare live carrier rates instantly across all zones & weight slabs
                    </p>
                </div>
                <div className="plan-badge">
                    {planNames[planData?.pricingPlanId]}
                </div>
            </div>
            <div className="row">
                <div className="col-6">
                    <div className="calc-card">
                        <div className="calc-card-header">
                            <div>
                            <div className="calc-header-title">Shipment Details</div>
                            <div className="calc-header-sub">
                                Fill in dimensions & route to compare rates
                            </div>
                            </div>
                        </div>
                        <div className="calc-body">
                            <form className="forms-sample" onSubmit={handleSubmit} noValidate>
                                <div>
                                    <div className="field-group-label">Route</div>
                                    <div className="field-row cols-2">
                                        <div className="form-field">
                                            <label className="form-label">
                                                Origin Pincode <span className="required-dot">*</span>
                                            </label>
                                            <div className="input-wrap">
                                                <div className="input-prefix">
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                                                    <circle cx="12" cy="10" r="3"/>
                                                </svg>
                                                </div>
                                                <input className="form-input" type="text" placeholder="e.g. 400001" name="origin" maxLength={6} pattern="\d*" value={formData.origin} onChange={handleChange}/>
                                            </div>
                                            {errors.origin && <small className="cmp-text-danger">{errors.origin}</small>}
                                        </div>
                                        <div className="form-field">
                                            <label className="form-label">
                                                Destination Pincode <span className="required-dot">*</span>
                                            </label>
                                            <div className="input-wrap">
                                                <div className="input-prefix">
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                                                    <circle cx="12" cy="10" r="3"/>
                                                </svg>
                                                </div>
                                                <input className="form-input" type="text" placeholder="e.g. 110001" name="destination" maxLength={6} pattern="\d*" value={formData.destination} onChange={handleChange}/>
                                            </div>
                                            {errors.destination && <small className="cmp-text-danger">{errors.destination}</small>}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="field-group-label">Weight</div>
                                    <div className="col-md-12">
                                        <div className="form-field">
                                        <label className="form-label">
                                            Actual Weight <span className="required-dot">*</span>
                                        </label>
                                        <div className="input-wrap">
                                            <div className="input-prefix">GM</div>
                                            <input className="form-input" type="number" placeholder="e.g. 500" name="weight" value={formData.weight} onChange={handleChange} />
                                        </div>
                                        {errors.weight && <small className="cmp-text-danger">{errors.weight}</small>}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="field-group-label">Package Dimensions (for volumetric weight)</div>
                                    <div className="field-row cols-3">
                                        {["length", "breadth", "height"].map((field) => (
                                            <div className="form-field">
                                                <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)} <span className="required-dot">*</span></label>
                                                <div className="input-wrap">
                                                    <div className="input-prefix">CM</div>
                                                    <input className="form-input" type="number" name={field} placeholder={field} value={formData[field]} onChange={handleChange} />
                                                </div>
                                                {errors[field] && <small className="cmp-text-danger">{errors[field]}</small>}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="dim-hint">Vol. weight = L × B × H ÷ 5000 · Chargeable = max(actual, volumetric)</div>
                                </div>
                                <div>
                                    <div className="field-group-label">Payment &amp; Order Value</div>
                                    <div className="field-row cols-2">
                                        <div className="form-field">
                                        <label className="form-label">Payment Method <span className="required-dot">*</span></label>
                                        <select name="paymentType" className="form-select" value={formData.paymentType} onChange={handleChange}>
                                            <option value="">Payment Method</option>
                                            <option value="cod">COD</option>
                                            <option value="prepaid">PREPAID</option>
                                        </select>
                                        </div>
                                        <div className="form-field">
                                        <label className="form-label">Order Value (₹)</label>
                                        <div className="input-wrap">
                                            <div className="input-prefix">₹</div>
                                            <input className="form-input" type="number" placeholder="e.g. 1500" name="amount" value={formData.amount}onChange={handleChange} />
                                        </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="calc-actions mt-3">
                                    <button type="submit" className="btn-calc btn-calc-primary" disabled={loading}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                                        {loading ? "Calculating..." : "Calculate Rates"} 
                                    </button>
                                    <button type="button" className="btn-calc btn-calc-ghost" onClick={() => {setFormData({origin: "",destination: "",weight: "",length: "",breadth: "",height: "",paymentType: "",amount: ""});setErrors({});}}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="1 4 1 10 7 10"/>
                                            <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                                        </svg>
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="card border p-3">
                        <div className="results-header">
                            <div>
                            <div className="results-title">Rate Comparison</div>
                            <div className="results-sub">
                                Live courier pricing
                            </div>
                            </div>
                        </div>
                        {showForwardReverse && (
                            <div className="results-card">
                                <div className="results-body">
                                    {ratePrice.length > 0 ? (
                                    ratePrice.map((row, index) => (
                                        <div
                                        key={index}
                                        className={`result-row ${index === 0 ? "best" : ""}`}
                                        >
                                        {index === 0 && <div className="best-tag">Best Rate</div>}

                                        <div className="carrier-logo" style={{background:"linear-gradient(135deg,#3D6BFF,#6B7AFF)"}}>
                                            {row.courier_name?.slice(0, 2)}
                                        </div>

                                        <div className="carrier-info">
                                            <div className="carrier-name">
                                            {row.courier_name}
                                            </div>

                                            <div className="carrier-meta">
                                            {row.zone}
                                            </div>
                                        </div>

                                        <div className="carrier-price">
                                            <div className="price-val">
                                            ₹{row.total}
                                            </div>

                                            <div className="price-breakdown">
                                            Freight ₹{row.freight_charge} + COD ₹{row.cod_charge || 0}
                                            </div>
                                        </div>
                                        </div>
                                    ))
                                    ) : (
                                    <div className="empty-results">
                                        <div className="empty-title">
                                        {apiMessage || "No courier available"}
                                        </div>
                                    </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="rate-card mt-3">
                        <div className="rate-card-header">
                            <div>
                            <div className="rate-card-title">Rate Card</div>
                            <div className="rate-card-sub">
                                All zones & weight slabs · GST inclusive
                            </div>
                            </div>
                            <div className="platinum-badge">
                            {planNames[planData?.pricingPlanId]}
                            </div>
                        </div>
                        <div className="rate-table-wrap">
                            <table className="rate-table">
                            <thead>
                                <tr>
                                <th style={{ minWidth: "160px" }}>Courier</th>
                                <th className="zone-th">Zone 1</th>
                                <th className="zone-th">Zone 2</th>
                                <th className="zone-th">Zone 3</th>
                                <th className="zone-th">Zone 4</th>
                                <th className="zone-th">Zone 5</th>
                                </tr>
                            </thead>
                            <tbody>
                                {planChartData.length > 0 ? (
                                planChartData.map((row, i) => {
                                    const data = row.data || {};
                                    return (
                                    <tr key={i}>
                                        <td>
                                        <div className="carrier-cell">
                                            <span className="carrier-dot"></span>
                                            <div>
                                            <div className="carrier-cell-name">
                                                {row.courier}
                                            </div>
                                            <div className="carrier-cell-sub">
                                                {row.type || "STANDARD"} · FWD & RTO
                                            </div>
                                            </div>
                                        </div>
                                        </td>
                                        <td className="zone-cell">
                                        <div className="fwd">₹{data.forward?.zone1 || "-"}</div>
                                        <div className="wt">WT: {data.weight?.zone1 || "-"}</div>
                                        <div className="rto">RTO: {data.rto?.zone1 || "-"}</div>
                                        </td>
                                        <td className="zone-cell">
                                        <div className="fwd">₹{data.forward?.zone2 || "-"}</div>
                                        <div className="wt">WT: {data.weight?.zone2 || "-"}</div>
                                        <div className="rto">RTO: {data.rto?.zone2 || "-"}</div>
                                        </td>
                                        <td className="zone-cell">
                                        <div className="fwd">₹{data.forward?.zone3 || "-"}</div>
                                        <div className="wt">WT: {data.weight?.zone3 || "-"}</div>
                                        <div className="rto">RTO: {data.rto?.zone3 || "-"}</div>
                                        </td>
                                        <td className="zone-cell">
                                        <div className="fwd">₹{data.forward?.zone4 || "-"}</div>
                                        <div className="wt">WT: {data.weight?.zone4 || "-"}</div>
                                        <div className="rto">RTO: {data.rto?.zone4 || "-"}</div>
                                        </td>
                                        <td className="zone-cell">
                                        <div className="fwd">₹{data.forward?.zone5 || "-"}</div>
                                        <div className="wt">WT: {data.weight?.zone5 || "-"}</div>
                                        <div className="rto">RTO: {data.rto?.zone5 || "-"}</div>
                                        </td>
                                    </tr>
                                    );
                                })
                                ) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                    No Data Found
                                    </td>
                                </tr>
                                )}
                            </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-12 mt-3">
                    <div className="terms-card">
                        <div className="terms-header">
                            <div className="terms-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            </div>
                            <div className="terms-title">Terms &amp; Conditions</div>
                        </div>
                        <div className="terms-grid">
                            <div className="term-item">
                            <div className="term-bullet">1</div>
                            <div className="term-text"><strong>GST Inclusive</strong> — All displayed prices include applicable GST. No additional tax is charged at booking.</div>
                            </div>
                            <div className="term-item">
                            <div className="term-bullet">2</div>
                            <div className="term-text"><strong>Chargeable Weight</strong> — Billed on whichever is higher: physical dead weight or volumetric weight (L×B×H ÷ 5000).</div>
                            </div>
                            <div className="term-item">
                            <div className="term-bullet">3</div>
                            <div className="term-text"><strong>COD Charges</strong> — Applied as a fixed COD charge or a % of order value, whichever is higher per carrier policy.</div>
                            </div>
                            <div className="term-item">
                            <div className="term-bullet">4</div>
                            <div className="term-text"><strong>Volumetric Formula</strong> — L (cm) × B (cm) × H (cm) ÷ 5000 = Volumetric weight in kg per IATA standard.</div>
                            </div>
                            <div className="term-item">
                            <div className="term-bullet">5</div>
                            <div className="term-text"><strong>Zone Detection</strong> — Zones are auto-detected based on origin and destination pincodes. Rates vary by zone.</div>
                            </div>
                            <div className="term-item">
                            <div className="term-bullet">6</div>
                            <div className="term-text"><strong>Fuel Surcharge</strong> — Prices may include fuel surcharge as per carrier policy. Surcharges are subject to periodic revision.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  )
}
export default index